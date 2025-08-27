import { BarChart3, TrendingUp, PieChart, Activity, MapPin } from 'lucide-react';
import Card from '@/components/ui/Card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ComposedChart,
  CartesianGrid,
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number | boolean | Date;
}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'composed';
  title: string;
  data: ChartData[];
  xAxis?: string;
  yAxis?: string;
  series?: string[];
  colors?: string[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  dualAxis?: boolean;
}

interface ReportChartsProps {
  charts: ChartConfig[];
  className?: string;
}

const ReportCharts = ({ charts, className = '' }: ReportChartsProps) => {
  const defaultColors = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#06B6D4',
    '#84CC16',
    '#F97316',
    '#EC4899',
    '#6366F1',
  ];

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'bar':
        return <BarChart3 className="w-5 h-5" />;
      case 'line':
        return <TrendingUp className="w-5 h-5" />;
      case 'pie':
        return <PieChart className="w-5 h-5" />;
      case 'area':
        return <Activity className="w-5 h-5" />;
      case 'scatter':
        return <MapPin className="w-5 h-5" />;
      case 'composed':
        return <BarChart3 className="w-5 h-5" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const renderBarChart = (config: ChartConfig) => (
    <ResponsiveContainer width="100%" height={config.height || 300}>
      <BarChart data={config.data}>
        {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={config.xAxis || 'name'} />
        <YAxis />
        <Tooltip />
        {config.showLegend && <Legend />}
        {config.series?.map((series, index) => (
          <Bar
            key={series}
            dataKey={series}
            fill={config.colors?.[index] || defaultColors[index % defaultColors.length]}
            stackId={config.stacked ? 'stack' : undefined}
          />
        )) || <Bar dataKey="value" fill={defaultColors[0]} />}
      </BarChart>
    </ResponsiveContainer>
  );

  const renderLineChart = (config: ChartConfig) => (
    <ResponsiveContainer width="100%" height={config.height || 300}>
      <LineChart data={config.data}>
        {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={config.xAxis || 'name'} />
        <YAxis />
        <Tooltip />
        {config.showLegend && <Legend />}
        {config.series?.map((series, index) => (
          <Line
            key={series}
            type="monotone"
            dataKey={series}
            stroke={config.colors?.[index] || defaultColors[index % defaultColors.length]}
            strokeWidth={2}
            dot={{
              fill: config.colors?.[index] || defaultColors[index % defaultColors.length],
              strokeWidth: 2,
              r: 4,
            }}
          />
        )) || (
          <Line
            type="monotone"
            dataKey="value"
            stroke={defaultColors[0]}
            strokeWidth={2}
            dot={{ fill: defaultColors[0], strokeWidth: 2, r: 4 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderPieChart = (config: ChartConfig) => (
    <ResponsiveContainer width="100%" height={config.height || 300}>
      <RechartsPieChart>
        <Pie
          data={config.data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={2}
          dataKey={config.yAxis || 'value'}
        >
          {config.data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={config.colors?.[index] || defaultColors[index % defaultColors.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        {config.showLegend && <Legend />}
      </RechartsPieChart>
    </ResponsiveContainer>
  );

  const renderAreaChart = (config: ChartConfig) => (
    <ResponsiveContainer width="100%" height={config.height || 300}>
      <AreaChart data={config.data}>
        {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={config.xAxis || 'name'} />
        <YAxis />
        <Tooltip />
        {config.showLegend && <Legend />}
        {config.series?.map((series, index) => (
          <Area
            key={series}
            type="monotone"
            dataKey={series}
            stackId={config.stacked ? 'stack' : undefined}
            fill={config.colors?.[index] || defaultColors[index % defaultColors.length]}
            stroke={config.colors?.[index] || defaultColors[index % defaultColors.length]}
          />
        )) || (
          <Area type="monotone" dataKey="value" fill={defaultColors[0]} stroke={defaultColors[0]} />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderScatterChart = (config: ChartConfig) => (
    <ResponsiveContainer width="100%" height={config.height || 300}>
      <ScatterChart data={config.data}>
        {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={config.xAxis || 'x'} />
        <YAxis dataKey={config.yAxis || 'y'} />
        <Tooltip />
        {config.showLegend && <Legend />}
        {config.series?.map((series, index) => (
          <Scatter
            key={series}
            dataKey={series}
            fill={config.colors?.[index] || defaultColors[index % defaultColors.length]}
          />
        )) || <Scatter dataKey="y" fill={defaultColors[0]} />}
      </ScatterChart>
    </ResponsiveContainer>
  );

  const renderComposedChart = (config: ChartConfig) => (
    <ResponsiveContainer width="100%" height={config.height || 300}>
      <ComposedChart data={config.data}>
        {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={config.xAxis || 'name'} />
        <YAxis yAxisId="left" />
        {config.dualAxis && <YAxis yAxisId="right" orientation="right" />}
        <Tooltip />
        {config.showLegend && <Legend />}
        {config.series?.map((series, index) => {
          if (index === 0) {
            return (
              <Bar
                key={series}
                dataKey={series}
                fill={config.colors?.[index] || defaultColors[index % defaultColors.length]}
                yAxisId="left"
              />
            );
          } else {
            return (
              <Line
                key={series}
                type="monotone"
                dataKey={series}
                stroke={config.colors?.[index] || defaultColors[index % defaultColors.length]}
                strokeWidth={2}
                yAxisId={config.dualAxis ? 'right' : 'left'}
              />
            );
          }
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );

  const renderChart = (config: ChartConfig) => {
    switch (config.type) {
      case 'bar':
        return renderBarChart(config);
      case 'line':
        return renderLineChart(config);
      case 'pie':
        return renderPieChart(config);
      case 'area':
        return renderAreaChart(config);
      case 'scatter':
        return renderScatterChart(config);
      case 'composed':
        return renderComposedChart(config);
      default:
        return renderBarChart(config);
    }
  };

  if (!charts || charts.length === 0) {
    return (
      <Card className={`p-6 text-center text-gray-500 ${className}`}>
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No charts configured</p>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {charts.map((chart, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">{getChartIcon(chart.type)}</div>
            <h3 className="text-lg font-semibold text-gray-900">{chart.title}</h3>
          </div>

          <div className="chart-container">{renderChart(chart)}</div>

          {chart.data.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No data available for this chart</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default ReportCharts;
