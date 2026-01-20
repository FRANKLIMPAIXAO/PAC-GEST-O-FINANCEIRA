import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  FileText, 
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { MOCK_METRICS, CHART_DATA_LINE, CHART_DATA_BAR, CHART_DATA_PIE } from '../constants';
import { generateFinancialReport } from '../services/geminiService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const StatCard = ({ title, value, subtext, icon: Icon, trend, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <div className="text-2xl font-bold text-slate-900">{value}</div>
    {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
  </div>
);

const DashboardScreen: React.FC = () => {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleGenerateReport = async () => {
    setLoadingAi(true);
    const context = JSON.stringify({ metrics: MOCK_METRICS, charts: CHART_DATA_LINE });
    const report = await generateFinancialReport(context);
    setAiReport(report);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Geral</h1>
          <p className="text-slate-500">Visão consolidada da operação financeira.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleGenerateReport}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            disabled={loadingAi}
          >
            {loadingAi ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {loadingAi ? 'Gerando Análise...' : 'IA Insights'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <FileText size={18} />
            Relatório PDF
          </button>
        </div>
      </div>

      {/* AI Report Section */}
      {aiReport && (
        <div className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-xl border border-purple-100 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 mb-3 text-purple-800 font-semibold">
            <Sparkles size={20} />
            <h2>Análise Gemini AI</h2>
          </div>
          <div className="prose prose-sm text-slate-700 max-w-none whitespace-pre-line">
            {aiReport}
          </div>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatCard 
          title="MRR (Recorrente)" 
          value={`R$ ${MOCK_METRICS.mrr.toLocaleString()}`} 
          icon={TrendingUp} 
          trend={12} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Receita Recebida" 
          value={`R$ ${MOCK_METRICS.revenueReceived.toLocaleString()}`} 
          subtext="85% da meta mensal"
          icon={DollarSign} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Inadimplência" 
          value={`${MOCK_METRICS.defaultRate}%`} 
          subtext="Acima do tolerável (3%)"
          icon={AlertTriangle} 
          trend={-1.5}
          color="bg-red-500" 
        />
        <StatCard 
          title="Despesas Fixas" 
          value={`R$ ${MOCK_METRICS.fixedExpenses.toLocaleString()}`} 
          icon={TrendingDown} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Resultado Proj." 
          value={`R$ ${MOCK_METRICS.projectedResult.toLocaleString()}`} 
          icon={TrendingUp} 
          color="bg-indigo-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Entradas x Saídas (Últimos 6 meses)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CHART_DATA_LINE}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `R$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, '']}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="Entradas" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="Saidas" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Alertas e Atenção</h3>
          <div className="space-y-3">
            {[
              { text: "3 clientes com > 30 dias atraso", type: "critical" },
              { text: "2 contratos vencendo reajuste", type: "warning" },
              { text: "5 cobranças sem NFS-e emitida", type: "info" },
              { text: "Meta de MRR atingida!", type: "success" },
            ].map((alert, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer">
                <div className={`mt-1 w-2 h-2 rounded-full ${
                  alert.type === 'critical' ? 'bg-red-500' : 
                  alert.type === 'warning' ? 'bg-orange-500' : 
                  alert.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-sm text-slate-700 font-medium">{alert.text}</p>
                  <button className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1">
                    Resolver <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-slate-600 font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Ver Faturamento Detalhado
          </button>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Receita por Serviço</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA_BAR} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Receita']} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Despesas por Centro de Custo</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CHART_DATA_PIE}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CHART_DATA_PIE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
