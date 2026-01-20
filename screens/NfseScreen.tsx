
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Building2, User, Calculator, 
  Send, Save, Trash2, ShieldCheck, Info, Sparkles, Loader2,
  RefreshCw, Download, ExternalLink, XCircle, CheckCircle2, History, Search
} from 'lucide-react';
import { NfseNationalData, Client } from '../types';
import { MOCK_CLIENTS } from '../constants';

const NfseScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'emitir' | 'consultar'>('emitir');
  
  // Autocomplete state
  const [showTomadorSuggestions, setShowTomadorSuggestions] = useState(false);
  const [tomadorSearchTerm, setTomadorSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock State for NFSe Form
  const [nfseForm, setNfseForm] = useState<NfseNationalData>({
    data_emissao: new Date().toISOString(),
    data_competencia: new Date().toISOString().split('T')[0],
    codigo_municipio_emissora: 3550308, 
    cnpj_prestador: "12.345.678/0001-90",
    inscricao_municipal_prestador: "12345",
    codigo_opcao_simples_nacional: 1, 
    regime_especial_tributacao: 0,
    cnpj_tomador: "",
    razao_social_tomador: "",
    codigo_municipio_tomador: 3550308,
    cep_tomador: "",
    logradouro_tomador: "",
    numero_tomador: "",
    bairro_tomador: "",
    email_tomador: "",
    codigo_municipio_prestacao: 3550308,
    codigo_tributacao_nacional_iss: "01.07.01",
    descricao_servico: "Serviços de BPO Financeiro - Outubro/2024",
    valor_servico: 3500.00,
    tributacao_iss: 1,
    tipo_retencao_iss: 2 
  });

  const filteredClients = MOCK_CLIENTS.filter(c => 
    c.name.toLowerCase().includes(tomadorSearchTerm.toLowerCase()) ||
    c.id.includes(tomadorSearchTerm)
  );

  const selectTomador = (client: Client) => {
    setNfseForm({
      ...nfseForm,
      razao_social_tomador: client.name,
      cnpj_tomador: '00.000.000/0001-91', 
      email_tomador: client.email,
      logradouro_tomador: 'Rua Exemplo do Cliente',
      numero_tomador: '123',
      cep_tomador: '01234-567',
      bairro_tomador: 'Centro'
    });
    setTomadorSearchTerm(client.name);
    setShowTomadorSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTomadorSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mock List for Consultation
  const [history, setHistory] = useState<NfseNationalData[]>([
    {
      ref: "REF12345",
      status: 'autorizado',
      numero: "1052",
      codigo_verificacao: "XYZ123ABC999",
      data_emissao: "2024-10-05T10:00:00",
      razao_social_tomador: "Tech Solutions Ltda",
      valor_servico: 3500.00,
      descricao_servico: "Mensalidade BPO",
      url_danfse: "#",
      codigo_municipio_emissora: 3550308, cnpj_prestador: "", inscricao_municipal_prestador: "", 
      codigo_opcao_simples_nacional: 1, regime_especial_tributacao: 0, cnpj_tomador: "", 
      codigo_municipio_tomador: 3550308, cep_tomador: "", logradouro_tomador: "", numero_tomador: "", 
      bairro_tomador: "", email_tomador: "", codigo_municipio_prestacao: 3550308, 
      codigo_tributacao_nacional_iss: "", tributacao_iss: 1, tipo_retencao_iss: 1, data_competencia: ""
    }
  ]);

  const handleIssue = () => {
    setLoading(true);
    setTimeout(() => {
      const newRef = "REF" + Math.floor(Math.random() * 100000);
      const newInvoice: NfseNationalData = {
        ...nfseForm,
        ref: newRef,
        status: 'processando_autorizacao',
        data_emissao: new Date().toISOString()
      };
      setHistory([newInvoice, ...history]);
      setLoading(false);
      setActiveTab('consultar');
      alert(`Nota enviada para processamento! Referência: ${newRef}`);
    }, 2000);
  };

  const getStatusBadge = (status?: string) => {
    switch(status) {
      case 'autorizado': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><CheckCircle2 size={12}/> Autorizado</span>;
      case 'processando_autorizacao': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 animate-pulse"><RefreshCw size={12} className="animate-spin"/> Processando</span>;
      case 'cancelado': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><XCircle size={12}/> Cancelado</span>;
      case 'erro_autorizacao': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><Info size={12}/> Erro</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">NFS-e Nacional</h1>
          <p className="text-slate-500">Emissão de Nota Fiscal de Serviço Eletrônica via API Focus NFe.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('emitir')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'emitir' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}
          >
            <Send size={16} /> Emitir Nota
          </button>
          <button 
            onClick={() => setActiveTab('consultar')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'consultar' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}
          >
            <History size={16} /> Consultar / Histórico
          </button>
        </div>
      </div>

      {activeTab === 'emitir' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-left-4 duration-300">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Dados do Tomador (COM AUTOCOMPLETE) */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-visible">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2 border-b pb-3">
                <User size={18} className="text-blue-600" /> Informações do Tomador (Cliente)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2 relative" ref={dropdownRef}>
                  <label className="text-xs font-bold text-slate-500 uppercase">Razão Social ou Código do Cliente</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Pesquisar por iniciais ou ID..."
                      className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" 
                      value={tomadorSearchTerm}
                      onChange={(e) => {
                        setTomadorSearchTerm(e.target.value);
                        setShowTomadorSuggestions(true);
                      }}
                      onFocus={() => setShowTomadorSuggestions(true)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  </div>

                  {showTomadorSuggestions && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => selectTomador(client)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                          >
                            <div>
                              <div className="text-sm font-bold text-slate-900">{client.name}</div>
                              <div className="text-[10px] text-slate-500 flex gap-2 font-mono">
                                <span>ID: {client.id}</span>
                                <span>•</span>
                                <span>{client.email}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">{client.serviceType}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-slate-500 italic">
                          Nenhum cliente cadastrado com esse termo.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">CNPJ / CPF</label>
                  <input type="text" className="w-full p-2.5 border rounded-lg text-sm bg-slate-50" value={nfseForm.cnpj_tomador} onChange={(e) => setNfseForm({...nfseForm, cnpj_tomador: e.target.value})} placeholder="00.000.000/0000-00" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email para Envio</label>
                  <input type="email" className="w-full p-2.5 border rounded-lg text-sm" value={nfseForm.email_tomador} onChange={(e) => setNfseForm({...nfseForm, email_tomador: e.target.value})} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Endereço Completo</label>
                  <div className="grid grid-cols-4 gap-2">
                    <input type="text" placeholder="Logradouro" className="col-span-3 p-2 border rounded-lg text-sm bg-slate-50" value={nfseForm.logradouro_tomador} onChange={(e) => setNfseForm({...nfseForm, logradouro_tomador: e.target.value})} />
                    <input type="text" placeholder="Nº" className="p-2 border rounded-lg text-sm bg-slate-50" value={nfseForm.numero_tomador} onChange={(e) => setNfseForm({...nfseForm, numero_tomador: e.target.value})} />
                  </div>
                </div>
              </div>
            </section>

            {/* Detalhes do Serviço */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2 border-b pb-3">
                <Calculator size={18} className="text-blue-600" /> Detalhamento do Serviço e ISS
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Descrição do Serviço</label>
                  <textarea 
                    className="w-full p-2.5 border rounded-lg text-sm h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                    value={nfseForm.descricao_servico}
                    onChange={(e) => setNfseForm({...nfseForm, descricao_servico: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Código Tributação ISS</label>
                      <input type="text" className="w-full p-2.5 border rounded-lg text-sm font-mono bg-slate-50" value={nfseForm.codigo_tributacao_nacional_iss || "01.07.01"} readOnly />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Valor do Serviço</label>
                      <input 
                        type="number" 
                        className="w-full p-2.5 border rounded-lg text-sm font-bold text-blue-600" 
                        value={nfseForm.valor_servico} 
                        onChange={(e) => setNfseForm({...nfseForm, valor_servico: parseFloat(e.target.value)})}
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Retenção ISS</label>
                      <select className="w-full p-2.5 border rounded-lg text-sm bg-white" value={nfseForm.tipo_retencao_iss} onChange={(e) => setNfseForm({...nfseForm, tipo_retencao_iss: parseInt(e.target.value)})}>
                        <option value={1}>1 - Não Retido</option>
                        <option value={2}>2 - Retido pelo Tomador</option>
                      </select>
                   </div>
                </div>
              </div>
            </section>

          </div>

          {/* Resumo e Ação */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl sticky top-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                <ShieldCheck size={18} className="text-blue-400" /> Validação de Envio
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Ambiente</span>
                  <span className="font-bold text-orange-400">Homologação</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Referência</span>
                  <span className="font-bold">Automática</span>
                </div>
                <div className="pt-4 border-t border-slate-800">
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Ao emitir, a nota será enviada para o **Ambiente Nacional**. Este processo é assíncrono e você receberá o status na aba de consulta.
                  </p>
                </div>
                <div className="pt-4">
                  <div className="text-xs font-bold text-emerald-400 mb-1">Total da Nota</div>
                  <div className="text-3xl font-black tracking-tighter">
                    R$ {nfseForm.valor_servico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleIssue}
                disabled={loading || !nfseForm.razao_social_tomador}
                className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:bg-slate-700 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                {loading ? 'Enviando...' : 'Emitir NFS-e Nacional'}
              </button>
              {!nfseForm.razao_social_tomador && (
                <p className="text-[9px] text-red-400 mt-2 text-center uppercase font-bold tracking-tighter">Selecione um tomador para habilitar o envio</p>
              )}
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
                <Sparkles size={18} />
                <h4 className="text-xs uppercase">Sugestão de BPO</h4>
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Detectamos que o tomador está em outro município. Verifique se há necessidade de retenção de ISS no destino para evitar cobranças futuras.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* CONSULTA / HISTÓRICO */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-300">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <History size={18} className="text-blue-600" /> Notas Recentes e Status de Processamento
             </h3>
             <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
               <RefreshCw size={14} /> Atualizar Tudo
             </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-[10px] font-bold text-slate-400 uppercase border-b">
                <tr>
                  <th className="px-6 py-4">Ref. / Número</th>
                  <th className="px-6 py-4">Tomador</th>
                  <th className="px-6 py-4">Data Emissão</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Status API</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800">#{item.numero || '---'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.ref}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{item.razao_social_tomador}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(item.data_emissao).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900">R$ {item.valor_servico.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {item.status === 'autorizado' && (
                          <>
                            <button className="p-2 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-lg shadow-sm" title="Baixar DANFSe">
                              <Download size={16} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg shadow-sm" title="Cancelar Nota">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        <button className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm">
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {history.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              Nenhuma nota emitida recentemente.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NfseScreen;
