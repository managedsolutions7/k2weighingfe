import { Droplets, Wind, AlertTriangle, CheckCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { QualityMetrics as QualityMetricsType } from '@/api/enhanced-dashboard';

interface QualityMetricsProps {
  data: QualityMetricsType;
  className?: string;
}

const QualityMetrics = ({ data, className = '' }: QualityMetricsProps) => {
  const moistureData = [
    { name: 'Moisture', value: data.averageMoisturePercentage || 0, color: '#3B82F6' },
    {
      name: 'Dry',
      value: Math.max(0, 100 - (data.averageMoisturePercentage || 0)),
      color: '#E5E7EB',
    },
  ];

  const dustData = [
    { name: 'Dust', value: data.averageDustPercentage || 0, color: '#F59E0B' },
    {
      name: 'Clean',
      value: Math.max(0, 100 - (data.averageDustPercentage || 0)),
      color: '#E5E7EB',
    },
  ];

  const getQualityStatus = (percentage: number, type: 'moisture' | 'dust') => {
    if (type === 'moisture') {
      if (percentage <= 5)
        return { status: 'Excellent', color: 'text-green-600', icon: CheckCircle };
      if (percentage <= 10) return { status: 'Good', color: 'text-blue-600', icon: CheckCircle };
      if (percentage <= 15)
        return { status: 'Acceptable', color: 'text-yellow-600', icon: AlertTriangle };
      return { status: 'Poor', color: 'text-red-600', icon: AlertTriangle };
    } else {
      if (percentage <= 3)
        return { status: 'Excellent', color: 'text-green-600', icon: CheckCircle };
      if (percentage <= 7) return { status: 'Good', color: 'text-blue-600', icon: CheckCircle };
      if (percentage <= 12)
        return { status: 'Acceptable', color: 'text-yellow-600', icon: AlertTriangle };
      return { status: 'Poor', color: 'text-red-600', icon: AlertTriangle };
    }
  };

  const moistureStatus = getQualityStatus(data.averageMoisturePercentage || 0, 'moisture');
  const dustStatus = getQualityStatus(data.averageDustPercentage || 0, 'dust');

  const StatusIcon = moistureStatus.icon;

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Quality Metrics</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Moisture Analysis */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Droplets className="w-5 h-5 text-blue-500" />
            <h4 className="text-md font-medium text-gray-800">Moisture Analysis</h4>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Moisture:</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-900">
                  {(data.averageMoisturePercentage || 0).toFixed(2)}%
                </span>
                <StatusIcon className={`w-4 h-4 ${moistureStatus.color}`} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Moisture Weight:</span>
              <span className="text-sm font-medium text-gray-900">
                {(data.totalMoistureWeight || 0).toFixed(2)} kg
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Deduction Rate:</span>
              <span className="text-sm font-medium text-gray-900">
                {(data.moistureDeductionPercentage || 0).toFixed(2)}%
              </span>
            </div>

            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moistureData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {moistureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Dust Analysis */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Wind className="w-5 h-5 text-yellow-500" />
            <h4 className="text-md font-medium text-gray-800">Dust Analysis</h4>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Dust:</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-900">
                  {(data.averageDustPercentage || 0).toFixed(2)}%
                </span>
                <StatusIcon className={`w-4 h-4 ${dustStatus.color}`} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Dust Weight:</span>
              <span className="text-sm font-medium text-gray-900">
                {(data.totalDustWeight || 0).toFixed(2)} kg
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Deduction Rate:</span>
              <span className="text-sm font-medium text-gray-900">
                {(data.dustDeductionPercentage || 0).toFixed(2)}%
              </span>
            </div>

            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dustData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {dustData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {(data.averageMoisturePercentage || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-blue-600">Avg Moisture</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {(data.averageDustPercentage || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-yellow-600">Avg Dust</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.max(
                0,
                100 - (data.averageMoisturePercentage || 0) - (data.averageDustPercentage || 0),
              ).toFixed(1)}
              %
            </div>
            <div className="text-sm text-green-600">Net Quality</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default QualityMetrics;
