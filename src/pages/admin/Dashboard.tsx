import { useEffect, useMemo, useState } from 'react';
import { getAdminDashboard, type DateRangeParams } from '@/api/dashboard';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="card p-4">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-2xl font-semibold">{value}</div>
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params: DateRangeParams = {
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
          recentEntriesLimit: 5,
          recentInvoicesLimit: 5,
          topVendorsLimit: 5,
        };
        const resp = await getAdminDashboard(params);
        setData(resp ?? {});
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [startDate, endDate]);

  return (
    <section id="main" aria-busy={loading} aria-live="polite" className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
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

      <div className="grid sm:grid-cols-4 gap-4">
        <StatCard label="Total Entries" value={data?.totals?.totalEntries ?? 0} />
        <StatCard label="Total Quantity" value={data?.totals?.totalQuantity ?? 0} />
        <StatCard label="Total Amount" value={data?.totals?.totalAmount ?? 0} />
        <StatCard label="Average Rate" value={data?.totals?.averageRate ?? 0} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-medium mb-2">By Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: 'Purchase',
                    entries: data?.byType?.purchase?.entries ?? 0,
                    quantity: data?.byType?.purchase?.quantity ?? 0,
                    amount: data?.byType?.purchase?.amount ?? 0,
                  },
                  {
                    name: 'Sale',
                    entries: data?.byType?.sale?.entries ?? 0,
                    quantity: data?.byType?.sale?.quantity ?? 0,
                    amount: data?.byType?.sale?.amount ?? 0,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="entries" fill="rgb(59,130,246)" />
                <Bar dataKey="quantity" fill="rgb(16,185,129)" />
                <Bar dataKey="amount" fill="rgb(245,158,11)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="font-medium mb-2">Counts</h3>
          <div className="grid sm:grid-cols-4 gap-3 text-sm">
            <div className="card p-3">Entries: {data?.counts?.entries ?? 0}</div>
            <div className="card p-3">Invoices: {data?.counts?.invoices ?? 0}</div>
            <div className="card p-3">Vendors: {data?.counts?.vendors ?? 0}</div>
            <div className="card p-3">Plants: {data?.counts?.plants ?? 0}</div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-medium mb-2">Top Vendors</h3>
          <div className="space-y-2 text-sm">
            {(data?.topVendors ?? []).map((v: any) => (
              <div key={v.vendor._id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{v.vendor.name}</div>
                  <div className="text-xs text-gray-500">{v.vendor.code}</div>
                </div>
                <div className="text-right">
                  <div>Amount: {v.totalAmount}</div>
                  <div className="text-xs text-gray-500">Qty: {v.totalQuantity}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="font-medium mb-2">Recent Invoices</h3>
          <div className="space-y-2 text-sm">
            {(data?.recentInvoices ?? []).map((inv: any) => (
              <div key={inv._id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {typeof inv.vendor === 'string' ? inv.vendor : inv.vendor?.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {typeof inv.plant === 'string' ? inv.plant : inv.plant?.code}
                  </div>
                </div>
                <div className="text-right text-xs">{inv.invoiceDate}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-medium mb-2">Recent Entries</h3>
        <div className="space-y-2 text-sm">
          {(data?.recentEntries ?? []).map((e: any) => (
            <div key={e._id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{e.entryType}</div>
                <div className="text-xs text-gray-500">
                  {typeof e.vendor === 'string' ? e.vendor : e.vendor?.name} ·{' '}
                  {typeof e.plant === 'string' ? e.plant : e.plant?.code}
                </div>
              </div>
              <div className="text-right text-xs">{e.entryDate}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="font-medium mb-2">Trends</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={useMemo(() => {
                const items = (data?.recentEntries ?? []) as any[];
                const map = new Map<string, number>();
                for (const it of items) {
                  const day = (it.entryDate ?? '').slice(0, 10);
                  if (!day) continue;
                  map.set(day, (map.get(day) ?? 0) + 1);
                }
                return Array.from(map.entries())
                  .sort((a, b) => (a[0] < b[0] ? -1 : 1))
                  .map(([date, count]) => ({ date: date.slice(5), count }));
              }, [data?.recentEntries])}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="rgb(59,130,246)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </section>
  );
};

export default AdminDashboard;
