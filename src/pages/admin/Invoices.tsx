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
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { usePlantsOptions, useVendorsOptions } from '@/hooks/useOptions';
import { getMaterials } from '@/api/materials';
import { getEntryById, type Entry } from '@/api/entries';
// import { getMaterials } from '@/api/materials';
import AsyncSelect from '@/components/common/AsyncSelect';
import type { Option } from '@/hooks/useOptions';
import FiltersBar from '@/components/common/FiltersBar';
import Pagination from '@/components/common/Pagination';
import { toastError, toastSuccess } from '@/utils/toast';
import { Download, Edit2, Trash2 } from 'lucide-react';

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
  const [materialRates, setMaterialRates] = useState<Record<string, number>>({});
  const [materialNames, setMaterialNames] = useState<Record<string, string>>({});
  // const [selectedEntries, setSelectedEntries] = useState<Entry[]>([]);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState<{
    vendor?: string;
    plant?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }>({});
  const { options: plantOptions } = usePlantsOptions();
  const plantIdValue =
    typeof form.plant === 'string' ? form.plant : (form.plant?._id as string | undefined);
  const { options: vendorOptions } = useVendorsOptions({ plantId: plantIdValue });
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
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge
          variant={r.status === 'paid' ? 'success' : r.status === 'draft' ? 'warning' : 'default'}
        >
          {r.status ?? ''}
        </Badge>
      ),
    },
    { key: 'invoiceDate', header: 'Invoice Date' },
    { key: 'dueDate', header: 'Due Date' },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => onEdit(r)}>
            <Edit2 className="w-4 h-4" /> Edit
          </Button>
          <Button type="button" variant="outline" onClick={() => onDelete(r._id)}>
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
          <Button type="button" variant="outline" onClick={() => onDownload(r._id)}>
            <Download className="w-4 h-4" /> Download
          </Button>
        </div>
      ),
    },
  ];

  const onEdit = (invoice: Invoice) => {
    // Normalize nested objects to string IDs for form controls
    setEditingId(invoice._id);
    setForm({
      ...invoice,
      vendor: typeof invoice.vendor === 'string' ? invoice.vendor : (invoice.vendor?._id ?? ''),
      plant: typeof invoice.plant === 'string' ? invoice.plant : (invoice.plant?._id ?? ''),
      entries: (invoice.entries ?? []).map((e) => (typeof e === 'string' ? e : e._id)),
    });
  };

  // Derive material ids from entries text and fetch names
  // Derive materials from selected entries and prefill names/rates
  useEffect(() => {
    const loadMaterialsFromEntries = async () => {
      try {
        const ids = (form.entries ?? []).filter(Boolean) as string[];
        if (ids.length === 0) {
          setMaterialRates({});
          return;
        }
        const details = await Promise.allSettled(ids.map((id) => getEntryById(id)));
        const entries: Entry[] = details
          .filter((r): r is PromiseFulfilledResult<Entry> => r.status === 'fulfilled')
          .map((r) => r.value);
        // selected entries not used currently
        // Collect material ids from entries (purchase only)
        const matIds = new Set<string>();
        const names: Record<string, string> = {};
        for (const e of entries) {
          if (e.entryType === 'purchase' && e.materialType) {
            if (typeof e.materialType === 'string') {
              matIds.add(e.materialType);
            } else if (e.materialType?._id) {
              matIds.add(e.materialType._id);
              names[e.materialType._id] = e.materialType.name;
            }
          }
        }
        if (matIds.size > 0) {
          try {
            const mats = await getMaterials({ isActive: true });
            for (const m of mats) {
              if (matIds.has(m._id)) names[m._id] = m.name;
            }
          } catch {
            // ignore mapping fetch errors
          }
          // Initialize rates if missing
          setMaterialRates((prev) => {
            const next = { ...prev } as Record<string, number>;
            for (const id of matIds) if (next[id] == null) next[id] = 0;
            return next;
          });
          setMaterialNames(names);
        } else {
          setMaterialRates({});
          setMaterialNames({});
        }
      } catch {
        // ignore
      }
    };
    void loadMaterialsFromEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(form.entries ?? [])]);

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
      setSaving(true);
      const payload: Record<string, unknown> = {
        vendor: typeof form.vendor === 'string' ? form.vendor : form.vendor?._id,
        plant: typeof form.plant === 'string' ? form.plant : form.plant?._id,
        entries: (form.entries ?? []).map((e) => e as string),
        materialRates,
        invoiceDate: form.invoiceDate,
        dueDate: form.dueDate,
      };
      if (editingId) {
        await updateInvoice(editingId, payload);
        toastSuccess('Invoice updated');
      } else {
        await createInvoice(payload);
        toastSuccess('Invoice created');
      }
      setForm(emptyForm);
      setEditingId(null);
      void fetchInvoices();
    } catch {
      toastError('Failed to save invoice');
    } finally {
      setSaving(false);
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
        <PageHeader title="Invoices" />

        <FiltersBar onReset={onResetFilters}>
          <FormField label="Vendor ID">
            <Input
              placeholder="Vendor ID"
              value={filters.vendor ?? ''}
              onChange={(e) =>
                setFilters((f) => ({ ...f, vendor: (e.target as HTMLInputElement).value }))
              }
            />
          </FormField>
          <FormField label="Plant ID">
            <Input
              placeholder="Plant ID"
              value={filters.plant ?? ''}
              onChange={(e) =>
                setFilters((f) => ({ ...f, plant: (e.target as HTMLInputElement).value }))
              }
            />
          </FormField>
          <FormField label="Status">
            <Select
              value={filters.status ?? ''}
              onChange={(e) =>
                setFilters((f) => ({ ...f, status: (e.target as HTMLSelectElement).value }))
              }
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
            </Select>
          </FormField>
          <FormField label="Start Date">
            <Input
              type="date"
              value={filters.startDate ?? ''}
              onChange={(e) =>
                setFilters((f) => ({ ...f, startDate: (e.target as HTMLInputElement).value }))
              }
            />
          </FormField>
          <FormField label="End Date">
            <Input
              type="date"
              value={filters.endDate ?? ''}
              onChange={(e) =>
                setFilters((f) => ({ ...f, endDate: (e.target as HTMLInputElement).value }))
              }
            />
          </FormField>
        </FiltersBar>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            {loading && invoices.length === 0 ? (
              <Skeleton className="h-48" />
            ) : (
              <>
                <DataTable<Invoice> columns={columns} data={invoices} keyField="_id" />
                <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
              </>
            )}
            {loading && invoices.length > 0 && <Spinner />}
          </Card>
          <form onSubmit={onSubmit} className="card p-4 space-y-3">
            <h2 className="font-medium">{editingId ? 'Edit Invoice' : 'Create Invoice'}</h2>
            <AsyncSelect
              value={plantIdValue ?? ''}
              onChange={(v) => setForm((f) => ({ ...f, plant: v }))}
              loadOptions={loadPlantOptions}
              placeholder="Search plant…"
              ariaLabel="Plant"
            />
            {(() => {
              const vendorIdValue =
                typeof form.vendor === 'string'
                  ? form.vendor
                  : ((form.vendor?._id as string | undefined) ?? '');
              return (
                <AsyncSelect
                  value={vendorIdValue}
                  onChange={(v) => setForm((f) => ({ ...f, vendor: v }))}
                  loadOptions={loadVendorOptions}
                  placeholder="Search vendor…"
                  ariaLabel="Vendor"
                />
              );
            })()}
            <FormField label="Entry IDs (comma-separated)">
              <Input
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
            </FormField>
            <FormField label="Invoice Date">
              <Input
                type="datetime-local"
                value={form.invoiceDate ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, invoiceDate: (e.target as HTMLInputElement).value }))
                }
              />
            </FormField>
            <Card>
              <h3 className="font-medium mb-2">Material Rates</h3>
              <div className="space-y-2 text-sm">
                {Object.keys(materialRates).length === 0 && (
                  <div className="text-xs text-gray-500">Add rates after selecting entries.</div>
                )}
                {Object.entries(materialRates).map(([matId, rate]) => (
                  <div key={matId} className="flex items-center gap-2">
                    <div className="w-40">{materialNames[matId] ?? matId}</div>
                    <Input
                      type="number"
                      value={rate}
                      onChange={(e) =>
                        setMaterialRates((prev) => ({
                          ...prev,
                          [matId]: Number((e.target as HTMLInputElement).value) || 0,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </Card>
            <FormField label="Due Date">
              <Input
                type="datetime-local"
                value={form.dueDate ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: (e.target as HTMLInputElement).value }))
                }
              />
            </FormField>
            <FormField label="Status">
              <Select
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
              </Select>
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
