
import React, { useState } from 'react';
import { 
  Search, Filter, Calendar, Upload, Repeat, Check, MoreVertical, FileUp
} from 'lucide-react';
import { MOCK_PAYABLES } from '../constants';
import { CostCenter, TransactionStatus } from '../types';

const PayablesScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = MOCK_PAYABLES.filter(item => 
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PAID: return 'bg-green-100 text-green-700';
      case TransactionStatus.SCHEDULED: return 'bg-blue-100 text-blue-700';
      case TransactionStatus.PENDING: return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getCostCenterBadge = (cc: CostCenter) => {
     const colors = {
         [CostCenter.ADMIN]: 'text-purple-700 bg-purple-50 border-purple-100',
         [CostCenter.OPS]: 'text-cyan-700 bg-cyan-50 border-cyan-100',
         [CostCenter.COMMERCIAL]: 'text-amber-700 bg-amber-50 border-amber-100'
     };
     return `px-2 py-0.5 rounded border text-xs font-medium ${colors[cc]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contas a Pagar</h1>
          <p className="text-slate-500">Gestão de despesas e fornecedores.</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FileUp size={18} />
            Importar OFX/PDF
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2 font-bold">
             <span>Nova Despesa</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar fornecedor..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 border border-slate-200 rounded-lg bg-white">
            <option>Este Mês</option>
            <option>Próximo Mês</option>
          </select>
          <select className="px-4 py-2 border border-slate-200 rounded-lg bg-white">
            <option>Todos Centros Custo</option>
            <option>Admin</option>
            <option>Operacional</option>
            <option>Comercial</option>
          </select>
          <select className="px-4 py-2 border border-slate-200 rounded-lg bg-white">
            <option>Status</option>
            <option>Pendente</option>
            <option>Pago</option>
            <option>Agendado</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Fornecedor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Descrição</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Vencimento</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Valor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Centro de Custo</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{item.supplier}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(item.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    R$ {item.value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={getCostCenterBadge(item.costCenter)}>{item.costCenter}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       {item.status !== TransactionStatus.PAID && (
                         <button className="p-1.5 text-slate-400 hover:text-green-600" title="Pagar">
                           <Check size={18} />
                         </button>
                       )}
                       <button className="p-1.5 text-slate-400 hover:text-blue-600" title="Anexar Comprovante">
                         <Upload size={18} />
                       </button>
                       <button className="p-1.5 text-slate-400 hover:text-slate-600">
                         <MoreVertical size={18} />
                       </button>
                    </div>
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

export default PayablesScreen;
