import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store';
import { getOperatorDashboard, type DateRangeParams } from '@/api/dashboard';
import PageHeader from '@/components/ui/PageHeader';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const OperatorDashboard = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const params: DateRangeParams = {
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        recentEntriesLimit: 5,
      };
      const resp = await getOperatorDashboard(params);
      setData(resp ?? {});
    };
    void load();
  }, [startDate, endDate]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Operator Dashboard"
        actions={
          <div className="flex gap-2">
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
            <Button
              variant="outline"
              onClick={() => {
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
        <div className="card p-4">
          <div className="text-sm text-gray-500">Amount</div>
          <div className="text-2xl font-semibold">{data?.totals?.totalAmount ?? 0}</div>
        </div>
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
          {(data?.recentEntries ?? []).map((e: any) => (
            <div key={e._id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{e.entryType}</div>
                <div className="text-xs text-gray-500">
                  {typeof e.vendor === 'string' ? e.vendor : e.vendor?.name} ·{' '}
                  {e.vehicle?.vehicleNumber ?? ''} ·{' '}
                  {typeof e.plant === 'string' ? e.plant : e.plant?.code}
                </div>
              </div>
              <div className="text-right text-xs">{e.entryDate}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-medium mb-2">Entry Quantities (Recent)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={(data?.recentEntries ?? []).map((e: any) => ({
                name: e.entryDate?.slice(5, 10) ?? '',
                qty: e.entryWeight ?? 0,
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
