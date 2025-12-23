export enum PromotionStatus {
  DRAFT = 'Draft',
  PLANNED = 'Planned',
  APPROVED = 'Approved',
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  ARCHIVED = 'Archived'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  EXECUTIVE = 'EXECUTIVE',
  REVENUE_MANAGER = 'REVENUE_MANAGER',
  ACCOUNT_MANAGER = 'ACCOUNT_MANAGER',
  FINANCE = 'FINANCE',
  ANALYST = 'ANALYST'
}

export enum DeductionStatus {
  OPEN = 'Open',
  PENDING = 'Pending',
  CLEARED = 'Cleared',
  CONTESTED = 'Contested'
}

export enum OptimizationGoal {
  REVENUE = 'Revenue',
  VOLUME = 'Volume',
  MARGIN = 'Margin'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  industry: string;
  size: string;
  createdAt: Date;
  updatedAt: Date;
  settings: TenantSettings;
}

export interface TenantSettings {
  currency: string;
  fiscalYearStart: number; // Month (0-11)
  defaultMargin: number;
  timezone: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  category: ProductCategory;
  subcategory?: string;
  basePrice: number;
  cost: number;
  margin: number;
  unit: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  tenantId: string;
  name: string;
  parentId?: string;
  isActive: boolean;
}

export interface Retailer {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  region: string;
  channel: string;
  tier: 'A' | 'B' | 'C';
  contactEmail?: string;
  contactPhone?: string;
  address?: Address;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface TradePromotion {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  status: PromotionStatus;
  retailerId: string;
  productIds: string[];
  startDate: Date;
  endDate: Date;
  mechanic: PromotionMechanic;
  discountDepth: number; // 0.1 = 10%
  plannedSpend: number;
  actualSpend?: number;
  plannedVolume: number;
  actualVolume?: number;
  plannedRevenue: number;
  actualRevenue?: number;
  plannedMargin: number;
  actualMargin?: number;
  roi?: number;
  liftPercent?: number;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  promotionHistory: PromotionHistory[];
}

export interface PromotionMechanic {
  type: 'TPR' | 'BOGO' | 'DISPLAY' | 'FEATURE' | 'COUPON' | 'LOYALTY' | 'BUNDLE';
  description: string;
  buyQuantity?: number;
  getQuantity?: number;
  minimumPurchase?: number;
  maximumDiscount?: number;
}

export interface PromotionHistory {
  id: string;
  promotionId: string;
  action: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  userId: string;
  reason?: string;
  createdAt: Date;
}

export interface Deduction {
  id: string;
  tenantId: string;
  retailerId: string;
  promotionId?: string;
  amount: number;
  status: DeductionStatus;
  type: string;
  reason: string;
  invoiceNumber?: string;
  date: Date;
  dueDate?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Claim {
  id: string;
  tenantId: string;
  deductionId: string;
  promotionId?: string;
  amount: number;
  status: 'Submitted' | 'Approved' | 'Rejected' | 'Paid';
  submittedAt: Date;
  approvedAt?: Date;
  paidAt?: Date;
  notes?: string;
  attachments?: string[];
}

export interface CompanyGoal {
  id: string;
  tenantId: string;
  type: 'Revenue' | 'Volume' | 'Margin';
  target: number;
  current: number;
  period: string; // 'FY2025', 'Q1-2025', etc.
  createdAt: Date;
  updatedAt: Date;
}

export interface POSData {
  id: string;
  tenantId: string;
  retailerId: string;
  productId: string;
  date: Date;
  baselineSales: number;
  promotedSales: number;
  baselineRevenue: number;
  promotedRevenue: number;
  units: number;
  price: number;
  isPromotion: boolean;
  promotionId?: string;
  createdAt: Date;
}

export interface AccountingData {
  id: string;
  tenantId: string;
  retailerId: string;
  date: Date;
  accountType: string;
  accountCode: string;
  amount: number;
  description?: string;
  reference?: string;
  createdAt: Date;
}

export interface Scenario {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  goal: OptimizationGoal;
  budget: number;
  constraints: ScenarioConstraints;
  results: ScenarioResult;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScenarioConstraints {
  minDiscount: number;
  maxDiscount: number;
  frequencyCap?: number;
  supplyLimits?: Record<string, number>;
  retailerFairness?: boolean;
}

export interface ScenarioResult {
  predictedLift: number;
  totalRevenue: number;
  totalVolume: number;
  totalMargin: number;
  roi: number;
  allocation: PromotionAllocation[];
}

export interface PromotionAllocation {
  retailerId: string;
  productId: string;
  discountDepth: number;
  plannedSpend: number;
  predictedLift: number;
  predictedRevenue: number;
}

export interface CalendarEvent {
  id: string;
  tenantId: string;
  title: string;
  type: 'Promotion' | 'RetailExecution' | 'Meeting' | 'Deadline';
  startDate: Date;
  endDate: Date;
  retailerId?: string;
  promotionId?: string;
  description?: string;
  assignedTo?: string[];
  status: 'Planned' | 'InProgress' | 'Completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardKPIs {
  totalROI: number;
  tradeSpend: number;
  incrementalVolume: number;
  deductionExposure: number;
  activePromotions: number;
  upcomingPromotions: number;
  goalProgress: {
    revenue: { current: number; target: number; progress: number };
    volume: { current: number; target: number; progress: number };
    margin: { current: number; target: number; progress: number };
  };
}

export interface OptimizationRequest {
  tenantId: string;
  goal: OptimizationGoal;
  budget: number;
  retailerIds?: string[];
  productIds?: string[];
  constraints: ScenarioConstraints;
}

export interface OptimizationResult {
  scenarioId: string;
  predictedLift: number;
  totalRevenue: number;
  totalVolume: number;
  totalMargin: number;
  roi: number;
  allocation: PromotionAllocation[];
  confidence: number;
  processingTime: number;
}

export type ViewType = 'DASHBOARD' | 'PROMOTIONS' | 'OPTIMIZER' | 'FINANCIALS' | 'DEDUCTIONS' | 'AI_INSIGHTS' | 'SETTINGS';

