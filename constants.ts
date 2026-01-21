
import { 
  Client, ContractStatus, PaymentStatus, ServiceType, DashboardMetrics,
  Receivable, Payable, TransactionStatus, PaymentMethod, CostCenter,
  Conversation, ServiceRequest, InventoryItem, DelinquencyData
} from './types';

export const MOCK_METRICS: DashboardMetrics = {
  mrr: 145000,
  revenueReceived: 98000,
  defaultRate: 4.2,
  fixedExpenses: 45000,
  projectedResult: 85000
};

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', sku: 'PROD-001', name: 'Software Licença Mensal', quantity: 50, minQuantity: 10, unit: 'UN', averageCost: 150.00, lastPurchasePrice: 155.00, ncm: '85234910', category: 'Software' },
  { id: '2', sku: 'HW-050', name: 'Roteador Wi-Fi 6 Mesh', quantity: 5, minQuantity: 8, unit: 'UN', averageCost: 450.00, lastPurchasePrice: 480.00, ncm: '85176241', category: 'Hardware' },
  { id: '3', sku: 'CB-99', name: 'Cabo de Rede CAT6 305m', quantity: 12, minQuantity: 5, unit: 'CX', averageCost: 320.00, lastPurchasePrice: 310.00, ncm: '85444900', category: 'Cabeamento' },
  { id: '4', sku: 'SRV-DL380', name: 'Servidor HP DL380 G10', quantity: 0, minQuantity: 1, unit: 'UN', averageCost: 18500.00, lastPurchasePrice: 19200.00, ncm: '84715010', category: 'Infra' }
];

export const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Tech Solutions Ltda', serviceType: ServiceType.BPO, monthlyValue: 3500, dueDate: 5, status: ContractStatus.ACTIVE, nextAdjustment: '2025-06-01', paymentStatus: PaymentStatus.PAID, responsible: 'Ana Silva', email: 'financeiro@techsolutions.com', contractStart: '2023-01-10', cnpj: '12.345.678/0001-90' },
  { id: '2', name: 'Restaurante Sabor & Arte', serviceType: ServiceType.CONSULTING, monthlyValue: 1200, dueDate: 10, status: ContractStatus.ACTIVE, nextAdjustment: '2025-05-15', paymentStatus: PaymentStatus.LATE, responsible: 'Carlos Souza', email: 'contato@saborearte.com', contractStart: '2024-02-01', cnpj: '98.765.432/0001-21' }
];

export const MOCK_RECEIVABLES: Receivable[] = [
  { id: 'R1', clientId: '1', clientName: 'Tech Solutions Ltda', service: ServiceType.BPO, description: 'Mensalidade Out/24', dueDate: '2024-10-05', value: 3500, paymentMethod: PaymentMethod.BOLETO, status: TransactionStatus.PAID, hasNfs: true },
  { id: 'R2', clientId: '2', clientName: 'Restaurante Sabor & Arte', service: ServiceType.CONSULTING, description: 'Consultoria Financeira', dueDate: '2024-10-10', value: 1200, paymentMethod: PaymentMethod.PIX, status: TransactionStatus.LATE, hasNfs: false }
];

export const MOCK_PAYABLES: Payable[] = [
  { id: 'P1', supplier: 'AWS Services', description: 'Servidor Nuvem', dueDate: '2024-10-25', value: 450.00, costCenter: CostCenter.OPS, paymentMethod: PaymentMethod.CARD, status: TransactionStatus.SCHEDULED },
  { id: 'P2', supplier: 'Imobiliária Central', description: 'Aluguel Escritório', dueDate: '2024-10-05', value: 2500.00, costCenter: CostCenter.ADMIN, paymentMethod: PaymentMethod.BOLETO, status: TransactionStatus.PAID }
];

export const CHART_DATA_LINE = [
  { name: 'Mai', Entradas: 85000, Saidas: 40000 },
  { name: 'Jun', Entradas: 92000, Saidas: 42000 },
  { name: 'Jul', Entradas: 88000, Saidas: 45000 },
  { name: 'Ago', Entradas: 120000, Saidas: 48000 },
  { name: 'Set', Entradas: 115000, Saidas: 46000 },
  { name: 'Out', Entradas: 145000, Saidas: 50000 },
];

export const CHART_DATA_BAR = [{ name: 'BPO', value: 85000 }, { name: 'Consultoria', value: 25000 }, { name: 'Mentoria', value: 35000 }];
export const CHART_DATA_PIE = [{ name: 'Operacional', value: 45 }, { name: 'Admin', value: 30 }, { name: 'Comercial', value: 25 }];

export const MOCK_CHATS: Conversation[] = [
  { id: 'c1', clientId: '1', clientName: 'Tech Solutions Ltda', category: 'Financeiro', unreadCount: 2, lastMessage: 'Segue comprovante do boleto de Outubro.', lastMessageTime: '10:30', status: 'Ativo', isUrgent: true, messages: [] }
];

export const MOCK_REQUESTS: ServiceRequest[] = [
  { id: 'req1', clientId: '1', clientName: 'Tech Solutions Ltda', title: 'Emitir NFS-e Ref Outubro', type: 'Nota Fiscal', status: 'Aberto', priority: 'Alta', createdAt: '2024-10-06', updatedAt: '2024-10-06' }
];

// Added missing mock data for billing and delinquency screens

export const MOCK_BILLING = [
  { id: 'B1', clientName: 'Tech Solutions Ltda', service: ServiceType.BPO, value: 3500, status: 'Paga' },
  { id: 'B2', clientName: 'Restaurante Sabor & Arte', service: ServiceType.CONSULTING, value: 1200, status: 'Em atraso' },
  { id: 'B3', clientName: 'Indústria Metalúrgica SA', service: ServiceType.BPO, value: 8500, status: 'Não gerada' },
];

export const MOCK_DELINQUENCY: DelinquencyData[] = [
  { clientId: '2', clientName: 'Restaurante Sabor & Arte', totalValue: 2400, daysLate: 45, invoicesCount: 2, lastPayment: '2024-08-10' },
  { clientId: '5', clientName: 'Clínica Bem Viver', totalValue: 1200, daysLate: 15, invoicesCount: 1, lastPayment: '2024-09-05' },
];
