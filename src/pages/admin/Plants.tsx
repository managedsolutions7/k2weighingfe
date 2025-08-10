import { useEffect, useMemo, useState } from 'react';
import { createPlant, deletePlant, getPlants, type Plant, updatePlant } from '@/api/plants';
import Spinner from '@/components/common/Spinner';
import DataTable, { type Column } from '@/components/common/DataTable';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import { toastError, toastSuccess } from '@/utils/toast';
import { ConfirmDialog } from '@/components/common/Modal';
import { useScopedParams } from '@/hooks/useScopedApi';
import { required, type FieldErrors } from '@/utils/validators';

const emptyForm: Partial<Plant> = { name: '', code: '', location: '', address: '', isActive: true };

const PlantsPage = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState<Partial<Plant>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [, /* errors */ setErrors] = useState<FieldErrors<Partial<Plant>>>({});
  const { withScope } = useScopedParams();

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const all = await getPlants(withScope({}));
      const filtered = query
        ? all.filter(
            (p) =>
              p.name.toLowerCase().includes(query.toLowerCase()) ||
              p.code?.toLowerCase().includes(query.toLowerCase()),
          )
        : all;
      setTotal(filtered.length);
      const start = (page - 1) * pageSize;
      setPlants(filtered.slice(start, start + pageSize));
    } catch {
      toastError('Failed to fetch plants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPlants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page]);

  const columns: Column<Plant>[] = useMemo(
    () => [
      { key: 'name', header: 'Name' },
      { key: 'code', header: 'Code' },
      { key: 'location', header: 'Location' },
      { key: 'address', header: 'Address' },
      { key: 'isActive', header: 'Active', render: (r) => (r.isActive ? 'Yes' : 'No') },
      {
        key: 'actions',
        header: 'Actions',
        render: (r) => (
          <div className="flex gap-2">
            <button className="px-2 py-1 border rounded" onClick={() => onEdit(r)}>
              Edit
            </button>
            <button className="px-2 py-1 border rounded" onClick={() => onDelete(r._id)}>
              Delete
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const onEdit = (plant: Plant) => {
    setEditingId(plant._id);
    setForm({ ...plant });
  };

  const onDelete = (id: string) => setConfirm({ open: true, id });
  const onConfirmDelete = async () => {
    try {
      if (confirm.id) {
        await deletePlant(confirm.id);
        toastSuccess('Plant deleted');
        void fetchPlants();
      }
    } catch {
      toastError('Failed to delete plant');
    } finally {
      setConfirm({ open: false });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: FieldErrors<Partial<Plant>> = {};
    const nameErr = required(form.name);
    const codeErr = required(form.code);
    if (nameErr) nextErrors.name = nameErr;
    if (codeErr) nextErrors.code = codeErr;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      if (editingId) {
        await updatePlant(editingId, form);
        toastSuccess('Plant updated');
      } else {
        await createPlant(form);
        toastSuccess('Plant created');
      }
      setForm(emptyForm);
      setEditingId(null);
      void fetchPlants();
    } catch {
      toastError('Failed to save plant');
    }
  };

  const onResetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Plants</h1>
        <SearchBar value={query} onChange={setQuery} placeholder="Search by name/code" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <DataTable<Plant> columns={columns} data={plants} keyField="_id" />
          <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
          {loading && <Spinner />}
        </div>
        <form onSubmit={onSubmit} className="bg-white border rounded p-4 space-y-3">
          <h2 className="font-medium">{editingId ? 'Edit Plant' : 'Create Plant'}</h2>
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Name"
            value={form.name ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, name: (e.target as HTMLInputElement).value }))}
            required
          />
          {/* Inline errors example */}
          {/* {errors.name && <div className="text-xs text-red-600">{errors.name}</div>} */}
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Code"
            value={form.code ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, code: (e.target as HTMLInputElement).value }))}
            required
          />
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Location"
            value={form.location ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, location: (e.target as HTMLInputElement).value }))
            }
          />
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Address"
            value={form.address ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: (e.target as HTMLInputElement).value }))
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
      <ConfirmDialog
        open={confirm.open}
        title="Delete Plant"
        message="This action cannot be undone. Do you want to proceed?"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
};

export default PlantsPage;
