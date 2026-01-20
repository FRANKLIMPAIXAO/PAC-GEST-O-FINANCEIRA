
import React, { useState } from 'react';
import { 
  Plus, Search, Filter, MoreHorizontal, Clock, CheckCircle, 
  XCircle, AlertCircle, FileText, ChevronRight, X, Save, User, ClipboardList
} from 'lucide-react';
import { MOCK_REQUESTS, MOCK_CLIENTS } from '../constants';
import { RequestStatus } from '../types';

const RequestsScreen: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    clientId: '',
    type: 'Nota Fiscal',
    priority: 'Média'
  });

  const filteredRequests = MOCK_REQUESTS.filter(req => 
    filterStatus === 'Todos' || req.status === filterStatus
  );

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Nova solicitação aberta com sucesso! ID: #REQ' + Math.floor(Math.random() * 1000));
    setIsAddModalOpen(false);
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'Alta': return 'bg-red-100 text-red-700';
      case 'Média': return 'bg-yellow-100 text-yellow-700';
      case 'Baixa': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: RequestStatus) => {
    switch(status) {
      case 'Aberto': return <AlertCircle size={16} className="text-blue-500" />;
      case 'Em análise': return <Clock size={16} className="text-orange-500" />;
      case 'Concluído': return <CheckCircle size={16} className="text-green-500" />;
      case 'Rejeitado': return <XCircle size={16} className="text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Solicitações</h1>
          <p className="text-slate-500">Central de tickets e demandas dos clientes.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm active:scale-95 font-bold"
        >
          <Plus size={20} />
          <span>Nova Solicitação</span>
        </button>
      </div>

      {/* Kanban-like Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          {['Todos', 'Aberto', 'Em análise', 'Concluído'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                filterStatus === status 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.map((req) => (
          <div key={req.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-50 rounded-lg text-slate-500">
                <FileText size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-800">{req.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getPriorityBadge(req.priority)}`}>
                    {req.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-medium mb-1">{req.clientName}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>ID: #{req.id}</span>
                  <span>•</span>
                  <span>Criado em: {new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                 {getStatusIcon(req.status)}
                 <span className="text-sm font-medium text-slate-700">{req.status}</span>
               </div>
               <button onClick={() => alert('Abrindo solicitação...')} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-all">
                 Detalhes
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: NOVA SOLICITAÇÃO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col animate-in zoom-in duration-200">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ClipboardList size={24} /></div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Nova Solicitação</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Abertura de Ticket</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddRequest} className="p-8 space-y-4">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-600">Assunto / Título</label>
                 <input required type="text" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={newRequest.title} onChange={e => setNewRequest({...newRequest, title: e.target.value})} placeholder="Ex: Correção de boleto" />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-600">Cliente Solicitante</label>
                 <select required className="w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500" value={newRequest.clientId} onChange={e => setNewRequest({...newRequest, clientId: e.target.value})}>
                   <option value="">Selecione um cliente...</option>
                   {MOCK_CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-600">Tipo</label>
                   <select className="w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500" value={newRequest.type} onChange={e => setNewRequest({...newRequest, type: e.target.value})}>
                     <option>Nota Fiscal</option>
                     <option>Vencimento</option>
                     <option>Contrato</option>
                     <option>Outros</option>
                   </select>
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-600">Prioridade</label>
                   <select className="w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500" value={newRequest.priority} onChange={e => setNewRequest({...newRequest, priority: e.target.value})}>
                     <option>Baixa</option>
                     <option>Média</option>
                     <option>Alta</option>
                   </select>
                 </div>
               </div>
               <div className="pt-6 flex justify-end gap-3 border-t">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl">Cancelar</button>
                  <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg flex items-center gap-2"><Save size={18} /> Abrir Ticket</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsScreen;
