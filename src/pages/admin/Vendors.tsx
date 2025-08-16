import { useEffect, useMemo, useState } from 'react';
import { createVendor, deleteVendor, getVendors, type Vendor, updateVendor } from '@/api/vendors';
import Spinner from '@/components/common/Spinner';
import DataTable, { type Column } from '@/components/common/DataTable';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import { ConfirmDialog } from '@/components/common/Modal';
import { toastError, toastSuccess } from '@/utils/toast';
import { useScopedParams } from '@/hooks/useScopedApi';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { Edit2, Trash2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import FormField from '@/components/ui/FormField';
import { required, isEmail, isGST, type FieldErrors } from '@/utils/validators';
import { usePlantsOptions } from '@/hooks/useOptions';

const emptyForm: Partial<Vendor> = {
  name: '',
  code: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  gstNumber: '',
  linkedPlants: [],
  isActive: true,
};

const VendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState<Partial<Vendor>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [errors, setErrors] = useState<FieldErrors<Partial<Vendor>>>({});
  const { withScope } = useScopedParams();
  const { options: plantOptions, loading: plantsLoading } = usePlantsOptions();

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const list = await getVendors(withScope({ q: query || undefined }));
      setTotal(list.length);
      const start = (page - 1) * pageSize;
      setVendors(list.slice(start, start + pageSize));
    } catch {
      toastError('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page]);

  const columns: Column<Vendor>[] = useMemo(
    () => [
      { key: 'name', header: 'Name' },
      { key: 'code', header: 'Code' },
      { key: 'phone', header: 'Phone' },
      { key: 'email', header: 'Email' },
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

  const onEdit = (vendor: Vendor) => {
    setEditingId(vendor._id);
    setForm({ ...vendor });
  };

  const onDelete = (id: string) => setConfirm({ open: true, id });
  const onConfirmDelete = async () => {
    try {
      if (confirm.id) {
        await deleteVendor(confirm.id);
        toastSuccess('Vendor deleted');
        void fetchVendors();
      }
    } catch {
      toastError('Failed to delete vendor');
    } finally {
      setConfirm({ open: false });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    const nextErrors: FieldErrors<Partial<Vendor>> = {};
    const nameErr = required(form.name);
    if (nameErr) nextErrors.name = nameErr;
    const contactErr = required(form.contactPerson);
    if (contactErr) nextErrors.contactPerson = contactErr;
    if (form.email) {
      const emailErr = isEmail(form.email);
      if (emailErr) nextErrors.email = emailErr;
    }
    if (form.gstNumber) {
      const gstErr = isGST(form.gstNumber);
      if (gstErr) nextErrors.gstNumber = gstErr;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      setSaving(true);
      if (editingId) {
        await updateVendor(editingId, form);
        toastSuccess('Vendor updated');
      } else {
        await createVendor(form);
        toastSuccess('Vendor created');
      }
      setForm(emptyForm);
      setEditingId(null);
      void fetchVendors();
    } catch {
      toastError('Failed to save vendor');
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
        title="Vendors"
        actions={
          <SearchBar value={query} onChange={setQuery} placeholder="Search by name/code/VEN-*" />
        }
      />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          {loading && vendors.length === 0 ? (
            <Skeleton className="h-48" />
          ) : (
            <>
              <DataTable<Vendor> columns={columns} data={vendors} keyField="_id" />
              <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
            </>
          )}
          {loading && vendors.length > 0 && <Spinner />}
        </div>
        <form onSubmit={onSubmit} className="card p-4 space-y-3" aria-label="Vendor form">
          <h2 className="font-medium">{editingId ? 'Edit Vendor' : 'Create Vendor'}</h2>
          <FormField label="Name" required htmlFor="vendor-name" error={errors.name}>
            <Input
              id="vendor-name"
              placeholder="Name"
              value={form.name ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: (e.target as HTMLInputElement).value }))
              }
              required
              describedById={errors.name ? 'vendor-name-error' : undefined}
              invalid={Boolean(errors.name)}
            />
          </FormField>
          <FormField label="Code">
            <Input
              placeholder="Code"
              value={form.code ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, code: (e.target as HTMLInputElement).value }))
              }
            />
          </FormField>
          <FormField label="Phone">
            <Input
              placeholder="Phone"
              value={form.phone ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: (e.target as HTMLInputElement).value }))
              }
            />
          </FormField>
          <FormField label="Email" htmlFor="vendor-email" error={errors.email}>
            <Input
              id="vendor-email"
              placeholder="Email"
              value={form.email ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: (e.target as HTMLInputElement).value }))
              }
              describedById={errors.email ? 'vendor-email-error' : undefined}
              invalid={Boolean(errors.email)}
            />
          </FormField>
          <FormField
            label="Contact Person"
            required
            htmlFor="vendor-contact"
            error={errors.contactPerson}
          >
            <Input
              id="vendor-contact"
              placeholder="Contact Person"
              value={form.contactPerson ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, contactPerson: (e.target as HTMLInputElement).value }))
              }
              required
              describedById={errors.contactPerson ? 'vendor-contact-error' : undefined}
              invalid={Boolean(errors.contactPerson)}
            />
          </FormField>
          <FormField label="GST Number" htmlFor="vendor-gst" error={errors.gstNumber}>
            <Input
              id="vendor-gst"
              placeholder="GSTIN (e.g., 27ABCDE1234F1Z5)"
              value={form.gstNumber ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  gstNumber: (e.target as HTMLInputElement).value.toUpperCase(),
                }))
              }
              describedById={errors.gstNumber ? 'vendor-gst-error' : undefined}
              invalid={Boolean(errors.gstNumber)}
            />
          </FormField>
          <FormField label="Address">
            <Input
              placeholder="Address"
              value={form.address ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: (e.target as HTMLInputElement).value }))
              }
            />
          </FormField>
          <FormField label="Linked Plants" hint="Associate this vendor with one or more plants">
            {plantsLoading ? (
              <Skeleton className="h-10" />
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                {plantOptions.map((opt) => {
                  const checked = (form.linkedPlants ?? []).includes(opt.value);
                  return (
                    <label key={opt.value} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={checked}
                        onChange={(e) =>
                          setForm((f) => {
                            const next = new Set(f.linkedPlants ?? []);
                            if ((e.target as HTMLInputElement).checked) next.add(opt.value);
                            else next.delete(opt.value);
                            return { ...f, linkedPlants: Array.from(next) };
                          })
                        }
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            )}
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
        title="Delete Vendor"
        message="This action cannot be undone. Do you want to proceed?"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
};

export default VendorsPage;
