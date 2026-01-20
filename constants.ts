
import { 
  Client, ContractStatus, PaymentStatus, ServiceType, BillingRecord, DashboardMetrics,
  Receivable, Payable, DelinquencyData, TransactionStatus, PaymentMethod, CostCenter,
  Conversation, ServiceRequest
} from './types';

export const MOCK_METRICS: DashboardMetrics = {
  mrr: 145000,
  revenueReceived: 98000,
  defaultRate: 4.2,
  fixedExpenses: 45000,
  projectedResult: 85000
};

export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Tech Solutions Ltda',
    serviceType: ServiceType.BPO,
    monthlyValue: 3500,
    dueDate: 5,
    status: ContractStatus.ACTIVE,
    nextAdjustment: '2025-06-01',
    paymentStatus: PaymentStatus.PAID,
    responsible: 'Ana Silva',
    email: 'financeiro@techsolutions.com',
    contractStart: '2023-01-10'
  },
  {
    id: '2',
    name: 'Restaurante Sabor & Arte',
    serviceType: ServiceType.CONSULTING,
    monthlyValue: 1200,
    dueDate: 10,
    status: ContractStatus.ACTIVE,
    nextAdjustment: '2025-05-15',
    paymentStatus: PaymentStatus.LATE,
    responsible: 'Carlos Souza',
    email: 'contato@saborearte.com',
    contractStart: '2024-02-01'
  },
  {
    id: '3',
    name: 'Advocacia Mendes',
    serviceType: ServiceType.BPO,
    monthlyValue: 4500,
    dueDate: 15,
    status: ContractStatus.TEST,
    nextAdjustment: '2025-08-01',
    paymentStatus: PaymentStatus.PENDING,
    responsible: 'Ana Silva',
    email: 'adm@mendes.adv.br',
    contractStart: '2025-01-01'
  },
  {
    id: '4',
    name: 'Construtora Build',
    serviceType: ServiceType.MENTORSHIP,
    monthlyValue: 8000,
    dueDate: 20,
    status: ContractStatus.CANCELLED,
    nextAdjustment: '2024-12-01',
    paymentStatus: PaymentStatus.NEGOTIATING,
    responsible: 'Roberto Lima',
    email: 'financeiro@build.com.br',
    contractStart: '2022-05-10'
  },
  {
    id: '5',
    name: 'Startup Z',
    serviceType: ServiceType.BPO,
    monthlyValue: 2500,
    dueDate: 5,
    status: ContractStatus.ACTIVE,
    nextAdjustment: '2025-10-01',
    paymentStatus: PaymentStatus.PAID,
    responsible: 'Carlos Souza',
    email: 'founders@startupz.com',
    contractStart: '2024-06-01'
  }
];

export const MOCK_BILLING: BillingRecord[] = [
  { id: '101', clientId: '1', clientName: 'Tech Solutions Ltda', service: ServiceType.BPO, value: 3500, status: 'Paga', dueDate: '2024-10-05', invoiceUrl: '#' },
  { id: '102', clientId: '2', clientName: 'Restaurante Sabor & Arte', service: ServiceType.CONSULTING, value: 1200, status: 'Em atraso', dueDate: '2024-10-10' },
  { id: '103', clientId: '3', clientName: 'Advocacia Mendes', service: ServiceType.BPO, value: 4500, status: 'Gerada', dueDate: '2024-10-15', invoiceUrl: '#' },
  { id: '104', clientId: '5', clientName: 'Startup Z', service: ServiceType.BPO, value: 2500, status: 'Não gerada', dueDate: '2024-10-05' },
];

export const MOCK_RECEIVABLES: Receivable[] = [
  { id: 'R1', clientId: '1', clientName: 'Tech Solutions Ltda', service: ServiceType.BPO, description: 'Mensalidade Out/24', dueDate: '2024-10-05', value: 3500, paymentMethod: PaymentMethod.BOLETO, status: TransactionStatus.PAID, hasNfs: true },
  { id: 'R2', clientId: '2', clientName: 'Restaurante Sabor & Arte', service: ServiceType.CONSULTING, description: 'Consultoria Financeira', dueDate: '2024-10-10', value: 1200, paymentMethod: PaymentMethod.PIX, status: TransactionStatus.LATE, hasNfs: false },
  { id: 'R3', clientId: '3', clientName: 'Advocacia Mendes', service: ServiceType.BPO, description: 'Mensalidade Out/24', dueDate: '2024-10-15', value: 4500, paymentMethod: PaymentMethod.BOLETO, status: TransactionStatus.OPEN, hasNfs: true },
  { id: 'R4', clientId: '5', clientName: 'Startup Z', service: ServiceType.BPO, description: 'Mensalidade Out/24', dueDate: '2024-10-05', value: 2500, paymentMethod: PaymentMethod.TRANSFER, status: TransactionStatus.OPEN, hasNfs: false },
  { id: 'R5', clientId: '1', clientName: 'Tech Solutions Ltda', service: ServiceType.IMPLEMENTATION, description: 'Setup Inicial', dueDate: '2024-09-15', value: 1500, paymentMethod: PaymentMethod.PIX, status: TransactionStatus.PAID, hasNfs: true },
];

