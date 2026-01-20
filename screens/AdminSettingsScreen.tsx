
import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Save, 
  Mail, 
  Phone, 
  CreditCard, 
  Lock, 
  UserPlus, 
  Trash2, 
  MoreVertical,
  Camera,
  Check,
  // Fixed Error: Added missing X icon import
  X
} from 'lucide-react';
import { CompanyConfig, SystemUser, UserRole } from '../types';

const AdminSettingsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'empresa' | 'usuarios' | 'admin'>('empresa');
  
  // Mock Initial Data
  const [company, setCompany] = useState<CompanyConfig>({
    name: 'BPO Pro - Assessoria Financeira',
    cnpj: '12.345.678/0001-90',
    email: 'contato@bpopro.com.br',
    phone: '(11) 98765-4321',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    bankInfo: {
      bank: 'Itaú Unibanco',
      agency: '0001',
      account: '12345-6',
      pixKey: 'financeiro@bpopro.com.br'
    }
  });

  const [users, setUsers] = useState<SystemUser[]>([
    { id: '1', name: 'Admin Master', email: 'admin@bpopro.com.br', role: UserRole.ADMIN, status: 'Ativo', lastLogin: '10/10/2024 09:45' },
    { id: '2', name: 'Ana Souza', email: 'ana@bpopro.com.br', role: UserRole.OPERATOR, status: 'Ativo', lastLogin: '09/10/2024 14:20' },
    { id: '3', name: 'Carlos Lima', email: 'carlos@bpopro.com.br', role: UserRole.VIEWER, status: 'Pendente' },
  ]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Configurações da empresa salvas com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configurações do Sistema</h1>
          <p className="text-slate-500">Gerencie sua empresa, usuários e permissões.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 space-y-1">
          <button 
            onClick={() => setActiveTab('empresa')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'empresa' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Building2 size={20} /> Empresa
          </button>
          <button 
            onClick={() => setActiveTab('usuarios')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'usuarios' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Users size={20} /> Usuários
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'admin' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck size={20} /> Administração
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Company Tab */}
          {activeTab === 'empresa' && (
            <form onSubmit={handleSaveCompany} className="divide-y divide-slate-100">
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Building2 className="text-blue-600" size={20} /> Perfil do BPO
                </h3>
                
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300 relative group overflow-hidden">
                      <Camera className="text-slate-400 group-hover:scale-110 transition-transform" size={32} />
                      <button className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold">
                        Alterar Logo
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 text-center">PNG ou JPG até 2MB.<br/>Recomendado 400x400.</p>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Nome Fantasia</label>
                      <input 
                        type="text" 
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={company.name}
                        onChange={(e) => setCompany({...company, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">CNPJ</label>
                      <input 
                        type="text" 
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={company.cnpj}
                        onChange={(e) => setCompany({...company, cnpj: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1"><Mail size={12}/> Email Corporativo</label>
                      <input 
                        type="email" 
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={company.email}
                        onChange={(e) => setCompany({...company, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1"><Phone size={12}/> Telefone</label>
                      <input 
                        type="text" 
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={company.phone}
                        onChange={(e) => setCompany({...company, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Endereço Completo</label>
                      <input 
                        type="text" 
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={company.address}
                        onChange={(e) => setCompany({...company, address: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CreditCard className="text-blue-600" size={20} /> Dados de Recebimento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Banco</label>
                      <input type="text" className="w-full p-2.5 border rounded-lg" value={company.bankInfo.bank} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Agência</label>
                      <input type="text" className="w-full p-2.5 border rounded-lg" value={company.bankInfo.agency} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Conta</label>
                      <input type="text" className="w-full p-2.5 border rounded-lg" value={company.bankInfo.account} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Chave PIX</label>
                      <input type="text" className="w-full p-2.5 border rounded-lg" value={company.bankInfo.pixKey} />
                   </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 flex justify-end">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md shadow-blue-100">
                  <Save size={18} /> Salvar Alterações
                </button>
              </div>
            </form>
          )}

          {/* Users Tab */}
          {activeTab === 'usuarios' && (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Gestão de Equipe</h3>
                  <p className="text-sm text-slate-500">Membros ativos e convites pendentes.</p>
                </div>
                <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                >
                  <UserPlus size={18} /> Convidar Membro
                </button>
              </div>

              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Perfil</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{user.name}</div>
                              <div className="text-xs text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                             user.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700 border-purple-100' :
                             user.role === UserRole.OPERATOR ? 'bg-blue-50 text-blue-700 border-blue-100' :
                             'bg-slate-50 text-slate-700 border-slate-100'
                           }`}>
                             {user.role}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-1.5">
                             <div className={`w-2 h-2 rounded-full ${user.status === 'Ativo' ? 'bg-green-500' : 'bg-orange-400'}`}></div>
                             <span className="text-sm text-slate-700">{user.status}</span>
                           </div>
                           {user.lastLogin && <p className="text-[10px] text-slate-400 mt-0.5">Acesso: {user.lastLogin}</p>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                              <MoreVertical size={18} />
                            </button>
                            {user.role !== UserRole.ADMIN && (
                              <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Admin Tab */}
          {activeTab === 'admin' && (
            <div className="divide-y divide-slate-100">
              <div className="p-8">
                <div className="flex items-start gap-4 max-w-2xl">
                  <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Administração Global</h3>
                    <p className="text-slate-500 leading-relaxed">
                      Gerencie as diretrizes de segurança, logs de auditoria e integrações nativas do sistema BPO.
                    </p>
                  </div>
                </div>

                <div className="mt-12 space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Segurança de Acesso</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 group cursor-pointer hover:bg-white transition-colors">
                        <div className="flex gap-3">
                          <Lock className="text-slate-400" size={20} />
                          <div>
                            <p className="font-bold text-slate-800 text-sm">Autenticação de Dois Fatores (2FA)</p>
                            <p className="text-xs text-slate-500">Exigir código extra para todos os administradores.</p>
                          </div>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                      </label>
                      <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 group cursor-pointer hover:bg-white transition-colors">
                        <div className="flex gap-3">
                          <Users className="text-slate-400" size={20} />
                          <div>
                            <p className="font-bold text-slate-800 text-sm">Controle de IP</p>
                            <p className="text-xs text-slate-500">Restringir acesso apenas a endereços IP autorizados.</p>
                          </div>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Auditoria e Logs</h4>
                    <div className="p-4 bg-slate-900 rounded-xl font-mono text-xs text-slate-400 space-y-1.5 overflow-hidden shadow-inner">
                      <p className="text-green-500">[2024-10-10 09:45:12] - ADMIN_LOGIN - user: admin@bpopro.com.br - IP: 187.54.12.10</p>
                      <p className="text-slate-300">[2024-10-10 10:12:05] - SETTINGS_UPDATE - field: company_address - user: admin@bpopro.com.br</p>
                      <p className="text-slate-500">[2024-10-10 10:30:12] - USER_INVITE - email: carlos@bpopro.com.br - role: VIEWER</p>
                      <p className="text-yellow-500">[2024-10-10 11:05:44] - FAILED_LOGIN_ATTEMPT - user: guest@xyz.com - IP: 201.23.4.5</p>
                    </div>
                    <button className="text-blue-600 text-xs font-bold hover:underline">Ver log completo de auditoria</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite User Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-600 text-white rounded-lg shadow-md">
                   <UserPlus size={20} />
                 </div>
                 <h3 className="text-lg font-bold">Novo Membro</h3>
               </div>
               <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                 <X size={24} />
               </button>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={(e) => { e.preventDefault(); setIsInviteModalOpen(false); alert('Convite enviado!')}}>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                 <input type="text" required placeholder="Ex: João da Silva" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">Email de Convite</label>
                 <input type="email" required placeholder="joao@bpopro.com.br" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">Perfil de Acesso</label>
                 <select className="w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500">
                   <option value={UserRole.OPERATOR}>Operador (Gestão de Dados)</option>
                   <option value={UserRole.VIEWER}>Visualizador (Apenas Leitura)</option>
                   <option value={UserRole.ADMIN}>Administrador (Acesso Total)</option>
                 </select>
                 <p className="text-[10px] text-slate-400 mt-1">O convite será enviado para o email informado com as instruções de senha.</p>
               </div>

               <div className="pt-4 flex gap-3">
                 <button 
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition-colors"
                 >
                   Cancelar
                 </button>
                 <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-95"
                 >
                   Enviar Convite
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsScreen;
