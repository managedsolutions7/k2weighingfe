import api, { unwrap } from '@/utils/api';

// Base report parameters
export interface BaseReportParams {
  entryType?: 'purchase' | 'sale';
  vendor?: string;
  plant?: string;
  startDate?: string;
  endDate?: string;
}

// Enhanced Summary Report
export interface EnhancedSummaryReport {
  totalEntries: number;
  totalQuantity: number;
  totalAmount: number;
  averageRate: number;
  purchaseEntries: number;
  purchaseQuantity: number;
  purchaseAmount: number;
  saleEntries: number;
  saleQuantity: number;
  saleAmount: number;

  // Enhanced Quality Metrics
  quality: {
    totalMoistureWeight: number;
    totalDustWeight: number;
    moistureDeductionPercentage: number;
    dustDeductionPercentage: number;
  };

  // Enhanced Review Metrics
  review: {
    reviewedEntries: number;
    pendingReview: number;
    reviewRate: number;
    flaggedEntries: number;
    varianceFlaggedEntries: number;
    manualWeightEntries: number;
    flagRate: number;
  };

  // Material and Palette Tracking
  materials: string[];
  palettes: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

// Enhanced Detailed Report
export interface DetailedReportEntry {
  _id: string;
  entryNumber: string;
  entryType: 'purchase' | 'sale';
  entryDate: Date;
  vendor: {
    _id: string;
    name: string;
    code: string;
    contactPerson?: string;
  };
  plant: {
    _id: string;
    name: string;
    code: string;
    address?: string;
  };
  vehicle: {
    _id: string;
    vehicleNumber: string;
    driverName: string;
  };
  materialType?: {
    _id: string;
    name: string;
    code: string;
  };
  palletteType?: 'loose' | 'packed';

  // Weight Fields
  quantity: number;
  entryWeight: number;
  exitWeight?: number;
  expectedWeight?: number;
  exactWeight?: number;
  finalWeight?: number;
  computedWeight: number;

  // Quality Fields
  moisture?: number;
  dust?: number;
  moistureWeight?: number;
  dustWeight?: number;

  // Palette Fields
  noOfBags?: number;
  weightPerBag?: number;
  packedWeight?: number;

  // Financial Fields
  rate?: number;
  totalAmount?: number;
  computedAmount: number;

  // Review and Flag Fields
  isReviewed: boolean;
  reviewedBy?: {
    _id: string;
    name: string;
    username: string;
  };
  reviewedAt?: Date;
  reviewNotes?: string;
  flagged: boolean;
  flagReason?: string;
  varianceFlag?: boolean;
  manualWeight: boolean;

