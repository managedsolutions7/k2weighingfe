import { useState, useCallback, useMemo } from 'react';
import { Download, FileText, BarChart3, Users, Package } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import DateRangePicker from '@/components/dashboard/DateRangePicker';
import { getPresetRange } from '@/utils/date';
import { toastError, toastSuccess } from '@/utils/toast';
import {
  getEnhancedSummaryReport,
  getEnhancedDetailedReport,
  getEnhancedVendorReport,
  getEnhancedPlantReport,
  exportReport,
  type EnhancedSummaryReport,
  type EnhancedDetailedReport,
  type EnhancedVendorReport,
  type EnhancedPlantReport,
  type ExportOptions,
} from '@/api/enhanced-reports';
import {
  QualityMetricsDisplay,
  ReviewStatusDisplay,
  MaterialPaletteSummary,
  ReportTable,
  ExportControls,
} from '@/components/reports';

interface ReportConfig {
  type: 'summary' | 'detailed' | 'vendors' | 'plants';
  format: 'json' | 'csv' | 'pdf';
  groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year';
  entryType?: 'purchase' | 'sale';
  vendor?: string;
  plant?: string;
  startDate: string;
  endDate: string;
}

const Reports = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'summary',
    format: 'pdf',
    groupBy: 'month',
    startDate: getPresetRange('30d').from,
    endDate: getPresetRange('30d').to,
  });

  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState<
    | EnhancedSummaryReport
    | EnhancedDetailedReport
    | EnhancedVendorReport
    | EnhancedPlantReport
    | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportTypes = useMemo(
    () => [
      {
        value: 'summary',
        label: 'Summary Report',
        icon: BarChart3,
        description: 'High-level overview of operations',
      },
      {
        value: 'detailed',
        label: 'Detailed Report',
        icon: FileText,
        description: 'Comprehensive entry-level analysis',
      },
      {
        value: 'vendors',
        label: 'Vendor Analysis',
        icon: Users,
        description: 'Vendor performance and quality metrics',
      },
      {
        value: 'plants',
        label: 'Plant Analysis',
        icon: Package,
        description: 'Plant-wise performance breakdown',
      },
    ],
    [],
  );

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'csv', label: 'CSV Spreadsheet' },
    { value: 'json', label: 'JSON Data' },
  ];

  const groupByOptions = [
    { value: 'day', label: 'Daily' },
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
    { value: 'quarter', label: 'Quarterly' },
    { value: 'year', label: 'Yearly' },
  ];

  const handleDateChange = useCallback((startDate: string, endDate: string) => {
    setReportConfig((prev) => ({ ...prev, startDate, endDate }));
  }, []);

  const handleGenerateReport = useCallback(async () => {
    try {
      setGenerating(true);
      setLoading(true);
      setError(null);

      const params = {
        entryType: reportConfig.entryType,
        vendor: reportConfig.vendor,
        plant: reportConfig.plant,
        startDate: reportConfig.startDate,
        endDate: reportConfig.endDate,
      };

      let data;
      switch (reportConfig.type) {
        case 'summary':
          data = await getEnhancedSummaryReport(params);
          break;
        case 'detailed':
          data = await getEnhancedDetailedReport({ ...params, page: 1, limit: 10 });
          break;
        case 'vendors':
          data = await getEnhancedVendorReport(params);
          break;
        case 'plants':
          data = await getEnhancedPlantReport(params);
          break;
        default:
          throw new Error('Invalid report type');
      }

      setReportData(
        data as
          | EnhancedSummaryReport
          | EnhancedDetailedReport
          | EnhancedVendorReport
          | EnhancedPlantReport,
      );
      toastSuccess(
        `${reportTypes.find((rt) => rt.value === reportConfig.type)?.label} generated successfully!`,
      );
    } catch (error) {
      console.error('Failed to generate report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
      setError(errorMessage);
      toastError(errorMessage);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  }, [reportConfig, reportTypes]);

  const selectedReportType = reportTypes.find((rt) => rt.value === reportConfig.type);
  const ReportIcon = selectedReportType?.icon || FileText;

  const handleQuickReport = useCallback((preset: '24h' | '7d' | '30d') => {
    const { from, to } = getPresetRange(preset);
    setReportConfig((prev) => ({ ...prev, startDate: from, endDate: to }));
  }, []);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Enhanced Reports"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleQuickReport('24h')}
              disabled={generating}
            >
              Last 24h
            </Button>
            <Button variant="outline" onClick={() => handleQuickReport('7d')} disabled={generating}>
              Last 7 Days
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickReport('30d')}
              disabled={generating}
            >
              Last 30 Days
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Report Configuration</h3>

            <div className="space-y-6">
              {/* Report Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reportTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        reportConfig.type === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() =>
                        setReportConfig((prev) => ({
                          ...prev,
                          type: type.value as ReportConfig['type'],
                        }))
                      }
                    >
                      <div className="flex items-center gap-3">
                        <type.icon className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium text-gray-900">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entry Type</label>
                  <Select
                    value={reportConfig.entryType || ''}
                    onChange={(e) =>
                      setReportConfig((prev) => ({
                        ...prev,
                        entryType: e.target.value as 'purchase' | 'sale' | undefined,
                      }))
                    }
                  >
                    <option value="">All Types</option>
                    <option value="purchase">Purchase</option>
                    <option value="sale">Sale</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                  <Select
                    value={reportConfig.vendor || ''}
                    onChange={(e) =>
                      setReportConfig((prev) => ({ ...prev, vendor: e.target.value || undefined }))
                    }
                  >
                    <option value="">All Vendors</option>
                    {/* TODO: Populate with actual vendors */}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plant</label>
                  <Select
                    value={reportConfig.plant || ''}
                    onChange={(e) =>
                      setReportConfig((prev) => ({ ...prev, plant: e.target.value || undefined }))
                    }
                  >
                    <option value="">All Plants</option>
                    {/* TODO: Populate with actual plants */}
                  </Select>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
                <DateRangePicker
                  startDate={reportConfig.startDate}
                  endDate={reportConfig.endDate}
                  onDateChange={handleDateChange}
                  showExport={false}
                />
              </div>

              {/* Format and Grouping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Format
                  </label>
                  <Select
                    value={reportConfig.format}
                    onChange={(e) =>
                      setReportConfig((prev) => ({
                        ...prev,
                        format: e.target.value as ReportConfig['format'],
                      }))
                    }
                  >
                    {formatOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
                  <Select
                    value={reportConfig.groupBy}
                    onChange={(e) =>
                      setReportConfig((prev) => ({
                        ...prev,
                        groupBy: e.target.value as ReportConfig['groupBy'],
                      }))
                    }
                  >
                    {groupByOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-4">
                <Button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="w-full"
                  size="md"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Report Preview & Info */}
        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <ReportIcon className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="font-medium text-gray-900">{selectedReportType?.label}</div>
                  <div className="text-sm text-gray-500">{selectedReportType?.description}</div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Format:</span>
                  <span className="font-medium">{reportConfig.format.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Grouping:</span>
                  <span className="font-medium">
                    {reportConfig.groupBy.charAt(0).toUpperCase() + reportConfig.groupBy.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date Range:</span>
                  <span className="font-medium">
                    {new Date(reportConfig.startDate).toLocaleDateString()} -{' '}
                    {new Date(reportConfig.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">What's Included</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {reportConfig.type === 'summary' && (
                    <>
                      <li>• Key performance indicators</li>
                      <li>• Quality metrics overview</li>
                      <li>• Review and compliance status</li>
                      <li>• Top vendor performance</li>
                    </>
                  )}
                  {reportConfig.type === 'detailed' && (
                    <>
                      <li>• Entry-level transaction details</li>
                      <li>• Quality analysis per entry</li>
                      <li>• Flag and variance details</li>
                      <li>• Driver and vehicle information</li>
                    </>
                  )}
                  {reportConfig.type === 'vendors' && (
                    <>
                      <li>• Vendor performance rankings</li>
                      <li>• Quality metrics comparison</li>
                      <li>• Financial analysis</li>
                      <li>• Risk assessment</li>
                    </>
                  )}
                  {reportConfig.type === 'plants' && (
                    <>
                      <li>• Plant-wise performance</li>
                      <li>• Capacity utilization</li>
                      <li>• Quality metrics by plant</li>
                      <li>• Efficiency analysis</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Report Display Section */}
      {error && (
        <Card className="p-6 border-red-200 bg-red-50">
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
            <p className="text-gray-600 mb-2">Failed to generate report</p>
            <p className="text-sm text-gray-500">{error}</p>
            <button
              onClick={handleGenerateReport}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </Card>
      )}

      {loading && (
        <Card className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating report...</p>
          </div>
        </Card>
      )}

      {reportData && !loading && (
        <div className="space-y-6">
          {/* Report Header with Export Controls */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedReportType?.label} -{' '}
                  {new Date(reportConfig.startDate).toLocaleDateString()} to{' '}
                  {new Date(reportConfig.endDate).toLocaleDateString()}
                </h3>
                <p className="text-sm text-gray-600">Generated on {new Date().toLocaleString()}</p>
              </div>
              <ExportControls
                onExport={async (options: ExportOptions) => {
                  try {
                    const exportParams = {
                      ...options,
                      reportType: reportConfig.type,
                      entryType: reportConfig.entryType,
                      vendor: reportConfig.vendor,
                      plant: reportConfig.plant,
                      startDate: reportConfig.startDate,
                      endDate: reportConfig.endDate,
                    };

                    // Use the unified export endpoint
                    await exportReport(exportParams);
                    toastSuccess('Report exported successfully!');
                  } catch {
                    toastError('Failed to export report');
                  }
                }}
                onPrint={() => window.print()}
                isLoading={generating}
              />
            </div>
          </Card>

          {/* Report Content */}
          {reportConfig.type === 'summary' && reportData && 'quality' in reportData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QualityMetricsDisplay
                data={{
                  totalMoistureWeight: reportData.quality.totalMoistureWeight,
                  totalDustWeight: reportData.quality.totalDustWeight,
                  moistureDeductionPercentage: reportData.quality.moistureDeductionPercentage,
                  dustDeductionPercentage: reportData.quality.dustDeductionPercentage,
                }}
                title="Quality Analysis"
              />
              <ReviewStatusDisplay
                data={{
                  totalEntries: reportData.totalEntries,
                  reviewed: reportData.review.reviewedEntries,
                  pending: reportData.review.pendingReview,
                  flagged: reportData.review.flaggedEntries,
                  varianceFlagged: reportData.review.varianceFlaggedEntries,
                  manualWeight: reportData.review.manualWeightEntries,
                  complianceRate: reportData.review.reviewRate,
                }}
                title="Review Status"
              />
            </div>
          )}

          {reportConfig.type === 'detailed' && reportData && 'entries' in reportData && (
            <ReportTable
              data={reportData.entries as unknown as Record<string, unknown>[]}
              columns={[
                { key: 'entryNumber', label: 'Entry No', sortable: true },
                { key: 'entryType', label: 'Type', sortable: true },
                {
                  key: 'entryDate',
                  label: 'Date',
                  sortable: true,
                  render: (value) =>
                    value ? new Date(value as string | number | Date).toLocaleDateString() : '-',
                },
                {
                  key: 'vendor.name',
                  label: 'Vendor',
                  sortable: true,
                  render: (_value, row) => {
                    const vendor = row.vendor as Record<string, unknown>;
                    return vendor?.name ? String(vendor.name) : '-';
                  },
                },
                { key: 'quantity', label: 'Quantity', sortable: true },
                { key: 'entryWeight', label: 'Entry Weight', sortable: true },
                { key: 'exitWeight', label: 'Exit Weight', sortable: true },
                { key: 'rate', label: 'Rate', sortable: true },
                { key: 'totalAmount', label: 'Amount', sortable: true },
                {
                  key: 'isReviewed',
                  label: 'Reviewed',
                  sortable: true,
                  render: (value) => (value ? 'Yes' : 'No'),
                },
                {
                  key: 'flagged',
                  label: 'Flagged',
                  sortable: true,
                  render: (value) => (value ? 'Yes' : 'No'),
                },
              ]}
              title="Detailed Entries"
              searchable={true}
              filterable={true}
              sortable={true}
              pagination={true}
              pageSize={10}
            />
          )}

          {reportConfig.type === 'vendors' && reportData && 'vendor' in reportData && (
            <div className="space-y-6">
              <MaterialPaletteSummary
                materials={reportData.materials.map((name, index) => ({
                  name,
                  quantity: 0, // These would come from actual data
                  amount: 0,
                  percentage: 0,
                  color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5],
                }))}
                palettes={['loose', 'packed'].map((type, index) => ({
                  type,
                  count: 0, // These would come from actual data
                  percentage: 0,
                  color: ['#3B82F6', '#10B981'][index % 2],
                }))}
                totalQuantity={reportData.totalQuantity}
                totalAmount={reportData.totalAmount}
                title="Vendor Performance Summary"
              />
            </div>
          )}

          {reportConfig.type === 'plants' && reportData && 'plant' in reportData && (
            <div className="space-y-6">
              <div className="space-y-6">
                <MaterialPaletteSummary
                  materials={reportData.materials.map((name, index) => ({
                    name,
                    quantity: 0, // These would come from actual data
                    amount: 0,
                    percentage: 0,
                    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5],
                  }))}
                  palettes={['loose', 'packed'].map((type, index) => ({
                    type,
                    count: 0, // These would come from actual data
                    percentage: 0,
                    color: ['#3B82F6', '#10B981'][index % 2],
                  }))}
                  totalQuantity={reportData.totalQuantity}
                  totalAmount={reportData.totalAmount}
                  title="Plant Performance Summary"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report History (Future Enhancement) */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Report history will be displayed here</p>
          <p className="text-sm">Generated reports will appear in this section</p>
        </div>
      </Card>
    </section>
  );
};

export default Reports;
