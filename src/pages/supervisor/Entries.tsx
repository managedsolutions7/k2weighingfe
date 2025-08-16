import { useEffect, useMemo, useState } from 'react';
import { getEntries, reviewEntry, type Entry } from '@/api/entries';
import DataTable, { type Column } from '@/components/common/DataTable';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Pagination from '@/components/common/Pagination';
import { useAppSelector } from '@/store';
import { toastError, toastSuccess } from '@/utils/toast';

const SupervisorEntries = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const list = await getEntries({ plant: user?.plantId });
      setTotal(list.length);
      const start = (page - 1) * pageSize;
      setEntries(list.slice(start, start + pageSize));
    } catch {
      toastError('Failed to fetch entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.plantId, page]);

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const onReview = async (id: string) => {
    const notes = prompt('Add review notes (optional)') ?? undefined;
    try {
      setReviewingId(id);
      await reviewEntry(id, { isReviewed: true, reviewNotes: notes });
      toastSuccess('Entry marked reviewed');
      void fetchEntries();
    } catch {
      toastError('Failed to mark reviewed');
    } finally {
      setReviewingId(null);
    }
  };

  const columns: Column<Entry>[] = useMemo(
    () => [
      { key: 'entryType', header: 'Type' },
      { key: 'vendor', header: 'Vendor' },
      { key: 'vehicle', header: 'Vehicle' },
      { key: 'entryWeight', header: 'Entry Wt' },
      { key: 'exitWeight', header: 'Exit Wt' },
      {
        key: 'isReviewed',
        header: 'Status',
        render: (r) => (
          <Badge variant={r.isReviewed ? 'success' : 'warning'}>
            {r.isReviewed ? 'Reviewed' : 'Pending'}
          </Badge>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (r) => (
          <div className="flex gap-2">
            {!r.isReviewed && (
              <Button
                size="sm"
                onClick={() => onReview(r._id)}
                loading={reviewingId === r._id}
                disabled={reviewingId === r._id}
              >
                Mark Reviewed
              </Button>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Entries" />
      <Card>
        {loading && entries.length === 0 ? (
          <Skeleton className="h-48" />
        ) : (
          <>
            <DataTable<Entry> columns={columns} data={entries} keyField="_id" />
            <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
};

export default SupervisorEntries;
