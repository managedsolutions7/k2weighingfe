import { Package, Palette, TrendingUp, TrendingDown } from 'lucide-react';
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
  LineChart,
  Line,
} from 'recharts';

interface MaterialData {
  name: string;
  quantity: number;
  amount: number;
  percentage: number;
  color: string;
}

interface PaletteData {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

interface MaterialPaletteSummaryProps {
  materials: MaterialData[];
  palettes: PaletteData[];
  totalQuantity: number;
  totalAmount: number;
  title?: string;
  showCharts?: boolean;
  className?: string;
}

const MaterialPaletteSummary = ({
  materials,
  palettes,
  totalQuantity,
  totalAmount,
  title = 'Material & Palette Summary',
  showCharts = true,
  className = '',
}: MaterialPaletteSummaryProps) => {
  const topMaterials = materials.slice(0, 5);
  const topPalettes = palettes.slice(0, 5);

  const getTrendIcon = (percentage: number) => {
    if (percentage >= 20) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (percentage >= 10) return <TrendingUp className="w-4 h-4 text-blue-500" />;
    if (percentage >= 5) return <TrendingUp className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getTrendColor = (percentage: number) => {
    if (percentage >= 20) return 'text-green-600';
    if (percentage >= 10) return 'text-blue-600';
    if (percentage >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatWeight = (weight: number) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)} MT`;
    }
    return `${weight.toFixed(0)} kg`;
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Package className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="ml-auto">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {materials.length} Materials
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{formatWeight(totalQuantity)}</div>
          <div className="text-sm text-blue-600">Total Quantity</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</div>
          <div className="text-sm text-green-600">Total Amount</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{materials.length}</div>
          <div className="text-sm text-purple-600">Materials</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Material Breakdown */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-blue-500" />
            <h4 className="text-md font-medium text-gray-800">Material Breakdown</h4>
          </div>

          {showCharts && (
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topMaterials}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="quantity"
                  >
                    {topMaterials.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatWeight(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-3">
            {topMaterials.map((material, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: material.color }}
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{material.name}</div>
                    <div className="text-xs text-gray-500">
                      {material.percentage.toFixed(1)}% of total
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatWeight(material.quantity)}
                  </div>
                  <div className="text-xs text-gray-500">{formatCurrency(material.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Palette Analysis */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-purple-500" />
            <h4 className="text-md font-medium text-gray-800">Palette Analysis</h4>
          </div>

          {showCharts && (
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPalettes}>
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-3">
            {topPalettes.map((palette, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: palette.color }}
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {palette.type}
                    </div>
                    <div className="text-xs text-gray-500">
                      {palette.percentage.toFixed(1)}% of total
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{palette.count}</div>
                  <div className="text-xs text-gray-500">entries</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Material Performance Chart */}
      {showCharts && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-800 mb-4">Material Performance</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMaterials}>
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="quantity" fill="#3B82F6" name="Quantity (kg)" />
                <Bar yAxisId="right" dataKey="amount" fill="#10B981" name="Amount (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Material Trends */}
      {showCharts && materials.length > 1 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-800 mb-4">Material Distribution Trends</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={topMaterials}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Material Table */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-md font-medium text-gray-800 mb-4">Detailed Material Breakdown</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.map((material, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: material.color }}
                      />
                      <div className="text-sm font-medium text-gray-900">{material.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatWeight(material.quantity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(material.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {material.percentage.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(material.percentage)}
                      <span className={`text-sm ${getTrendColor(material.percentage)}`}>
                        {material.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Palette Summary */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-md font-medium text-gray-800 mb-4">Palette Summary</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {palettes.map((palette, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{palette.count}</div>
              <div className="text-sm text-gray-600 capitalize">{palette.type}</div>
              <div className="text-xs text-gray-500">{palette.percentage.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default MaterialPaletteSummary;
