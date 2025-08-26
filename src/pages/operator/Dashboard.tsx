import { useEffect, useState } from 'react';
// import { useAppSelector } from '@/store';
import { getOperatorDashboard, type DateRangeParams } from '@/api/dashboard';
import PageHeader from '@/components/ui/PageHeader';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatDateTime, getPresetRange, type PresetRange } from '@/utils/date';

const OperatorDashboard = () => {
  // Removed unused selector to satisfy linter
  const [preset, setPreset] = useState<PresetRange>('24h');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  interface OperatorDashboardData {
    totals?: { totalEntries?: number; totalQuantity?: number };
    counters?: { pendingReviews?: number; flagged?: number };
    recentEntries?: Array<{
      exactWeight: number;
      _id: string;
      entryType?: string;
      vendor?: string | { name?: string };
      vehicle?: { vehicleNumber?: string };
      plant?: string | { code?: string };
      entryDate?: string;
      entryWeight?: number;
    }>;
  }
  const [data, setData] = useState<OperatorDashboardData | null>(null);

  useEffect(() => {
    const load = async () => {
      // Map presets to start/end ISO dates; custom uses explicit dates
      let params: DateRangeParams = { recentEntriesLimit: 5 };
      if (preset === 'custom') {
        params = {
          ...params,
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        };
      } else {
        const { from, to } = getPresetRange(preset);
        params = { ...params, startDate: from, endDate: to };
      }
      const resp = await getOperatorDashboard(params);
      setData(resp ?? {});
    };
    void load();
  }, [preset, startDate, endDate]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Operator Dashboard"
        actions={
          <div className="flex flex-wrap gap-2 items-center">
            <select
              className="border rounded px-3 py-2"
              value={preset}
              onChange={(e) => setPreset((e.target as HTMLSelectElement).value as PresetRange)}
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="custom">Custom</option>
            </select>
            {preset === 'custom' && (
              <>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate((e.target as HTMLInputElement).value)}
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate((e.target as HTMLInputElement).value)}
                />
              </>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setPreset('24h');
                setStartDate('');
                setEndDate('');
              }}
            >
              Reset
            </Button>
          </div>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-500">Total Entries</div>
          <div className="text-2xl font-semibold">{data?.totals?.totalEntries ?? 0}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">Quantity</div>
          <div className="text-2xl font-semibold">{data?.totals?.totalQuantity ?? 0}</div>
        </div>
        {/* Removed Amount card as per new requirement */}
      </div>

      <Card>
        <h3 className="font-medium mb-2">Counters</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="card p-3">Pending Reviews: {data?.counters?.pendingReviews ?? 0}</div>
          <div className="card p-3">Flagged: {data?.counters?.flagged ?? 0}</div>
        </div>
      </Card>

      <Card>
        <h3 className="font-medium mb-2">Recent Entries</h3>
        <div className="space-y-2 text-sm">
          {(data?.recentEntries ?? []).map((e) => (
            <div key={e._id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{e.entryType}</div>
                <div className="text-xs text-gray-500">
                  {typeof e.vendor === 'string' ? e.vendor : e.vendor?.name} ·{' '}
                  {e.vehicle?.vehicleNumber ?? ''} ·{' '}
                  {typeof e.plant === 'string' ? e.plant : e.plant?.code}
                </div>
              </div>
              <div className="text-right text-xs">{formatDateTime(e.entryDate)}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-medium mb-2">Entry Quantities (Recent)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={(data?.recentEntries ?? []).map((e, idx) => ({
                name: e.entryDate ? formatDateTime(e.entryDate) : `Entry ${idx + 1}`,
                qty: e.exactWeight ?? 0,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="qty" fill="rgb(59,130,246)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </section>
  );
};

export default OperatorDashboard;
