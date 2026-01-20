
import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Save, 
  Mail, 
  Phone, 
  Lock, 
  UserPlus, 
  Trash2, 
  MoreVertical,
  Camera,
  Check,
  X,
  Loader2,
  UserCircle,
  Shield,
  Key,
  UserCog,
  Sparkles
} from 'lucide-react';
import { CompanyConfig, SystemUser, UserRole } from '../types';

const AdminSettingsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'empresa' | 'usuarios' | 'perfil' | 'admin'>('empresa');
  const [securitySettings, setSecuritySettings] = useState({ tfa: false, ipControl: true });
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // States for Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mock Company Data
  const [company, setCompany] = useState<CompanyConfig>({
    name: 'BPO Pro - Assessoria Financeira',
    cnpj: '12.345.678/0001-90',
    email: 'contato@bpopro.com.br',
    phone: '(11) 98765-4321',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    crt: '1',
    bankInfo: {
      bank: 'Itaú Unibanco',
      agency: '0001',
      account: '12345-6',
      pixKey: 'financeiro@bpopro.com.br'
    }
  });

  // Mock Users List
  const [users, setUsers] = useState<SystemUser[]>([
    { id: '1', name: 'Admin Master', email: 'admin@bpopro.com.br', role: UserRole.ADMIN, status: 'Ativo', lastLogin: '10/10/2024 09:45' },
    { id: '2', name: 'Ana Souza', email: 'ana@bpopro.com.br', role: UserRole.OPERATOR, status: 'Ativo', lastLogin: '09/10/2024 14:20' },
    { id: '3', name: 'Carlos Lima', email: 'carlos@bpopro.com.br', role: UserRole.VIEWER, status: 'Pendente' },
  ]);

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: UserRole.OPERATOR
  });

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Configurações da empresa salvas com sucesso!');
    }, 1000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const user: SystemUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'Pendente'
    };
    setUsers([...users, user]);
    setIsAddUserModalOpen(false);
    setNewUser({ name: '', email: '', role: UserRole.OPERATOR });
    alert('Convite enviado para o e-mail do novo usuário!');
  };

  const deleteUser = (id: string) => {
    if (confirm('Tem certeza que deseja remover este acesso?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-purple-100 text-purple-700 border-purple-200';
      case UserRole.OPERATOR: return 'bg-blue-100 text-blue-700 border-blue-200';
      case UserRole.VIEWER: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configurações do Sistema</h1>
          <p className="text-slate-500">Gerencie sua empresa, usuários e níveis de acesso.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 space-y-1">
          <button 
            onClick={() => setActiveTab('empresa')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'empresa' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Building2 size={20} /> Empresa
          </button>
          <button 
            onClick={() => setActiveTab('usuarios')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'usuarios' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Users size={20} /> Usuários & Permissões
          </button>
          <button 
            onClick={() => setActiveTab('perfil')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'perfil' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <UserCircle size={20} /> Meu Perfil Admin
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'admin' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck size={20} /> Segurança & Logs
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
          
          {/* TAB: EMPRESA */}
          {activeTab === 'empresa' && (
            <form onSubmit={handleSaveCompany} className="h-full flex flex-col">
              <div className="p-8 space-y-8 flex-1">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 bg-slate-100 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-300 relative group overflow-hidden cursor-pointer shadow-inner">
                      <Camera className="text-slate-400" size={32} />
                      <div className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold">Trocar Logo</div>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Razão Social</label>
                      <input type="text" className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium" value={company.name} onChange={e => setCompany({...company, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CNPJ</label>
                      <input type="text" className="w-full p-2.5 border rounded-xl bg-slate-50 font-mono" value={company.cnpj} readOnly />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail de Contato Financeiro</label>
                      <input type="email" className="w-full p-2.5 border rounded-xl" value={company.email} onChange={e => setCompany({...company, email: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t flex justify-end">
                <button type="submit" disabled={isSaving} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95">
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Salvar Dados da Empresa
                </button>
              </div>
            </form>
          )}

          {/* TAB: USUÁRIOS */}
          {activeTab === 'usuarios' && (
            <div className="flex flex-col h-full">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900">Membros da Equipe</h3>
                  <p className="text-xs text-slate-500">Convide seu time e defina o que cada um pode acessar.</p>
                </div>
                <button 
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all active:scale-95"
                >
                  <UserPlus size={18} /> Novo Usuário
                </button>
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase border-b">
                    <tr>
                      <th className="px-8 py-4">Nome / Usuário</th>
                      <th className="px-8 py-4">Papel (Role)</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Último Acesso</th>
                      <th className="px-8 py-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4">
                          <div className="font-bold text-slate-800">{user.name}</div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </td>
                        <td className="px-8 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <span className={`flex items-center gap-1.5 text-xs font-bold ${user.status === 'Ativo' ? 'text-green-600' : 'text-orange-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Ativo' ? 'bg-green-500' : 'bg-orange-400'}`} />
                            {user.status}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-xs text-slate-500 font-medium">{user.lastLogin || '--'}</td>
                        <td className="px-8 py-4 text-right">
                          <button onClick={() => deleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: MEU PERFIL (ADMIN) */}
          {activeTab === 'perfil' && (
            <div className="p-8 space-y-8 animate-in fade-in duration-300">
               <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-200">
                    AM
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Admin Master</h3>
                    <p className="text-slate-500 font-medium">admin@bpopro.com.br</p>
                    <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-black rounded-full uppercase border border-purple-200 w-fit">
                      <Shield size={12} /> Super Administrador
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Key size={14} /> Segurança da Conta
                    </h4>
                    <button onClick={() => alert('Link de redefinição enviado!')} className="w-full text-left p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-white hover:shadow-sm transition-all flex justify-between items-center group">
                       <span className="text-sm font-bold text-slate-700">Alterar minha senha</span>
                       <Lock size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </button>
                    <button className="w-full text-left p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-white hover:shadow-sm transition-all flex justify-between items-center group">
                       <span className="text-sm font-bold text-slate-700">Minhas Sessões Ativas</span>
                       <Shield size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </button>
                  </div>
                  <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50 flex flex-col justify-center">
                    <Sparkles className="text-blue-500 mb-4" size={32} />
                    <h4 className="font-bold text-blue-900 mb-2">Acesso Prioritário</h4>
                    <p className="text-xs text-blue-800 leading-relaxed">Como administrador, você tem acesso às ferramentas de automação IA exclusivas para aceleração do BPO.</p>
                  </div>
               </div>
            </div>
          )}

          {/* TAB: SEGURANÇA */}
          {activeTab === 'admin' && (
            <div className="p-8 space-y-8 animate-in slide-in-from-right-2 duration-300">
               <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Políticas de Acesso</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { icon: Lock, title: '2FA Obrigatório', desc: 'Exige autenticação em duas etapas para todos os membros.', active: securitySettings.tfa },
                      { icon: Shield, title: 'Bloqueio de IP', desc: 'Restringir o acesso apenas para o IP do escritório (simulado).', active: securitySettings.ipControl }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="flex gap-4">
                          <div className="p-3 bg-white rounded-xl shadow-sm"><item.icon className="text-blue-600" size={20} /></div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.desc}</p>
                          </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${item.active ? 'bg-blue-600' : 'bg-slate-300'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${item.active ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
               
               <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Histórico de Alterações Críticas</h4>
                  <div className="space-y-2">
                    {[
                      { user: 'Admin Master', action: 'Alterou valor MRR - Cliente Tech Ltda', time: '10:30' },
                      { user: 'Ana Souza', action: 'Emitiu Lote de 15 Notas Fiscais', time: '09:15' }
                    ].map((log, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700">{log.user}</span>
                        <span className="text-slate-500">{log.action}</span>
                        <span className="text-slate-400 font-mono">{log.time}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: NOVO USUÁRIO */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg"><UserPlus size={20} /></div>
                <h3 className="font-bold text-slate-900">Convidar para Equipe</h3>
              </div>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:bg-slate-200 p-2 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddUser} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Nome Completo</label>
                <input required type="text" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">E-mail Corporativo</label>
                <input required type="email" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Nível de Acesso (Role)</label>
                <select className="w-full p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
                  <option value={UserRole.ADMIN}>Administrador (Acesso Total)</option>
                  <option value={UserRole.OPERATOR}>Operador (Gestão Diária)</option>
                  <option value={UserRole.VIEWER}>Visualizador (Somente Relatórios)</option>
                </select>
                <div className="pt-2">
                  {newUser.role === UserRole.ADMIN && <p className="text-[10px] text-purple-600 font-bold">Atenção: Admins podem excluir dados e criar outros usuários.</p>}
                  {newUser.role === UserRole.OPERATOR && <p className="text-[10px] text-blue-600 font-bold">Pode operar financeiro, mas não acessa configurações do sistema.</p>}
                  {newUser.role === UserRole.VIEWER && <p className="text-[10px] text-slate-500 font-bold">Não pode alterar dados, apenas visualizar dashboards.</p>}
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-2xl transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-95 transition-all">Enviar Convite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsScreen;
