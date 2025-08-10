import { useEffect, useMemo, useState } from 'react';
import {
  createVehicle,
  deleteVehicle,
  getVehicles,
  type Vehicle,
  updateVehicle,
} from '@/api/vehicles';
import Spinner from '@/components/common/Spinner';
import DataTable, { type Column } from '@/components/common/DataTable';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import { ConfirmDialog } from '@/components/common/Modal';
import { toastError, toastSuccess } from '@/utils/toast';
import { useScopedParams } from '@/hooks/useScopedApi';
import { required, type FieldErrors } from '@/utils/validators';

const emptyForm: Partial<Vehicle> = {
  vehicleNumber: '',
  vehicleType: 'buy',
  capacity: undefined,
  driverName: '',
  driverPhone: '',
  tareWeight: undefined,
  isActive: true,
};

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState<Partial<Vehicle>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [, /* errors */ setErrors] = useState<FieldErrors<Partial<Vehicle>>>({});
  const { withScope } = useScopedParams();

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const all = await getVehicles(withScope({}));
      const filtered = query
        ? all.filter((v) => v.vehicleNumber.toLowerCase().includes(query.toLowerCase()))
        : all;
      setTotal(filtered.length);
      const start = (page - 1) * pageSize;
      setVehicles(filtered.slice(start, start + pageSize));
    } catch {
      toastError('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page]);

  const columns: Column<Vehicle>[] = useMemo(
    () => [
      { key: 'vehicleNumber', header: 'Vehicle No.' },
      { key: 'vehicleType', header: 'Type' },
      { key: 'capacity', header: 'Capacity' },
      { key: 'driverName', header: 'Driver' },
      { key: 'driverPhone', header: 'Phone' },
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

  const onEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle._id);
    setForm({ ...vehicle });
  };

  const onDelete = (id: string) => setConfirm({ open: true, id });
  const onConfirmDelete = async () => {
    try {
      if (confirm.id) {
        await deleteVehicle(confirm.id);
        toastSuccess('Vehicle deleted');
        void fetchVehicles();
      }
    } catch {
      toastError('Failed to delete vehicle');
    } finally {
      setConfirm({ open: false });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: FieldErrors<Partial<Vehicle>> = {};
    const vnoErr = required(form.vehicleNumber);
    if (vnoErr) nextErrors.vehicleNumber = vnoErr;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      if (editingId) {
        await updateVehicle(editingId, form);
        toastSuccess('Vehicle updated');
      } else {
        await createVehicle(form);
        toastSuccess('Vehicle created');
      }
      setForm(emptyForm);
      setEditingId(null);
      void fetchVehicles();
    } catch {
      toastError('Failed to save vehicle');
    }
  };

  const onResetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Vehicles</h1>
        <SearchBar value={query} onChange={setQuery} placeholder="Search by vehicle number" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <DataTable<Vehicle> columns={columns} data={vehicles} keyField="_id" />
          <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
          {loading && <Spinner />}
        </div>
        <form onSubmit={onSubmit} className="bg-white border rounded p-4 space-y-3">
          <h2 className="font-medium">{editingId ? 'Edit Vehicle' : 'Create Vehicle'}</h2>
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Vehicle Number"
            value={form.vehicleNumber ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, vehicleNumber: (e.target as HTMLInputElement).value }))
            }
            required
          />
          <select
            className="border rounded px-3 py-2 w-full"
            value={form.vehicleType ?? 'buy'}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                vehicleType: (e.target as HTMLSelectElement).value as 'buy' | 'sell',
              }))
            }
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
          <input
            type="number"
            className="border rounded px-3 py-2 w-full"
            placeholder="Capacity"
            value={form.capacity ?? ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                capacity: Number((e.target as HTMLInputElement).value) || undefined,
              }))
            }
          />
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Driver Name"
            value={form.driverName ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, driverName: (e.target as HTMLInputElement).value }))
            }
          />
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Driver Phone"
            value={form.driverPhone ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, driverPhone: (e.target as HTMLInputElement).value }))
            }
          />
          <input
            type="number"
            className="border rounded px-3 py-2 w-full"
            placeholder="Tare Weight"
            value={form.tareWeight ?? ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                tareWeight: Number((e.target as HTMLInputElement).value) || undefined,
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
      <ConfirmDialog
        open={confirm.open}
        title="Delete Vehicle"
        message="This action cannot be undone. Do you want to proceed?"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
};

export default VehiclesPage;
