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
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { Edit2, Trash2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import FormField from '@/components/ui/FormField';
import Pagination from '@/components/common/Pagination';
import { ConfirmDialog, Modal } from '@/components/common/Modal';
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
  const [saving, setSaving] = useState(false);
  const [pendingQuery, setPendingQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const list = await getVehicles(withScope({ q: query || undefined }));
      setTotal(list.length);
      const start = (page - 1) * pageSize;
      setVehicles(list.slice(start, start + pageSize));
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
      {
        key: 'isActive',
        header: 'Active',
        render: (r) => (
          <Badge variant={r.isActive ? 'success' : 'danger'}>
            {r.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (r) => (
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onEdit(r)}>
              <Edit2 className="w-4 h-4" /> Edit
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => onDelete(r._id)}>
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const onEdit = (vehicle: Vehicle) => {
    setModalOpen(true);
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
      setSaving(true);
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
    } finally {
      setSaving(false);
      setModalOpen(false);
    }
  };

  const onResetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicles"
        actions={
          <div className="flex flex-wrap gap-2 items-center">
            <SearchBar
              value={pendingQuery}
              onChange={setPendingQuery}
              placeholder="Search by vehicle no/code (VEH-*)"
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
        }
      />
      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setModalOpen(true);
          }}
        >
          Create Vehicle
        </Button>
      </div>
      <div className="grid md:grid-cols-1 gap-6">
        <Card>
          {loading && vehicles.length === 0 ? (
            <Skeleton className="h-48" />
          ) : (
            <>
              <DataTable<Vehicle> columns={columns} data={vehicles} keyField="_id" />
              <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
            </>
          )}
          {loading && vehicles.length > 0 && <Spinner />}
        </Card>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Edit Vendor' : 'Create Vendor'}
        >
          <form onSubmit={onSubmit} className="card p-4 space-y-3">
            <h2 className="font-medium">{editingId ? 'Edit Vehicle' : 'Create Vehicle'}</h2>
            <FormField label="Vehicle Number" required>
              <Input
                placeholder="Vehicle Number"
                value={form.vehicleNumber ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, vehicleNumber: (e.target as HTMLInputElement).value }))
                }
                required
              />
            </FormField>
            <FormField label="Type">
              <Select
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
              </Select>
            </FormField>
            <FormField label="Capacity">
              <Input
                type="number"
                placeholder="Capacity"
                value={form.capacity ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    capacity: Number((e.target as HTMLInputElement).value) || undefined,
                  }))
                }
              />
            </FormField>
            <FormField label="Driver Name">
              <Input
                placeholder="Driver Name"
                value={form.driverName ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, driverName: (e.target as HTMLInputElement).value }))
                }
              />
            </FormField>
            <FormField label="Driver Phone">
              <Input
                placeholder="Driver Phone"
                value={form.driverPhone ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, driverPhone: (e.target as HTMLInputElement).value }))
                }
              />
            </FormField>
            <FormField label="Tare Weight">
              <Input
                type="number"
                placeholder="Tare Weight"
                value={form.tareWeight ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tareWeight: Number((e.target as HTMLInputElement).value) || undefined,
                  }))
                }
              />
            </FormField>
            <FormField label="Active">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.isActive ?? true}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: (e.target as HTMLInputElement).checked }))
                  }
                />
                Active
              </label>
            </FormField>
            <div className="flex gap-2">
              <Button type="submit" loading={saving} disabled={saving}>
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={onResetForm}>
                Reset
              </Button>
            </div>
          </form>
        </Modal>
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
