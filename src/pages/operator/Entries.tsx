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
  }>({ open: false, value: '' });
  const [saving, setSaving] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [, /* errors */ setErrors] = useState<FieldErrors<Partial<Entry>>>({});
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
      // For operators, default to last 24 hours
      const params = withScope({ q: query || undefined, page, limit: pageSize }) as Record<
        string,
        unknown
      >;
      if (user?.role === 'operator') {
        const to = new Date();
        const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
        (params.from as string) = from.toISOString();
        (params.to as string) = to.toISOString();
      }
      const res = await getEntries(params as any);
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
    setExitPrompt({
      open: true,
      id: entry._id,
      value: '',
      entryType: entry.entryType,
      palletteType: '',
      noOfBags: '',
      weightPerBag: '',
    });
  };

  const confirmExit = async () => {
    const weight = Number(exitPrompt.value);
    if (!exitPrompt.id || !Number.isFinite(weight) || weight <= 0) {
      toastError('Please enter a valid exit weight');
      return;
    }
    try {
      setSaving(true);
      let payload: any = { exitWeight: weight };
      if (exitPrompt.entryType === 'sale') {
        if (exitPrompt.palletteType === 'packed') {
          const bags = Number(exitPrompt.noOfBags);
          const wpb = Number(exitPrompt.weightPerBag);
          if (!Number.isFinite(bags) || bags <= 0 || !Number.isFinite(wpb) || wpb <= 0) {
            toastError('Bags and Weight/Bag must be > 0');
            return;
          }
          payload = {
            exitWeight: weight,
            palletteType: 'packed',
            noOfBags: bags,
            weightPerBag: wpb,
          };
        } else if (exitPrompt.palletteType === 'loose') {
          payload = { exitWeight: weight, palletteType: 'loose' };
        }
      }
      await updateEntryExit(exitPrompt.id, payload as any);
      toastSuccess('Exit updated');
      setExitPrompt({ open: false, value: '' });
      void fetchEntries();
    } catch {
      toastError('Failed to update exit');
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: FieldErrors<Partial<Entry>> = {};
    if (required(form.entryType)) nextErrors.entryType = 'Type is required';
    if (required(form.vendor)) nextErrors.vendor = 'Vendor is required';
    if (required(form.vehicle)) nextErrors.vehicle = 'Vehicle is required';
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
        const value = (r as unknown as any).vendor;
        if (!value) return '';
        if (typeof value === 'object') return value.name ?? value._id ?? '';
        return vendorOptions.find((o) => o.value === value)?.label ?? value;
      },
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (r) => {
        const value = (r as unknown as any).vehicle;
        if (!value) return '';
        if (typeof value === 'object') return value.vehicleNumber ?? value._id ?? '';
        return vehicleOptions.find((o) => o.value === value)?.label ?? value;
      },
    },
    { key: 'entryNumber', header: 'Entry No' },
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
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onExit(r)}>
            <LogOut className="w-4 h-4" /> Exit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Entries"
          actions={
            <SearchBar value={query} onChange={setQuery} placeholder="Search by entry no (ENT-*)" />
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