  // Metadata
  createdBy: {
    _id: string;
    name: string;
    username: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EnhancedDetailedReport {
  entries: DetailedReportEntry[];
  summary: EnhancedSummaryReport;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DetailedReportParams extends BaseReportParams {
  page?: number;
  limit?: number;
}

// Enhanced Vendor Report
export interface EnhancedVendorReport {
  vendor: {
    _id: string;
    name: string;
    code: string;
    contactPerson?: string;
    gstNumber?: string;
  };
  totalEntries: number;
  totalQuantity: number;
  totalAmount: number;
  averageRate: number;
  purchaseEntries: number;
  purchaseQuantity: number;
  purchaseAmount: number;
  saleEntries: number;
  saleQuantity: number;
  saleAmount: number;

  // Enhanced Quality Metrics
  quality: {
    totalMoistureWeight: number;
    totalDustWeight: number;
    moistureDeductionPercentage: number;
    dustDeductionPercentage: number;
  };

  // Enhanced Review Metrics
  review: {
    reviewedEntries: number;
    pendingReview: number;
    reviewRate: number;
    flaggedEntries: number;
    varianceFlaggedEntries: number;
    manualWeightEntries: number;
    flagRate: number;
  };

  // Material and Palette Tracking
  materials: string[];
  palettes: string[];
}

// Enhanced Plant Report
export interface EnhancedPlantReport {
  plant: {
    _id: string;
    name: string;
    code: string;
    address?: string;
  };
  totalEntries: number;
  totalQuantity: number;
  totalAmount: number;
  averageRate: number;
  purchaseEntries: number;
  purchaseQuantity: number;
  purchaseAmount: number;
  saleEntries: number;
  saleQuantity: number;
  saleAmount: number;

  // Enhanced Quality Metrics
  quality: {
    totalMoistureWeight: number;
    totalDustWeight: number;
    moistureDeductionPercentage: number;
    dustDeductionPercentage: number;
  };

  // Enhanced Review Metrics
  review: {
    reviewedEntries: number;
    pendingReview: number;
    reviewRate: number;
    flaggedEntries: number;
    varianceFlaggedEntries: number;
    manualWeightEntries: number;
    flagRate: number;
  };

  // Material and Palette Tracking
  materials: string[];
  palettes: string[];
}

// Export options
export interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  includeCharts?: boolean;
  includeSummary?: boolean;
  dateFormat?: string;
  timezone?: string;
  filename?: string;
}

// API Functions
export const getEnhancedSummaryReport = (params: BaseReportParams) =>
  unwrap(api.get<EnhancedSummaryReport>('/api/reports/enhanced-summary', { params }));

export const getEnhancedDetailedReport = (params: DetailedReportParams) =>
  unwrap(api.get<EnhancedDetailedReport>('/api/reports/enhanced-detailed', { params }));

export const getEnhancedVendorReport = (params: BaseReportParams) =>
  unwrap(api.get<EnhancedVendorReport>('/api/reports/enhanced-vendors', { params }));

export const getEnhancedPlantReport = (params: BaseReportParams) =>
  unwrap(api.get<EnhancedPlantReport>('/api/reports/enhanced-plants', { params }));

// Export functions
export const exportReport = async (
  params: BaseReportParams & ExportOptions & { reportType: string },
) => {
  // Clean up params for query string - only include defined values
  const queryParams: Record<string, string> = {};

  // Add required string values
  if (params.reportType) queryParams.reportType = params.reportType;
  if (params.entryType) queryParams.entryType = params.entryType;
  if (params.vendor) queryParams.vendor = params.vendor;
  if (params.plant) queryParams.plant = params.plant;
  if (params.startDate) queryParams.startDate = params.startDate;
  if (params.endDate) queryParams.endDate = params.endDate;
  if (params.format) queryParams.format = params.format;
  if (params.dateFormat) queryParams.dateFormat = params.dateFormat;
  if (params.timezone) queryParams.timezone = params.timezone;
  if (params.filename) queryParams.filename = params.filename;

  // Handle boolean values - only include in query if explicitly true
  // This prevents sending "false" strings which might confuse backend validation
  if (params.includeCharts === true) {
    queryParams.includeCharts = 'true';
  }
  if (params.includeSummary === true) {
    queryParams.includeSummary = 'true';
  }

  // Debug: Log the parameters being sent
  console.log('🚀 Export API Parameters:', queryParams);
  console.log('📝 Original params:', params);
  console.log('🔗 Query string will be:', new URLSearchParams(queryParams).toString());

  const response = await unwrap(
    api.get('/api/reports/enhanced-export', {
      params: queryParams,
      responseType: 'blob',
    }),
  );

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response as BlobPart]));
  const link = document.createElement('a');
  link.href = url;

  // Set filename based on report type and date
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = params.filename || `${params.reportType}-report-${dateStr}.${params.format}`;
  link.setAttribute('download', filename);

  // Trigger download
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return response;
};

export const exportSummaryReport = (params: BaseReportParams & ExportOptions) =>
  exportReport({ ...params, reportType: 'summary' });

export const exportDetailedReport = (params: DetailedReportParams & ExportOptions) =>
  exportReport({ ...params, reportType: 'detailed' });

export const exportVendorReport = (params: BaseReportParams & ExportOptions) =>
  exportReport({ ...params, reportType: 'vendors' });

export const exportPlantReport = (params: BaseReportParams & ExportOptions) =>
  exportReport({ ...params, reportType: 'plants' });

// Utility functions for data processing
export const calculateQualityScore = (moisture: number, dust: number): number => {
  const totalImpurity = moisture + dust;
  if (totalImpurity <= 8) return 100;
  if (totalImpurity <= 15) return 85;
  if (totalImpurity <= 25) return 70;
  if (totalImpurity <= 35) return 50;
  return 30;
};

export const getQualityStatus = (score: number): { status: string; color: string; bg: string } => {
  if (score >= 90) return { status: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
  if (score >= 80) return { status: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (score >= 70) return { status: 'Acceptable', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  if (score >= 50) return { status: 'Poor', color: 'text-orange-600', bg: 'bg-orange-50' };
  return { status: 'Critical', color: 'text-red-600', bg: 'bg-red-50' };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatWeight = (weight: number): string => {
  if (weight >= 1000) {
    return `${(weight / 1000).toFixed(2)} MT`;
  }
  return `${weight.toFixed(2)} kg`;
};
