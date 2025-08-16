import { useEffect, useMemo, useState } from 'react';
import {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  type Material,
} from '@/api/materials';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import DataTable, { type Column } from '@/components/common/DataTable';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import { ConfirmDialog } from '@/components/common/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import { toastError, toastSuccess } from '@/utils/toast';
import { required, type FieldErrors } from '@/utils/validators';

const emptyForm: Partial<Material> = {
  name: '',
  description: '',
  isActive: true,
};

const MaterialsPage = () => {
  const [list, setList] = useState<Material[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState<Partial<Material>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [errors, setErrors] = useState<FieldErrors<Partial<Material>>>({});
  const [saving, setSaving] = useState(false);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const all = await getMaterials({
        q: query || undefined,
        isActive: activeOnly ? true : undefined,
      });
      setTotal(all.length);
      const start = (page - 1) * pageSize;
      setList(all.slice(start, start + pageSize));
    } catch {
      toastError('Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page]);

  const columns: Column<Material>[] = useMemo(
    () => [
      { key: 'name', header: 'Name' },
      { key: 'description', header: 'Description' },
      { key: 'isActive', header: 'Active', render: (r) => (r.isActive ? 'Yes' : 'No') },
      {
        key: 'actions',
        header: 'Actions',
        render: (r) => (
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onEdit(r)}>
              Edit
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => onDelete(r._id)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const onEdit = (material: Material) => {
    setEditingId(material._id);
    setForm({ ...material });
  };

  const onDelete = (id: string) => setConfirm({ open: true, id });
  const onConfirmDelete = async () => {
    try {
      if (confirm.id) {
        await deleteMaterial(confirm.id);
        toastSuccess('Material deleted');
        void fetchMaterials();
      }
    } catch {
      toastError('Failed to delete material');
    } finally {
      setConfirm({ open: false });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: FieldErrors<Partial<Material>> = {};
    const nameErr = required(form.name);
    if (nameErr) nextErrors.name = nameErr;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      setSaving(true);
      if (editingId) {
        await updateMaterial(editingId, form);
        toastSuccess('Material updated');
      } else {
        await createMaterial(form);
        toastSuccess('Material created');
      }
      setForm(emptyForm);
      setEditingId(null);
      void fetchMaterials();
    } catch {
      toastError('Failed to save material');
    } finally {
      setSaving(false);
    }
  };

  const onResetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Materials"
        actions={
          <div className="flex items-center gap-2">
            <SearchBar value={query} onChange={setQuery} placeholder="Search materials (q)" />
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={activeOnly}
                onChange={(e) => setActiveOnly((e.target as HTMLInputElement).checked)}
              />
              Active only
            </label>
          </div>
        }
      />
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          {loading && list.length === 0 ? (
            <Skeleton className="h-48" />
          ) : (
            <>
              <DataTable<Material> columns={columns} data={list} keyField="_id" />
              <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
            </>
          )}
        </Card>
        <form onSubmit={onSubmit} className="card p-4 space-y-3">
          <h2 className="font-medium">{editingId ? 'Edit Material' : 'Create Material'}</h2>
          <FormField label="Name" required htmlFor="mat-name" error={errors.name}>
            <Input
              id="mat-name"
              placeholder="Name"
              value={form.name ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: (e.target as HTMLInputElement).value }))
              }
              required
            />
          </FormField>
          <FormField label="Description">
            <Input
              placeholder="Description"
              value={form.description ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: (e.target as HTMLInputElement).value }))
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
      </div>
      <ConfirmDialog
        open={confirm.open}
        title="Delete Material"
        message="This action cannot be undone. Do you want to proceed?"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
};

export default MaterialsPage;
