import { useEffect, useState } from 'react';
import {
  createEntry,
  deleteEntry,
  getEntries,
  type Entry,
  updateEntry,
  updateEntryExit,
} from '@/api/entries';
import Spinner from '@/components/common/Spinner';
import { ConfirmDialog } from '@/components/common/Modal';
import DataTable, { type Column } from '@/components/common/DataTable';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import { toastError, toastSuccess } from '@/utils/toast';
import { usePlantsOptions, useVendorsOptions, useVehiclesOptions } from '@/hooks/useOptions';
import AsyncSelect from '@/components/common/AsyncSelect';
import type { Option } from '@/hooks/useOptions';
import { useScopedParams } from '@/hooks/useScopedApi';
import { required, type FieldErrors } from '@/utils/validators';

const emptyForm: Partial<Entry> = {
  entryType: 'sale',
  vendor: '',
  vehicle: '',
  plant: '',
  entryWeight: undefined,
  rate: undefined,
  isActive: true,
};

const EntriesPage = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState<Partial<Entry>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [, /* errors */ setErrors] = useState<FieldErrors<Partial<Entry>>>({});
  const { withScope } = useScopedParams();
  const { options: plantOptions } = usePlantsOptions();
  const { options: vendorOptions } = useVendorsOptions({});
  const { options: vehicleOptions } = useVehiclesOptions();

  const loadVendorOptions = async (q: string): Promise<Option[]> => {
    const filtered = vendorOptions.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
    return Promise.resolve(filtered);
  };
  const loadVehicleOptions = async (q: string): Promise<Option[]> => {
    const filtered = vehicleOptions.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
    return Promise.resolve(filtered);
  };
  const loadPlantOptions = async (q: string): Promise<Option[]> => {
    const filtered = plantOptions.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
    return Promise.resolve(filtered);
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const all = await getEntries(withScope({}));
      const filtered = query
        ? all.filter((e) => e.entryType.toLowerCase().includes(query.toLowerCase()))
        : all;
      setTotal(filtered.length);
      const start = (page - 1) * pageSize;
      setEntries(filtered.slice(start, start + pageSize));
    } catch {
      toastError('Failed to fetch entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page]);

  // Handlers below are referenced in columns; ensure stable deps or list them

  const onEdit = (entry: Entry) => {
    setEditingId(entry._id);
    setForm({ ...entry });
  };

  const onDelete = (id: string) => setConfirm({ open: true, id });
  const onConfirmDelete = async () => {
    try {
      if (confirm.id) {
        await deleteEntry(confirm.id);
        toastSuccess('Entry deleted');
        void fetchEntries();
      }
    } catch {
      toastError('Failed to delete entry');
    } finally {
      setConfirm({ open: false });
    }
  };

  const onExit = async (id: string) => {
    const value = prompt('Enter exit weight');
    const weight = value ? Number(value) : undefined;
    if (!weight) return;
    try {
      await updateEntryExit(id, weight);
      toastSuccess('Exit updated');
      void fetchEntries();
    } catch {
      toastError('Failed to update exit');
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: FieldErrors<Partial<Entry>> = {};
    if (required(form.entryType)) nextErrors.entryType = 'Type is required';
    if (required(form.vendor)) nextErrors.vendor = 'Vendor is required';
    if (required(form.vehicle)) nextErrors.vehicle = 'Vehicle is required';
    if (required(form.plant)) nextErrors.plant = 'Plant is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      if (editingId) {
        await updateEntry(editingId, form);
        toastSuccess('Entry updated');
      } else {
        await createEntry(form);
        toastSuccess('Entry created');
      }
      setForm(emptyForm);
      setEditingId(null);
      void fetchEntries();
    } catch {
      toastError('Failed to save entry');
    }
  };

  const onResetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const columns: Column<Entry>[] = [
    { key: 'entryType', header: 'Type' },
    { key: 'vendor', header: 'Vendor' },
    { key: 'vehicle', header: 'Vehicle' },
    { key: 'plant', header: 'Plant' },
    { key: 'entryWeight', header: 'Entry Wt' },
    { key: 'exitWeight', header: 'Exit Wt' },
    { key: 'rate', header: 'Rate' },
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
          <button className="px-2 py-1 border rounded" onClick={() => onExit(r._id)}>
            Exit
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">Entries</h1>
          <SearchBar value={query} onChange={setQuery} placeholder="Search by type" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <DataTable<Entry> columns={columns} data={entries} keyField="_id" />
            <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
            {loading && <Spinner />}
          </div>
          <form onSubmit={onSubmit} className="bg-white border rounded p-4 space-y-3">
            <h2 className="font-medium">{editingId ? 'Edit Entry' : 'Create Entry'}</h2>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.entryType ?? 'sale'}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  entryType: (e.target as HTMLSelectElement).value as 'sale' | 'purchase',
                }))
              }
            >
              <option value="sale">Sale</option>
              <option value="purchase">Purchase</option>
            </select>
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
            <AsyncSelect
              value={form.vehicle ?? ''}
              onChange={(v) => setForm((f) => ({ ...f, vehicle: v }))}
              loadOptions={loadVehicleOptions}
              placeholder="Search vehicle…"
              ariaLabel="Vehicle"
            />
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              placeholder="Entry Weight"
              value={form.entryWeight ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  entryWeight: Number((e.target as HTMLInputElement).value) || undefined,
                }))
              }
            />
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              placeholder="Rate"
              value={form.rate ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  rate: Number((e.target as HTMLInputElement).value) || undefined,
                }))
              }
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: (e.target as HTMLInputElement).checked }))
                }
              />
              Active
            </label>
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
        title="Delete Entry"
        message="This action cannot be undone. Do you want to proceed?"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};

export default EntriesPage;
