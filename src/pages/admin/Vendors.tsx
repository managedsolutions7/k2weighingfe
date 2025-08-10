import { useEffect, useMemo, useState } from 'react';
import { createVendor, deleteVendor, getVendors, type Vendor, updateVendor } from '@/api/vendors';
import Spinner from '@/components/common/Spinner';
import DataTable, { type Column } from '@/components/common/DataTable';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import { ConfirmDialog } from '@/components/common/Modal';
import { toastError, toastSuccess } from '@/utils/toast';
import { useScopedParams } from '@/hooks/useScopedApi';
import { required, isEmail, type FieldErrors } from '@/utils/validators';

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
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState<Partial<Vendor>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [, /* errors */ setErrors] = useState<FieldErrors<Partial<Vendor>>>({});
  const { withScope } = useScopedParams();

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const all = await getVendors(withScope({}));
      const filtered = query
        ? all.filter(
            (v) =>
              v.name.toLowerCase().includes(query.toLowerCase()) ||
              v.code?.toLowerCase().includes(query.toLowerCase()),
          )
        : all;
      setTotal(filtered.length);
      const start = (page - 1) * pageSize;
      setVendors(filtered.slice(start, start + pageSize));
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
    if (form.email) {
      const emailErr = isEmail(form.email);
      if (emailErr) nextErrors.email = emailErr;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
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
    }
  };

  const onResetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Vendors</h1>
        <SearchBar value={query} onChange={setQuery} placeholder="Search by name/code" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <DataTable<Vendor> columns={columns} data={vendors} keyField="_id" />
          <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
          {loading && <Spinner />}
        </div>
        <form
          onSubmit={onSubmit}
          className="bg-white border rounded p-4 space-y-3"
          aria-label="Vendor form"
        >
          <h2 className="font-medium">{editingId ? 'Edit Vendor' : 'Create Vendor'}</h2>
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Name"
            value={form.name ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, name: (e.target as HTMLInputElement).value }))}
            required
          />
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Code"
            value={form.code ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, code: (e.target as HTMLInputElement).value }))}
          />
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Phone"
            value={form.phone ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, phone: (e.target as HTMLInputElement).value }))
            }
          />
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Email"
            value={form.email ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: (e.target as HTMLInputElement).value }))
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
          {/* Placeholder for dynamic plants multi-select */}
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
        title="Delete Vendor"
        message="This action cannot be undone. Do you want to proceed?"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
};

export default VendorsPage;