export const MOCK_PAYABLES: Payable[] = [
  { id: 'P1', supplier: 'AWS Services', description: 'Servidor Nuvem', dueDate: '2024-10-25', value: 450.00, costCenter: CostCenter.OPS, paymentMethod: PaymentMethod.CARD, status: TransactionStatus.SCHEDULED },
  { id: 'P2', supplier: 'Imobiliária Central', description: 'Aluguel Escritório', dueDate: '2024-10-05', value: 2500.00, costCenter: CostCenter.ADMIN, paymentMethod: PaymentMethod.BOLETO, status: TransactionStatus.PAID },
  { id: 'P3', supplier: 'Google Workspace', description: 'Emails e Drive', dueDate: '2024-10-01', value: 150.00, costCenter: CostCenter.ADMIN, paymentMethod: PaymentMethod.CARD, status: TransactionStatus.PAID },
  { id: 'P4', supplier: 'Freelancer Design', description: 'Posts Redes Sociais', dueDate: '2024-10-15', value: 800.00, costCenter: CostCenter.COMMERCIAL, paymentMethod: PaymentMethod.PIX, status: TransactionStatus.PENDING },
];

export const MOCK_DELINQUENCY: DelinquencyData[] = [
  { clientId: '2', clientName: 'Restaurante Sabor & Arte', totalValue: 2400.00, daysLate: 15, invoicesCount: 2, lastPayment: '2024-08-10' },
  { clientId: '4', clientName: 'Construtora Build', totalValue: 8000.00, daysLate: 45, invoicesCount: 1, lastPayment: '2024-07-20' },
];

export const CHART_DATA_LINE = [
  { name: 'Mai', Entradas: 85000, Saidas: 40000 },
  { name: 'Jun', Entradas: 92000, Saidas: 42000 },
  { name: 'Jul', Entradas: 88000, Saidas: 45000 },
  { name: 'Ago', Entradas: 120000, Saidas: 48000 },
  { name: 'Set', Entradas: 115000, Saidas: 46000 },
  { name: 'Out', Entradas: 145000, Saidas: 50000 },
];

export const CHART_DATA_BAR = [
  { name: 'BPO', value: 85000 },
  { name: 'Consultoria', value: 25000 },
  { name: 'Mentoria', value: 35000 },
];

export const CHART_DATA_PIE = [
  { name: 'Operacional', value: 45 },
  { name: 'Admin', value: 30 },
  { name: 'Comercial', value: 25 },
];

// --- Mock Data for Communication ---

export const MOCK_CHATS: Conversation[] = [
  {
    id: 'c1',
    clientId: '1',
    clientName: 'Tech Solutions Ltda',
    category: 'Financeiro',
    unreadCount: 2,
    lastMessage: 'Segue comprovante do boleto de Outubro.',
    lastMessageTime: '10:30',
    status: 'Ativo',
    isUrgent: true,
    messages: [
      { id: 'm1', sender: 'me', content: 'Bom dia, prezados! Segue boleto referente a Outubro/2024.', timestamp: '09:00', type: 'text', isRead: true },
      { id: 'm2', sender: 'me', content: '', attachmentName: 'Boleto_Out_24.pdf', timestamp: '09:01', type: 'pdf', isRead: true },
      { id: 'm3', sender: 'client', content: 'Bom dia! Recebido. Já realizamos o pagamento.', timestamp: '10:25', type: 'text', isRead: false },
      { id: 'm4', sender: 'client', content: '', attachmentName: 'Comprovante.png', timestamp: '10:30', type: 'image', isRead: false, actionRequired: 'register_payment' },
    ]
  },
  {
    id: 'c2',
    clientId: '2',
    clientName: 'Restaurante Sabor & Arte',
    category: 'Solicitações',
    unreadCount: 0,
    lastMessage: 'Ok, vou aguardar a análise.',
    lastMessageTime: 'Ontem',
    status: 'Em atraso',
    messages: [
      { id: 'm1', sender: 'me', content: 'Olá, verificamos que a fatura 102 consta em aberto. Houve algum problema?', timestamp: 'Ontem 14:00', type: 'text', isRead: true },
      { id: 'm2', sender: 'client', content: 'Oi, tivemos um problema no caixa essa semana. Consigo pagar dia 15?', timestamp: 'Ontem 15:30', type: 'text', isRead: true },
      { id: 'm3', sender: 'me', content: 'Vou verificar a possibilidade de prorrogação sem juros e te retorno.', timestamp: 'Ontem 15:35', type: 'text', isRead: true },
      { id: 'm4', sender: 'client', content: 'Ok, vou aguardar a análise.', timestamp: 'Ontem 15:40', type: 'text', isRead: true },
    ]
  },
  {
    id: 'c3',
    clientId: '3',
    clientName: 'Advocacia Mendes',
    category: 'Geral',
    unreadCount: 5,
    lastMessage: 'Precisamos agendar a reunião mensal.',
    lastMessageTime: '08:15',
    status: 'Ativo',
    messages: [
      { id: 'm1', sender: 'client', content: 'Bom dia. Precisamos agendar a reunião mensal.', timestamp: '08:15', type: 'text', isRead: false },
    ]
  }
];

export const MOCK_REQUESTS: ServiceRequest[] = [
  { id: 'req1', clientId: '1', clientName: 'Tech Solutions Ltda', title: 'Emitir NFS-e Ref Outubro', type: 'Nota Fiscal', status: 'Aberto', priority: 'Alta', createdAt: '2024-10-06', updatedAt: '2024-10-06' },
  { id: 'req2', clientId: '2', clientName: 'Restaurante Sabor & Arte', title: 'Prorrogação de Boleto', type: 'Vencimento', status: 'Em análise', priority: 'Média', createdAt: '2024-10-05', updatedAt: '2024-10-06' },
  { id: 'req3', clientId: '3', clientName: 'Advocacia Mendes', title: 'Revisão Contrato', type: 'Contrato', status: 'Concluído', priority: 'Baixa', createdAt: '2024-09-28', updatedAt: '2024-10-01' },
];
