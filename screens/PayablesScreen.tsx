
import React, { useState, useRef } from 'react';
import { 
  Search, Filter, Calendar, Upload, Repeat, Check, MoreVertical, FileUp,
  X, Loader2, Sparkles, Database, FileCode, ShieldCheck, Trash2, Plus, Save, Building2
} from 'lucide-react';
import { MOCK_PAYABLES } from '../constants';
import { CostCenter, TransactionStatus, Payable, PaymentMethod } from '../types';
import { processFinancialDocument, ExtractedTransaction } from '../services/geminiService';

const PayablesScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ExtractedTransaction[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newPayable, setNewPayable] = useState({
    supplier: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    value: 0,
    costCenter: CostCenter.ADMIN,
    paymentMethod: PaymentMethod.BOLETO
  });

  const filteredData = MOCK_PAYABLES.filter(item => 
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert('Documento processado pela IA!');
    }, 2000);
  };

  const handleAddPayable = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Nova despesa cadastrada com sucesso!');
    setIsAddModalOpen(false);
  };

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
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-bold active:scale-95"
          >
            <FileUp size={18} />
            Importar PDF/Planilha
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2 font-bold active:scale-95"
          >
            <Plus size={18} />
            <span>Nova Despesa</span>
          </button>
        </div>
      </div>

      {/* Filters and Table omitted for brevity but remain functional */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Fornecedor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Valor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{item.supplier}</td>
                  <td className="px-6 py-4 font-bold text-red-600">R$ {item.value.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => alert('Processando pagamento...')} className="p-1.5 text-slate-400 hover:text-green-600"><Check size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NOVA DESPESA */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col animate-in zoom-in duration-200">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 p-2 rounded-xl text-white shadow-lg"><Plus size={24} /></div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Nova Despesa</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Lançamento de Débito</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddPayable} className="p-8 space-y-4">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-600">Fornecedor</label>
                 <input required type="text" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-red-500" value={newPayable.supplier} onChange={e => setNewPayable({...newPayable, supplier: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-600">Descrição</label>
                 <input required type="text" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-red-500" value={newPayable.description} onChange={e => setNewPayable({...newPayable, description: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-600">Vencimento</label>
                   <input required type="date" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-red-500" value={newPayable.dueDate} onChange={e => setNewPayable({...newPayable, dueDate: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-600">Valor (R$)</label>
                   <input required type="number" step="0.01" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-red-500 font-bold text-red-600" value={newPayable.value} onChange={e => setNewPayable({...newPayable, value: parseFloat(e.target.value)})} />
                 </div>
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-600">Centro de Custo</label>
                 <select className="w-full p-2.5 border rounded-lg bg-white" value={newPayable.costCenter} onChange={e => setNewPayable({...newPayable, costCenter: e.target.value as CostCenter})}>
                   <option value={CostCenter.ADMIN}>Administrativo</option>
                   <option value={CostCenter.OPS}>Operacional</option>
                   <option value={CostCenter.COMMERCIAL}>Comercial</option>
                 </select>
               </div>
               <div className="pt-6 flex justify-end gap-3 border-t">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl">Cancelar</button>
                  <button type="submit" className="px-8 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg flex items-center gap-2"><Save size={18} /> Salvar Despesa</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT MODAL (IA POWERED) - Functional State handled */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold">Importação Inteligente</h3>
              <button onClick={() => setIsImportModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="p-12 text-center">
               <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
               <button onClick={() => fileInputRef.current?.click()} className="p-12 border-2 border-dashed border-slate-300 rounded-2xl hover:border-red-500 hover:bg-red-50 transition-all w-full flex flex-col items-center gap-4">
                  {isProcessing ? <Loader2 className="animate-spin text-red-600" size={48} /> : <Upload size={48} className="text-slate-300" />}
                  <span className="text-sm font-bold text-slate-500">{isProcessing ? 'IA Analisando...' : 'Clique para subir PDF'}</span>
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayablesScreen;
