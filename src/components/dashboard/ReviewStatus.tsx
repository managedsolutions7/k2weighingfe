import { Eye, Flag, CheckCircle, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import type { ReviewMetrics } from '@/api/enhanced-dashboard';

interface ReviewStatusProps {
  data: ReviewMetrics;
  className?: string;
}

const ReviewStatus = ({ data, className = '' }: ReviewStatusProps) => {
  const getReviewStatusColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-blue-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFlagStatusColor = (rate: number) => {
    if (rate <= 5) return 'text-green-600';
    if (rate <= 15) return 'text-blue-600';
    if (rate <= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const ProgressBar = ({
    value,
    max,
    color,
    label,
  }: {
    value: number;
    max: number;
    color: string;
    label: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">
          {value} / {max}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Review & Compliance Status</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Review Metrics */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-blue-500" />
            <h4 className="text-md font-medium text-gray-800">Review Metrics</h4>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{data.reviewedEntries}</div>
                <div className="text-sm text-blue-600">Reviewed</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{data.pendingReview}</div>
                <div className="text-sm text-orange-600">Pending</div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Review Rate:</span>
                <span className={`text-lg font-semibold ${getReviewStatusColor(data.reviewRate)}`}>
                  {data.reviewRate.toFixed(1)}%
                </span>
              </div>
              <ProgressBar
                value={data.reviewedEntries}
                max={data.reviewedEntries + data.pendingReview}
                color="bg-blue-500"
                label="Review Progress"
              />
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-600">Reviewed</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-gray-600">Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flag Metrics */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Flag className="w-5 h-5 text-red-500" />
            <h4 className="text-md font-medium text-gray-800">Flag & Variance Metrics</h4>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{data.flaggedEntries}</div>
                <div className="text-sm text-red-600">Flagged</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {data.varianceFlaggedEntries}
                </div>
                <div className="text-sm text-yellow-600">Variance</div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Flag Rate:</span>
                <span className={`text-lg font-semibold ${getFlagStatusColor(data.flagRate)}`}>
                  {data.flagRate.toFixed(1)}%
                </span>
              </div>
              <ProgressBar
                value={data.flaggedEntries}
                max={data.reviewedEntries + data.pendingReview}
                color="bg-red-500"
                label="Flag Rate"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Manual Weight Entries:</span>
                <span className="font-medium text-gray-900">{data.manualWeightEntries}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Entries:</span>
                <span className="font-medium text-gray-900">
                  {data.reviewedEntries + data.pendingReview}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{data.reviewRate.toFixed(0)}%</div>
            <div className="text-xs text-green-600">Review Rate</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">{data.flagRate.toFixed(0)}%</div>
            <div className="text-xs text-red-600">Flag Rate</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{data.manualWeightEntries}</div>
            <div className="text-xs text-blue-600">Manual Weight</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">{data.varianceFlaggedEntries}</div>
            <div className="text-xs text-purple-600">Variance Flags</div>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Excellent (90%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Good (75-89%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">Acceptable (60-74%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Needs Attention (&lt;60%)</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReviewStatus;
