
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FileText, Building2, User, Package, Calculator, 
  Send, Save, Plus, Trash2, ShieldCheck, Info, Sparkles, Loader2,
  ChevronDown, Globe, CreditCard, Layout, Eye, Code, Zap, Search,
  CheckCircle, AlertCircle, UserCheck, Box
} from 'lucide-react';
import { NfeData, NfeItem, Client } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { MOCK_CLIENTS, MOCK_INVENTORY } from '../constants';

const NfeScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'form' | 'xml'>('form');
  const [aiSuggesting, setAiSuggesting] = useState(false);
  
  // Autocomplete state
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [nfe, setNfe] = useState<NfeData>({
    ide: {
      natOp: 'Venda de Mercadoria Interna',
      mod: '55',
      serie: '1',
      nNF: '512',
      dhEmi: new Date().toISOString().split('T')[0],
      tpNF: '1', 
      idDest: '1', 
      tpImp: '1', 
      tpEmis: '1', 
      tpAmb: '2', 
      finNFe: '1', 
      indFinal: '1', 
      indPres: '1', 
    },
    emit: {
      name: 'BPO Pro - Assessoria Financeira Ltda',
      cnpj: '12.345.678/0001-90',
      email: 'financeiro@bpopro.com.br',
      phone: '(11) 98765-4321',
      address: 'Av. Paulista, 1000 - SP',
      crt: '1', 
      bankInfo: { bank: '', agency: '', account: '', pixKey: '' }
    },
    dest: {
      xNome: '',
      cnpjCpf: '',
      ie: '',
      indIEDest: '9', 
      email: '',
      enderDest: {
        xLgr: '', nro: '', xBairro: '', cMun: '3550308', xMun: 'São Paulo', uf: 'SP', cep: ''
      }
    },
    items: [
      {
        id: '1',
        cProd: 'PROD-001',
        xProd: 'Software Licença Mensal',
        ncm: '85234910',
        cfop: '5102',
        uCom: 'UN',
        qCom: 1,
        vUnCom: 250.00,
        vProd: 250.00,
        pISSQN: 0,
        vISSQN: 0,
        vBC: 250.00
      }
    ],
    vltTot: {
      vProd: 250.00,
      vDesc: 0,
      vISS: 0,
      vNF: 250.00
    },
    pag: {
      tPag: '15', 
      vPag: 250.00
    }
  });

  const validationResult = useMemo(() => {
    const raw = nfe.dest.cnpjCpf.replace(/\D/g, '');
    if (!raw) return { status: 'empty' };
    const isLengthValid = raw.length === 11 || raw.length === 14;
    if (!isLengthValid) return { status: 'invalid_format', message: 'Formato inválido' };
    const foundClient = MOCK_CLIENTS.find(c => c.cnpj?.replace(/\D/g, '') === raw);
    return foundClient ? { status: 'registered', client: foundClient } : { status: 'unregistered', message: 'Cliente não cadastrado' };
  }, [nfe.dest.cnpjCpf]);

  const filteredClients = MOCK_CLIENTS.filter(c => 
    c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    c.id.includes(clientSearchTerm)
  );

  const selectClient = (client: Client) => {
    setNfe({
      ...nfe,
      dest: {
        ...nfe.dest,
        xNome: client.name,
        cnpjCpf: client.cnpj || '',
        email: client.email,
        enderDest: {
          ...nfe.dest.enderDest,
          xLgr: client.address?.split(',')[0] || 'Rua Exemplo',
          nro: '123',
          cep: '01234-567'
        }
      }
    });
    setClientSearchTerm(client.name);
    setShowClientSuggestions(false);
  };

  const transmitNfe = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Lógica de Baixa de Estoque
      nfe.items.forEach(item => {
        const stockItem = MOCK_INVENTORY.find(si => si.sku === item.cProd);
        if (stockItem) {
          stockItem.quantity -= item.qCom;
          console.log(`Baixa de estoque: ${stockItem.name} -${item.qCom} unidades`);
        }
      });
      alert('NF-e Transmitida com Sucesso! Estoque atualizado automaticamente.');
    }, 2000);
  };

  const handleAiFiscalHelp = async (itemIdx: number) => {
    setAiSuggesting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analise fiscal do produto: ${nfe.items[itemIdx].xProd}`,
        config: { responseMimeType: 'application/json' }
      });
      const result = JSON.parse(response.text || "{}");
      const newItems = [...nfe.items];
      newItems[itemIdx] = { ...newItems[itemIdx], ncm: result.ncm || '85234910', cfop: result.cfop || '5102' };
      setNfe({ ...nfe, items: newItems });
    } catch (err) { console.error(err); } finally { setAiSuggesting(false); }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Emissão de NF-e 4.0</h1>
          <p className="text-slate-500 text-sm">Integrado com o Controle de Estoque Pro.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setActiveView('form')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeView === 'form' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Formulário</button>
          <button onClick={() => setActiveView('xml')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeView === 'xml' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>XML</button>
        </div>
      </div>

      {activeView === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                <User size={18} className="text-blue-600" /> Destinatário
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 relative" ref={dropdownRef}>
                  <label className="text-xs font-bold text-slate-500 uppercase">Pesquisar Cliente</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border rounded-lg text-sm" 
                    value={clientSearchTerm} 
                    onChange={e => {setClientSearchTerm(e.target.value); setShowClientSuggestions(true)}} 
                  />
                  {showClientSuggestions && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-xl shadow-xl max-h-48 overflow-auto">
                      {filteredClients.map(c => (
                        <button key={c.id} onClick={() => selectClient(c)} className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-0 text-sm">{c.name}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Box size={18} className="text-blue-600" /> Itens da Nota
                </h3>
              </div>
              <table className="w-full text-left">
                <thead className="text-[10px] text-slate-400 uppercase">
                  <tr>
                    <th className="py-2">Produto</th>
                    <th className="py-2 text-center">Qtd</th>
                    <th className="py-2 text-right">Valor</th>
                    <th className="py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {nfe.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3">
                        <div className="font-bold text-slate-800">{item.xProd}</div>
                        <div className="text-[10px] text-slate-400">SKU: {item.cProd} | NCM: {item.ncm}</div>
                      </td>
                      <td className="py-3 text-center font-bold">{item.qCom}</td>
                      <td className="py-3 text-right">R$ {item.vUnCom.toFixed(2)}</td>
                      <td className="py-3 text-right font-black">R$ {item.vProd.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <Calculator size={18} /> Resumo Financeiro
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Produtos</span>
                  <span>R$ {nfe.vltTot.vProd.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-slate-800">
                  <div className="text-xs text-emerald-400 font-bold mb-1">Valor Final NF-e</div>
                  <div className="text-4xl font-black">R$ {nfe.vltTot.vNF.toLocaleString()}</div>
                </div>
              </div>
              <button 
                onClick={transmitNfe}
                disabled={loading || !nfe.dest.xNome}
                className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {loading ? 'Transmitindo...' : 'Transmitir e Baixar Estoque'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NfeScreen;
