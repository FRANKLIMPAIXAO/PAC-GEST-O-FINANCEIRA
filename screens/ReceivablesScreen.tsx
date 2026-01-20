
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Filter, Calendar, CheckCircle, Clock, 
  MoreHorizontal, FileText, Send, DollarSign, X, History,
  MessageCircle, Mail, Loader2, Save, FileUp, Upload, Check, AlertCircle, FileCode,
  Sparkles, ShieldCheck, Database, Plus, Trash2, User, MoreVertical, ExternalLink
} from 'lucide-react';
import { MOCK_RECEIVABLES } from '../constants';
import { TransactionStatus, Receivable, PaymentMethod } from '../types';
import { processStatementFile, ExtractedTransaction } from '../services/geminiService';

const ReceivablesScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [receivables, setReceivables] = useState<Receivable[]>(MOCK_RECEIVABLES);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // New Receivable State
  const [newReceivable, setNewReceivable] = useState({
    clientName: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    value: 0,
    paymentMethod: PaymentMethod.BOLETO
  });

  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleAddReceivable = (e: React.FormEvent) => {
    e.preventDefault();
    const id = 'R' + (receivables.length + 1);
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
      clientName: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      value: 0,
      paymentMethod: PaymentMethod.BOLETO
    });
    alert('Nova receita cadastrada com sucesso!');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    alert('Extrato processado com sucesso!');
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
            onClick={() => setIsImportModalOpen(true)}
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
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
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
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Descrição</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Vencimento</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Valor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{item.clientName}</div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{item.service}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(item.dueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">R$ {item.value.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(item.status)}`}>
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
                          onClick={() => {alert('Registrando pagamento para ' + item.clientName); setOpenMenuId(null)}}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                        >
                          <DollarSign size={16} className="text-green-600" /> Registrar Pagamento
                        </button>
                        <button 
                          onClick={() => {alert('Lembrete enviado para ' + item.clientName); setOpenMenuId(null)}}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                        >
                          <Send size={16} className="text-blue-600" /> Enviar Lembrete
                        </button>
                        <button 
                          onClick={() => {alert('Gerando NFS-e para ' + item.clientName); setOpenMenuId(null)}}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                        >
                          <FileText size={16} className="text-purple-600" /> Gerar NFS-e
                        </button>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button 
                          onClick={() => {alert('Abrindo histórico de ' + item.clientName); setOpenMenuId(null)}}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                        >
                          <History size={16} className="text-slate-500" /> Ver Histórico do Cliente
                        </button>
                        <button 
                          onClick={() => {alert('Visualizando detalhes...'); setOpenMenuId(null)}}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                        >
                          <ExternalLink size={16} className="text-slate-500" /> Detalhes do Lançamento
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            Nenhum lançamento encontrado para os filtros aplicados.
          </div>
        )}
      </div>

      {/* MODAL: NOVA RECEITA */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col animate-in zoom-in duration-200">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><Plus size={24} /></div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Nova Receita</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Lançamento Manual</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddReceivable} className="p-8 space-y-4">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-600">Cliente</label>
                 <input required type="text" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={newReceivable.clientName} onChange={e => setNewReceivable({...newReceivable, clientName: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-600">Descrição / Serviço</label>
                 <input required type="text" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={newReceivable.description} onChange={e => setNewReceivable({...newReceivable, description: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-600">Vencimento</label>
                   <input required type="date" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={newReceivable.dueDate} onChange={e => setNewReceivable({...newReceivable, dueDate: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-600">Valor (R$)</label>
                   <input required type="number" step="0.01" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-600" value={newReceivable.value} onChange={e => setNewReceivable({...newReceivable, value: parseFloat(e.target.value)})} />
                 </div>
               </div>
               <div className="pt-6 flex justify-end gap-3 border-t">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl">Cancelar</button>
                  <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg flex items-center gap-2"><Save size={18} /> Salvar Receita</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold">Importação de Arquivos</h3>
              <button onClick={() => setIsImportModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="p-12 text-center">
               <div className="p-12 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all w-full flex flex-col items-center gap-4 cursor-pointer">
                  <Upload size={48} className="text-slate-300" />
                  <span className="text-sm font-bold text-slate-500">Clique ou arraste seu OFX/PDF aqui</span>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivablesScreen;
