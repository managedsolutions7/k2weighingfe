import { useEffect, useState } from 'react';
import {
  createInvoice,
  deleteInvoice,
  downloadInvoice,
  getInvoices,
  type Invoice,
  updateInvoice,
} from '@/api/invoices';
import Spinner from '@/components/common/Spinner';
import { ConfirmDialog } from '@/components/common/Modal';
import DataTable, { type Column } from '@/components/common/DataTable';
import { usePlantsOptions, useVendorsOptions } from '@/hooks/useOptions';
import AsyncSelect from '@/components/common/AsyncSelect';
import type { Option } from '@/hooks/useOptions';
import FiltersBar from '@/components/common/FiltersBar';
import Pagination from '@/components/common/Pagination';
import { toastError, toastSuccess } from '@/utils/toast';

const emptyForm: Partial<Invoice> = {
  vendor: '',
  plant: '',
  entries: [],
  invoiceDate: '',
  dueDate: '',
  status: 'draft',
  isActive: true,
};

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState<Partial<Invoice>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [filters, setFilters] = useState<{
    vendor?: string;
    plant?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }>({});
  const { options: plantOptions } = usePlantsOptions();
  const { options: vendorOptions } = useVendorsOptions({ plantId: form.plant });
  const loadPlantOptions = async (q: string): Promise<Option[]> => {
    return plantOptions.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
  };
  const loadVendorOptions = async (q: string): Promise<Option[]> => {
    return vendorOptions.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { items, total } = await getInvoices(filters);
      setTotal(total);
      const start = (page - 1) * pageSize;
      setInvoices(items.slice(start, start + pageSize));
    } catch {
      toastError('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  const columns: Column<Invoice>[] = [
    {
      key: 'vendor',
      header: 'Vendor',
      render: (r) => (typeof r.vendor === 'string' ? r.vendor : (r.vendor?.name ?? '')),
    },
    {
      key: 'plant',
      header: 'Plant',
      render: (r) => (typeof r.plant === 'string' ? r.plant : (r.plant?.name ?? '')),
    },
    { key: 'status', header: 'Status' },
    { key: 'invoiceDate', header: 'Invoice Date' },
    { key: 'dueDate', header: 'Due Date' },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          <button className="px-2 py-1 border rounded" onClick={() => onEdit(r)}>
            Edit
          </button>
          <button className="px-2 py-1 border rounded" onClick={() => onDelete(r._id)}>
            Delete
          </button>
          <button className="px-2 py-1 border rounded" onClick={() => onDownload(r._id)}>
            Download
          </button>
        </div>
      ),
    },
  ];

  const onEdit = (invoice: Invoice) => {
    setEditingId(invoice._id);
    setForm({ ...invoice });
  };

  const onDelete = (id: string) => setConfirm({ open: true, id });
  const onConfirmDelete = async () => {
    try {
      if (confirm.id) {
        await deleteInvoice(confirm.id);
        toastSuccess('Invoice deleted');
        void fetchInvoices();
      }
    } catch {
      toastError('Failed to delete invoice');
    } finally {
      setConfirm({ open: false });
    }
  };

  const onDownload = async (id: string) => {
    try {
      const blob = await downloadInvoice(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toastError('Failed to download invoice');
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateInvoice(editingId, form);
        toastSuccess('Invoice updated');
      } else {
        await createInvoice(form);
        toastSuccess('Invoice created');
      }
      setForm(emptyForm);
      setEditingId(null);
      void fetchInvoices();
    } catch {
      toastError('Failed to save invoice');
    }
  };

  const onResetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onResetFilters = () => setFilters({});

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Invoices</h1>
        </div>

        <FiltersBar onReset={onResetFilters}>
          <input
            className="border rounded px-3 py-2"
            placeholder="Vendor ID"
            value={filters.vendor ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, vendor: (e.target as HTMLInputElement).value }))
            }
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Plant ID"
            value={filters.plant ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, plant: (e.target as HTMLInputElement).value }))
            }
          />
          <select
            className="border rounded px-3 py-2"
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: (e.target as HTMLSelectElement).value }))
            }
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
          </select>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={filters.startDate ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, startDate: (e.target as HTMLInputElement).value }))
            }
          />
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={filters.endDate ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, endDate: (e.target as HTMLInputElement).value }))
            }
          />
        </FiltersBar>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <DataTable<Invoice> columns={columns} data={invoices} keyField="_id" />
            <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
            {loading && <Spinner />}
          </div>
          <form onSubmit={onSubmit} className="bg-white border rounded p-4 space-y-3">
            <h2 className="font-medium">{editingId ? 'Edit Invoice' : 'Create Invoice'}</h2>
            <AsyncSelect
              value={form.plant ?? ''}
              onChange={(v) => setForm((f) => ({ ...f, plant: v }))}
              loadOptions={loadPlantOptions}
              placeholder="Search plant…"
              ariaLabel="Plant"
            />
            <AsyncSelect
              value={form.vendor ?? ''}
              onChange={(v) => setForm((f) => ({ ...f, vendor: v }))}
              loadOptions={loadVendorOptions}
              placeholder="Search vendor…"
              ariaLabel="Vendor"
            />
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="Entry IDs (comma-separated)"
              value={(form.entries ?? []).join(',')}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  entries: (e.target as HTMLInputElement).value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
            />
            <input
              type="datetime-local"
              className="border rounded px-3 py-2 w-full"
              value={form.invoiceDate ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, invoiceDate: (e.target as HTMLInputElement).value }))
              }
            />
            <input
              type="datetime-local"
              className="border rounded px-3 py-2 w-full"
              value={form.dueDate ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, dueDate: (e.target as HTMLInputElement).value }))
              }
            />
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.status ?? 'draft'}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: (e.target as HTMLSelectElement).value as 'draft' | 'sent' | 'paid',
                }))
              }
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
            </select>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button className="px-4 py-2 border rounded" type="button" onClick={onResetForm}>
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
      <ConfirmDialog
        open={confirm.open}
        title="Delete Invoice"
        message="This action cannot be undone. Do you want to proceed?"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};

export default InvoicesPage;
