import { useEffect, useState } from 'react';
import { getSupervisorDashboard, type DateRangeParams } from '@/api/dashboard';
import PageHeader from '@/components/ui/PageHeader';
import Input from '@/components/ui/Input';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { getEntries, reviewEntry, type Entry } from '@/api/entries';
import { useAppSelector } from '@/store';
import { useScopedParams } from '@/hooks/useScopedApi';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { formatDateTime } from '@/utils/date';
import Skeleton from '@/components/ui/Skeleton';

const SupervisorDashboard = () => {
  const user = useAppSelector((s) => s.auth.user);
  // KPIs not used currently

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  interface SupervisorDashboardData {
    totals?: { totalEntries?: number; totalQuantity?: number };
    byType?: {
      purchase?: { entries?: number; quantity?: number };
      sale?: { entries?: number; quantity?: number };
    };
    recentEntries?: Array<{
      _id: string;
      entryNumber?: string;
      entryType?: string;
      vendor?: string | { name?: string };
      vehicle?: { vehicleNumber?: string } | string;
      entryDate?: string;
    }>;
  }
  const [data, setData] = useState<SupervisorDashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const params: DateRangeParams = {
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        recentEntriesLimit: 5,
        recentInvoicesLimit: 5,
      };
      setLoading(true);
      const resp = await getSupervisorDashboard(params);
      setData(resp ?? {});
      setLoading(false);
    };
    void load();
  }, [startDate, endDate]);

  return (
    <section className="space-y-6" aria-live="polite">
      <PageHeader
        title="Supervisor Dashboard"
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
              loading={loading}
              disabled={loading}
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
        {loading ? (
          <>
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <div />
          </>
        ) : (
          <>
            <div className="card p-4">
              <div className="text-sm text-gray-500">Total Entries</div>
              <div className="text-2xl font-semibold">{data?.totals?.totalEntries ?? 0}</div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-gray-500">Quantity</div>
              <div className="text-2xl font-semibold">{data?.totals?.totalQuantity ?? 0}</div>
            </div>
            {/* Amount removed as per new requirement */}
          </>
        )}
      </div>

      <Card>
        <h2 className="font-medium mb-3">By Type</h2>
        <div className="h-64">
          {loading ? (
            <Skeleton className="h-64" />
          ) : (
            (() => {
              const chartData = [
                {
                  name: 'Purchase',
                  entries: data?.byType?.purchase?.entries ?? 0,
                  quantity: data?.byType?.purchase?.quantity ?? 0,
                },
                {
                  name: 'Sale',
                  entries: data?.byType?.sale?.entries ?? 0,
                  quantity: data?.byType?.sale?.quantity ?? 0,
                },
              ];
              const hasData = chartData.some((d) => (d.entries ?? 0) > 0 || (d.quantity ?? 0) > 0);
              return hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="entries" fill="rgb(59,130,246)" />
                    <Bar dataKey="quantity" fill="rgb(16,185,129)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-500">
                  No data to display
                </div>
              );
            })()
          )}
        </div>
      </Card>

      <Card>
        <h2 className="font-medium mb-3">Recent Entries</h2>
        {loading ? (
          <Skeleton className="h-28" />
        ) : (data?.recentEntries ?? []).length === 0 ? (
          <div className="text-sm text-gray-500 px-3 py-2">No recent entries</div>
        ) : (
          <div className="space-y-2 text-sm">
            {(data?.recentEntries ?? []).map((e) => (
              <div key={e._id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{e.entryNumber ?? e._id}</div>
                  <div className="text-xs text-gray-500">
                    {e.entryType} · Vendor:{' '}
                    {typeof e.vendor === 'string' ? e.vendor : e.vendor?.name} · Vehicle:{' '}
                    {typeof e.vehicle === 'string' ? e.vehicle : e.vehicle?.vehicleNumber}
                  </div>
                </div>
                <div className="text-right text-xs">{formatDateTime(e.entryDate)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-medium mb-3">Pending Review</h2>
        <PendingReviewList plantId={user?.plantId ?? ''} />
      </Card>
    </section>
  );
};

export default SupervisorDashboard;

const PendingReviewList = ({ plantId }: { plantId: string }) => {
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const { withScope } = useScopedParams();

  const fetchPending = async () => {
    try {
      setLoading(true);
      // Ensure backend receives the correct filter and response is mapped
      const res = await getEntries(withScope({ isReviewed: 'false' }));
      setItems(res?.entries ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantId]);

  const onReview = async (id: string) => {
    try {
      setReviewingId(id);
      await reviewEntry(id, { isReviewed: true });
      await fetchPending();
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="space-y-2">
      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      {!loading && items.length === 0 && (
        <div className="text-sm text-gray-500">No pending entries</div>
      )}
      {!loading &&
        items.slice(0, 10).map((e) => (
          <div key={e._id} className="flex items-center justify-between border rounded px-3 py-2">
            <div className="flex items-center gap-3 text-sm">
              <Badge variant="warning">Pending</Badge>
              <span>{e.entryType}</span>
              <span>Vendor: {typeof e.vendor === 'string' ? e.vendor : e.vendor?.name}</span>
              <span>
                Vehicle: {typeof e.vehicle === 'string' ? e.vehicle : e.vehicle?.vehicleNumber}
              </span>
              <span>Entry Wt: {e.entryWeight ?? '-'}</span>
            </div>
            <Button
              size="sm"
              onClick={() => onReview(e._id)}
              loading={reviewingId === e._id}
              disabled={reviewingId === e._id || Boolean(e.varianceFlag)}
            >
              Mark Reviewed
            </Button>
          </div>
        ))}
    </div>
  );
};
