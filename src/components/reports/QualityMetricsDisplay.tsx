import { Droplets, Wind, TrendingUp, TrendingDown } from 'lucide-react';
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
import { calculateQualityScore, getQualityStatus } from '@/api/enhanced-reports';

interface QualityMetricsData {
  totalMoistureWeight: number;
  totalDustWeight: number;
  moistureDeductionPercentage: number;
  dustDeductionPercentage: number;
}

interface QualityMetricsDisplayProps {
  data: QualityMetricsData;
  title?: string;
  showCharts?: boolean;
  className?: string;
}

const QualityMetricsDisplay = ({
  data,
  title = 'Quality Metrics',
  showCharts = true,
  className = '',
}: QualityMetricsDisplayProps) => {
  const moistureData = [
    { name: 'Moisture', value: data.moistureDeductionPercentage, color: '#3B82F6' },
    { name: 'Net Weight', value: 100 - data.moistureDeductionPercentage, color: '#E5E7EB' },
  ];

  const dustData = [
    { name: 'Dust', value: data.dustDeductionPercentage, color: '#F59E0B' },
    { name: 'Clean Weight', value: 100 - data.dustDeductionPercentage, color: '#E5E7EB' },
  ];

  const qualityScore = calculateQualityScore(
    data.moistureDeductionPercentage,
    data.dustDeductionPercentage,
  );
  const qualityStatus = getQualityStatus(qualityScore);

  const chartData = [
    {
      name: 'Moisture',
      percentage: data.moistureDeductionPercentage,
      weight: data.totalMoistureWeight,
      color: '#3B82F6',
    },
    {
      name: 'Dust',
      percentage: data.dustDeductionPercentage,
      weight: data.totalDustWeight,
      color: '#F59E0B',
    },
  ];

  const getTrendIcon = (percentage: number) => {
    if (percentage <= 5) return <TrendingDown className="w-4 h-4 text-green-500" />;
    if (percentage <= 15) return <TrendingUp className="w-4 h-4 text-yellow-500" />;
    return <TrendingUp className="w-4 h-4 text-red-500" />;
  };

  const getTrendColor = (percentage: number) => {
    if (percentage <= 5) return 'text-green-600';
    if (percentage <= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Droplets className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="ml-auto">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${qualityStatus.bg} ${qualityStatus.color}`}
          >
            {qualityStatus.status}
          </span>
        </div>
      </div>

      {/* Quality Score */}
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-gray-900 mb-2">{qualityScore.toFixed(0)}%</div>
        <div className="text-sm text-gray-600">Overall Quality Score</div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className={`h-2 rounded-full ${
              qualityScore >= 90
                ? 'bg-green-500'
                : qualityScore >= 80
                  ? 'bg-blue-500'
                  : qualityScore >= 70
                    ? 'bg-yellow-500'
                    : qualityScore >= 50
                      ? 'bg-orange-500'
                      : 'bg-red-500'
            }`}
            style={{ width: `${qualityScore}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Moisture Analysis */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Droplets className="w-4 h-4 text-blue-500" />
            <h4 className="text-md font-medium text-gray-800">Moisture Analysis</h4>
            {getTrendIcon(data.moistureDeductionPercentage)}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Deduction Rate:</span>
              <span
                className={`text-lg font-semibold ${getTrendColor(data.moistureDeductionPercentage)}`}
              >
                {data.moistureDeductionPercentage.toFixed(2)}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Weight:</span>
              <span className="text-sm font-medium text-gray-900">
                {data.totalMoistureWeight.toFixed(2)} kg
              </span>
            </div>

            {showCharts && (
              <div className="h-32 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moistureData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={50}
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
            )}
          </div>
        </div>

        {/* Dust Analysis */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Wind className="w-4 h-4 text-yellow-500" />
            <h4 className="text-md font-medium text-gray-800">Dust Analysis</h4>
            {getTrendIcon(data.dustDeductionPercentage)}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Deduction Rate:</span>
              <span
                className={`text-lg font-semibold ${getTrendColor(data.dustDeductionPercentage)}`}
              >
                {data.dustDeductionPercentage.toFixed(2)}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Weight:</span>
              <span className="text-sm font-medium text-gray-900">
                {data.totalDustWeight.toFixed(2)} kg
              </span>
            </div>

            {showCharts && (
              <div className="h-32 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dustData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={50}
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
            )}
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      {showCharts && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-800 mb-4">Quality Comparison</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="percentage" fill="#8884d8" name="Deduction %" />
                <Bar dataKey="weight" fill="#82ca9d" name="Weight (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quality Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {data.moistureDeductionPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-blue-600">Moisture Deduction</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">
              {data.dustDeductionPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-yellow-600">Dust Deduction</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {(100 - data.moistureDeductionPercentage - data.dustDeductionPercentage || 0).toFixed(
                1,
              )}
              %
            </div>
            <div className="text-xs text-green-600">Net Quality</div>
          </div>
        </div>
      </div>

      {/* Quality Indicators */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quality Indicators</h4>
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Excellent (≤8%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Good (≤15%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">Acceptable (≤25%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Poor (&gt;25%)</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default QualityMetricsDisplay;
