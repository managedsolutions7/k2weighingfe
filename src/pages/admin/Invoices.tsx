import { useEffect, useState } from 'react';
import {
  createInvoice,
  getInvoices,
  type Invoice,
  updateInvoice,
  getAvailableEntries,
  generateInvoiceFromRange,
  getInvoicePdf,
} from '@/api/invoices';
import Spinner from '@/components/common/Spinner';
import DataTable, { type Column } from '@/components/common/DataTable';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

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
import { Download, Edit2 } from 'lucide-react';
// Modal removed in favor of inline builder layout

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
  const [invoiceType, setInvoiceType] = useState<'purchase' | 'sale'>('purchase');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [paletteRates, setPaletteRates] = useState<{ loose: number; packed: number }>({
    loose: 0,
    packed: 0,
  });
  const [materialsList, setMaterialsList] = useState<Array<{ _id: string; name: string }>>([]);
  // GST state
  const [gstApplicable, setGstApplicable] = useState<boolean>(false);
  const [gstType, setGstType] = useState<'IGST' | 'CGST_SGST' | null>(null);
  const [gstRate, setGstRate] = useState<number | null>(null);

  const [available, setAvailable] = useState<{
    entries: Array<{
      _id: string;
      entryNumber: string;
      entryDate: string;
      vehicle?: { vehicleNumber?: string; driverName?: string } | string;
      exactWeight?: number;
      finalWeight?: number;
      materialType?: { _id?: string; name: string } | null;
      palletteType?: 'loose' | 'packed' | undefined;
    }>;
    total: number;
    loading: boolean;
  }>({ entries: [], total: 0, loading: false });
  // const [selectedEntries, setSelectedEntries] = useState<Entry[]>([]);

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
  // Inline builder replaces modal
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

  const fetchAvailable = async () => {
    try {
      const plantId =
        typeof form.plant === 'string' ? form.plant : (form.plant?._id as string | undefined);
      const vendorId =
        typeof form.vendor === 'string' ? form.vendor : (form.vendor?._id as string | undefined);
      if (!vendorId || !plantId || !rangeStart || !rangeEnd) {
        setAvailable((s) => ({ ...s, entries: [], total: 0 }));
        return;
      }
      setAvailable((s) => ({ ...s, loading: true }));
      const res = await getAvailableEntries({
        vendor: vendorId,
        plant: plantId,
        invoiceType,
        startDate: rangeStart,
        endDate: rangeEnd,
        page: 1,
        limit: 50,
      });
      const entries = res.entries ?? [];
      setAvailable({ entries, total: res.total ?? 0, loading: false });
      // derive material names from available entries for purchase flow
      if (invoiceType === 'purchase') {
        const names: Record<string, string> = {};
        for (const e of entries) {
          const materialType = e.materialType as { _id: string; name: string } | string | undefined;
          const id = typeof materialType === 'string' ? materialType : materialType?._id;
          const nm = typeof materialType === 'string' ? undefined : materialType?.name;
          if (id && nm) names[id] = nm;
        }
        if (Object.keys(names).length) {
          setMaterialNames(names);
          setMaterialRates((prev) => {
            const next = { ...prev };
            for (const id of Object.keys(names)) if (next[id] == null) next[id] = 0;
            return next;
          });
        }
        // Also ensure rates exist for any material ids even without names
        setMaterialRates((prev) => {
          const next = { ...prev } as Record<string, number>;
          for (const e of entries) {
            const materialType = e.materialType as
              | { _id: string; name: string }
              | string
              | undefined;
            const id = typeof materialType === 'string' ? materialType : materialType?._id;
            if (id && next[id] == null) next[id] = 0;
          }
          return next;
        });
      }
    } catch {
      setAvailable((s) => ({ ...s, loading: false }));
      toastError('Failed to load available entries');
    }
  };

  useEffect(() => {
    void fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  // Load all active materials once for manual rate entry
  useEffect(() => {
    const loadAllMaterials = async () => {
      try {
        const mats = await getMaterials({ isActive: true });
        setMaterialsList(mats.map((m) => ({ _id: m._id, name: m.name })));
        // Populate names if missing
        setMaterialNames((prev) => {
          const next = { ...prev } as Record<string, string>;
          for (const m of mats) if (!next[m._id]) next[m._id] = m.name;
          return next;
        });
      } catch {
        // ignore load errors
      }
    };
    if (invoiceType === 'purchase') void loadAllMaterials();
  }, [invoiceType]);

  useEffect(() => {
    void fetchAvailable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.vendor, form.plant, rangeStart, rangeEnd, invoiceType]);

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice Number',
      render: (r) => r.invoiceNumber || '-',
    },
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
      key: 'invoiceType',
      header: 'Invoice Type',
      render: (r) => {
        return (r as { invoiceType?: 'purchase' | 'sale' }).invoiceType ?? 'purchase';
      },
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      render: (r) => (r.totalAmount ? `₹${r.totalAmount.toLocaleString()}` : '-'),
    },
    {
      key: 'invoiceDate',
      header: 'Invoice Date',
      render: (r) => (r.invoiceDate ? new Date(r.invoiceDate).toLocaleDateString('en-GB') : '-'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => onEdit(r)}>
            <Edit2 className="w-4 h-4" /> Edit
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

    // Set form data immediately
    setForm({
      ...invoice,
      vendor: typeof invoice.vendor === 'string' ? invoice.vendor : (invoice.vendor?._id ?? ''),
      plant: typeof invoice.plant === 'string' ? invoice.plant : (invoice.plant?._id ?? ''),
      entries: (invoice.entries ?? []).map((e) => (typeof e === 'string' ? e : e._id)),
    });

    // Load GST state from invoice
    setGstApplicable(Boolean((invoice as { gstApplicable?: boolean }).gstApplicable));
    setGstType((invoice as { gstType?: 'IGST' | 'CGST_SGST' | null }).gstType ?? null);
    setGstRate(
      (invoice as { gstRate?: number | null }).gstRate != null
        ? ((invoice as { gstRate?: number | null }).gstRate as number)
        : null,
    );

    // Reset range dates for editing (these are only used for creating new invoices from date ranges)
    setRangeStart('');
    setRangeEnd('');

    // Reset material rates and palette rates for editing
    setMaterialRates({});
    setPaletteRates({ loose: 0, packed: 0 });

    // Determine invoice type asynchronously
    if (invoice.entries && invoice.entries.length > 0) {
      const firstEntryId =
        typeof invoice.entries[0] === 'string' ? invoice.entries[0] : invoice.entries[0]._id;

      getEntryById(firstEntryId)
        .then((firstEntry) => {
          setInvoiceType(firstEntry.entryType);
        })
        .catch((error) => {
          console.warn('Could not determine invoice type from entries:', error);
          // Default to purchase if we can't determine
          setInvoiceType('purchase');
        });
    } else {
      setInvoiceType('purchase');
    }
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

  const onDownload = async (id: string) => {
    try {
      const { url } = await getInvoicePdf(id);

      if (!url) {
        toastError('Download URL missing');
        return;
      }

      // Just open the signed S3 URL – no CORS issues
      window.open(url, '_blank');
    } catch {
      toastError('Failed to download invoice');
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const isRangeFlow = Boolean(rangeStart && rangeEnd && form.vendor && form.plant);
      if (isRangeFlow) {
        const rangePayload = {
          vendor: typeof form.vendor === 'string' ? form.vendor : (form.vendor?._id as string),
          plant: typeof form.plant === 'string' ? form.plant : (form.plant?._id as string),
          invoiceType,
          startDate: rangeStart,
          endDate: rangeEnd,
          materialRates:
            invoiceType === 'purchase' && Object.keys(materialRates).length
              ? materialRates
              : undefined,
          paletteRates: invoiceType === 'sale' ? paletteRates : undefined,
          invoiceDate: undefined,
          dueDate: undefined,
          gstApplicable: gstApplicable || false,
          gstType: gstApplicable ? (gstType ?? 'CGST_SGST') : null,
          gstRate: gstApplicable ? (gstRate ?? null) : null,
        };
        await generateInvoiceFromRange(rangePayload);
        toastSuccess('Invoice generated');
      } else {
        const payload = {
          vendor: (typeof form.vendor === 'string' ? form.vendor : form.vendor?._id) as string,
          plant: (typeof form.plant === 'string' ? form.plant : form.plant?._id) as string,
          entries: (form.entries ?? []).map((e) => e as string),
          materialRates,
          invoiceDate: form.invoiceDate,
          dueDate: form.dueDate,
          invoiceType,
          gstApplicable: gstApplicable || false,
          gstType: gstApplicable ? (gstType ?? 'CGST_SGST') : null,
          gstRate: gstApplicable ? (gstRate ?? null) : null,
        };
        if (editingId) {
          await updateInvoice(editingId, payload);
          toastSuccess('Invoice updated');
        } else {
          await createInvoice(payload);
          toastSuccess('Invoice created');
        }
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
    setInvoiceType('purchase');
    setRangeStart('');
    setRangeEnd('');
    setMaterialRates({});
    setPaletteRates({ loose: 0, packed: 0 });
    setGstApplicable(false);
    setGstType(null);
    setGstRate(null);
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
          <FormField label="Invoice Type">
            <Select
              value={invoiceType}
              onChange={(e) =>
                setInvoiceType((e.target as HTMLSelectElement).value as 'purchase' | 'sale')
              }
            >
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
            </Select>
          </FormField>
        </FiltersBar>
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-base">
                  {editingId ? 'Edit Invoice' : 'Create Invoice'}
                </h2>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onResetForm}>
                    Reset
                  </Button>
                  <Button type="button" variant="primary" onClick={() => onResetForm()}>
                    New
                  </Button>
                </div>
              </div>
              <form onSubmit={onSubmit} className="p-0 space-y-3 mt-3">
                <h2 className="font-medium">{editingId ? 'Edit Invoice' : 'Create Invoice'}</h2>
                <FormField label="Plant">
                  <AsyncSelect
                    value={plantIdValue ?? ''}
                    onChange={(v) => setForm((f) => ({ ...f, plant: v }))}
                    loadOptions={loadPlantOptions}
                    placeholder="Search plant…"
                    ariaLabel="Plant"
                  />
                </FormField>
                {(() => {
                  const vendorIdValue =
                    typeof form.vendor === 'string'
                      ? form.vendor
                      : ((form.vendor?._id as string | undefined) ?? '');
                  return (
                    <FormField label="Vendor">
                      <AsyncSelect
                        value={vendorIdValue}
                        onChange={(v) => setForm((f) => ({ ...f, vendor: v }))}
                        loadOptions={loadVendorOptions}
                        placeholder="Search vendor…"
                        ariaLabel="Vendor"
                      />
                    </FormField>
                  );
                })()}
                <FormField label="Invoice Type">
                  <Select
                    value={invoiceType}
                    onChange={(e) =>
                      setInvoiceType((e.target as HTMLSelectElement).value as 'purchase' | 'sale')
                    }
                  >
                    <option value="purchase">Purchase</option>
                    <option value="sale">Sale</option>
                  </Select>
                </FormField>
                <div className="grid sm:grid-cols-2 gap-3">
                  {editingId ? (
                    // Show invoice date for editing
                    <FormField label="Invoice Date">
                      <Input
                        type="date"
                        value={
                          form.invoiceDate
                            ? new Date(form.invoiceDate).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) => setForm((f) => ({ ...f, invoiceDate: e.target.value }))}
                      />
                    </FormField>
                  ) : (
                    // Show date range for creating new invoices
                    <>
                      <FormField label="Start Date">
                        <Input
                          type="date"
                          value={rangeStart}
                          onChange={(e) => setRangeStart((e.target as HTMLInputElement).value)}
                        />
                      </FormField>
                      <FormField label="End Date">
                        <Input
                          type="date"
                          value={rangeEnd}
                          onChange={(e) => setRangeEnd((e.target as HTMLInputElement).value)}
                        />
                      </FormField>
                    </>
                  )}
                </div>
                {/* GST Section */}
                <Card>
                  <h3 className="font-medium mb-2">GST</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={gstApplicable}
                        onChange={(e) => setGstApplicable((e.target as HTMLInputElement).checked)}
                      />
                      GST Applicable?
                    </label>
                    {gstApplicable && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1">
                          <FormField label="GST Type">
                            <Select
                              value={gstType ?? 'CGST_SGST'}
                              onChange={(e) =>
                                setGstType(
                                  ((e.target as HTMLSelectElement).value as 'IGST' | 'CGST_SGST') ??
                                    null,
                                )
                              }
                            >
                              <option value="CGST_SGST">CGST + SGST</option>
                              <option value="IGST">IGST</option>
                            </Select>
                          </FormField>
                        </div>
                        <div className="grid md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-4">
                          <FormField label="GST Rate">
                            <Select
                              value={gstRate != null ? String(gstRate) : ''}
                              onChange={(e) =>
                                setGstRate(Number((e.target as HTMLSelectElement).value) || null)
                              }
                            >
                              <option value="">Select rate…</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </Select>
                          </FormField>
                          <FormField label="Custom Rate (%)">
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              value={gstRate ?? ''}
                              onChange={(e) =>
                                setGstRate(Number((e.target as HTMLInputElement).value) || null)
                              }
                              placeholder="e.g. 18"
                            />
                          </FormField>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
                {/* Invoice Date removed */}
                {invoiceType === 'purchase' && (
                  <Card>
                    <h3 className="font-medium mb-2">Material Rates</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-end gap-2">
                        <FormField label="Add material">
                          <Select
                            value=""
                            onChange={(e) => {
                              const id = (e.target as HTMLSelectElement).value;
                              if (!id) return;
                              setMaterialRates((prev) => ({ ...prev, [id]: prev[id] ?? 0 }));
                              setMaterialNames((prev) => ({
                                ...prev,
                                [id]: materialsList.find((m) => m._id === id)?.name ?? id,
                              }));
                            }}
                          >
                            <option value="">Select material…</option>
                            {materialsList
                              .filter((m) => materialRates[m._id] == null)
                              .map((m) => (
                                <option key={m._id} value={m._id}>
                                  {m.name}
                                </option>
                              ))}
                          </Select>
                        </FormField>
                      </div>
                      {Object.keys(materialRates).length === 0 && (
                        <div className="text-xs text-gray-500">Add materials to specify rates.</div>
                      )}
                      {Object.entries(materialRates).map(([matId, rate]) => (
                        <div key={matId} className="flex items-center gap-2">
                          <div className="w-40 truncate" title={materialNames[matId] ?? matId}>
                            {materialNames[matId] ?? matId}
                          </div>
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
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setMaterialRates((prev) => {
                                const next = { ...prev } as Record<string, number>;
                                delete next[matId];
                                return next;
                              })
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                {invoiceType === 'sale' && (
                  <Card>
                    <h3 className="font-medium mb-2">Palette Rates</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <FormField label="Loose (₹/kg)">
                        <Input
                          type="number"
                          value={paletteRates.loose}
                          onChange={(e) =>
                            setPaletteRates((p) => ({
                              ...p,
                              loose: Number((e.target as HTMLInputElement).value) || 0,
                            }))
                          }
                        />
                      </FormField>
                      <FormField label="Packed (₹/kg)">
                        <Input
                          type="number"
                          value={paletteRates.packed}
                          onChange={(e) =>
                            setPaletteRates((p) => ({
                              ...p,
                              packed: Number((e.target as HTMLInputElement).value) || 0,
                            }))
                          }
                        />
                      </FormField>
                    </div>
                  </Card>
                )}
                {/* Due Date and Status removed */}
                <div className="flex gap-2">
                  <Button type="submit" loading={saving} disabled={saving}>
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="outline" onClick={onResetForm}>
                    Reset
                  </Button>
                </div>
              </form>
            </Card>
          </div>
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Invoices</h3>
                <Button type="button" variant="primary" onClick={onResetForm}>
                  New Invoice
                </Button>
              </div>
              {loading && invoices.length === 0 ? (
                <Skeleton className="h-48" />
              ) : (
                <>
                  <DataTable<Invoice> columns={columns} data={invoices} keyField="_id" />
                  <Pagination
                    page={page}
                    total={total}
                    pageSize={pageSize}
                    onPageChange={setPage}
                  />
                </>
              )}
              {loading && invoices.length > 0 && <Spinner />}
            </Card>
          </div>
          <div className="col-span-full space-y-6">
            <Card>
              <h3 className="font-medium mb-2">Available Entries ({available.total})</h3>
              {available.loading ? (
                <Skeleton className="h-48" />
              ) : (
                <div className="overflow-x-auto border rounded">
                  <table className="min-w-[700px] w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Entry #</th>
                        <th className="px-3 py-2 font-semibold">Date</th>
                        <th className="px-3 py-2 font-semibold">Vehicle</th>
                        <th className="px-3 py-2 font-semibold">Driver</th>
                        <th className="px-3 py-2 font-semibold">Weight (kg)</th>
                        <th className="px-3 py-2 font-semibold">Material</th>
                        <th className="px-3 py-2 font-semibold">Palette</th>
                      </tr>
                    </thead>
                    <tbody>
                      {available.entries.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                            No entries
                          </td>
                        </tr>
                      ) : (
                        available.entries.map((e) => (
                          <tr key={e._id}>
                            <td className="px-3 py-2">{e.entryNumber}</td>
                            <td className="px-3 py-2">
                              {new Date(e.entryDate).toLocaleDateString('en-GB')}
                            </td>
                            <td className="px-3 py-2">
                              {typeof e.vehicle === 'string'
                                ? e.vehicle
                                : (e.vehicle?.vehicleNumber ?? '')}
                            </td>
                            <td className="px-3 py-2">
                              {typeof e.vehicle === 'string' ? '' : (e.vehicle?.driverName ?? '')}
                            </td>
                            <td className="px-3 py-2">
                              {(e.finalWeight ?? e.exactWeight ?? 0).toFixed(2)}
                            </td>
                            <td className="px-3 py-2">{e.materialType?.name ?? '—'}</td>
                            <td className="px-3 py-2">{e.palletteType ?? '—'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoicesPage;
