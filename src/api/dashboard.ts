import api, { unwrap } from '@/utils/api';

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
  recentEntriesLimit?: number;
  recentInvoicesLimit?: number;
  topVendorsLimit?: number; // admin only
}

export const getAdminDashboard = (params: DateRangeParams) =>
  unwrap(api.get('/api/dashboard/admin', { params }));

export const getSupervisorDashboard = (params: DateRangeParams) =>
  unwrap(api.get('/api/dashboard/supervisor', { params }));

export const getOperatorDashboard = (params: DateRangeParams) =>
  unwrap(api.get('/api/dashboard/operator', { params }));
