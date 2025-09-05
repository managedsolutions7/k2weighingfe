import { useEffect, useState } from 'react';
import { getEntries, type Entry, reviewEntry, flagEntry } from '@/api/entries';
import Spinner from '@/components/common/Spinner';
import { Modal } from '@/components/common/Modal';
import DataTable, { type Column } from '@/components/common/DataTable';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import FormField from '@/components/ui/FormField';
import { toastError, toastSuccess } from '@/utils/toast';
import { useVendorsOptions, useVehiclesOptions, useMaterialsOptions } from '@/hooks/useOptions';
import { useScopedParams } from '@/hooks/useScopedApi';
import { useAppSelector } from '@/store';
import { formatDateTime } from '@/utils/date';
import { Eye, Flag, CheckCircle, Download } from 'lucide-react';

const AdminEntries = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [query, setQuery] = useState('');
  const [pendingQuery, setPendingQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [flagModal, setFlagModal] = useState<{ open: boolean; entry?: Entry; reason: string }>({
    open: false,
    reason: '',
  });
  const [filters, setFilters] = useState({
    entryType: '',
    reviewStatus: '',
    varianceFlag: '',
    dateFrom: '',
    dateTo: '',
  });

  const { withScope } = useScopedParams();
  const user = useAppSelector((s) => s.auth.user);
  const { options: vendorOptions } = useVendorsOptions({});
  const { options: vehicleOptions } = useVehiclesOptions();
  const { options: materialOptions } = useMaterialsOptions();

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params = withScope({
        q: query || undefined,
        page,
        limit: pageSize,
        entryType: filters.entryType || undefined,
        isReviewed:
          filters.reviewStatus === 'reviewed'
            ? true
            : filters.reviewStatus === 'pending'
              ? false
              : undefined,
        varianceFlag:
          filters.varianceFlag === 'flagged'
            ? true
            : filters.varianceFlag === 'passed'
              ? false
              : undefined,
        from: filters.dateFrom || undefined,
        to: filters.dateTo || undefined,
      }) as Record<string, unknown>;

      const res = await getEntries(params as never);
      const list = res.entries ?? [];
      setTotal(res.total ?? list.length);
      setEntries(list);
    } catch {
      toastError('Failed to fetch entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page, filters, user?.role]);

  const onViewDetails = (entry: Entry) => {
    setSelectedEntry(entry);
    setDetailModalOpen(true);
  };

  const onReview = async (id: string) => {
    try {
      setReviewingId(id);
      await reviewEntry(id, { isReviewed: true });
      toastSuccess('Entry marked as reviewed');
      void fetchEntries();
    } catch {
      toastError('Failed to mark as reviewed');
    } finally {
      setReviewingId(null);
    }
  };

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

  const onDownloadReceipt = async (entry: Entry) => {
    try {
      const { downloadEntryReceipt } = await import('@/api/entries');
      await downloadEntryReceipt(entry._id);
    } catch {
      toastError('Failed to download receipt');
    }
  };

  const columns: Column<Entry>[] = [
    {
      key: 'entryDate',
      header: 'Entry Date',
      render: (r) => {
        const dt = r.entryDate ? new Date(r.entryDate) : null;
        return dt ? formatDateTime(dt) : '';
      },
    },
    { key: 'entryType', header: 'Type' },
    {
      key: 'vendor',
      header: 'Vendor',
      render: (r) => {
        const value = r.vendor as Entry['vendor'];
        if (!value) return '';
        if (typeof value === 'object') return value.name ?? value._id ?? '';
        return vendorOptions.find((o) => o.value === value)?.label ?? value;
      },
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (r) => {
        const value = r.vehicle as Entry['vehicle'];
        if (!value) return '';
        if (typeof value === 'object') return value.vehicleNumber ?? value._id ?? '';
        return vehicleOptions.find((o) => o.value === value)?.label ?? value;
      },
    },
    { key: 'entryNumber', header: 'Entry No' },
    { key: 'driverName', header: "Driver's Name" },
    { key: 'entryWeight', header: 'Entry Wt' },
    { key: 'exitWeight', header: 'Exit Wt' },
    { key: 'initialEntryWeight', header: 'Initial Entry Wt' },
    { key: 'initialExitWeight', header: 'Initial Exit Wt' },
    {
      key: 'materialType',
      header: 'Material',
      render: (r) => (typeof r.materialType === 'string' ? r.materialType : r.materialType?.name),
    },
    {
      key: 'varianceFlag',
      header: 'Variance',
      render: (r) => (
        <Badge variant={r.varianceFlag ? 'danger' : 'success'}>
          {r.varianceFlag ? 'Failed' : 'Passed'}
        </Badge>
      ),
    },
    {
      key: 'isReviewed',
      header: 'Review Status',
      render: (r) => (
        <Badge variant={r.isReviewed ? 'success' : 'warning'}>
          {r.isReviewed ? 'Reviewed' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'flagged',
      header: 'Flagged',
      render: (r) => (
        <Badge variant={r.flagged ? 'danger' : 'secondary'}>
          {r.flagged ? 'Flagged' : 'Normal'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(r)}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onFlag(r)}
            loading={flaggingId === r._id}
            disabled={flaggingId === r._id}
            title={r.flagged ? 'Unflag Entry' : 'Flag Entry'}
          >
            <Flag className="w-4 h-4" />
          </Button>
          {!r.isReviewed && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onReview(r._id)}
              loading={reviewingId === r._id}
              disabled={reviewingId === r._id || Boolean(r.flagged) || Boolean(r.varianceFlag)}
              title="Mark as Reviewed"
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={Boolean(r.varianceFlag) || !(r.exitWeight && r.exitWeight > 0)}
            onClick={() => onDownloadReceipt(r)}
            title={
              r.varianceFlag
                ? 'Variance failed'
                : !(r.exitWeight && r.exitWeight > 0)
                  ? 'Exit not recorded'
                  : 'Download receipt'
            }
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Entries Management"
          subtitle="View and manage all entries across the system"
        />

        {/* Filters */}
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <FormField label="Entry Type">
                <Select
                  value={filters.entryType}
                  onChange={(e) => setFilters((f) => ({ ...f, entryType: e.target.value }))}
                >
                  <option value="">All Types</option>
                  <option value="sale">Sale</option>
                  <option value="purchase">Purchase</option>
                </Select>
              </FormField>

              <FormField label="Review Status">
                <Select
                  value={filters.reviewStatus}
                  onChange={(e) => setFilters((f) => ({ ...f, reviewStatus: e.target.value }))}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                </Select>
              </FormField>

              <FormField label="Variance Status">
                <Select
                  value={filters.varianceFlag}
                  onChange={(e) => setFilters((f) => ({ ...f, varianceFlag: e.target.value }))}
                >
                  <option value="">All</option>
                  <option value="passed">Passed</option>
                  <option value="flagged">Failed</option>
                </Select>
              </FormField>

              <FormField label="From Date">
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                />
              </FormField>

              <FormField label="To Date">
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
                />
              </FormField>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      entryType: '',
                      reviewStatus: '',
                      varianceFlag: '',
                      dateFrom: '',
                      dateTo: '',
                    })
                  }
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Search */}
        <Card>
          <div className="p-4">
            <div className="flex flex-wrap gap-2 items-center">
              <SearchBar
                value={pendingQuery}
                onChange={setPendingQuery}
                placeholder="Search by entry number (ENT-*)"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setQuery(pendingQuery);
                  setPage(1);
                }}
              >
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPendingQuery('');
                  setQuery('');
                  setPage(1);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </Card>

        {/* Entries Table */}
        <Card>
          {loading && entries.length === 0 ? (
            <Skeleton className="h-48" />
          ) : (
            <>
              <DataTable<Entry> columns={columns} data={entries} keyField="_id" />
              <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
            </>
          )}
          {loading && entries.length > 0 && <Spinner />}
        </Card>
      </div>

      {/* Entry Details Modal */}
      <Modal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Entry Details"
        size="lg"
      >
        {selectedEntry && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Entry Number:</span> {selectedEntry.entryNumber}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {selectedEntry.entryType}
                  </div>
                  <div>
                    <span className="font-medium">Entry Date:</span>{' '}
                    {selectedEntry.entryDate
                      ? formatDateTime(new Date(selectedEntry.entryDate))
                      : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Driver Name:</span>{' '}
                    {selectedEntry.driverName || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Driver Phone:</span>{' '}
                    {selectedEntry.driverPhone || 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Vendor & Vehicle</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Vendor:</span>{' '}
                    {typeof selectedEntry.vendor === 'object'
                      ? selectedEntry.vendor?.name || selectedEntry.vendor?._id
                      : vendorOptions.find((o) => o.value === selectedEntry.vendor)?.label ||
                        selectedEntry.vendor}
                  </div>
                  <div>
                    <span className="font-medium">Vehicle:</span>{' '}
                    {typeof selectedEntry.vehicle === 'object'
                      ? selectedEntry.vehicle?.vehicleNumber || selectedEntry.vehicle?._id
                      : vehicleOptions.find((o) => o.value === selectedEntry.vehicle)?.label ||
                        selectedEntry.vehicle}
                  </div>
                  <div>
                    <span className="font-medium">Vehicle Code:</span>{' '}
                    {selectedEntry.vehicleCode || 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Weights & Measurements</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Entry Weight:</span>{' '}
                    {selectedEntry.entryWeight || 'N/A'} kg
                  </div>
                  <div>
                    <span className="font-medium">Exit Weight:</span>{' '}
                    {selectedEntry.exitWeight || 'N/A'} kg
                  </div>
                  <div>
                    <span className="font-medium">Initial Entry Weight:</span>{' '}
                    {selectedEntry.initialEntryWeight || 'N/A'} kg
                  </div>
                  <div>
                    <span className="font-medium">Initial Exit Weight:</span>{' '}
                    {selectedEntry.initialExitWeight || 'N/A'} kg
                  </div>
                  <div>
                    <span className="font-medium">Expected Weight:</span>{' '}
                    {selectedEntry.expectedWeight || 'N/A'} kg
                  </div>
                  <div>
                    <span className="font-medium">Exact Weight:</span>{' '}
                    {selectedEntry.exactWeight || 'N/A'} kg
                  </div>
                  {selectedEntry.entryType === 'purchase' && (
                    <>
                      <div>
                        <span className="font-medium">Moisture:</span>{' '}
                        {selectedEntry.moisture || 'N/A'}%
                      </div>
                      <div>
                        <span className="font-medium">Dust:</span> {selectedEntry.dust || 'N/A'}%
                      </div>
                      <div>
                        <span className="font-medium">Final Weight:</span>{' '}
                        {selectedEntry.finalWeight || 'N/A'} kg
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Material & Packaging</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Material:</span>{' '}
                    {typeof selectedEntry.materialType === 'object'
                      ? selectedEntry.materialType?.name
                      : materialOptions.find((o) => o.value === selectedEntry.materialType)
                          ?.label ||
                        selectedEntry.materialType ||
                        'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Pallette Type:</span>{' '}
                    {selectedEntry.palletteType || 'N/A'}
                  </div>
                  {selectedEntry.palletteType === 'packed' && (
                    <>
                      <div>
                        <span className="font-medium">Number of Bags:</span>{' '}
                        {selectedEntry.noOfBags || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Weight per Bag:</span>{' '}
                        {selectedEntry.weightPerBag || 'N/A'} kg
                      </div>
                      <div>
                        <span className="font-medium">Packed Weight:</span>{' '}
                        {selectedEntry.packedWeight || 'N/A'} kg
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Status & Flags</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Review Status:</span>{' '}
                    <Badge variant={selectedEntry.isReviewed ? 'success' : 'warning'}>
                      {selectedEntry.isReviewed ? 'Reviewed' : 'Pending'}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Variance Test:</span>{' '}
                    <Badge variant={selectedEntry.varianceFlag ? 'danger' : 'success'}>
                      {selectedEntry.varianceFlag ? 'Failed' : 'Passed'}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Flagged:</span>{' '}
                    <Badge variant={selectedEntry.flagged ? 'danger' : 'secondary'}>
                      {selectedEntry.flagged ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Manual Weight:</span>{' '}
                    {selectedEntry.manualWeight ? 'Yes' : 'No'}
                  </div>
                  {selectedEntry.flagReason && (
                    <div>
                      <span className="font-medium">Flag Reason:</span> {selectedEntry.flagReason}
                    </div>
                  )}
                  {selectedEntry.reviewNotes && (
                    <div>
                      <span className="font-medium">Review Notes:</span> {selectedEntry.reviewNotes}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">System Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Created By:</span>{' '}
                    {typeof selectedEntry.createdBy === 'object'
                      ? selectedEntry.createdBy?.name || selectedEntry.createdBy?.username
                      : selectedEntry.createdBy || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Updated By:</span>{' '}
                    {typeof selectedEntry.updatedBy === 'object'
                      ? selectedEntry.updatedBy?.name || selectedEntry.updatedBy?.username
                      : selectedEntry.updatedBy || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Active:</span>{' '}
                    {selectedEntry.isActive ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Flag Modal */}
      <Modal
        open={flagModal.open}
        onClose={() => setFlagModal({ open: false, reason: '' })}
        title={flagModal.entry?.flagged ? 'Unflag Entry' : 'Flag Entry'}
      >
        <div className="space-y-3">
          <FormField label="Reason (optional)">
            <Input
              placeholder="Reason for flagging"
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
    </>
  );
};

export default AdminEntries;
