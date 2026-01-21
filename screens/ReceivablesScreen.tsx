
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Filter, Calendar, CheckCircle, Clock, 
  MoreHorizontal, FileText, Send, DollarSign, X, History,
  MessageCircle, Mail, Loader2, Save, FileUp, Upload, Check, AlertCircle, 
  Sparkles, Plus, Trash2, RefreshCw, User
} from 'lucide-react';
import { MOCK_RECEIVABLES } from '../constants';
import { TransactionStatus, Receivable, PaymentMethod } from '../types';
import { processFinancialDocument, ExtractedTransaction } from '../services/geminiService';

const ReceivablesScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [receivables, setReceivables] = useState<Receivable[]>(MOCK_RECEIVABLES);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedTransaction[]>([]);
  const [selectedHistoryClient, setSelectedHistoryClient] = useState<Receivable | null>(null);

  // New Receivable State
  const [newReceivable, setNewReceivable] = useState({
    clientName: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    value: 0,
    paymentMethod: PaymentMethod.BOLETO
  });

  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredData = receivables.filter(item => {
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

  const handleRegisterPayment = (id: string) => {
    setReceivables(prev => prev.map(item => 
      item.id === id ? { ...item, status: TransactionStatus.PAID } : item
    ));
    setSelectedHistoryClient(null);
    alert('Pagamento registrado com sucesso!');
  };

  const handleAddReceivable = (e: React.FormEvent) => {
    e.preventDefault();
    const id = 'R' + (receivables.length + Math.floor(Math.random() * 1000));
    const item: Receivable = {
      id,
      clientId: 'manual',
      clientName: newReceivable.clientName,
      description: newReceivable.description,
      dueDate: newReceivable.dueDate,
      value: newReceivable.value,
      paymentMethod: newReceivable.paymentMethod,
      status: TransactionStatus.OPEN,
      hasNfs: false,
      service: 'Manual'
    };
    setReceivables([item, ...receivables]);
    setIsAddModalOpen(false);
    setNewReceivable({
      clientName: '', description: '', dueDate: new Date().toISOString().split('T')[0],
      value: 0, paymentMethod: PaymentMethod.BOLETO
    });
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadError(null);
    setExtractedData([]);

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let mimeType = file.type;

      if (!mimeType) {
        if (extension === 'pdf') mimeType = 'application/pdf';
        else if (extension === 'ofx') mimeType = 'text/plain';
        else if (['png', 'jpg', 'jpeg', 'webp'].includes(extension || '')) mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
        else mimeType = 'application/octet-stream';
      }

      const base64 = await readFileAsBase64(file);
      const results = await processFinancialDocument(base64, mimeType, 'receivable');
      
      if (results && results.length > 0) {
        setExtractedData(results);
      } else {
        setUploadError("Não foi possível extrair dados financeiros deste arquivo. Verifique se o formato está correto.");
      }
    } catch (error) {
      console.error("Erro no processamento:", error);
      setUploadError("Falha na comunicação com a IA. Por favor, tente novamente em instantes.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmImport = () => {
    const newItems: Receivable[] = extractedData.map((item, idx) => ({
      id: `IMP-${Date.now()}-${idx}`,
      clientId: 'imported',
      clientName: item.entity || 'Cliente Desconhecido',
      description: item.description,
      dueDate: item.date,
      value: item.value,
      paymentMethod: PaymentMethod.TRANSFER,
      status: TransactionStatus.OPEN,
      hasNfs: false,
      service: 'Importado via IA'
    }));

    setReceivables([...newItems, ...receivables]);
    setIsImportModalOpen(false);
    setExtractedData([]);
    alert(`${newItems.length} lançamentos importados com sucesso!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contas a Receber</h1>
          <p className="text-slate-500">Gestão operacional de fluxos de entrada.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setUploadError(null);
              setExtractedData([]);
              setIsImportModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all shadow-sm active:scale-95 font-bold"
          >
            <FileUp size={18} />
            Importar OFX/PDF
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95 font-bold"
          >
            <Plus size={18} />
            Nova Receita
          </button>
        </div>
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
        <div className="flex gap-3">
          <select 
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos Status</option>
            <option value={TransactionStatus.OPEN}>Em Aberto</option>
            <option value={TransactionStatus.PAID}>Pago</option>
            <option value={TransactionStatus.LATE}>Em Atraso</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
        <div className="overflow-x-auto overflow-visible">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Vencimento</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Valor</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedHistoryClient(item)}
                      className="text-left group"
                    >
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.clientName}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{item.service}</div>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{item.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{new Date(item.dueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-black text-slate-900">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {openMenuId === item.id && (
                      <div 
                        ref={menuRef}
                        className="absolute right-6 top-12 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100"
                      >
                        <button 
                          onClick={() => {handleRegisterPayment(item.id); setOpenMenuId(null)}}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 font-bold"
                        >
                          <DollarSign size={16} className="text-green-600" /> Registrar Pagamento
                        </button>
                        <button 
                          onClick={() => {alert('Lembrete enviado para ' + item.clientName); setOpenMenuId(null)}}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 font-bold"
                        >
                          <Send size={16} className="text-blue-600" /> Enviar Lembrete
                        </button>
                        <button 
                          onClick={() => {alert('Gerando NFS-e para ' + item.clientName); setOpenMenuId(null)}}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 font-bold"
                        >
                          <FileText size={16} className="text-purple-600" /> Gerar NFS-e
                        </button>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button 
                          onClick={() => {setSelectedHistoryClient(item); setOpenMenuId(null)}}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 font-medium"
                        >
                          <History size={16} className="text-slate-500" /> Ver Histórico do Cliente
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: HISTÓRICO FINANCEIRO */}
      {selectedHistoryClient && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><History size={24} /></div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Histórico Financeiro</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{selectedHistoryClient.clientName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedHistoryClient(null)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                  {selectedHistoryClient.clientName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{selectedHistoryClient.clientName}</h4>
                  <p className="text-xs text-slate-400 font-mono">CLIENTE ID: {selectedHistoryClient.clientId}</p>
                </div>
              </div>

              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Lançamento Atual</h5>
                <div className="p-4 border rounded-2xl bg-white shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">{selectedHistoryClient.description}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(selectedHistoryClient.status)}`}>
                      {selectedHistoryClient.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Vencimento</p>
                      <p className="text-sm font-bold text-slate-700">{new Date(selectedHistoryClient.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Valor</p>
                      <p className="text-xl font-black text-slate-900">R$ {selectedHistoryClient.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Recibos Anteriores (Simulado)</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500" />
                      <span className="font-bold text-slate-700">Mensalidade Set/24</span>
                    </div>
                    <span className="font-black text-slate-900">R$ 3.500,00</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500" />
                      <span className="font-bold text-slate-700">Mensalidade Ago/24</span>
                    </div>
                    <span className="font-black text-slate-900">R$ 3.500,00</span>
                  </div>
                </div>
              </div>

              {selectedHistoryClient.status !== TransactionStatus.PAID && (
                <div className="pt-4 border-t flex flex-col gap-3">
                  <button 
                    onClick={() => handleRegisterPayment(selectedHistoryClient.id)}
                    className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <DollarSign size={20} /> Registrar Pagamento da Fatura
                  </button>
                  <p className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-tighter italic">
                    Ao confirmar, o status será atualizado para "Pago" no fluxo de caixa.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* IMPORT MODAL: IA POWERED */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".ofx,.pdf,.png,.jpg,.jpeg"
            />
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100"><Sparkles size={20} /></div>
                <div>
                  <h3 className="font-bold text-slate-900">Importação Inteligente</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Processamento via Gemini AI</p>
                </div>
              </div>
              <button onClick={() => { setIsImportModalOpen(false); setExtractedData([]); setUploadError(null); }} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="p-8">
               {!isProcessing && extractedData.length === 0 && !uploadError && (
                 <div className="text-center space-y-4">
                    <div onClick={() => fileInputRef.current?.click()} className="p-16 border-2 border-dashed border-slate-300 rounded-3xl hover:border-blue-500 hover:bg-blue-50 transition-all group cursor-pointer flex flex-col items-center gap-4">
                       <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-blue-100">
                          <Upload size={32} className="text-slate-400 group-hover:text-blue-600" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-sm font-black text-slate-700 uppercase tracking-tight">Carregar Extrato ou Relatório</p>
                          <p className="text-xs text-slate-400">Arraste ou clique para selecionar OFX/PDF</p>
                       </div>
                    </div>
                 </div>
               )}
               {uploadError && (
                 <div className="py-12 text-center space-y-6 animate-in fade-in duration-300">
                    <div className="flex justify-center"><div className="p-4 bg-red-100 rounded-full text-red-600"><AlertCircle size={48} /></div></div>
                    <div className="space-y-2 max-w-sm mx-auto">
                      <h4 className="font-bold text-slate-900 text-lg">Ops! Algo deu errado</h4>
                      <p className="text-sm text-slate-500">{uploadError}</p>
                    </div>
                    <button onClick={() => { setUploadError(null); fileInputRef.current?.click(); }} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center gap-2 mx-auto transition-all"><RefreshCw size={18} /> Tentar Outro Arquivo</button>
                 </div>
               )}
               {isProcessing && (
                 <div className="py-20 flex flex-col items-center gap-6 animate-pulse">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
                      <Loader2 size={64} className="text-blue-600 animate-spin relative z-10" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-lg font-black text-slate-800 uppercase tracking-tighter">Gemini está analisando seu arquivo...</p>
                      <p className="text-sm text-slate-400 italic">Identificando clientes, valores e datas de vencimento.</p>
                    </div>
                 </div>
               )}
               {!isProcessing && extractedData.length > 0 && (
                 <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center">
                       <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><CheckCircle className="text-green-500" size={14} /> {extractedData.length} Lançamentos Encontrados</h4>
                       <button onClick={() => { setExtractedData([]); setUploadError(null); }} className="text-[10px] font-bold text-blue-600 hover:underline uppercase">Trocar Arquivo</button>
                    </div>
                    <div className="border rounded-2xl overflow-hidden shadow-sm">
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b sticky top-0">
                            <tr><th className="px-4 py-3 font-black text-slate-500 uppercase">Cliente</th><th className="px-4 py-3 font-black text-slate-500 uppercase">Vencimento</th><th className="px-4 py-3 font-black text-slate-500 uppercase text-right">Valor</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {extractedData.map((item, idx) => (
                              <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-bold text-slate-800">{item.entity}</td>
                                <td className="px-4 py-3 font-medium text-slate-500">{new Date(item.date).toLocaleDateString()}</td>
                                <td className="px-4 py-3 font-black text-slate-900 text-right">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t">
                      <button onClick={() => { setExtractedData([]); setIsImportModalOpen(false); }} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                      <button onClick={confirmImport} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-95 transition-all"><Save size={18} /> Confirmar Importação</button>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA RECEITA (MANUAL) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col animate-in zoom-in duration-200">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-3"><div className="bg-blue-600 p-2 rounded-xl text-white"><Plus size={24} /></div><h3 className="text-xl font-bold text-slate-900">Nova Receita</h3></div>
              <button onClick={() => setIsAddModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddReceivable} className="p-8 space-y-4">
               <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase">Cliente</label><input required type="text" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" value={newReceivable.clientName} onChange={e => setNewReceivable({...newReceivable, clientName: e.target.value})} /></div>
               <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase">Descrição</label><input required type="text" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" value={newReceivable.description} onChange={e => setNewReceivable({...newReceivable, description: e.target.value})} /></div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase">Vencimento</label><input required type="date" className="w-full p-2.5 border rounded-lg" value={newReceivable.dueDate} onChange={e => setNewReceivable({...newReceivable, dueDate: e.target.value})} /></div>
                 <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase">Valor (R$)</label><input required type="number" step="0.01" className="w-full p-2.5 border rounded-lg font-black text-blue-600" value={newReceivable.value} onChange={e => setNewReceivable({...newReceivable, value: parseFloat(e.target.value)})} /></div>
               </div>
               <div className="pt-6 flex justify-end gap-3 border-t">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl">Cancelar</button>
                  <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2"><Save size={18} /> Salvar</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivablesScreen;
