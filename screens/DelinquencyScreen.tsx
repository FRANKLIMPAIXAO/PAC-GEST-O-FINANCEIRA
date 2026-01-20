
import React, { useState } from 'react';
import { 
  AlertTriangle, DollarSign, Users, Calendar, 
  MessageCircle, FileText, Loader2, Sparkles, Send, Copy, Check,
  Smile, Gavel, ShieldAlert, RefreshCw, X
} from 'lucide-react';
import { MOCK_DELINQUENCY } from '../constants';
import { DelinquencyData, CollectionPlan } from '../types';
import { generateCollectionPlan } from '../services/geminiService';

const KPI = ({ title, value, subtext, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
    <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <p className="text-xs text-slate-400 mt-1">{subtext}</p>
    </div>
  </div>
);

const DelinquencyScreen: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<DelinquencyData | null>(null);
  const [aiPlan, setAiPlan] = useState<CollectionPlan | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<'friendly' | 'firm' | 'legal'>('friendly');

  const handleGeneratePlan = async (client: DelinquencyData, tone?: 'friendly' | 'firm' | 'legal') => {
    setSelectedClient(client);
    setLoadingAi(true);
    setAiPlan(null);
    if (tone) setSelectedTone(tone);
    
    const plan = await generateCollectionPlan(client.clientName, client, tone || selectedTone);
    setAiPlan(plan);
    setLoadingAi(false);
  };

  const closePlan = () => {
    setSelectedClient(null);
    setAiPlan(null);
    setCopyFeedback(null);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(type);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const totalLateValue = MOCK_DELINQUENCY.reduce((acc, curr) => acc + curr.totalValue, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inadimplência</h1>
          <p className="text-slate-500">Gestão de cobranças em atraso e recuperação.</p>
        </div>
        <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 font-semibold">
          <FileText size={18} />
          <span>Relatório Consolidado</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI 
          title="Valor Total em Atraso" 
          value={`R$ ${totalLateValue.toLocaleString()}`} 
          subtext="Impacto direto no caixa"
          icon={DollarSign} 
          color="bg-red-500"
        />
        <KPI 
          title="Clientes Devedores" 
          value={MOCK_DELINQUENCY.length.toString()} 
          subtext="4.2% da base total"
          icon={Users} 
          color="bg-orange-500"
        />
        <KPI 
          title="Ticket Médio Dívida" 
          value={`R$ ${(totalLateValue / MOCK_DELINQUENCY.length).toLocaleString()}`} 
          subtext="Por cliente"
          icon={AlertTriangle} 
          color="bg-yellow-500"
        />
        <KPI 
          title="Idade Média Atraso" 
          value="30 dias" 
          subtext="Tempo médio de espera"
          icon={Calendar} 
          color="bg-slate-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Ranking de Inadimplência</h3>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Atualizado agora</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Valor Aberto</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Maior Atraso</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Qtd. Faturas</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_DELINQUENCY.map((item) => (
                <tr key={item.clientId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{item.clientName}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-black">Último pagto: {new Date(item.lastPayment).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-red-600">R$ {item.totalValue.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      item.daysLate > 30 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {item.daysLate} dias
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium">{item.invoicesCount} faturas</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleGeneratePlan(item)}
                      className="group inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-bold shadow-sm active:scale-95"
                    >
                      <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                      Gerar Abordagem IA
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Collection Plan Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 rounded-t-2xl">
              <div className="flex items-center gap-3">
                 <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                   <Sparkles size={24} />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-slate-900">Estratégia de Cobrança IA</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedClient.clientName}</p>
                 </div>
              </div>
              <button onClick={closePlan} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-white">
              {/* Mood/Tone Selector */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Selecionar Tom da Abordagem</h4>
                <div className="flex p-1 bg-slate-100 rounded-2xl shadow-inner max-w-sm mx-auto w-full">
                  <button 
                    onClick={() => handleGeneratePlan(selectedClient, 'friendly')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${selectedTone === 'friendly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Smile size={14} /> Amigável
                  </button>
                  <button 
                    onClick={() => handleGeneratePlan(selectedClient, 'firm')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${selectedTone === 'firm' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <ShieldAlert size={14} /> Firme
                  </button>
                  <button 
                    onClick={() => handleGeneratePlan(selectedClient, 'legal')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${selectedTone === 'legal' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Gavel size={14} /> Jurídico
                  </button>
                </div>
              </div>

              {loadingAi ? (
                <div className="flex flex-col items-center justify-center py-16 gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-2xl animate-pulse"></div>
                    <Loader2 className="animate-spin text-blue-600 relative z-10" size={56} />
                  </div>
                  <div className="text-center">
                    <h4 className="text-lg font-bold text-slate-800">Processando Inteligência...</h4>
                    <p className="text-sm text-slate-500 animate-pulse">Analisando o tom {selectedTone} para o perfil do devedor.</p>
                  </div>
                </div>
              ) : aiPlan ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                  {/* Analysis Summary */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">
                      <Sparkles size={16} className="text-purple-500"/> Análise Estratégica
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed italic border-l-4 border-purple-400 pl-4">{aiPlan.analysis}</p>
                  </div>

                  {/* Channel Tabs Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* WhatsApp Script */}
                    <div className="flex flex-col h-full bg-[#E7FCE3] p-6 rounded-2xl border border-[#D5F0D0] relative group">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="flex items-center gap-2 font-black text-[#2E7D32] text-xs uppercase tracking-widest">
                          <MessageCircle size={16} /> WhatsApp
                        </h4>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => copyToClipboard(aiPlan.whatsappMessage, 'whatsapp')}
                             className="p-2 bg-white text-[#2E7D32] rounded-xl hover:bg-[#D5F0D0] transition-colors shadow-sm"
                           >
                             {copyFeedback === 'whatsapp' ? <Check size={16} /> : <Copy size={16} />}
                           </button>
                        </div>
                      </div>
                      <div className="bg-white/80 p-4 rounded-xl text-sm text-slate-800 whitespace-pre-line font-medium leading-snug flex-1">
                        {aiPlan.whatsappMessage}
                      </div>
                      <button 
                        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(aiPlan.whatsappMessage)}`, '_blank')}
                        className="mt-4 w-full py-3 bg-[#25D366] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-all shadow-md shadow-green-100 active:scale-95"
                      >
                        <MessageCircle size={18} /> Enviar Agora
                      </button>
                    </div>

                    {/* Email Script */}
                    <div className="flex flex-col h-full bg-[#EEF2FF] p-6 rounded-2xl border border-[#E0E7FF] relative group">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="flex items-center gap-2 font-black text-[#3730A3] text-xs uppercase tracking-widest">
                          <Send size={16} /> E-mail Formal
                        </h4>
                        <button 
                          onClick={() => copyToClipboard(`${aiPlan.emailSubject}\n\n${aiPlan.emailBody}`, 'email')}
                          className="p-2 bg-white text-[#3730A3] rounded-xl hover:bg-[#E0E7FF] transition-colors shadow-sm"
                        >
                          {copyFeedback === 'email' ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                      <div className="space-y-3 flex-1 flex flex-col">
                        <div className="bg-white/80 p-3 rounded-xl text-xs font-bold text-[#3730A3] border border-blue-100">
                          <span className="text-slate-400 font-normal mr-2">Assunto:</span> {aiPlan.emailSubject}
                        </div>
                        <div className="bg-white/80 p-4 rounded-xl text-xs text-slate-700 whitespace-pre-line leading-relaxed flex-1 overflow-y-auto max-h-[180px]">
                          {aiPlan.emailBody}
                        </div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(`${aiPlan.emailSubject}\n\n${aiPlan.emailBody}`, 'email')}
                        className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
                      >
                        <Copy size={18} /> Copiar para o Gmail
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-500 py-12 flex flex-col items-center gap-4">
                   <AlertTriangle size={48} />
                   <p className="font-bold">Ocorreu um erro ao processar o plano de cobrança.</p>
                   <button onClick={() => handleGeneratePlan(selectedClient)} className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold flex items-center gap-2">
                     <RefreshCw size={18} /> Tentar Novamente
                   </button>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-slate-50 rounded-b-2xl flex justify-between items-center">
               <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                 <ShieldAlert size={12} /> Sugerido pelo Consultor Gemini Flash
               </div>
               <button onClick={closePlan} className="px-8 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl transition-all font-bold active:scale-95 shadow-sm">
                 Fechar Painel
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DelinquencyScreen;
