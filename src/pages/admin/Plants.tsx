import { useEffect, useMemo, useState } from 'react';
import { createPlant, deletePlant, getPlants, type Plant, updatePlant } from '@/api/plants';
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
import Checkbox from '@/components/ui/Checkbox';
import FormField from '@/components/ui/FormField';
import Pagination from '@/components/common/Pagination';
import { toastError, toastSuccess } from '@/utils/toast';
import { ConfirmDialog, Modal } from '@/components/common/Modal';
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
  const [errors, setErrors] = useState<FieldErrors<Partial<Plant>>>({});
  const { withScope } = useScopedParams();
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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

  const onEdit = (plant: Plant) => {
    setModalOpen(true);
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
      setSaving(true);
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
        title="Plants"
        actions={<SearchBar value={query} onChange={setQuery} placeholder="Search by name/code" />}
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
          Create Plant
        </Button>
      </div>
      <div className="grid md:grid-cols-1 gap-6">
        <Card>
          {loading && plants.length === 0 ? (
            <Skeleton className="h-48" />
          ) : (
            <>
              <DataTable<Plant> columns={columns} data={plants} keyField="_id" />
              <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
            </>
          )}
          {loading && plants.length > 0 && <Spinner />}
        </Card>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Edit Plant' : 'Create Plant'}
        >
          <form onSubmit={onSubmit} className="card p-4 space-y-3">
            <h2 className="font-medium">{editingId ? 'Edit Plant' : 'Create Plant'}</h2>
            <FormField
              label="Name"
              required
              htmlFor="plant-name"
              hint="Human-readable name"
              error={errors.name}
            >
              <Input
                id="plant-name"
                placeholder="Name"
                value={form.name ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: (e.target as HTMLInputElement).value }))
                }
                required
                describedById={errors.name ? 'plant-name-error' : 'plant-name-hint'}
                invalid={Boolean(errors.name)}
              />
            </FormField>
            {/* Inline errors example */}
            {/* {errors.name && <div className="text-xs text-red-600">{errors.name}</div>} */}
            <FormField
              label="Code"
              required
              htmlFor="plant-code"
              hint="Short code (e.g., BLR)"
              error={errors.code}
            >
              <Input
                id="plant-code"
                placeholder="Code"
                value={form.code ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: (e.target as HTMLInputElement).value }))
                }
                required
                describedById={errors.code ? 'plant-code-error' : 'plant-code-hint'}
                invalid={Boolean(errors.code)}
              />
            </FormField>
            <FormField label="Location" htmlFor="plant-location">
              <Input
                id="plant-location"
                placeholder="Location"
                value={form.location ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: (e.target as HTMLInputElement).value }))
                }
              />
            </FormField>
            <FormField label="Address" htmlFor="plant-address">
              <Input
                id="plant-address"
                placeholder="Address"
                value={form.address ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: (e.target as HTMLInputElement).value }))
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
        title="Delete Plant"
        message="This action cannot be undone. Do you want to proceed?"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
};

export default PlantsPage;
