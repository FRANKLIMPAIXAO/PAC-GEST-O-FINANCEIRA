import React from 'react';
import { 
  Download, RefreshCw, Send, Check, AlertCircle, Clock, FileText
} from 'lucide-react';
import { MOCK_BILLING } from '../constants';

const BillingScreen: React.FC = () => {
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Gerada': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Paga': return 'bg-green-100 text-green-700 border-green-200';
      case 'Em atraso': return 'bg-red-100 text-red-700 border-red-200';
      case 'Não gerada': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faturamento Recorrente</h1>
          <p className="text-slate-500">Controle mensal de cobranças e emissão de notas.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <Download size={18} />
            Exportar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <RefreshCw size={18} />
            Processar Lote
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Total Previsto</p>
          <h3 className="text-2xl font-bold text-slate-900">R$ 145.000</h3>
          <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-full"></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Já Cobrado</p>
          <h3 className="text-2xl font-bold text-blue-600">R$ 138.500</h3>
          <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
             <div className="bg-blue-500 h-full w-[95%]"></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Recebido</p>
          <h3 className="text-2xl font-bold text-green-600">R$ 98.000</h3>
          <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
             <div className="bg-green-500 h-full w-[67%]"></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Gap (A Receber)</p>
          <h3 className="text-2xl font-bold text-orange-500">R$ 47.000</h3>
          <p className="text-xs text-slate-400 mt-2">32% do total</p>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center bg-slate-50">
           <select className="px-3 py-1.5 border border-slate-300 rounded-md text-sm bg-white">
             <option>Outubro 2024</option>
             <option>Setembro 2024</option>
           </select>
           <select className="px-3 py-1.5 border border-slate-300 rounded-md text-sm bg-white">
             <option>Todos os Planos</option>
             <option>BPO</option>
           </select>
           <select className="px-3 py-1.5 border border-slate-300 rounded-md text-sm bg-white">
             <option>Status: Todos</option>
             <option>Pendente</option>
             <option>Pago</option>
           </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Serviço</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Valor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Vencimento</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">NFS-e</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_BILLING.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{record.clientName}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{record.service}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">R$ {record.value.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {new Date(record.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {record.invoiceUrl ? (
                      <button className="text-blue-600 hover:text-blue-800" title="Ver Nota Fiscal">
                        <FileText size={18} className="mx-auto" />
                      </button>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {record.status === 'Não gerada' ? (
                       <button className="text-blue-600 hover:underline text-sm font-medium">Gerar</button>
                    ) : record.status === 'Em atraso' ? (
                       <button className="flex items-center gap-1 text-red-600 hover:underline text-sm font-medium ml-auto">
                         <Send size={14} /> Cobrar
                       </button>
                    ) : (
                       <button className="text-slate-400 hover:text-slate-600 text-sm">Detalhes</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingScreen;
