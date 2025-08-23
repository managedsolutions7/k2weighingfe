import { useState, useEffect } from 'react';
import { Filter, Search, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { getPresetRange } from '@/utils/date';
import type { BaseReportParams } from '@/api/enhanced-reports';

interface ReportFiltersProps {
  filters: BaseReportParams;
  onFiltersChange: (filters: BaseReportParams) => void;
  onReset: () => void;
  vendors?: Array<{ _id: string; name: string; code: string }>;
  plants?: Array<{ _id: string; name: string; code: string }>;
  className?: string;
}

const ReportFilters = ({
  filters,
  onFiltersChange,
  onReset,
  vendors = [],
  plants = [],
  className = '',
}: ReportFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<BaseReportParams>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof BaseReportParams, value: string | undefined) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleQuickDateRange = (preset: '24h' | '7d' | '30d') => {
    const { from, to } = getPresetRange(preset);
    const newFilters = { ...localFilters, startDate: from, endDate: to };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: BaseReportParams = {};
    setLocalFilters(resetFilters);
    onReset();
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined);

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Report Filters</h3>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {Object.values(filters).filter(Boolean).length} Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Quick Date Range Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickDateRange('24h')}
          className="text-xs"
        >
          Last 24h
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickDateRange('7d')}
          className="text-xs"
        >
          Last 7 Days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickDateRange('30d')}
          className="text-xs"
        >
          Last 30 Days
        </Button>
      </div>

      {/* Basic Filters (Always Visible) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Entry Type</label>
          <Select
            value={localFilters.entryType || ''}
            onChange={(e) => handleFilterChange('entryType', e.target.value || undefined)}
          >
            <option value="">All Types</option>
            <option value="purchase">Purchase</option>
            <option value="sale">Sale</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
          <Select
            value={localFilters.vendor || ''}
            onChange={(e) => handleFilterChange('vendor', e.target.value || undefined)}
          >
            <option value="">All Vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor._id} value={vendor._id}>
                {vendor.name} ({vendor.code})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Plant</label>
          <Select
            value={localFilters.plant || ''}
            onChange={(e) => handleFilterChange('plant', e.target.value || undefined)}
          >
            <option value="">All Plants</option>
            {plants.map((plant) => (
              <option key={plant._id} value={plant._id}>
                {plant.name} ({plant.code})
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            onClick={handleApplyFilters}
            className="w-full"
            disabled={JSON.stringify(localFilters) === JSON.stringify(filters)}
          >
            <Search className="w-4 h-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Advanced Filters (Expandable) */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <Input
                type="date"
                value={localFilters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <Input
                type="date"
                value={localFilters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
              />
            </div>
          </div>

          {/* Additional Advanced Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quality Score</label>
              <Select value="" onChange={() => {}} disabled>
                <option value="">Coming Soon</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Status</label>
              <Select value="" onChange={() => {}} disabled>
                <option value="">Coming Soon</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Flag Status</label>
              <Select value="" onChange={() => {}} disabled>
                <option value="">Coming Soon</option>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.entryType && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Type: {filters.entryType}
                <button
                  onClick={() => handleFilterChange('entryType', undefined)}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.vendor && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Vendor: {vendors.find((v) => v._id === filters.vendor)?.name || filters.vendor}
                <button
                  onClick={() => handleFilterChange('vendor', undefined)}
                  className="ml-1 hover:text-green-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.plant && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Plant: {plants.find((p) => p._id === filters.plant)?.name || filters.plant}
                <button
                  onClick={() => handleFilterChange('plant', undefined)}
                  className="ml-1 hover:text-purple-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.startDate && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                From: {new Date(filters.startDate).toLocaleDateString()}
                <button
                  onClick={() => handleFilterChange('startDate', undefined)}
                  className="ml-1 hover:text-yellow-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.endDate && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                To: {new Date(filters.endDate).toLocaleDateString()}
                <button
                  onClick={() => handleFilterChange('endDate', undefined)}
                  className="ml-1 hover:text-yellow-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ReportFilters;
