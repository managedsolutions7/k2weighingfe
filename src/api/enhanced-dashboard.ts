import api, { unwrap } from '@/utils/api';

export interface EnhancedDashboardParams {
  startDate?: string;
  endDate?: string;
  topVendorsLimit?: number;
  recentEntriesLimit?: number;
  recentInvoicesLimit?: number;
  includeFlags?: boolean;
}

export interface QualityMetrics {
  totalMoistureWeight: number;
  totalDustWeight: number;
  averageMoisturePercentage: number;
  averageDustPercentage: number;
  moistureDeductionPercentage: number;
  dustDeductionPercentage: number;
}

export interface ReviewMetrics {
  reviewedEntries: number;
  pendingReview: number;
  reviewRate: number;
  flaggedEntries: number;
  varianceFlaggedEntries: number;
  manualWeightEntries: number;
  flagRate: number;
}

export interface MaterialBreakdown {
  materialName: string;
  materialCode: string;
  totalEntries: number;
  totalQuantity: number;
  totalMoistureWeight: number;
  totalDustWeight: number;
  averageMoisture: number;
  averageDust: number;
  flaggedEntries: number;
  varianceFlaggedEntries: number;
}

export interface PaletteAnalytics {
  _id: string;
  totalEntries: number;
  totalQuantity: number;
  totalBags: number;
  totalPackedWeight: number;
  averageBagsPerEntry: number;
  averageWeightPerBag: number;
  flaggedEntries: number;
  varianceFlaggedEntries: number;
}

export interface TopVendor {
  vendor: {
    _id: string;
    name: string;
    code: string;
  };
  totalAmount: number;
  totalQuantity: number;
  entries: number;
  purchaseEntries: number;
  saleEntries: number;
  flaggedEntries: number;
  varianceFlaggedEntries: number;
  averageRate: number;
}

export interface Entry {
  _id: string;
  entryType: 'purchase' | 'sale';
  entryNumber: string;
  entryDate: string;
  quantity: number;
  entryWeight: number;
  expectedWeight: number;
  exactWeight: number;
  varianceFlag: boolean;
  driverName?: string;
  driverPhone?: string;
  vendor: { _id: string; name: string } | string;
  vehicle: { _id: string; vehicleNumber: string } | string;
  plant: { _id: string; name: string; code: string } | string;
  isReviewed: boolean;
  flagged: boolean;
  flagReason?: string;
  moisture?: number;
  dust?: number;
  moistureWeight?: number;
  dustWeight?: number;
  finalWeight?: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  invoiceType: 'purchase' | 'sale';
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue';
  vendor: { _id: string; name: string } | string;
  plant: { _id: string; name: string; code: string } | string;
}

export interface EnhancedDashboardData {
  totals: {
    totalEntries: number;
    totalQuantity: number;
    totalAmount: number;
    averageRate: number;
  };
  byType: {
    purchase: { entries: number; quantity: number; amount: number };
    sale: { entries: number; quantity: number; amount: number };
  };
  quality: QualityMetrics;
  review: ReviewMetrics;
  breakdowns: {
    materials: MaterialBreakdown[];
    palettes: PaletteAnalytics[];
  };
  topVendors: TopVendor[];
  recentEntries: Entry[];
  recentInvoices: Invoice[];
  counts: {
    entries: number;
    invoices: number;
    vendors: number;
    plants: number;
  };
}

export interface EnhancedReportParams {
  startDate?: string;
  endDate?: string;
  format?: 'json' | 'csv' | 'pdf';
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

// Enhanced Dashboard API calls
export const getEnhancedAdminDashboard = (params: EnhancedDashboardParams) =>
  unwrap(api.get<EnhancedDashboardData>('/api/enhanced-dashboard/admin', { params }));

export const getEnhancedSupervisorDashboard = (params: EnhancedDashboardParams) =>
  unwrap(api.get<EnhancedDashboardData>('/api/enhanced-dashboard/supervisor', { params }));

export const getEnhancedOperatorDashboard = (params: EnhancedDashboardParams) =>
  unwrap(api.get<EnhancedDashboardData>('/api/enhanced-dashboard/operator', { params }));

// Enhanced Reports API calls
export const getEnhancedSummaryReport = (params: EnhancedReportParams) =>
  unwrap(api.get('/api/reports/enhanced-summary', { params }));

export const getEnhancedDetailedReport = (params: EnhancedReportParams) =>
  unwrap(api.get('/api/reports/enhanced-detailed', { params }));

export const getEnhancedVendorsReport = (params: EnhancedReportParams) =>
  unwrap(api.get('/api/reports/enhanced-vendors', { params }));

export const getEnhancedPlantsReport = (params: EnhancedReportParams) =>
  unwrap(api.get('/api/reports/enhanced-plants', { params }));
