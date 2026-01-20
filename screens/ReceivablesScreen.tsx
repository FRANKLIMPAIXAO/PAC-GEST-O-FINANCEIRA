
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Filter, Calendar, CheckCircle, Clock, 
  MoreHorizontal, FileText, Send, DollarSign, X, History,
  MessageCircle, Mail, Loader2, Save, FileUp, Upload, Check, AlertCircle, FileCode,
  Sparkles, ShieldCheck, Database
} from 'lucide-react';
import { MOCK_RECEIVABLES } from '../constants';
import { TransactionStatus, Receivable } from '../types';
import { processStatementFile, ExtractedTransaction } from '../services/geminiService';

const ReceivablesScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // State for History Modal
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedClientHistory, setSelectedClientHistory] = useState<{name: string, data: any[]} | null>(null);

  // State for Manual Payment in History
  const [payingItemId, setPayingItemId] = useState<number | null>(null);
  const [paymentForm, setPaymentForm] = useState({ value: '', date: '' });

  // State for Reminder Modal
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [reminderChannel, setReminderChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [reminderText, setReminderText] = useState('');
  const [sending, setSending] = useState(false);

  // --- Import State ---
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ExtractedTransaction[]>([]);
  const [importSource, setImportSource] = useState<'ofx' | 'ai' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredData = MOCK_RECEIVABLES.filter(item => {
    const matchesSearch = item.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PAID: return 'bg-green-100 text-green-700';
      case TransactionStatus.LATE: return 'bg-red-100 text-red-700';
      case TransactionStatus.OPEN: return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // --- REAL OFX PARSER LOGIC ---
  const parseOFX = (text: string): ExtractedTransaction[] => {
    const transactions: ExtractedTransaction[] = [];
    // Regex para capturar blocos de transação <STMTTRN>...</STMTTRN>
    const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
    let match;

    while ((match = trnRegex.exec(text)) !== null) {
      const content = match[1];
      
      // Extração de campos via regex simples (padrão OFX)
      const dateMatch = /<DTPOSTED>(\d{8})/.exec(content);
      const amountMatch = /<TRNAMT>([\d.-]+)/.exec(content);
      const nameMatch = /<NAME>([^<]+)/.exec(content) || /<MEMO>([^<]+)/.exec(content);
      const typeMatch = /<TRNTYPE>(CREDIT|DEBIT)/.exec(content);

      if (dateMatch && amountMatch && nameMatch) {
        const rawDate = dateMatch[1];
        const date = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
        const value = parseFloat(amountMatch[1]);
        
        transactions.push({
          date,
          description: nameMatch[1].trim(),
          value: Math.abs(value),
          type: value >= 0 ? 'entrada' : 'saida'
        });
      }
    }
    return transactions;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportResult([]);
    
    const reader = new FileReader();

    if (file.name.toLowerCase().endsWith('.ofx')) {
      setImportSource('ofx');
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const transactions = parseOFX(text);
        
        // Simular um pequeno delay para feedback visual
        setTimeout(() => {
          setImportResult(transactions);
          setIsProcessing(false);
        }, 1000);
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
      setImportSource('ai');
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const transactions = await processStatementFile(base64, file.type);
        setImportResult(transactions);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Formato não suportado. Use .OFX ou .PDF");
      setIsProcessing(false);
    }
  };

  const handleOpenHistory = (clientName: string, currentValue: number) => {
    const mockHistory = [
      { id: 99, date: '2024-10-05', desc: 'Mensalidade Out/24', value: currentValue, status: 'Pendente', method: 'Boleto' },
      { id: 1, date: '2024-09-05', desc: 'Mensalidade Set/24', value: currentValue, status: 'Pago', method: 'Boleto' },
      { id: 2, date: '2024-08-05', desc: 'Mensalidade Ago/24', value: currentValue, status: 'Pago', method: 'Boleto' },
      { id: 3, date: '2024-07-05', desc: 'Mensalidade Jul/24', value: currentValue, status: 'Pago com atraso', method: 'PIX' },
      { id: 4, date: '2024-06-05', desc: 'Mensalidade Jun/24', value: currentValue, status: 'Pago', method: 'Boleto' },
    ];

    setSelectedClientHistory({ name: clientName, data: mockHistory });
    setPayingItemId(null);
    setIsHistoryOpen(true);
  };

  const handleStartPayment = (item: any) => {
    setPayingItemId(item.id);
    setPaymentForm({
      value: item.value.toString(),
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleConfirmPayment = () => {
    if (!selectedClientHistory || payingItemId === null) return;
    const updatedData = selectedClientHistory.data.map(item => {
      if (item.id === payingItemId) {
        return { ...item, status: 'Pago', date: paymentForm.date, value: parseFloat(paymentForm.value) };
      }
      return item;
    });
    setSelectedClientHistory({ ...selectedClientHistory, data: updatedData });
    setPayingItemId(null);
  };

  const generateMessage = (receivable: Receivable, channel: 'whatsapp' | 'email') => {
    const isLate = receivable.status === TransactionStatus.LATE;
    const formattedDate = new Date(receivable.dueDate).toLocaleDateString('pt-BR');
    const formattedValue = receivable.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (channel === 'whatsapp') {
      return isLate 
        ? `Olá ${receivable.clientName}, notamos que a fatura de *${formattedValue}* (${formattedDate}) ainda está pendente. Podemos ajudar?`
        : `Olá ${receivable.clientName}! Lembrete: Sua fatura de *${formattedValue}* vence dia *${formattedDate}*.`;
    } else {
      return isLate
        ? `Assunto: Pendência - ${receivable.description}\n\nPrezados, consta pendência de ${formattedValue} (${formattedDate}).`
        : `Assunto: Lembrete - ${receivable.description}\n\nLembramos o vencimento em ${formattedDate} do valor ${formattedValue}.`;
    }
  };

  const handleOpenReminder = (receivable: Receivable) => {
    setSelectedReceivable(receivable);
    setReminderChannel('whatsapp');
    setReminderText(generateMessage(receivable, 'whatsapp'));
    setIsReminderOpen(true);
  };

  useEffect(() => {
    if (selectedReceivable) {
      setReminderText(generateMessage(selectedReceivable, reminderChannel));
    }
  }, [reminderChannel, selectedReceivable]);

  const handleSendReminder = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setIsReminderOpen(false);
      setSelectedReceivable(null);
      alert('Lembrete enviado!'); 
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contas a Receber</h1>
          <p className="text-slate-500">Gestão operacional de fluxos de entrada.</p>
        </div>
        <button 
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md active:scale-95"
        >
          <FileUp size={18} />
          Importar Extrato (OFX/PDF)
        </button>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por cliente..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
          <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <select className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white appearance-none min-w-[140px]">
               <option>Outubro/2024</option>
               <option>Novembro/2024</option>
             </select>
          </div>
          <select 
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-700"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos Status</option>
            <option value={TransactionStatus.OPEN}>Em Aberto</option>
            <option value={TransactionStatus.PAID}>Pago</option>
            <option value={TransactionStatus.LATE}>Em Atraso</option>
          </select>
          <button className="px-3 py-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">
            <Filter size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vencimento</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <button 
                      onClick={() => handleOpenHistory(item.clientName, item.value)}
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                    >
                      {item.clientName}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(item.dueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">R$ {item.value.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-1.5 text-slate-400 hover:text-green-600 transition-colors" title="Registrar Recebimento"><DollarSign size={18} /></button>
                       <button onClick={() => handleOpenReminder(item)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title="Enviar Lembrete"><Send size={18} /></button>
                       <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"><MoreHorizontal size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REAL IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in duration-200 border border-white/20">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                  <FileUp size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Importação de Extrato</h3>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Processamento Digital Financeiro</p>
                </div>
              </div>
              <button 
                onClick={() => {setIsImportModalOpen(false); setImportResult([]); setImportSource(null)}} 
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              {!importResult.length && !isProcessing && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-2xl p-16 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer group bg-slate-50/30"
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".ofx,.pdf,image/*" />
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <Upload className="text-indigo-600" size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800">Selecione seu arquivo bancário</h4>
                  <p className="text-slate-500 mt-2 max-w-sm mx-auto">Arraste aqui ou clique para selecionar seu arquivo **.OFX** (Nativo) ou **.PDF** (Análise via IA).</p>
                  
                  <div className="mt-8 flex justify-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600">
                      <FileCode size={18} className="text-orange-500" /> OFX
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600">
                      <Sparkles size={18} className="text-indigo-500" /> PDF Inteligente
                    </div>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="flex flex-col items-center justify-center py-24 gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-200 rounded-full blur-2xl animate-pulse"></div>
                    <Loader2 className="animate-spin text-indigo-600 relative z-10" size={56} />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-slate-800">
                      {importSource === 'ai' ? 'IA Lendo Documento...' : 'Processando Estrutura OFX...'}
                    </h4>
                    <p className="text-slate-500 mt-2 max-w-xs mx-auto">Estamos transformando os dados brutos em transações conciliaveis para o sistema.</p>
                  </div>
                </div>
              )}

              {importResult.length > 0 && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-3">
                      {importSource === 'ofx' ? (
                        <ShieldCheck className="text-indigo-600" size={24} />
                      ) : (
                        <Sparkles className="text-indigo-600" size={24} />
                      )}
                      <div>
                        <h4 className="font-bold text-indigo-900">
                          {importResult.length} Transações Extraídas via {importSource === 'ofx' ? 'Nativo (OFX)' : 'Inteligência Artificial'}
                        </h4>
                        <p className="text-indigo-700 text-xs">Revise os dados abaixo para confirmar a conciliação.</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Origem de Dados</span>
                      <span className="text-sm font-bold text-indigo-900">{importSource?.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Data</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Descrição no Extrato</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Valor</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Sugestão de Conciliação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importResult.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 text-sm font-medium text-slate-600">
                              {new Date(item.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-800">
                              {item.description}
                            </td>
                            <td className={`px-6 py-4 text-sm font-black ${item.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                              {item.type === 'entrada' ? '+' : '-'} R$ {item.value.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <select className="text-xs bg-white border border-slate-200 rounded-lg py-1.5 pl-2 pr-8 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer">
                                <option>✨ Auto-detectar Cliente</option>
                                <option>Vincular a Tech Solutions</option>
                                <option>Novo Lançamento</option>
                                <option className="text-red-500">Ignorar Transação</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={() => {setIsImportModalOpen(false); setImportResult([]); setImportSource(null)}}
                className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              {importResult.length > 0 && (
                <button 
                  onClick={() => {alert('Conciliação em lote processada!'); setIsImportModalOpen(false); setImportResult([])}}
                  className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Database size={18} />
                  Salvar Lote de Importação
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAIS DE HISTÓRICO E PAGAMENTO (ANTERIORES) */}
      {isHistoryOpen && selectedClientHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><History size={24} /></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Histórico Financeiro</h3>
                  <p className="text-sm text-slate-500">{selectedClientHistory.name}</p>
                </div>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Data</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Descrição</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Valor</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedClientHistory.data.map((historyItem) => (
                      <tr key={historyItem.id} className="hover:bg-slate-50">
                        {payingItemId === historyItem.id ? (
                          <>
                            <td className="px-4 py-3"><input type="date" className="w-full text-sm border-slate-300 rounded-md" value={paymentForm.date} onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})} /></td>
                            <td className="px-4 py-3 text-sm font-medium">{historyItem.desc}</td>
                            <td className="px-4 py-3"><div className="flex items-center gap-1 text-sm"><span>R$</span><input type="number" className="w-24 text-sm border-slate-300 rounded-md" value={paymentForm.value} onChange={(e) => setPaymentForm({...paymentForm, value: e.target.value})} /></div></td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={handleConfirmPayment} className="p-1.5 bg-green-100 text-green-700 rounded shadow-sm"><Save size={16} /></button>
                                <button onClick={() => setPayingItemId(null)} className="p-1.5 bg-red-100 text-red-700 rounded shadow-sm"><X size={16} /></button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-sm text-slate-600">{new Date(historyItem.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-sm font-medium">{historyItem.desc}</td>
                            <td className="px-4 py-3 text-sm font-bold">R$ {historyItem.value.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">
                              {historyItem.status !== 'Pago' && (
                                <button onClick={() => handleStartPayment(historyItem)} className="px-3 py-1 bg-white border border-slate-300 text-slate-700 text-xs rounded-lg font-bold hover:bg-slate-50 transition-all flex items-center gap-1 ml-auto">
                                  <Check size={12} /> Registrar Pago
                                </button>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {isReminderOpen && selectedReceivable && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b bg-slate-50 rounded-t-xl flex justify-between items-center">
              <div className="flex items-center gap-3"><div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Send size={24} /></div><h3 className="text-lg font-bold">Enviar Lembrete</h3></div>
              <button onClick={() => setIsReminderOpen(false)} className="text-slate-400 p-2"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex p-1 bg-slate-100 rounded-lg">
                <button onClick={() => setReminderChannel('whatsapp')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${reminderChannel === 'whatsapp' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500'}`}>WhatsApp</button>
                <button onClick={() => setReminderChannel('email')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${reminderChannel === 'email' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>Email</button>
              </div>
              <textarea className="w-full h-40 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm resize-none bg-slate-50" value={reminderText} onChange={(e) => setReminderText(e.target.value)} />
            </div>
            <div className="p-4 border-t flex justify-end gap-3 bg-slate-50 rounded-b-xl">
              <button onClick={() => setIsReminderOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancelar</button>
              <button onClick={handleSendReminder} disabled={sending} className="px-6 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 font-bold shadow-md hover:bg-indigo-700 transition-all">
                {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {sending ? 'Enviando...' : 'Enviar Agora'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivablesScreen;
