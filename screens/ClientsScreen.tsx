
import React, { useState } from 'react';
import { 
  Search, Filter, Plus, MoreHorizontal, CheckCircle, 
  AlertCircle, XCircle, Clock, Edit2, FileText, DollarSign, Ban, Check, X,
  Building2, Mail, Phone, User, MapPin, Save, Sparkles, PlusCircle,
  Calendar, AlignLeft
} from 'lucide-react';
import { MOCK_CLIENTS } from '../constants';
import { Client, ContractStatus, PaymentStatus, ServiceType } from '../types';

const ClientsScreen: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCustomService, setIsCustomService] = useState(false);
  const [customServiceValue, setCustomServiceValue] = useState('');
  
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    cnpj: '',
    address: '',
    email: '',
    whatsapp: '',
    responsible: '',
    serviceType: ServiceType.BPO,
    monthlyValue: 0,
    dueDate: 5,
    status: ContractStatus.ACTIVE,
    paymentStatus: PaymentStatus.PAID,
    contractStart: new Date().toISOString().split('T')[0],
    nextAdjustment: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    notes: ''
  });

  // Edit state for responsible field
  const [isEditingResponsible, setIsEditingResponsible] = useState(false);
  const [tempResponsible, setTempResponsible] = useState('');

  // Filter Logic
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (client.cnpj && client.cnpj.includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.ACTIVE: return 'bg-green-100 text-green-700';
      case ContractStatus.TEST: return 'bg-blue-100 text-blue-700';
      case ContractStatus.CANCELLED: return 'bg-red-100 text-red-700';
      case ContractStatus.PAUSED: return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPaymentStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return <CheckCircle size={16} className="text-green-500" />;
      case PaymentStatus.LATE: return <AlertCircle size={16} className="text-red-500" />;
      case PaymentStatus.NEGOTIATING: return <Clock size={16} className="text-orange-500" />;
      default: return <Clock size={16} className="text-slate-400" />;
    }
  };

  const handleOpenModal = (client: Client) => {
    setSelectedClient(client);
    setTempResponsible(client.responsible);
    setIsEditingResponsible(false);
  };

  const handleSaveResponsible = () => {
    if (!selectedClient) return;
    const updatedClient = { ...selectedClient, responsible: tempResponsible };
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    setSelectedClient(updatedClient);
    setIsEditingResponsible(false);
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const id = (clients.length + 1).toString();
    
    // Determine the service type to use
    const finalServiceType = isCustomService ? customServiceValue : newClient.serviceType;
    
    if (!finalServiceType) {
      alert('Por favor, defina um tipo de serviço.');
      return;
    }

    const clientToAdd = { 
      ...newClient, 
      id, 
      serviceType: finalServiceType 
    } as Client;
    
    setClients([clientToAdd, ...clients]);
    setIsAddModalOpen(false);
    
    // Reset form and states
    setIsCustomService(false);
    setCustomServiceValue('');
    setNewClient({
      name: '', cnpj: '', address: '', email: '', whatsapp: '', responsible: '',
      serviceType: ServiceType.BPO, monthlyValue: 0, dueDate: 5,
      status: ContractStatus.ACTIVE, paymentStatus: PaymentStatus.PAID,
      contractStart: new Date().toISOString().split('T')[0],
      notes: ''
    });
    alert('Novo contrato cadastrado com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes & Contratos</h1>
          <p className="text-slate-500">Gestão da carteira de clientes ativos e inativos.</p>
        </div>
        <button 
          onClick={() => {
            setIsCustomService(false);
            setCustomServiceValue('');
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-md active:scale-95"
        >
          <Plus size={20} />
          <span className="font-bold">Novo Contrato</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou CNPJ..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            <option value={ContractStatus.ACTIVE}>Ativos</option>
            <option value={ContractStatus.TEST}>Em Teste</option>
            <option value={ContractStatus.CANCELLED}>Cancelados</option>
          </select>
          <select className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Todos os Serviços</option>
            <option>BPO Financeiro</option>
            <option>Consultoria</option>
            <option>Mentoria</option>
            <option>Implantação</option>
          </select>
          <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor Mensal</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Início</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pagamento</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{client.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{client.cnpj || 'CNPJ não informado'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {client.serviceType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    R$ {client.monthlyValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(client.contractStart).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getPaymentStatusIcon(client.paymentStatus)}
                      <span className="text-sm text-slate-700">{client.paymentStatus}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Detalhes"
                        onClick={() => handleOpenModal(client)}
                      >
                        <FileText size={18} />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-green-600 transition-colors" title="Cobrança Avulsa">
                        <DollarSign size={18} />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NOVO CONTRATO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-200">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl text-white">
                  <Plus size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Novo Contrato</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Cadastro de Cliente</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddClient} className="p-8 overflow-y-auto space-y-6">
              {/* Seção Dados Básicos */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-tighter flex items-center gap-2">
                  <Building2 size={14} /> Informações Principais
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Razão Social / Nome</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                      value={newClient.name}
                      onChange={e => setNewClient({...newClient, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">CNPJ / CPF</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono" 
                      placeholder="00.000.000/0000-00"
                      value={newClient.cnpj}
                      onChange={e => setNewClient({...newClient, cnpj: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-600">Endereço Completo</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                        placeholder="Rua, Número, Bairro, Cidade - UF"
                        value={newClient.address}
                        onChange={e => setNewClient({...newClient, address: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção Contato e Responsável */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-tighter flex items-center gap-2">
                  <User size={14} /> Contato e Gestão
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Email Financeiro</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-slate-400" size={14} />
                      <input 
                        required
                        type="email" 
                        className="w-full pl-9 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                        value={newClient.email}
                        onChange={e => setNewClient({...newClient, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-slate-400" size={14} />
                      <input 
                        type="text" 
                        className="w-full pl-9 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono" 
                        placeholder="(00) 00000-0000"
                        value={newClient.whatsapp}
                        onChange={e => setNewClient({...newClient, whatsapp: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Sócio Responsável</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                      value={newClient.responsible}
                      onChange={e => setNewClient({...newClient, responsible: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Seção Contratual */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-tighter flex items-center gap-2">
                  <FileText size={14} /> Definições de Contrato
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600">Tipo de Serviço</label>
                    <div className="flex flex-col gap-2">
                      {!isCustomService ? (
                        <select 
                          className="w-full p-2.5 border rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          value={newClient.serviceType}
                          onChange={e => {
                            if (e.target.value === 'CUSTOM') {
                              setIsCustomService(true);
                            } else {
                              setNewClient({...newClient, serviceType: e.target.value as ServiceType});
                            }
                          }}
                        >
                          <option value={ServiceType.BPO}>BPO Financeiro</option>
                          <option value={ServiceType.CONSULTING}>Consultoria</option>
                          <option value={ServiceType.MENTORSHIP}>Mentoria</option>
                          <option value={ServiceType.IMPLEMENTATION}>Implantação</option>
                          <option disabled>──────────</option>
                          <option value="CUSTOM" className="font-bold text-blue-600">⊕ Outro (Personalizado)...</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-200">
                          <div className="relative flex-1">
                            <Sparkles className="absolute left-3 top-3 text-indigo-400" size={14} />
                            <input 
                              autoFocus
                              type="text" 
                              placeholder="Digite o serviço..."
                              className="w-full pl-9 pr-4 py-2.5 border-2 border-indigo-100 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold" 
                              value={customServiceValue}
                              onChange={e => setCustomServiceValue(e.target.value)}
                            />
                          </div>
                          <button 
                            type="button"
                            onClick={() => {setIsCustomService(false); setCustomServiceValue('')}}
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Voltar"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Valor Mensal</label>
                    <input 
                      required
                      type="number" 
                      className="w-full p-2.5 border rounded-lg text-sm font-bold text-blue-600 outline-none focus:ring-2 focus:ring-blue-500" 
                      value={newClient.monthlyValue}
                      onChange={e => setNewClient({...newClient, monthlyValue: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Vencimento (Dia)</label>
                    <input 
                      required
                      type="number" 
                      min="1" max="31"
                      className="w-full p-2.5 border rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-blue-500" 
                      value={newClient.dueDate}
                      onChange={e => setNewClient({...newClient, dueDate: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Início Contrato</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 text-slate-400" size={14} />
                      <input 
                        required
                        type="date" 
                        className="w-full pl-9 pr-2 py-2.5 border rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" 
                        value={newClient.contractStart}
                        onChange={e => setNewClient({...newClient, contractStart: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção Detalhes / Observações */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-tighter flex items-center gap-2">
                  <AlignLeft size={14} /> Observações / Detalhes
                </h4>
                <div className="space-y-1">
                  <textarea 
                    placeholder="Informações adicionais relevantes sobre este contrato ou cliente..."
                    className="w-full p-3 border rounded-lg text-sm min-h-[100px] focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-50/50"
                    value={newClient.notes}
                    onChange={e => setNewClient({...newClient, notes: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 border-t flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Descartar
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Save size={18} />
                  Salvar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Details */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Detalhes do Contrato</h3>
              <button onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                  {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{selectedClient.name}</h4>
                  <p className="text-xs text-slate-400 font-mono mb-1">{selectedClient.cnpj}</p>
                  <p className="text-sm text-slate-500">{selectedClient.id} • {selectedClient.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Tipo de Serviço</p>
                  <p className="font-bold text-blue-700 flex items-center gap-1">
                    <Sparkles size={12} className="text-blue-400" />
                    {selectedClient.serviceType}
                  </p>
                </div>
                
                <div className="p-3 bg-slate-50 rounded-lg group relative h-[62px]">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Responsável</p>
                  {isEditingResponsible ? (
                    <div className="flex items-center gap-1 absolute top-6 left-2 right-2 bg-white shadow-sm z-10 p-1 rounded border border-blue-200">
                       <input 
                         type="text" 
                         className="flex-1 text-sm border-none focus:ring-0 p-0 text-slate-800"
                         value={tempResponsible}
                         onChange={(e) => setTempResponsible(e.target.value)}
                         autoFocus
                       />
                       <button onClick={handleSaveResponsible} className="p-1 text-green-600 hover:bg-green-50 rounded">
                         <Check size={14} />
                       </button>
                       <button onClick={() => setIsEditingResponsible(false)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                         <X size={14} />
                       </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                       <p className="font-medium truncate">{selectedClient.responsible}</p>
                       <button 
                         onClick={() => setIsEditingResponsible(true)}
                         className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600 p-1"
                         title="Editar Responsável"
                       >
                         <Edit2 size={14} />
                       </button>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Valor Atual</p>
                  <p className="font-medium text-green-600">R$ {selectedClient.monthlyValue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Dia Vencimento</p>
                  <p className="font-medium">Dia {selectedClient.dueDate}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Data de Início</p>
                  <p className="font-medium">{new Date(selectedClient.contractStart).toLocaleDateString()}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase font-semibold">WhatsApp</p>
                  <p className="font-medium">{selectedClient.whatsapp || 'Não informado'}</p>
                </div>
                
                <div className="p-3 bg-slate-50 rounded-lg col-span-2">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Endereço</p>
                  <p className="text-sm font-medium">{selectedClient.address || 'Não informado'}</p>
                </div>
              </div>
              
              {/* Seção de Notas no Visualizar */}
              {selectedClient.notes && (
                <div className="pt-2">
                  <h5 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                    <AlignLeft size={12} /> Detalhes do Contrato
                  </h5>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed italic">
                    "{selectedClient.notes}"
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <h5 className="text-sm font-semibold mb-2">Histórico Recente</h5>
                <ul className="text-sm space-y-2 text-slate-600">
                  <li className="flex justify-between">
                    <span>Cobrança Out/2024</span>
                    <span className="text-green-600 font-medium">Paga</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Cobrança Set/2024</span>
                    <span className="text-green-600 font-medium">Paga</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex gap-3 justify-end border-t border-slate-100">
              <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-colors">
                Editar Contrato
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Gerar Cobrança
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsScreen;
