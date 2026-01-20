
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  FileBarChart,
  MessageSquare,
  ClipboardList,
  Settings,
  ShieldCheck,
  FileText,
  Files
} from 'lucide-react';

// Screens
import DashboardScreen from './screens/DashboardScreen';
import ClientsScreen from './screens/ClientsScreen';
import BillingScreen from './screens/BillingScreen';
import ReceivablesScreen from './screens/ReceivablesScreen';
import PayablesScreen from './screens/PayablesScreen';
import DelinquencyScreen from './screens/DelinquencyScreen';
import ReportsScreen from './screens/ReportsScreen';
import CommunicationScreen from './screens/CommunicationScreen';
import RequestsScreen from './screens/RequestsScreen';
import AdminSettingsScreen from './screens/AdminSettingsScreen';
import NfeScreen from './screens/NfeScreen';
import NfseScreen from './screens/NfseScreen';

const SidebarLink = ({ to, icon: Icon, label, badge }: { to: string; icon: any; label: string; badge?: number }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 relative ${
        isActive 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
      {badge ? (
        <span className="absolute right-4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {badge}
        </span>
      ) : null}
    </Link>
  );
};

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`
            fixed lg:static inset-y-0 left-0 z-30
            w-64 bg-slate-900 text-white flex flex-col
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
                B
              </div>
              <span className="text-xl font-bold tracking-tight">BPO Fin.</span>
            </div>
            <button 
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4">
              Gestão
            </div>
            <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink to="/clientes" icon={Users} label="Clientes" />
            <SidebarLink to="/faturamento" icon={Receipt} label="Faturamento MRR" />
            
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-6 px-4">
              Operacional
            </div>
            <SidebarLink to="/receber" icon={ArrowDownCircle} label="Contas a Receber" />
            <SidebarLink to="/pagar" icon={ArrowUpCircle} label="Contas a Pagar" />
            <SidebarLink to="/inadimplencia" icon={AlertTriangle} label="Inadimplência" />
            
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-6 px-4">
              Documentos Fiscais
            </div>
            <SidebarLink to="/nfse" icon={FileText} label="Emissão NFS-e" />
            <SidebarLink to="/nfe" icon={Files} label="Emissão NF-e" />

            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-6 px-4">
              Comunicação
            </div>
            <SidebarLink to="/comunicacao" icon={MessageSquare} label="Chat & Caixa" badge={7} />
            <SidebarLink to="/solicitacoes" icon={ClipboardList} label="Solicitações" badge={3} />
            
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-6 px-4">
              Estratégico
            </div>
            <SidebarLink to="/relatorios" icon={FileBarChart} label="Relatório Mensal" />

            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-6 px-4">
              Sistema
            </div>
            <SidebarLink to="/configuracoes" icon={Settings} label="Configurações" />
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors w-full">
              <LogOut size={20} />
              <span className="font-medium">Sair do Sistema</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-10">
            <button 
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div className="flex-1 lg:flex-none" /> 

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">Admin Master</p>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Admin</p>
                </div>
                <img 
                  src="https://picsum.photos/40/40" 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-slate-100"
                />
              </div>
            </div>
          </header>

          {/* Scrollable Area */}
          <main className="flex-1 overflow-auto p-4 lg:p-8">
            <Routes>
              <Route path="/" element={<DashboardScreen />} />
              <Route path="/clientes" element={<ClientsScreen />} />
              <Route path="/faturamento" element={<BillingScreen />} />
              <Route path="/receber" element={<ReceivablesScreen />} />
              <Route path="/pagar" element={<PayablesScreen />} />
              <Route path="/inadimplencia" element={<DelinquencyScreen />} />
              <Route path="/comunicacao" element={<CommunicationScreen />} />
              <Route path="/solicitacoes" element={<RequestsScreen />} />
              <Route path="/relatorios" element={<ReportsScreen />} />
              <Route path="/configuracoes" element={<AdminSettingsScreen />} />
              <Route path="/nfe" element={<NfeScreen />} />
              <Route path="/nfse" element={<NfseScreen />} />
            </Routes>
          </main>

        </div>
      </div>
    </HashRouter>
  );
};

export default App;
