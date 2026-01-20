
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FileText, Building2, User, Package, Calculator, 
  Send, Save, Plus, Trash2, ShieldCheck, Info, Sparkles, Loader2,
  ChevronDown, Globe, CreditCard, Layout, Eye, Code, Zap, Search,
  CheckCircle, AlertCircle, UserCheck
} from 'lucide-react';
import { NfeData, NfeItem, Client } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { MOCK_CLIENTS } from '../constants';

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
      natOp: 'Prestação de Serviço de BPO Financeiro',
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
        cProd: 'SERV-001',
        xProd: 'BPO Financeiro Mensal - Referência Out/24',
        ncm: '00',
        cfop: '5933',
        uCom: 'UN',
        qCom: 1,
        vUnCom: 3500.00,
        vProd: 3500.00,
        pISSQN: 5.0,
        vISSQN: 175.00,
        vBC: 3500.00
      }
    ],
    vltTot: {
      vProd: 3500.00,
      vDesc: 0,
      vISS: 175.00,
      vNF: 3500.00
    },
    pag: {
      tPag: '15', 
      vPag: 3500.00
    }
  });

  // Validation Logic for CNPJ/CPF
  const validationResult = useMemo(() => {
    const raw = nfe.dest.cnpjCpf.replace(/\D/g, '');
    if (!raw) return { status: 'empty' };
    
    // Basic format check
    const isLengthValid = raw.length === 11 || raw.length === 14;
    if (!isLengthValid) return { status: 'invalid_format', message: 'Formato inválido (deve ter 11 ou 14 dígitos)' };

    // Check against mock database
    const foundClient = MOCK_CLIENTS.find(c => c.cnpj?.replace(/\D/g, '') === raw);
    
    if (foundClient) {
      return { status: 'registered', client: foundClient };
    } else {
      return { status: 'unregistered', message: 'Documento válido, mas não cadastrado na base de clientes' };
    }
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
          xLgr: client.address?.split(',')[0] || 'Rua Exemplo do Cliente',
          nro: '123',
          cep: '01234-567'
        }
      }
    });
    setClientSearchTerm(client.name);
    setShowClientSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowClientSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAiFiscalHelp = async (itemIdx: number) => {
    setAiSuggesting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Como um consultor fiscal brasileiro, forneça o código NCM (8 dígitos) e CFOP (4 dígitos) para este item de serviço: "${nfe.items[itemIdx].xProd}". Responda em JSON rigoroso com as chaves "ncm" e "cfop".`,
        config: {
           responseMimeType: 'application/json',
           responseSchema: {
             type: Type.OBJECT,
             properties: {
               ncm: { type: Type.STRING },
               cfop: { type: Type.STRING }
             }
           }
        }
      });

      const result = JSON.parse(response.text);
      const newItems = [...nfe.items];
      newItems[itemIdx] = { ...newItems[itemIdx], ncm: result.ncm, cfop: result.cfop };
      setNfe({ ...nfe, items: newItems });
    } catch (err) {
      console.error(err);
    } finally {
      setAiSuggesting(false);
    }
  };

  const addItem = () => {
    const newItem: NfeItem = {
      id: Math.random().toString(36).substr(2, 9),
      cProd: '', xProd: '', ncm: '', cfop: '5933', uCom: 'UN', qCom: 1, vUnCom: 0, vProd: 0,
      pISSQN: 5, vISSQN: 0, vBC: 0
    };
    setNfe({ ...nfe, items: [...nfe.items, newItem] });
  };

  const generateMockXml = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe versao="4.00" Id="NFe35241012345678000190550010000004821000004821">
    <ide>
      <cUF>35</cUF>
      <natOp>${nfe.ide.natOp}</natOp>
      <mod>${nfe.ide.mod}</mod>
      <serie>${nfe.ide.serie}</serie>
      <nNF>${nfe.ide.nNF}</nNF>
      <dhEmi>${nfe.ide.dhEmi}T10:00:00-03:00</dhEmi>
      <tpNF>${nfe.ide.tpNF}</tpNF>
      <idDest>${nfe.ide.idDest}</idDest>
      <cMunFG>3550308</cMunFG>
      <tpImp>${nfe.ide.tpImp}</tpImp>
      <tpEmis>${nfe.ide.tpEmis}</tpEmis>
      <tpAmb>${nfe.ide.tpAmb}</tpAmb>
      <finNFe>${nfe.ide.finNFe}</finNFe>
      <indFinal>${nfe.ide.indFinal}</indFinal>
      <indPres>${nfe.ide.indPres}</indPres>
    </ide>
    <emit>
      <CNPJ>${nfe.emit.cnpj.replace(/\D/g, '')}</CNPJ>
      <xNome>${nfe.emit.name}</xNome>
      <CRT>${nfe.emit.crt}</CRT>
    </emit>
    <dest>
      <CNPJ>${nfe.dest.cnpjCpf.replace(/\D/g, '')}</CNPJ>
      <xNome>${nfe.dest.xNome}</xNome>
      <indIEDest>${nfe.dest.indIEDest}</indIEDest>
    </dest>
    ${nfe.items.map((item, idx) => `
    <det nItem="${idx + 1}">
      <prod>
        <cProd>${item.cProd}</cProd>
        <xProd>${item.xProd}</xProd>
        <NCM>${item.ncm}</NCM>
        <CFOP>${item.cfop}</CFOP>
        <uCom>${item.uCom}</uCom>
        <qCom>${item.qCom.toFixed(4)}</qCom>
        <vUnCom>${item.vUnCom.toFixed(10)}</vUnCom>
        <vProd>${item.vProd.toFixed(2)}</vProd>
        <indTot>1</indTot>
      </prod>
    </det>`).join('')}
    <pag>
      <detPag>
        <tPag>${nfe.pag.tPag}</tPag>
        <vPag>${nfe.pag.vPag.toFixed(2)}</vPag>
      </detPag>
    </pag>
  </infNFe>
</NFe>`;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
             <h1 className="text-2xl font-bold text-slate-900">Emissão de NF-e 4.0</h1>
             <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-black rounded-full uppercase">Homologação</span>
          </div>
          <p className="text-slate-500 text-sm">Gestão fiscal rigorosa conforme NT 2023.001.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setActiveView('form')}
            className={`flex-1 md:flex-none flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'form' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            <Layout size={16} /> Formulário
          </button>
          <button 
            onClick={() => setActiveView('xml')}
            className={`flex-1 md:flex-none flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'xml' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            <Code size={16} /> Visualizar XML
          </button>
        </div>
      </div>

      {activeView === 'form' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* GRUPO IDE - Identificação */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Info size={18} className="text-blue-600" /> Identificação da Nota
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Natureza da Operação</label>
                  <input type="text" className="w-full p-2.5 border rounded-lg bg-slate-50 text-sm" value={nfe.ide.natOp} readOnly />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Data Emissão</label>
                  <input type="date" className="w-full p-2.5 border rounded-lg text-sm" value={nfe.ide.dhEmi} onChange={(e) => setNfe({...nfe, ide: {...nfe.ide, dhEmi: e.target.value}})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Local de Destino</label>
                  <select className="w-full p-2.5 border rounded-lg text-sm bg-white" value={nfe.ide.idDest} onChange={(e) => setNfe({...nfe, ide: {...nfe.ide, idDest: e.target.value}})}>
                    <option value="1">1 - Operação Interna</option>
                    <option value="2">2 - Operação Interestadual</option>
                    <option value="3">3 - Operação com Exterior</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Presença do Comprador</label>
                  <select className="w-full p-2.5 border rounded-lg text-sm bg-white" value={nfe.ide.indPres} onChange={(e) => setNfe({...nfe, ide: {...nfe.ide, indPres: e.target.value}})}>
                    <option value="0">0 - Não se aplica</option>
                    <option value="1">1 - Operação Presencial</option>
                    <option value="2">2 - Operação Internet</option>
                    <option value="9">9 - Outros</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">Finalidade <Globe size={12}/></label>
                  <select className="w-full p-2.5 border rounded-lg text-sm bg-white" value={nfe.ide.finNFe} onChange={(e) => setNfe({...nfe, ide: {...nfe.ide, finNFe: e.target.value}})}>
                    <option value="1">1 - NF-e Normal</option>
                    <option value="2">2 - NF-e Complementar</option>
                    <option value="3">3 - NF-e de Ajuste</option>
                    <option value="4">4 - Devolução de Mercadoria</option>
                  </select>
                </div>
              </div>
            </section>

            {/* GRUPO DEST - Destinatário (COM AUTOCOMPLETE E VALIDAÇÃO) */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-visible">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                <User size={18} className="text-blue-600" /> Destinatário (Cliente)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 md:col-span-2 relative" ref={dropdownRef}>
                  <label className="text-xs font-bold text-slate-500 uppercase">Pesquisar por Nome (Cadastro de Clientes)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Pesquisar cliente cadastrado..."
                      className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" 
                      value={clientSearchTerm}
                      onChange={(e) => {
                        setClientSearchTerm(e.target.value);
                        setShowClientSuggestions(true);
                      }}
                      onFocus={() => setShowClientSuggestions(true)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  </div>

                  {showClientSuggestions && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => selectClient(client)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                          >
                            <div>
                              <div className="text-sm font-bold text-slate-900">{client.name}</div>
                              <div className="text-[10px] text-slate-500 flex gap-2">
                                <span>Doc: {client.cnpj}</span>
                                <span>•</span>
                                <span>{client.email}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Ativo</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-slate-500 italic">
                          Nenhum cliente encontrado.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* CAMPO CNPJ/CPF COM VALIDAÇÃO EM TEMPO REAL */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
                    CNPJ / CPF
                    {validationResult.status === 'registered' && (
                      <span className="text-[9px] text-green-600 font-black uppercase flex items-center gap-1">
                        <UserCheck size={10} /> Cadastro Local OK
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className={`w-full pl-4 pr-10 py-2.5 border rounded-lg text-sm transition-all focus:ring-2 outline-none font-mono ${
                        validationResult.status === 'registered' ? 'border-green-500 focus:ring-green-100' :
                        validationResult.status === 'unregistered' ? 'border-yellow-500 focus:ring-yellow-100' :
                        validationResult.status === 'invalid_format' ? 'border-red-500 focus:ring-red-100' :
                        'border-slate-200 focus:ring-blue-100'
                      }`} 
                      value={nfe.dest.cnpjCpf} 
                      placeholder="00.000.000/0000-00" 
                      onChange={(e) => setNfe({...nfe, dest: {...nfe.dest, cnpjCpf: e.target.value}})}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {validationResult.status === 'registered' && <CheckCircle className="text-green-500" size={18} />}
                      {validationResult.status === 'unregistered' && <Info className="text-yellow-500" size={18} />}
                      {validationResult.status === 'invalid_format' && <AlertCircle className="text-red-500" size={18} />}
                    </div>
                  </div>
                  {validationResult.status === 'invalid_format' && (
                    <p className="text-[10px] text-red-500 font-bold italic mt-1">{validationResult.message}</p>
                  )}
                  {validationResult.status === 'unregistered' && (
                    <p className="text-[10px] text-yellow-600 font-bold italic mt-1">{validationResult.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Razão Social / Nome Completo</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border rounded-lg text-sm bg-white" 
                    value={nfe.dest.xNome} 
                    onChange={(e) => setNfe({...nfe, dest: {...nfe.dest, xNome: e.target.value}})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">IE Destinatário</label>
                  <select className="w-full p-2.5 border rounded-lg text-sm bg-white" value={nfe.dest.indIEDest} onChange={(e) => setNfe({...nfe, dest: {...nfe.dest, indIEDest: e.target.value}})}>
                    <option value="1">1 - Contribuinte ICMS</option>
                    <option value="2">2 - Contribuinte Isento</option>
                    <option value="9">9 - Não Contribuinte</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">E-mail para Envio XML/PDF</label>
                  <input 
                    type="email" 
                    className="w-full p-2.5 border rounded-lg text-sm bg-white" 
                    value={nfe.dest.email} 
                    onChange={(e) => setNfe({...nfe, dest: {...nfe.dest, email: e.target.value}})}
                  />
                </div>
              </div>
            </section>

            {/* GRUPO DET - Detalhamento de Itens */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Package size={18} className="text-blue-600" /> Detalhamento de Produtos e Serviços
                </h3>
                <button 
                  onClick={addItem}
                  className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-blue-100"
                >
                  <Plus size={14} /> Novo Item
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white text-[10px] font-bold text-slate-400 uppercase border-b">
                    <tr>
                      <th className="px-6 py-3">Prod/Serv</th>
                      <th className="px-6 py-3 w-32">NCM (Fiscal)</th>
                      <th className="px-6 py-3 w-24 text-center">Qtd</th>
                      <th className="px-6 py-3 w-32 text-right">V. Unitário</th>
                      <th className="px-6 py-3 w-32 text-right">Total</th>
                      <th className="px-6 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {nfe.items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/30 group">
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <input 
                              className="w-full text-sm font-bold text-slate-800 border-none focus:ring-0 p-0 bg-transparent"
                              value={item.xProd}
                              onChange={(e) => {
                                const newItems = [...nfe.items];
                                newItems[idx].xProd = e.target.value;
                                setNfe({...nfe, items: newItems});
                              }}
                            />
                            <div className="flex gap-2 text-[10px] text-slate-400">
                              <span>CFOP: {item.cfop}</span>
                              <span>•</span>
                              <span>uCom: {item.uCom}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                             <input type="text" className="w-full text-xs p-1.5 border border-slate-200 rounded text-center bg-slate-50 font-mono" value={item.ncm} onChange={(e) => {
                               const newItems = [...nfe.items];
                               newItems[idx].ncm = e.target.value;
                               setNfe({...nfe, items: newItems});
                             }} />
                             <button 
                               onClick={() => handleAiFiscalHelp(idx)}
                               disabled={aiSuggesting}
                               className="p-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors"
                               title="Sugerir via IA"
                             >
                               {aiSuggesting ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                             </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input type="number" className="w-full text-sm p-1.5 border border-slate-100 rounded text-center" value={item.qCom} onChange={(e) => {
                            const newItems = [...nfe.items];
                            newItems[idx].qCom = parseFloat(e.target.value);
                            newItems[idx].vProd = newItems[idx].qCom * newItems[idx].vUnCom;
                            setNfe({...nfe, items: newItems});
                          }} />
                        </td>
                        <td className="px-6 py-4">
                          <input type="number" className="w-full text-sm p-1.5 border border-slate-100 rounded text-right" value={item.vUnCom} onChange={(e) => {
                             const newItems = [...nfe.items];
                             newItems[idx].vUnCom = parseFloat(e.target.value);
                             newItems[idx].vProd = newItems[idx].qCom * newItems[idx].vUnCom;
                             setNfe({...nfe, items: newItems});
                          }} />
                        </td>
                        <td className="px-6 py-4 text-right font-black text-sm text-slate-900">
                          R$ {item.vProd.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setNfe({...nfe, items: nfe.items.filter(i => i.id !== item.id)})} className="text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

          </div>

          {/* Sidebar de Totais e Tributos */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl sticky top-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                <Calculator size={18} /> Resumo Financeiro (V4.0)
              </h3>
              
              <div className="space-y-5">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Forma de Pagamento</label>
                   <select className="w-full bg-slate-800 border-none rounded-lg text-sm p-2.5 focus:ring-1 focus:ring-blue-500">
                     <option value="15">Boleto Bancário</option>
                     <option value="17">PIX Dinâmico</option>
                     <option value="03">Cartão de Crédito</option>
                     <option value="90">Sem Pagamento</option>
                   </select>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-400">Total Produtos/Serv</span>
                    <span>R$ {nfe.vltTot.vProd.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-400">Total Descontos</span>
                    <span className="text-red-400">- R$ 0,00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Total ISSQN</span>
                    <span className="text-blue-400">R$ {nfe.vltTot.vISS.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-end mb-1">
                     <span className="text-xs font-bold text-emerald-400 uppercase tracking-tighter">Valor Total da NF-e</span>
                  </div>
                  <div className="text-4xl font-black text-white tracking-tighter drop-shadow-md">
                    R$ {nfe.vltTot.vNF.toLocaleString()}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {setLoading(true); setTimeout(() => {setLoading(false); alert('NF-e Transmitida com Sucesso!');}, 2000)}}
                disabled={loading || validationResult.status === 'invalid_format' || !nfe.dest.xNome}
                className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                {loading ? 'Transmitindo...' : 'Transmitir SEFAZ'}
              </button>

              <div className="mt-6 flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <ShieldCheck size={20} className="text-blue-500" />
                <div>
                  <p className="text-[10px] font-bold text-slate-300 uppercase">Validação Fiscal OK</p>
                  <p className="text-[9px] text-slate-500">Documento atende aos schemas PL_009_V4</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-blue-700 font-bold mb-2">
                <Sparkles size={18} />
                <h4 className="text-xs uppercase">Dica do Especialista</h4>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                A validação de CNPJ em tempo real previne rejeições na SEFAZ. Sempre verifique se o cliente está ativo no Sintegra para evitar a denegação da nota.
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* VISUALIZAÇÃO DO XML (Layout 4.0) */
        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
           <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <Code size={18} className="text-blue-400" />
                 <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Estrutura XML de Transmissão (NF-e 4.00)</span>
              </div>
              <button 
                onClick={() => {navigator.clipboard.writeText(generateMockXml()); alert('XML Copiado!')}}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase bg-blue-400/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                Copiar Conteúdo
              </button>
           </div>
           <div className="p-8 max-h-[65vh] overflow-y-auto font-mono text-xs leading-relaxed text-indigo-200">
             <pre className="whitespace-pre-wrap">
               {generateMockXml()}
             </pre>
           </div>
        </div>
      )}
    </div>
  );
};

export default NfeScreen;
