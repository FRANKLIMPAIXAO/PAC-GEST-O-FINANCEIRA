
export enum ContractStatus {
  ACTIVE = 'Ativo',
  TEST = 'Em teste',
  CANCELLED = 'Cancelado',
  PAUSED = 'Pausado'
}

export enum PaymentStatus {
  PAID = 'Em dia',
  LATE = 'Atrasado',
  NEGOTIATING = 'Em negociação',
  PENDING = 'Pendente'
}

export enum ServiceType {
  BPO = 'BPO Financeiro',
  MENTORSHIP = 'Mentoria',
  CONSULTING = 'Consultoria',
  IMPLEMENTATION = 'Implantação'
}

export enum TransactionStatus {
  OPEN = 'Em aberto',
  PAID = 'Pago',
  LATE = 'Em atraso',
  NEGOTIATED = 'Negociado',
  CANCELLED = 'Cancelado',
  PENDING = 'Pendente',
  SCHEDULED = 'Agendado'
}

export enum PaymentMethod {
  PIX = 'PIX',
  BOLETO = 'Boleto',
  TRANSFER = 'Transferência',
  CARD = 'Cartão'
}

export enum CostCenter {
  ADMIN = 'Administrativo',
  OPS = 'Operacional',
  COMMERCIAL = 'Comercial'
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  averageCost: number;
  lastPurchasePrice: number;
  ncm?: string;
  category: string;
}

export interface Client {
  id: string;
  name: string;
  serviceType: ServiceType | string;
  monthlyValue: number;
  dueDate: number;
  status: ContractStatus;
  nextAdjustment: string;
  paymentStatus: PaymentStatus;
  responsible: string;
  email: string;
  contractStart: string;
  cnpj?: string;
  address?: string;
  whatsapp?: string;
  notes?: string;
}

export interface CompanyConfig {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  logoUrl?: string;
  crt: string;
  bankInfo: {
    bank: string;
    agency: string;
    account: string;
    pixKey: string;
  };
}

export interface NfeItem {
  id: string;
  cProd: string;
  xProd: string;
  ncm: string;
  cfop: string;
  uCom: string;
  qCom: number;
  vUnCom: number;
  vProd: number;
  vDesc?: number;
  infAdProd?: string;
  pISSQN: number;
  vISSQN: number;
  vBC: number;
}

export interface NfeData {
  id?: string;
  ide: {
    natOp: string;
    mod: string;
    serie: string;
    nNF: string;
    dhEmi: string;
    tpNF: string;
    idDest: string;
    tpImp: string;
    tpEmis: string;
    tpAmb: string;
    finNFe: string;
    indFinal: string;
    indPres: string;
  };
  emit: CompanyConfig;
  dest: {
    xNome: string;
    cnpjCpf: string;
    ie?: string;
    indIEDest: string;
    email: string;
    enderDest: {
      xLgr: string;
      nro: string;
      xBairro: string;
      cMun: string;
      xMun: string;
      uf: string;
      cep: string;
    };
  };
  items: NfeItem[];
  vltTot: {
    vProd: number;
    vDesc: number;
    vISS: number;
    vNF: number;
  };
  pag: {
    tPag: string;
    vPag: number;
  };
}

export interface Receivable {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  description: string;
  dueDate: string;
  value: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  hasNfs: boolean;
}

export interface Payable {
  id: string;
  supplier: string;
  description: string;
  dueDate: string;
  value: number;
  costCenter: CostCenter;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  receiptUrl?: string;
}

export interface MonthlyReportData {
  summary: {
    revenue: number;
    expenses: number;
    result: number;
    delinquencyRate: number;
    aiComment: string;
  };
  revenueByService: any[];
  expensesByCostCenter: any[];
  topClients: any[];
  alerts: any[];
}

export interface CollectionPlan {
  analysis: string;
  whatsappMessage: string;
  emailSubject: string;
  emailBody: string;
}

export interface Conversation {
  id: string;
  clientId: string;
  clientName: string;
  category: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  status: string;
  isUrgent?: boolean;
  messages: any[];
}

export interface ServiceRequest {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  type: string;
  status: 'Aberto' | 'Em análise' | 'Concluído' | 'Rejeitado';
  priority: string;
  createdAt: string;
  updatedAt: string;
}

// Added missing types below for application components and services

export interface DashboardMetrics {
  mrr: number;
  revenueReceived: number;
  defaultRate: number;
  fixedExpenses: number;
  projectedResult: number;
}

export interface DelinquencyData {
  clientId: string;
  clientName: string;
  totalValue: number;
  daysLate: number;
  invoicesCount: number;
  lastPayment: string;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'client';
  type: 'text' | 'pdf' | 'image';
  content?: string;
  timestamp: string;
  attachmentName?: string;
  isRead?: boolean;
  actionRequired?: string;
}

export type RequestStatus = 'Aberto' | 'Em análise' | 'Concluído' | 'Rejeitado';

export enum UserRole {
  ADMIN = 'Administrador',
  OPERATOR = 'Operador',
  VIEWER = 'Visualizador'
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  lastLogin?: string;
}

export interface NfseNationalData {
  ref?: string;
  status?: string;
  numero?: string;
  codigo_verificacao?: string;
  url_danfse?: string;
  data_emissao: string;
  data_competencia: string;
  codigo_municipio_emissora: number;
  cnpj_prestador: string;
  inscricao_municipal_prestador: string;
  codigo_opcao_simples_nacional: number;
  regime_especial_tributacao: number;
  cnpj_tomador: string;
  razao_social_tomador: string;
  codigo_municipio_tomador: number;
  cep_tomador: string;
  logradouro_tomador: string;
  numero_tomador: string;
  bairro_tomador: string;
  email_tomador: string;
  codigo_municipio_prestacao: number;
  codigo_tributacao_nacional_iss: string;
  descricao_servico: string;
  valor_servico: number;
  tributacao_iss: number;
  tipo_retencao_iss: number;
}
