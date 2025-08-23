import { Users, TrendingUp, AlertTriangle, Award, Star } from 'lucide-react';
import Card from '@/components/ui/Card';
import type { TopVendor } from '@/api/enhanced-dashboard';

interface TopVendorsProps {
  data: TopVendor[];
  className?: string;
}

const TopVendors = ({ data, className = '' }: TopVendorsProps) => {
  const getPerformanceScore = (vendor: TopVendor) => {
    const qualityScore = 100 - (vendor.flaggedEntries / vendor.entries) * 100;
    const volumeScore = Math.min((vendor.totalQuantity / 10000) * 100, 100); // Normalize to 10k kg
    const rateScore = Math.min((vendor.averageRate / 100) * 100, 100); // Normalize to ₹100

    return qualityScore * 0.4 + volumeScore * 0.3 + rateScore * 0.3;
  };

  const sortedVendors = [...data].sort((a, b) => getPerformanceScore(b) - getPerformanceScore(a));

  const getPerformanceBadge = (score: number) => {
    if (score >= 90)
      return { label: 'Excellent', color: 'bg-green-100 text-green-800', icon: Award };
    if (score >= 80) return { label: 'Good', color: 'bg-blue-100 text-blue-800', icon: Star };
    if (score >= 70)
      return { label: 'Average', color: 'bg-yellow-100 text-yellow-800', icon: TrendingUp };
    return { label: 'Needs Attention', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
  };

  const getQualityStatus = (vendor: TopVendor) => {
    const flagRate = (vendor.flaggedEntries / vendor.entries) * 100;
    if (flagRate <= 5) return { status: 'Excellent', color: 'text-green-600' };
    if (flagRate <= 15) return { status: 'Good', color: 'text-blue-600' };
    if (flagRate <= 25) return { status: 'Acceptable', color: 'text-yellow-600' };
    return { status: 'Poor', color: 'text-red-600' };
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">Top Vendors Performance</h3>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600">{data.length}</div>
          <div className="text-xs text-blue-600">Total Vendors</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {data.reduce((sum, v) => sum + v.totalAmount, 0).toLocaleString()}
          </div>
          <div className="text-xs text-green-600">Total Value</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-lg font-bold text-yellow-600">
            {data.reduce((sum, v) => sum + v.totalQuantity, 0).toFixed(0)}
          </div>
          <div className="text-xs text-yellow-600">Total Quantity (kg)</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-lg font-bold text-purple-600">
            {(data.reduce((sum, v) => sum + v.averageRate, 0) / data.length).toFixed(2)}
          </div>
          <div className="text-xs text-purple-600">Avg Rate</div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entries
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity (kg)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount (₹)
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
            {sortedVendors.map((vendor, index) => {
              const performanceScore = getPerformanceScore(vendor);
              const performanceBadge = getPerformanceBadge(performanceScore);
              const qualityStatus = getQualityStatus(vendor);
              const PerformanceIcon = performanceBadge.icon;

              return (
                <tr key={vendor.vendor._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index < 3 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-yellow-600">#{index + 1}</span>
                          {index === 0 && <Award className="w-5 h-5 text-yellow-500" />}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">#{index + 1}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{vendor.vendor.name}</div>
                      <div className="text-sm text-gray-500">{vendor.vendor.code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${performanceBadge.color}`}
                      >
                        <PerformanceIcon className="w-3 h-3 mr-1" />
                        {performanceBadge.label}
                      </span>
                      <span className="text-xs text-gray-500">{performanceScore.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="text-center">
                      <div className="font-medium">{vendor.entries}</div>
                      <div className="text-xs text-gray-500">
                        P: {vendor.purchaseEntries} | S: {vendor.saleEntries}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.totalQuantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{vendor.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${qualityStatus.color === 'text-green-600' ? 'bg-green-100 text-green-800' : qualityStatus.color === 'text-blue-600' ? 'bg-blue-100 text-blue-800' : qualityStatus.color === 'text-yellow-600' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {qualityStatus.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {vendor.flaggedEntries > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {vendor.flaggedEntries} Flagged
                        </span>
                      )}
                      {vendor.varianceFlaggedEntries > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {vendor.varianceFlaggedEntries} Variance
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

      {/* Performance Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-md font-medium text-gray-800 mb-4">Performance Insights</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-800">Top Performer</div>
            <div className="text-lg font-bold text-blue-600">
              {sortedVendors[0]?.vendor.name || 'N/A'}
            </div>
            <div className="text-xs text-blue-600">
              Score: {sortedVendors[0] ? getPerformanceScore(sortedVendors[0]).toFixed(0) : 0}%
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm font-medium text-green-800">Highest Volume</div>
            <div className="text-lg font-bold text-green-600">
              {data.reduce((max, v) => (v.totalQuantity > max.totalQuantity ? v : max), data[0])
                ?.vendor.name || 'N/A'}
            </div>
            <div className="text-xs text-green-600">
              {data
                .reduce((max, v) => (v.totalQuantity > max.totalQuantity ? v : max), data[0])
                ?.totalQuantity.toLocaleString() || 0}{' '}
              kg
            </div>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="text-sm font-medium text-yellow-800">Best Quality</div>
            <div className="text-lg font-bold text-yellow-600">
              {data.reduce(
                (min, v) =>
                  v.flaggedEntries / v.entries < min.flaggedEntries / min.entries ? v : min,
                data[0],
              )?.vendor.name || 'N/A'}
            </div>
            <div className="text-xs text-yellow-600">
              Flag Rate:{' '}
              {data.reduce(
                (min, v) =>
                  v.flaggedEntries / v.entries < min.flaggedEntries / min.entries ? v : min,
                data[0],
              )
                ? (
                    ((data.reduce(
                      (min, v) =>
                        v.flaggedEntries / v.entries < min.flaggedEntries / min.entries ? v : min,
                      data[0],
                    )?.flaggedEntries || 0) /
                      (data.reduce(
                        (min, v) =>
                          v.flaggedEntries / v.entries < min.flaggedEntries / min.entries ? v : min,
                        data[0],
                      )?.entries || 1)) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TopVendors;
