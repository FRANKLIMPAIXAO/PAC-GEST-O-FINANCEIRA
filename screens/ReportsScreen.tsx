import React, { useState } from 'react';
import { 
  FileBarChart, Calendar, Download, Building2, Sparkles, Loader2,
  TrendingUp, TrendingDown, AlertTriangle, Wallet, PieChart as PieIcon,
  BarChart as BarIcon, Target
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { MOCK_CLIENTS, MOCK_METRICS } from '../constants';
import { generateMeetingReport } from '../services/geminiService';
import { MonthlyReportData } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const ReportsScreen: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Outubro/2024');
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    // Allows generation even without client selected for demo purposes (using general data)
    // but ideally requires client
    setLoading(true);
    const client = MOCK_CLIENTS.find(c => c.id === selectedClient);
    const clientName = client ? client.name : "Empresa Modelo Ltda";
    
    // Simulating aggregation of data for the report context
    const summaryData = {
       revenue: 150000, 
       expenses: 65000, 
       result: 85000,
       kpis: MOCK_METRICS
    };

    const data = await generateMeetingReport(clientName, selectedMonth, summaryData);
    setReportData(data);
    setLoading(false);
  };

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString()}`;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relatório Mensal para Reunião</h1>
          <p className="text-slate-500">Ferramenta de consultoria e apresentação de resultados.</p>
        </div>
        {reportData && (
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
            <Download size={18} />
            Exportar PDF
          </button>
        )}
      </div>

      {/* Control Panel */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Building2 size={16} /> Selecionar Empresa
            </label>
            <select 
              className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <option value="">Selecione um cliente...</option>
              {MOCK_CLIENTS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar size={16} /> Mês de Referência
            </label>
            <select 
              className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option>Outubro 2024</option>
              <option>Setembro 2024</option>
              <option>Agosto 2024</option>
            </select>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full p-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold text-white transition-all shadow-md
              ${loading 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
              }
            `}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {loading ? 'Processando dados...' : 'Gerar Relatório'}
          </button>
        </div>
      </div>

      {!reportData && !loading && (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
             <FileBarChart size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-400">Aguardando geração</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">
            Selecione os parâmetros acima para gerar o dashboard da reunião.
          </p>
        </div>
      )}

      {reportData && (
        <div className="space-y-6 animate-fade-in-up">
          
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-slate-500 text-sm font-medium">Receita Total</span>
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={20} /></div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(reportData.summary.revenue)}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-slate-500 text-sm font-medium">Despesas</span>
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><TrendingDown size={20} /></div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(reportData.summary.expenses)}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-slate-500 text-sm font-medium">Resultado</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Wallet size={20} /></div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(reportData.summary.result)}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-slate-500 text-sm font-medium">Inadimplência</span>
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><AlertTriangle size={20} /></div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{reportData.summary.delinquencyRate}%</div>
              <p className="text-xs text-slate-400 mt-1">Meta: 3.0%</p>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-r from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-indigo-700 font-bold">
              <Sparkles size={20} />
              <h3>Insights do Consultor (IA)</h3>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {reportData.summary.aiComment}
            </p>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Revenue By Service */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                 <BarIcon size={20} className="text-slate-400" />
                 <h3 className="font-bold text-slate-800">Receita por Tipo de Serviço</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.revenueByService} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: '#64748b'}} />
                    <RechartsTooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Receita']}
                      contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expenses By Cost Center */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                 <PieIcon size={20} className="text-slate-400" />
                 <h3 className="font-bold text-slate-800">Despesas por Centro de Custo</h3>
              </div>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData.expensesByCostCenter}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {reportData.expensesByCostCenter.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Section: Top Clients & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Top 5 Clients */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                 <Target size={20} className="text-slate-400" />
                 <h3 className="font-bold text-slate-800">Top 5 Clientes (Pareto)</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Cliente</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Faturamento</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">% Receita</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData.topClients.map((client, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-6 py-3 font-medium text-slate-900">{client.name}</td>
                          <td className="px-6 py-3 text-slate-700">{formatCurrency(client.value)}</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${client.percent}%` }}></div>
                              </div>
                              <span className="text-xs font-medium text-slate-600">{client.percent}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>

            {/* Alerts & Risks */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                 <AlertTriangle size={20} className="text-slate-400" />
                 <h3 className="font-bold text-slate-800">Alertas e Riscos</h3>
               </div>
               <div className="p-5 space-y-4">
                 {reportData.alerts.map((alert, idx) => (
                   <div key={idx} className={`p-4 rounded-lg border flex items-start gap-3 ${
                     alert.type === 'critical' ? 'bg-red-50 border-red-100 text-red-800' :
                     alert.type === 'warning' ? 'bg-orange-50 border-orange-100 text-orange-800' :
                     'bg-blue-50 border-blue-100 text-blue-800'
                   }`}>
                     <div className={`mt-0.5 min-w-[6px] h-[6px] rounded-full ${
                       alert.type === 'critical' ? 'bg-red-500' :
                       alert.type === 'warning' ? 'bg-orange-500' :
                       'bg-blue-500'
                     }`} />
                     <p className="text-sm font-medium">{alert.message}</p>
                   </div>
                 ))}
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsScreen;