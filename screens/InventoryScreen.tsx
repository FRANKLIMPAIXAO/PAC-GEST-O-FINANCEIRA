
import React, { useState, useRef } from 'react';
import { 
  Package, Search, Plus, FileUp, Upload, Loader2, Sparkles, X, 
  ArrowUp, ArrowDown, AlertTriangle, CheckCircle, Database, TrendingUp, History, ShoppingCart, Save
} from 'lucide-react';
import { MOCK_INVENTORY } from '../constants';
import { InventoryItem } from '../types';
import { parseNfeXml, ExtractedTransaction } from '../services/geminiService';

const InventoryScreen: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedTransaction | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return { label: 'Esgotado', color: 'bg-red-100 text-red-700 border-red-200' };
    if (item.quantity <= item.minQuantity) return { label: 'Crítico', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    return { label: 'Em dia', color: 'bg-green-100 text-green-700 border-green-200' };
  };

  const handleXmlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const content = reader.result as string;
      const data = await parseNfeXml(content);
      setExtractedData(data);
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!extractedData || !extractedData.products) return;

    // 1. Atualizar Estoque
    const updatedInventory = [...inventory];
    extractedData.products.forEach(newProd => {
      const index = updatedInventory.findIndex(item => item.name.toLowerCase().includes(newProd.name.toLowerCase().substring(0, 10)));
      if (index !== -1) {
        updatedInventory[index].quantity += newProd.quantity;
        updatedInventory[index].lastPurchasePrice = newProd.unitPrice;
      } else {
        updatedInventory.push({
          id: Math.random().toString(36).substr(2, 9),
          sku: 'NEW-' + Math.floor(Math.random() * 1000),
          name: newProd.name,
          quantity: newProd.quantity,
          minQuantity: 5,
          unit: 'UN',
          averageCost: newProd.unitPrice,
          lastPurchasePrice: newProd.unitPrice,
          ncm: newProd.ncm,
          category: 'Importado'
        });
      }
    });

    setInventory(updatedInventory);
    setIsImportModalOpen(false);
    setExtractedData(null);
    alert('Estoque atualizado e duplicatas enviadas ao Contas a Pagar!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Controle de Estoque</h1>
          <p className="text-slate-500">Gestão de mercadorias e insumos integrados ao financeiro.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all shadow-sm font-bold"
          >
            <FileUp size={18} />
            Subir XML de Compra
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md font-bold">
            <Plus size={18} />
            Novo Produto
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase mb-1">Total em Estoque</p>
          <h3 className="text-2xl font-bold text-slate-900">{inventory.reduce((a, b) => a + b.quantity, 0)} <span className="text-xs text-slate-400 font-normal">unidades</span></h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase mb-1">Valor Ativo (Custo)</p>
          <h3 className="text-2xl font-bold text-emerald-600">R$ {inventory.reduce((a, b) => a + (b.quantity * b.averageCost), 0).toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase mb-1">Itens Críticos</p>
          <h3 className="text-2xl font-bold text-orange-500">{inventory.filter(i => i.quantity <= i.minQuantity && i.quantity > 0).length}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase mb-1">Esgotados</p>
          <h3 className="text-2xl font-bold text-red-500">{inventory.filter(i => i.quantity === 0).length}</h3>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por SKU ou Nome..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
              <tr>
                <th className="px-6 py-4">SKU / Produto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-center">Quantidade</th>
                <th className="px-6 py-4">Preço Médio</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map(item => {
                const status = getStockStatus(item);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-black text-slate-800">{item.quantity} {item.unit}</div>
                      <div className="text-[9px] text-slate-400 uppercase">Mínimo: {item.minQuantity}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">R$ {item.averageCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"><History size={18} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL IMPORTAÇÃO XML */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
               <div className="flex items-center gap-3">
                 <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100"><Sparkles size={20} /></div>
                 <div>
                   <h3 className="font-bold text-slate-900">Alimentação Automática por XML</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">IA Integrada com SEFAZ</p>
                 </div>
               </div>
               <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors"><X size={24}/></button>
            </div>

            <div className="p-8">
              {!isProcessing && !extractedData && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-16 border-2 border-dashed border-slate-300 rounded-3xl hover:border-blue-500 hover:bg-blue-50 transition-all group cursor-pointer flex flex-col items-center gap-4"
                >
                  <Upload size={48} className="text-slate-300 group-hover:text-blue-500 transition-all" />
                  <p className="text-sm font-bold text-slate-500 group-hover:text-blue-700">Clique ou arraste o XML da nota de compra aqui</p>
                  <input type="file" ref={fileInputRef} accept=".xml" className="hidden" onChange={handleXmlUpload} />
                </div>
              )}

              {isProcessing && (
                <div className="py-20 flex flex-col items-center gap-6">
                   <Loader2 size={64} className="text-blue-600 animate-spin" />
                   <div className="text-center space-y-2">
                     <p className="text-lg font-black text-slate-800">IA Decompondo XML Fiscal...</p>
                     <p className="text-sm text-slate-400 italic">Identificando itens de estoque e parcelas de pagamento.</p>
                   </div>
                </div>
              )}

              {!isProcessing && extractedData && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                   <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-4">
                      <CheckCircle className="text-emerald-500" size={32} />
                      <div>
                        <h4 className="font-bold text-emerald-900">Nota de {extractedData.entity} detectada!</h4>
                        <p className="text-xs text-emerald-700">Total: R$ {extractedData.value?.toLocaleString()}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <ShoppingCart size={14} /> Itens para Entrada
                        </h5>
                        <div className="border rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                           {extractedData.products?.map((p, i) => (
                             <div key={i} className="p-3 border-b text-xs flex justify-between bg-white last:border-0">
                                <div>
                                  <div className="font-bold text-slate-800">{p.name}</div>
                                  <div className="text-[10px] text-slate-400">NCM: {p.ncm}</div>
                                </div>
                                <div className="text-right font-black text-blue-600">+{p.quantity} un</div>
                             </div>
                           ))}
                        </div>
                     </div>
                     <div className="space-y-3">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Database size={14} /> Contas a Pagar (Parcelas)
                        </h5>
                        <div className="border rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                           {extractedData.installments?.map((inst, i) => (
                             <div key={i} className="p-3 border-b text-xs flex justify-between bg-slate-50 last:border-0">
                                <div className="font-bold">Venc: {new Date(inst.dueDate).toLocaleDateString()}</div>
                                <div className="font-black text-red-600">R$ {inst.value.toLocaleString()}</div>
                             </div>
                           ))}
                           {(!extractedData.installments || extractedData.installments.length === 0) && (
                             <div className="p-4 text-center text-xs text-slate-400 italic">Pagamento à vista (detectado)</div>
                           )}
                        </div>
                     </div>
                   </div>

                   <div className="flex gap-3 pt-6 border-t">
                      <button onClick={() => setExtractedData(null)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all">Cancelar</button>
                      <button onClick={confirmImport} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                        <Save size={20} /> Confirmar e Integrar
                      </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryScreen;
