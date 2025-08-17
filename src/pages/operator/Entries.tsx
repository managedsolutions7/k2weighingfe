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
import { ConfirmDialog, Modal } from '@/components/common/Modal';
import DataTable, { type Column } from '@/components/common/DataTable';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { LogOut } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import FormField from '@/components/ui/FormField';
import { toastError, toastSuccess } from '@/utils/toast';
import { useVendorsOptions, useVehiclesOptions, useMaterialsOptions } from '@/hooks/useOptions';
import AsyncSelect from '@/components/common/AsyncSelect';
import type { Option } from '@/hooks/useOptions';
import { useScopedParams } from '@/hooks/useScopedApi';
import { useAppSelector } from '@/store';
import { required, type FieldErrors } from '@/utils/validators';
//

const emptyForm: Partial<Entry> = {
  entryType: 'sale',
  vendor: '',
  vehicle: '',
  entryWeight: undefined,
  isActive: true,
};

const EntriesPage = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [query, setQuery] = useState('');
  const [pendingQuery, setPendingQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState<Partial<Entry>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [exitPrompt, setExitPrompt] = useState<{
    open: boolean;
    id?: string;
    value: string; // exitWeight
    entryType?: 'sale' | 'purchase';
    palletteType?: '' | 'loose' | 'packed';
    noOfBags?: string;
    weightPerBag?: string;
    moisture?: string;
    dust?: string;
  }>({ open: false, value: '' });
  const [saving, setSaving] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors<Partial<Entry>>>({});
  const { withScope } = useScopedParams();
  const user = useAppSelector((s) => s.auth.user);
  const { options: vendorOptions } = useVendorsOptions({});
  const { options: vehicleOptions } = useVehiclesOptions();
  const { options: materialOptions } = useMaterialsOptions();

  const loadVendorOptions = async (q: string): Promise<Option[]> => {
    const filtered = vendorOptions.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
    return Promise.resolve(filtered);
  };
  const loadVehicleOptions = async (q: string): Promise<Option[]> => {
    const filtered = vehicleOptions.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
    return Promise.resolve(filtered);
  };
  // Plant is not part of create payload/UI per new spec

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params = withScope({ q: query || undefined, page, limit: pageSize }) as Record<
        string,
        unknown
      >;
      // For operator, default to last 24 hours
      const to = new Date();
      const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
      (params.from as string) = from.toISOString();
      (params.to as string) = to.toISOString();
      const res = await getEntries(params as never);
      const list = res.entries ?? [];
      setTotal(res.total ?? list.length);
      setEntries(list);
    } catch {
      toastError('Failed to fetch entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page, user?.role]);

  // Plant is managed by backend via req.user.plantId

  // Handlers below are referenced in columns; ensure stable deps or list them

  // Operator cannot edit/delete entries per permissions
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

  const onExit = (entry: Entry) => {
    if (entry.exitWeight && entry.exitWeight > 0) {
      toastError('Exit weight already recorded and cannot be updated again');
      return;
    }
    setExitPrompt({
      open: true,
      id: entry._id,
      value: '',
      entryType: entry.entryType,
      palletteType: '',
      noOfBags: '',
      weightPerBag: '',
      moisture: '',
      dust: '',
    });
  };

  const confirmExit = async () => {
    const weight = Number(exitPrompt.value);
    if (!exitPrompt.id || !Number.isFinite(weight) || weight <= 0) {
      toastError('Please enter a valid exit weight');
      return;
    }
    // Additional validations per flow
    const current = entries.find((e) => e._id === exitPrompt.id);
    const entryWeight = current?.entryWeight ?? undefined;
    if (exitPrompt.entryType === 'sale' && typeof entryWeight === 'number' && entryWeight > 0) {
      if (weight < entryWeight) {
        toastError(
          'Invalid weights: for sale, exitWeight must be greater than or equal to entryWeight',
        );
        return;
      }
    }
    if (
      exitPrompt.entryType === 'purchase' &&
      typeof entryWeight === 'number' &&
      entryWeight > 0 &&
      entryWeight < weight
    ) {
      toastError(
        'Invalid weights: for purchase, entryWeight must be greater than or equal to exitWeight',
      );
      return;
    }
    const moisture = exitPrompt.moisture !== '' ? Number(exitPrompt.moisture) : undefined;
    const dust = exitPrompt.dust !== '' ? Number(exitPrompt.dust) : undefined;
    if (typeof moisture === 'number') {
      if (!Number.isFinite(moisture) || moisture < 0 || moisture > 100) {
        toastError('Moisture must be between 0 and 100');
        return;
      }
    }
    if (typeof dust === 'number') {
      if (!Number.isFinite(dust) || dust < 0 || dust > 100) {
        toastError('Dust must be between 0 and 100');
        return;
      }
    }
    try {
      setSaving(true);
      const payload: Record<string, unknown> = { exitWeight: weight };
      if (exitPrompt.entryType === 'sale') {
        if (exitPrompt.palletteType === 'packed') {
          const bags = Number(exitPrompt.noOfBags);
          const wpb = Number(exitPrompt.weightPerBag);
          if (!Number.isFinite(bags) || bags <= 0 || !Number.isFinite(wpb) || wpb <= 0) {
            toastError('Bags and Weight/Bag must be > 0');
            return;
          }
          payload.palletteType = 'packed';
          payload.noOfBags = bags;
          payload.weightPerBag = wpb;
        } else if (exitPrompt.palletteType === 'loose') {
          payload.palletteType = 'loose';
        }
      } else if (exitPrompt.entryType === 'purchase') {
        // Include optional moisture/dust for purchase exits
        if (typeof moisture === 'number') (payload as { moisture?: number }).moisture = moisture;
        if (typeof dust === 'number') (payload as { dust?: number }).dust = dust;
      }
      await updateEntryExit(exitPrompt.id, payload as never);
      toastSuccess('Exit updated');
      setExitPrompt({ open: false, value: '' });
      void fetchEntries();
    } catch (err) {
      // show backend error as-is if message available
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as Error).message
          : 'Failed to update exit';
      toastError(message);
    } finally {
      setSaving(false);
    }
  };

  const onDownloadReceipt = async (entry: Entry) => {
    try {
      // Lazy import to avoid circular imports at top if needed
      const { downloadEntryReceipt } = await import('@/api/entries');
      const blob = await downloadEntryReceipt(entry._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entry.entryNumber ?? entry._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toastError('Failed to download receipt');
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: FieldErrors<Partial<Entry>> = {};
    if (required(form.entryType)) nextErrors.entryType = 'Type is required';
    if (required(form.vendor)) nextErrors.vendor = 'Vendor is required';
    if (required(form.vehicle)) nextErrors.vehicle = 'Vehicle is required';
    if (!form.driverName || String(form.driverName).trim().length === 0)
      nextErrors.driverName = "Driver's name is required";
    // plant is not required/sent
    if (!form.entryWeight || form.entryWeight <= 0)
      nextErrors.entryWeight = 'Entry weight must be > 0';
    // rate is removed from payload per new spec
    // sale-specific pallette details are captured at exit, not at entry
    if (form.entryType === 'purchase') {
      if (required(form.materialType)) nextErrors.materialType = 'Material is required';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      setFormSaving(true);
      const payload: Record<string, unknown> = {
        entryType: form.entryType,
        vendor: form.vendor,
        vehicle: form.vehicle,
        driverName: form.driverName,
        driverPhone: form.driverPhone,
        entryWeight: form.entryWeight,
        entryDate: form.entryDate,
        manualWeight: form.manualWeight,
      };
      // sale pallette details are handled during exit
      if (form.entryType === 'purchase') {
        payload.materialType =
          typeof form.materialType === 'string' ? form.materialType : form.materialType?._id;
      }

      if (editingId) {
        await updateEntry(editingId, payload);
        toastSuccess('Entry updated');
      } else {
        await createEntry(payload);
        toastSuccess('Entry created');
      }
      setForm(emptyForm);
      setEditingId(null);
      void fetchEntries();
    } catch {
      toastError('Failed to save entry');
    } finally {
      setFormSaving(false);
    }
  };

  const onResetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const columns: Column<Entry>[] = [
    { key: 'entryType', header: 'Type' },
    {
      key: 'vendor',
      header: 'Vendor',
      render: (r) => {
        const value = r.vendor as Entry['vendor'];
        if (!value) return '';
        if (typeof value === 'object') return value.name ?? value._id ?? '';
        return vendorOptions.find((o) => o.value === value)?.label ?? value;
      },
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (r) => {
        const value = r.vehicle as Entry['vehicle'];
        if (!value) return '';
        if (typeof value === 'object') return value.vehicleNumber ?? value._id ?? '';
        return vehicleOptions.find((o) => o.value === value)?.label ?? value;
      },
    },
    { key: 'entryNumber', header: 'Entry No' },
    { key: 'driverName', header: "Driver's Name" },
    { key: 'driverPhone', header: "Driver's Phone" },
    { key: 'palletteType', header: 'Pallette' },
    { key: 'noOfBags', header: 'Bags' },
    { key: 'weightPerBag', header: 'Wt/Bag' },
    { key: 'packedWeight', header: 'Packed Wt' },
    {
      key: 'materialType',
      header: 'Material',
      render: (r) => (typeof r.materialType === 'string' ? r.materialType : r.materialType?.name),
    },
    { key: 'entryWeight', header: 'Entry Wt' },
    { key: 'exitWeight', header: 'Exit Wt' },
    {
      key: 'varianceFlag',
      header: 'Variance Test',
      render: (r) => (
        <span
          className={`px-2 py-0.5 text-xs rounded ${r.varianceFlag ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}
        >
          {r.varianceFlag ? 'Fail' : 'Pass'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => {
        const disabled = Boolean(r.exitWeight && r.exitWeight > 0);
        return (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onExit(r)}
              disabled={disabled}
            >
              <LogOut className="w-4 h-4" /> {disabled ? 'Recorded' : 'Exit'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={Boolean(r.varianceFlag) || !(r.exitWeight && r.exitWeight > 0)}
              onClick={() => onDownloadReceipt(r)}
              title={
                r.varianceFlag
                  ? 'Variance failed'
                  : !(r.exitWeight && r.exitWeight > 0)
                    ? 'Exit not recorded'
                    : 'Download receipt'
              }
            >
              PDF
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Entries"
          actions={
            <div className="flex flex-wrap gap-2 items-center">
              <SearchBar
                value={pendingQuery}
                onChange={setPendingQuery}
                placeholder="Search by entry no (ENT-*)"
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
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            {loading && entries.length === 0 ? (
              <Skeleton className="h-48" />
            ) : (
              <>
                <DataTable<Entry> columns={columns} data={entries} keyField="_id" />
                <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
              </>
            )}
            {loading && entries.length > 0 && <Spinner />}
          </Card>
          <form onSubmit={onSubmit} className="card p-4 space-y-3">
            <h2 className="font-medium">{editingId ? 'Edit Entry' : 'Create Entry'}</h2>
            <FormField label="Type">
              <Select
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
              </Select>
            </FormField>
            {/* Plant removed from create payload/UI */}
            <FormField label="Vendor">
              <AsyncSelect
                value={typeof form.vendor === 'string' ? form.vendor : (form.vendor?._id ?? '')}
                onChange={(v) => setForm((f) => ({ ...f, vendor: v }))}
                loadOptions={loadVendorOptions}
                placeholder="Search vendor…"
                ariaLabel="Vendor"
              />
            </FormField>
            <FormField label="Vehicle">
              <AsyncSelect
                value={typeof form.vehicle === 'string' ? form.vehicle : (form.vehicle?._id ?? '')}
                onChange={(v) => setForm((f) => ({ ...f, vehicle: v }))}
                loadOptions={loadVehicleOptions}
                placeholder="Search vehicle…"
                ariaLabel="Vehicle"
              />
            </FormField>
            <FormField
              label="Driver's Name"
              htmlFor="driverName"
              error={errors.driverName as string | undefined}
            >
              <Input
                id="driverName"
                placeholder="Driver's name"
                value={form.driverName ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, driverName: (e.target as HTMLInputElement).value }))
                }
                invalid={Boolean(errors.driverName)}
              />
            </FormField>
            <FormField label="Driver's Phone" htmlFor="driverPhone">
              <Input
                id="driverPhone"
                placeholder="Driver's phone (optional)"
                value={form.driverPhone ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, driverPhone: (e.target as HTMLInputElement).value }))
                }
              />
            </FormField>
            <FormField
              label={
                form.entryType === 'sale' ? 'Unladen weight at entry' : 'Loaded weight at entry'
              }
              htmlFor="entryWeight"
              hint="In kilograms"
            >
              <Input
                id="entryWeight"
                type="number"
                placeholder="Entry Weight"
                value={form.entryWeight ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    entryWeight: Number((e.target as HTMLInputElement).value) || undefined,
                  }))
                }
                describedById="entryWeight-hint"
              />
            </FormField>
            {/* Sale pallette details will be captured during exit, not at entry */}
            {form.entryType === 'purchase' && (
              <FormField label="Material Type">
                <Select
                  value={
                    typeof form.materialType === 'string'
                      ? form.materialType
                      : (form.materialType?._id ?? '')
                  }
                  onChange={(e) =>
                    setForm((f) => ({ ...f, materialType: (e.target as HTMLSelectElement).value }))
                  }
                >
                  <option value="">Select material…</option>
                  {materialOptions.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(form.manualWeight)}
                onChange={(e) =>
                  setForm((f) => ({ ...f, manualWeight: (e.target as HTMLInputElement).checked }))
                }
              />
              Manual weight (hardware offline)
            </label>
            <div className="flex gap-2">
              <Button type="submit" loading={formSaving} disabled={formSaving}>
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
        title="Delete Entry"
        message="This action cannot be undone. Do you want to proceed?"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={onConfirmDelete}
      />
      <Modal
        open={exitPrompt.open}
        onClose={() => setExitPrompt({ open: false, value: '' })}
        title="Update Exit Weight"
      >
        <div className="space-y-3">
          <FormField label="Exit Weight" htmlFor="exitWeight" hint="In kilograms">
            <Input
              id="exitWeight"
              type="number"
              value={exitPrompt.value}
              onChange={(e) =>
                setExitPrompt((s) => ({ ...s, value: (e.target as HTMLInputElement).value }))
              }
            />
          </FormField>
          {exitPrompt.entryType === 'purchase' && (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <FormField label="Moisture (%)">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={exitPrompt.moisture ?? ''}
                    onChange={(e) =>
                      setExitPrompt((s) => ({
                        ...s,
                        moisture: (e.target as HTMLInputElement).value,
                      }))
                    }
                  />
                </FormField>
                <FormField label="Dust (%)">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={exitPrompt.dust ?? ''}
                    onChange={(e) =>
                      setExitPrompt((s) => ({ ...s, dust: (e.target as HTMLInputElement).value }))
                    }
                  />
                </FormField>
              </div>
            </>
          )}
          {exitPrompt.entryType === 'sale' && (
            <>
              <FormField label="Pallette Type">
                <Select
                  value={exitPrompt.palletteType ?? ''}
                  onChange={(e) =>
                    setExitPrompt((s) => ({
                      ...s,
                      palletteType: (e.target as HTMLSelectElement).value as
                        | 'loose'
                        | 'packed'
                        | '',
                      noOfBags: '',
                      weightPerBag: '',
                    }))
                  }
                >
                  <option value="">Not specified</option>
                  <option value="loose">Loose</option>
                  <option value="packed">Packed</option>
                </Select>
              </FormField>
              {exitPrompt.palletteType === 'packed' && (
                <>
                  <FormField label="Number of Bags">
                    <Input
                      type="number"
                      value={exitPrompt.noOfBags ?? ''}
                      onChange={(e) =>
                        setExitPrompt((s) => ({
                          ...s,
                          noOfBags: (e.target as HTMLInputElement).value,
                        }))
                      }
                    />
                  </FormField>
                  <FormField label="Weight per Bag">
                    <Input
                      type="number"
                      value={exitPrompt.weightPerBag ?? ''}
                      onChange={(e) =>
                        setExitPrompt((s) => ({
                          ...s,
                          weightPerBag: (e.target as HTMLInputElement).value,
                        }))
                      }
                    />
                  </FormField>
                  <FormField label="Packed Weight">
                    <Input
                      readOnly
                      value={String(
                        (Number(exitPrompt.noOfBags) || 0) * (Number(exitPrompt.weightPerBag) || 0),
                      )}
                    />
                  </FormField>
                </>
              )}
            </>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setExitPrompt({ open: false, value: '' })}
            >
              Cancel
            </Button>
            <Button type="button" onClick={confirmExit} loading={saving} disabled={saving}>
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EntriesPage;
