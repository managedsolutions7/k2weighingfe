import { useEnhancedDashboard } from '@/hooks/useEnhancedDashboard';
import PageHeader from '@/components/ui/PageHeader';
import DateRangePicker from './DateRangePicker';
import KPICards from './KPICards';
import QualityMetrics from './QualityMetrics';
import ReviewStatus from './ReviewStatus';
import MaterialBreakdown from './MaterialBreakdown';
import TopVendors from './TopVendors';
import RecentActivity from './RecentActivity';

interface EnhancedDashboardProps {
  className?: string;
}

const EnhancedDashboard = ({ className = '' }: EnhancedDashboardProps) => {
  const {
    data,
    loading,
    error,
    startDate,
    endDate,
    handleDateChange,
    handleRefresh,
    handleExport,
  } = useEnhancedDashboard();

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">Failed to load dashboard</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <section
      id="main"
      aria-busy={loading}
      aria-live="polite"
      className={`space-y-6 relative ${className}`}
    >
      {/* Header Section */}
      <PageHeader
        title="Enhanced Dashboard"
        subtitle="Comprehensive business intelligence and analytics"
        actions={
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            onRefresh={handleRefresh}
            onExport={handleExport}
            showExport={true}
          />
        }
      />

      {/* KPI Cards */}
      <KPICards data={data.totals} />

      {/* Quality Metrics & Review Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QualityMetrics data={data.quality} />
        <ReviewStatus data={data.review} />
      </div>

      {/* Material Breakdown & Top Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MaterialBreakdown data={data.breakdowns.materials} />
        <TopVendors data={data.topVendors} />
      </div>

      {/* Recent Activity */}
      <RecentActivity recentEntries={data.recentEntries} recentInvoices={data.recentInvoices} />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
          <div className="bg-white rounded-lg p-6 text-center shadow-lg border">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Updating dashboard...</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default EnhancedDashboard;
