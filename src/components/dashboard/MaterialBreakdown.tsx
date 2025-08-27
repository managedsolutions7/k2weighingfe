import { Package } from 'lucide-react';
import Card from '@/components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { MaterialBreakdown as MaterialBreakdownType } from '@/api/enhanced-dashboard';

interface MaterialBreakdownProps {
  data: MaterialBreakdownType[];
  className?: string;
}

const MaterialBreakdown = ({ data, className = '' }: MaterialBreakdownProps) => {
  const getQualityStatus = (moisture: number, dust: number) => {
    const totalImpurity = moisture + dust;
    if (totalImpurity <= 8)
      return { status: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (totalImpurity <= 15) return { status: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (totalImpurity <= 25)
      return { status: 'Acceptable', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { status: 'Poor', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const chartData = data.map((material) => ({
    name: material.materialName,
    quantity: material.totalQuantity,
    moisture: material.averageMoisture,
    dust: material.averageDust,
    entries: material.totalEntries,
    flagged: material.flaggedEntries,
    variance: material.varianceFlaggedEntries,
  }));

  const pieData = data.map((material) => ({
    name: material.materialName,
    value: material.totalQuantity,
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Package className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">Material Performance Analysis</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Material Distribution Chart */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-4">
            Material Distribution by Quantity
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} kg`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Comparison Chart */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-4">Quality Metrics Comparison</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="moisture" fill="#3B82F6" name="Moisture %" />
                <Bar dataKey="dust" fill="#F59E0B" name="Dust %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Material Performance Table */}
      <div className="mt-8">
        <h4 className="text-md font-medium text-gray-800 mb-4">Detailed Material Performance</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moisture %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dust %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flags
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((material, index) => {
                const quality = getQualityStatus(material.averageMoisture, material.averageDust);
                return (
                  <tr
                    key={material.materialCode}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {material.materialName}
                        </div>
                        <div className="text-sm text-gray-500">{material.materialCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.totalEntries}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.totalQuantity.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.averageMoisture.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.averageDust.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${quality.bg} ${quality.color}`}
                      >
                        {quality.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {material.flaggedEntries > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {material.flaggedEntries} Flagged
                          </span>
                        )}
                        {material.varianceFlaggedEntries > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {material.varianceFlaggedEntries} Variance
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{data.length}</div>
            <div className="text-xs text-blue-600">Total Materials</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {data.reduce((sum, m) => sum + m.totalQuantity, 0).toFixed(0)}
            </div>
            <div className="text-xs text-green-600">Total Quantity (kg)</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">
              {(data.reduce((sum, m) => sum + m.averageMoisture, 0) / data.length).toFixed(1)}%
            </div>
            <div className="text-xs text-yellow-600">Avg Moisture</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">
              {data.reduce((sum, m) => sum + m.flaggedEntries, 0)}
            </div>
            <div className="text-xs text-red-600">Total Flags</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MaterialBreakdown;
