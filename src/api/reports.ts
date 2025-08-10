import api, { unwrap } from '@/utils/api';

export const getReportSummary = async (params: Record<string, unknown>) =>
  unwrap(api.get('/api/reports/summary', { params }));

export const getDetailedReport = async (params: Record<string, unknown>) =>
  unwrap(api.get('/api/reports/detailed', { params }));

export const getVendorWiseReport = async (params: Record<string, unknown>) =>
  unwrap(api.get('/api/reports/vendors', { params }));

export const getPlantWiseReport = async (params: Record<string, unknown>) =>
  unwrap(api.get('/api/reports/plants', { params }));

export const exportCsv = async (params: Record<string, unknown>) =>
  unwrap<Blob>(api.get('/api/reports/export', { params, responseType: 'blob' }));
