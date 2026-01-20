
import React, { useState } from 'react';
import { 
  Plus, Search, Filter, MoreHorizontal, Clock, CheckCircle, 
  XCircle, AlertCircle, FileText, ChevronRight
} from 'lucide-react';
import { MOCK_REQUESTS } from '../constants';
import { RequestStatus } from '../types';

const RequestsScreen: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('Todos');

  const filteredRequests = MOCK_REQUESTS.filter(req => 
    filterStatus === 'Todos' || req.status === filterStatus
  );

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
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
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

      {/* List / Board */}
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
                  <span>•</span>
                  <span>Tipo: {req.type}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 pl-4 md:pl-0 border-l md:border-l-0 border-slate-100">
               <div className="flex items-center gap-2">
                 {getStatusIcon(req.status)}
                 <span className="text-sm font-medium text-slate-700">{req.status}</span>
               </div>
               
               <div className="flex items-center gap-2">
                 <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                   Detalhes
                 </button>
                 <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full">
                   <MoreHorizontal size={20} />
                 </button>
               </div>
            </div>

          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">Nenhuma solicitação encontrada nesta categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsScreen;
