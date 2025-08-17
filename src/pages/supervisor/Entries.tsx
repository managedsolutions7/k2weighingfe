import { useEffect, useMemo, useState } from 'react';
import { getEntries, reviewEntry, flagEntry, updateEntry, type Entry } from '@/api/entries';
import DataTable, { type Column } from '@/components/common/DataTable';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Pagination from '@/components/common/Pagination';
import { useAppSelector } from '@/store';
import { toastError, toastSuccess } from '@/utils/toast';
import { Modal } from '@/components/common/Modal';
import Input from '@/components/ui/Input';
import FormField from '@/components/ui/FormField';
import { formatDateTime } from '@/utils/date';

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
      const res = await getEntries({ page, limit: pageSize });
      setEntries(res.entries ?? []);
      setTotal(res.total ?? res.entries?.length ?? 0);
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
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [updateModal, setUpdateModal] = useState<{ open: boolean; entry?: Entry }>({ open: false });
  const [updateForm, setUpdateForm] = useState<Partial<Entry>>({});
  const [updateSaving, setUpdateSaving] = useState(false);
  // flag reason collected via prompt for now

  const onReview = async (id: string) => {
    // Review without comments
    try {
      setReviewingId(id);
      await reviewEntry(id, { isReviewed: true });
      toastSuccess('Entry marked reviewed');
      void fetchEntries();
    } catch {
      toastError('Failed to mark reviewed');
    } finally {
      setReviewingId(null);
    }
  };

  const [flagModal, setFlagModal] = useState<{ open: boolean; entry?: Entry; reason: string }>({
    open: false,
    reason: '',
  });
  const onFlag = (entry: Entry) => {
    setFlagModal({ open: true, entry, reason: entry.flagReason ?? '' });
  };
  const submitFlag = async () => {
    if (!flagModal.entry) return;
    try {
      setFlaggingId(flagModal.entry._id);
      await flagEntry(flagModal.entry._id, {
        flagged: !flagModal.entry.flagged,
        flagReason: flagModal.reason || undefined,
      });
      toastSuccess(flagModal.entry.flagged ? 'Entry unflagged' : 'Entry flagged');
      setFlagModal({ open: false, reason: '' });
      void fetchEntries();
    } catch {
      toastError('Failed to update flag');
    } finally {
      setFlaggingId(null);
    }
  };

  const onOpenUpdate = (entry: Entry) => {
    if (entry.isReviewed) {
      toastError('Reviewed entry cannot be updated');
      return;
    }
    if (!entry.varianceFlag) {
      toastError('Only variance-flagged entries can be updated');
      return;
    }
    setUpdateForm({
      vendor: typeof entry.vendor === 'string' ? entry.vendor : entry.vendor?._id,
      vehicle: typeof entry.vehicle === 'string' ? entry.vehicle : entry.vehicle?._id,
      entryType: entry.entryType,
      entryWeight: entry.entryWeight,
      exitWeight: entry.exitWeight,
      moisture: entry.moisture,
      dust: entry.dust,
      reviewNotes: entry.reviewNotes,
    });
    setUpdateModal({ open: true, entry });
  };

  const onSubmitUpdate = async () => {
    if (!updateModal.entry) return;
    try {
      setUpdateSaving(true);
      // Send only changed fields
      const payload: Record<string, unknown> = {};
      const original = updateModal.entry;
      if (updateForm.entryWeight !== original.entryWeight)
        payload.entryWeight = updateForm.entryWeight;
      if (updateForm.exitWeight !== original.exitWeight) payload.exitWeight = updateForm.exitWeight;
      if (updateForm.moisture !== original.moisture && original.entryType === 'purchase')
        payload.moisture = updateForm.moisture;
      if (updateForm.dust !== original.dust && original.entryType === 'purchase')
        payload.dust = updateForm.dust;
      if (
        typeof (updateForm as { reviewNotes?: string }).reviewNotes === 'string' &&
        (updateForm as { reviewNotes?: string }).reviewNotes !== original.reviewNotes
      ) {
        payload.reviewNotes = (updateForm as { reviewNotes?: string }).reviewNotes as string;
      }
      if (
        (updateForm as { varianceFlag?: boolean }).varianceFlag === false &&
        original.varianceFlag === true
      )
        payload.varianceFlag = false;
      await updateEntry(updateModal.entry._id, payload);
      toastSuccess('Entry updated');
      setUpdateModal({ open: false });
      void fetchEntries();
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as Error).message
          : 'Failed to update entry';
      toastError(message);
    } finally {
      setUpdateSaving(false);
    }
  };

  const columns: Column<Entry>[] = useMemo(
    () => [
      { key: 'entryType', header: 'Type' },
      {
        key: 'vendor',
        header: 'Vendor',
        render: (r) => (typeof r.vendor === 'string' ? r.vendor : (r.vendor?.name ?? '')),
      },
      {
        key: 'vehicle',
        header: 'Vehicle',
        render: (r) =>
          typeof r.vehicle === 'string' ? r.vehicle : (r.vehicle?.vehicleNumber ?? ''),
      },
      {
        key: 'expectedWeight',
        header: 'Expected Wt',
      },
      {
        key: 'exactWeight',
        header: 'Exact Wt',
      },
      { key: 'entryNumber', header: 'Entry No' },
      {
        key: 'entryDate',
        header: 'Date',
        render: (r) => formatDateTime(r.entryDate),
      },
      { key: 'entryWeight', header: 'Entry Wt' },
      { key: 'exitWeight', header: 'Exit Wt' },
      {
        key: 'varianceFlag',
        header: 'Variance',
        render: (r) => (
          <Badge variant={r.varianceFlag ? 'danger' : 'success'}>
            {r.varianceFlag ? 'Raised' : 'OK'}
          </Badge>
        ),
      },
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => onFlag(r)}
              loading={flaggingId === r._id}
              disabled={flaggingId === r._id}
            >
              {r.flagged ? 'Unflag' : 'Flag'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenUpdate(r)}
              disabled={!r.varianceFlag || r.isReviewed}
            >
              Update
            </Button>
            {!r.isReviewed && (
              <Button
                size="sm"
                onClick={() => onReview(r._id)}
                loading={reviewingId === r._id}
                disabled={reviewingId === r._id || Boolean(r.flagged) || Boolean(r.varianceFlag)}
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
      {/* Flag modal */}
      <Modal
        open={flagModal.open}
        onClose={() => setFlagModal({ open: false, reason: '' })}
        title={flagModal.entry?.flagged ? 'Unflag Entry' : 'Flag Entry'}
      >
        <div className="space-y-3">
          <FormField label="Reason (optional)">
            <Input
              placeholder="Reason"
              value={flagModal.reason}
              onChange={(e) =>
                setFlagModal((s) => ({ ...s, reason: (e.target as HTMLInputElement).value }))
              }
            />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFlagModal({ open: false, reason: '' })}>
              Cancel
            </Button>
            <Button
              onClick={submitFlag}
              loading={flaggingId === flagModal.entry?._id}
              disabled={flaggingId === flagModal.entry?._id}
            >
              {flagModal.entry?.flagged ? 'Unflag' : 'Flag'}
            </Button>
          </div>
        </div>
      </Modal>
      {/* Update modal */}
      <Modal
        open={updateModal.open}
        onClose={() => setUpdateModal({ open: false })}
        title="Update Entry"
      >
        <div className="space-y-3">
          <FormField label="Review Notes">
            <Input
              placeholder="Reason/comments"
              value={updateForm.reviewNotes ?? ''}
              onChange={(e) =>
                setUpdateForm((f) => ({ ...f, reviewNotes: (e.target as HTMLInputElement).value }))
              }
            />
          </FormField>
          {/* Optional fields to adjust (supervisor responsibility) */}
          <div className="grid sm:grid-cols-2 gap-3">
            <FormField label="Entry Weight">
              <Input
                type="number"
                value={updateForm.entryWeight ?? ''}
                onChange={(e) =>
                  setUpdateForm((f) => ({
                    ...f,
                    entryWeight: Number((e.target as HTMLInputElement).value) || undefined,
                  }))
                }
              />
            </FormField>
            <FormField label="Exit Weight">
              <Input
                type="number"
                value={updateForm.exitWeight ?? ''}
                onChange={(e) =>
                  setUpdateForm((f) => ({
                    ...f,
                    exitWeight: Number((e.target as HTMLInputElement).value) || undefined,
                  }))
                }
              />
            </FormField>
            <FormField label="Moisture (%)">
              <Input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={updateForm.moisture ?? ''}
                onChange={(e) =>
                  setUpdateForm((f) => ({
                    ...f,
                    moisture: Number((e.target as HTMLInputElement).value) || undefined,
                  }))
                }
              />
            </FormField>
            <FormField label="Dust (%)">
              <Input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={updateForm.dust ?? ''}
                onChange={(e) =>
                  setUpdateForm((f) => ({
                    ...f,
                    dust: Number((e.target as HTMLInputElement).value) || undefined,
                  }))
                }
              />
            </FormField>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUpdateModal({ open: false })}>
              Cancel
            </Button>
            <Button onClick={onSubmitUpdate} loading={updateSaving} disabled={updateSaving}>
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SupervisorEntries;
