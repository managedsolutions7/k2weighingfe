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
import { getVendors } from '@/api/vendors';
import { getVehicles } from '@/api/vehicles';
import { useAppSelector } from '@/store';
import { useScopedParams } from '@/hooks/useScopedApi';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

const SupervisorDashboard = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [kpis, setKpis] = useState<{ totalEntries: number; vendors: number; vehicles: number }>({
    totalEntries: 0,
    vendors: 0,
    vehicles: 0,
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState<any>(null);
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
        <h2 className="font-medium mb-3">By Type</h2>
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
      const list = await getEntries(withScope({ isReviewed: false }));
      setItems(Array.isArray(list) ? list.filter((e) => !plantId || e.plant === plantId) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantId]);

  const onReview = async (id: string) => {
    const notes = prompt('Add review notes (optional)') ?? undefined;
    try {
      setReviewingId(id);
      await reviewEntry(id, { isReviewed: true, reviewNotes: notes });
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
              <span>Vendor: {e.vendor}</span>
              <span>Vehicle: {e.vehicle}</span>
              <span>Entry Wt: {e.entryWeight ?? '-'}</span>
            </div>
            <Button
              size="sm"
              onClick={() => onReview(e._id)}
              loading={reviewingId === e._id}
              disabled={reviewingId === e._id}
            >
              Mark Reviewed
            </Button>
          </div>
        ))}
    </div>
  );
};
