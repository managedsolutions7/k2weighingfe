import { Eye, Flag, CheckCircle, Clock, AlertTriangle, Shield } from 'lucide-react';
import Card from '@/components/ui/Card';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

interface ReviewMetrics {
  totalEntries: number;
  reviewed: number;
  pending: number;
  flagged: number;
  varianceFlagged: number;
  manualWeight: number;
  complianceRate: number;
}

interface ReviewStatusDisplayProps {
  data: ReviewMetrics;
  title?: string;
  showCharts?: boolean;
  className?: string;
}

const ReviewStatusDisplay = ({
  data,
  title = 'Review Status',
  showCharts = true,
  className = '',
}: ReviewStatusDisplayProps) => {
  const reviewData = [
    { name: 'Reviewed', value: data.reviewed, color: '#10B981' },
    { name: 'Pending', value: data.pending, color: '#F59E0B' },
    { name: 'Flagged', value: data.flagged, color: '#EF4444' },
  ];

  const statusData = [
    { name: 'Variance Flagged', value: data.varianceFlagged, color: '#F97316' },
    { name: 'Manual Weight', value: data.manualWeight, color: '#8B5CF6' },
    {
      name: 'Normal',
      value: data.totalEntries - data.varianceFlagged - data.manualWeight,
      color: '#6B7280',
    },
  ];

  const complianceData = [
    { name: 'Compliant', value: data.complianceRate, color: '#10B981' },
    { name: 'Non-Compliant', value: 100 - data.complianceRate, color: '#EF4444' },
  ];

  const getStatusBg = (type: string) => {
    switch (type) {
      case 'reviewed':
        return 'bg-green-100';
      case 'pending':
        return 'bg-yellow-100';
      case 'flagged':
        return 'bg-red-100';
      case 'variance':
        return 'bg-orange-100';
      case 'manual':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Eye className="w-5 h-5 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="ml-auto">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800`}
          >
            {data.complianceRate.toFixed(1)}% Compliant
          </span>
        </div>
      </div>

      {/* Compliance Rate */}
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {data.complianceRate.toFixed(1)}%
        </div>
        <div className="text-sm text-gray-600">Overall Compliance Rate</div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
          <div
            className={`h-3 rounded-full ${
              data.complianceRate >= 90
                ? 'bg-green-500'
                : data.complianceRate >= 80
                  ? 'bg-blue-500'
                  : data.complianceRate >= 70
                    ? 'bg-yellow-500'
                    : data.complianceRate >= 50
                      ? 'bg-orange-500'
                      : 'bg-red-500'
            }`}
            style={{ width: `${data.complianceRate}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Review Status */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-green-500" />
            <h4 className="text-md font-medium text-gray-800">Review Status</h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reviewed:</span>
              <span className="text-lg font-semibold text-green-600">
                {data.reviewed} ({((data.reviewed / data.totalEntries) * 100).toFixed(1)}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending:</span>
              <span className="text-lg font-semibold text-yellow-600">
                {data.pending} ({((data.pending / data.totalEntries) * 100).toFixed(1)}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Flagged:</span>
              <span className="text-lg font-semibold text-red-600">
                {data.flagged} ({((data.flagged / data.totalEntries) * 100).toFixed(1)}%)
              </span>
            </div>

            {showCharts && (
              <div className="h-32 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reviewData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {reviewData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Entry Status */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-purple-500" />
            <h4 className="text-md font-medium text-gray-800">Entry Status</h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Variance Flagged:</span>
              <span className="text-lg font-semibold text-orange-600">
                {data.varianceFlagged} (
                {((data.varianceFlagged / data.totalEntries) * 100).toFixed(1)}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Manual Weight:</span>
              <span className="text-lg font-semibold text-purple-600">
                {data.manualWeight} ({((data.manualWeight / data.totalEntries) * 100).toFixed(1)}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Normal:</span>
              <span className="text-lg font-semibold text-gray-600">
                {data.totalEntries - data.varianceFlagged - data.manualWeight} (
                {(
                  ((data.totalEntries - data.varianceFlagged - data.manualWeight) /
                    data.totalEntries) *
                  100
                ).toFixed(1)}
                %)
              </span>
            </div>

            {showCharts && (
              <div className="h-32 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compliance Chart */}
      {showCharts && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-800 mb-4">Compliance Overview</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complianceData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Status Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className={`text-center p-3 rounded-lg ${getStatusBg('reviewed')}`}>
            <div className="text-lg font-bold text-green-600">{data.reviewed}</div>
            <div className="text-xs text-green-600">Reviewed</div>
          </div>
          <div className={`text-center p-3 rounded-lg ${getStatusBg('pending')}`}>
            <div className="text-lg font-bold text-yellow-600">{data.pending}</div>
            <div className="text-xs text-yellow-600">Pending</div>
          </div>
          <div className={`text-center p-3 rounded-lg ${getStatusBg('flagged')}`}>
            <div className="text-lg font-bold text-red-600">{data.flagged}</div>
            <div className="text-xs text-red-600">Flagged</div>
          </div>
          <div className={`text-center p-3 rounded-lg ${getStatusBg('variance')}`}>
            <div className="text-lg font-bold text-orange-600">{data.varianceFlagged}</div>
            <div className="text-xs text-orange-600">Variance</div>
          </div>
          <div className={`text-center p-3 rounded-lg ${getStatusBg('manual')}`}>
            <div className="text-lg font-bold text-purple-600">{data.manualWeight}</div>
            <div className="text-xs text-purple-600">Manual</div>
          </div>
        </div>
      </div>

      {/* Review Progress */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Review Progress</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Review Progress</span>
            <span className="text-sm font-medium text-gray-900">
              {data.reviewed} of {data.totalEntries} entries
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(data.reviewed / data.totalEntries) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Status Indicators</h4>
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">Reviewed</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-600">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-500" />
            <span className="text-gray-600">Flagged</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-gray-600">Variance</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500" />
            <span className="text-gray-600">Manual</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReviewStatusDisplay;
