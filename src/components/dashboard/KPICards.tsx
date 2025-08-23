import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from '@/components/ui/Card';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

const KPICard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className = '',
}: KPICardProps) => {
  const getTrendIcon = () => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
    if (trend === 'down') {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon && <div className="text-gray-500">{icon}</div>}
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {trend && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            {trendValue && (
              <span className={`text-sm font-medium ${getTrendColor()}`}>{trendValue}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

interface KPICardsProps {
  data: {
    totalEntries: number;
    totalQuantity: number;
    totalAmount: number;
    averageRate: number;
  };
  className?: string;
}

const KPICards = ({ data, className = '' }: KPICardsProps) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      <KPICard
        title="Total Entries"
        value={data.totalEntries}
        subtitle="All time entries"
        icon="📊"
      />
      <KPICard
        title="Total Quantity"
        value={data.totalQuantity.toFixed(2)}
        subtitle="Total weight processed"
        icon="⚖️"
      />
      <KPICard
        title="Total Amount"
        value={`₹${(data.totalAmount / 1000000).toFixed(2)}M`}
        subtitle="Total value"
        icon="💰"
      />
      <KPICard
        title="Average Rate"
        value={`₹${data.averageRate.toFixed(2)}`}
        subtitle="Per unit rate"
        icon="📈"
      />
    </div>
  );
};

export default KPICards;
export { KPICard };
