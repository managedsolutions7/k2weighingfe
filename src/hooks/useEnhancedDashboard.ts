import { useState, useEffect, useCallback } from 'react';
import { getPresetRange } from '@/utils/date';
import {
  getEnhancedAdminDashboard,
  type EnhancedDashboardData,
  type EnhancedDashboardParams,
} from '@/api/enhanced-dashboard';
import { toastError } from '@/utils/toast';

export const useEnhancedDashboard = () => {
  const [data, setData] = useState<EnhancedDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Initialize with 24h range
  useEffect(() => {
    const { from, to } = getPresetRange('24h');
    setStartDate(from);
    setEndDate(to);
  }, []);

  const loadDashboard = useCallback(
    async (params?: Partial<EnhancedDashboardParams>) => {
      try {
        setLoading(true);
        setError(null);

        const requestParams: EnhancedDashboardParams = {
          startDate,
          endDate,
          recentEntriesLimit: 10,
          recentInvoicesLimit: 10,
          topVendorsLimit: 10,
          includeFlags: true,
          ...params,
        };

        const response = await getEnhancedAdminDashboard(requestParams);
        setData(
          response || {
            totals: { totalEntries: 0, totalQuantity: 0, totalAmount: 0, averageRate: 0 },
            byType: {
              purchase: { entries: 0, quantity: 0, amount: 0 },
              sale: { entries: 0, quantity: 0, amount: 0 },
            },
            quality: {
              totalMoistureWeight: 0,
              totalDustWeight: 0,
              averageMoisturePercentage: 0,
              averageDustPercentage: 0,
              moistureDeductionPercentage: 0,
              dustDeductionPercentage: 0,
            },
            review: {
              reviewedEntries: 0,
              pendingReview: 0,
              reviewRate: 0,
              flaggedEntries: 0,
              varianceFlaggedEntries: 0,
              manualWeightEntries: 0,
              flagRate: 0,
            },
            breakdowns: { materials: [], palettes: [] },
            topVendors: [],
            recentEntries: [],
            recentInvoices: [],
            counts: { entries: 0, invoices: 0, vendors: 0, plants: 0 },
          },
        );
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setError(errorMessage);
        toastError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate],
  );

  useEffect(() => {
    if (startDate && endDate) {
      void loadDashboard();
    }
  }, [startDate, endDate, loadDashboard]);

  const handleDateChange = useCallback((newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, []);

  const handleRefresh = useCallback(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleExport = useCallback(() => {
    // TODO: Implement export functionality
    console.log('Export functionality to be implemented');
  }, []);

  const resetToDefaultRange = useCallback(() => {
    const { from, to } = getPresetRange('24h');
    setStartDate(from);
    setEndDate(to);
  }, []);

  return {
    data,
    loading,
    error,
    startDate,
    endDate,
    loadDashboard,
    handleDateChange,
    handleRefresh,
    handleExport,
    resetToDefaultRange,
  };
};
