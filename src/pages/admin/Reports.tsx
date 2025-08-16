import { useState } from 'react';
import FiltersBar from '@/components/common/FiltersBar';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import FormField from '@/components/ui/FormField';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import {
  exportCsv,
  getDetailedReport,
  getPlantWiseReport,
  getReportSummary,
  getVendorWiseReport,
} from '@/api/reports';
import { toastError, toastSuccess } from '@/utils/toast';

const ReportsPage = () => {
  const [entryType, setEntryType] = useState<'sale' | 'purchase' | ''>('');
  const [vendor, setVendor] = useState('');
  const [plant, setPlant] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month' | ''>('');
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const onReset = () => {
    setEntryType('');
    setVendor('');
    setPlant('');
    setStartDate('');
    setEndDate('');
    setGroupBy('');
    setResult(null);
  };

  const params = {
    ...(entryType ? { entryType } : {}),
    ...(vendor ? { vendor } : {}),
    ...(plant ? { plant } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    ...(groupBy ? { groupBy } : {}),
  } as Record<string, unknown>;

  const runSummary = async () => {
    try {
      setLoading(true);
      const data = await getReportSummary(params);
      setResult(data);
    } catch {
      toastError('Failed to get summary');
    } finally {
      setLoading(false);
    }
  };

  const runDetailed = async () => {
    try {
      setLoading(true);
      const data = await getDetailedReport(params);
      setResult(data);
    } catch {
      toastError('Failed to get detailed report');
    } finally {
      setLoading(false);
    }
  };

  const runVendorWise = async () => {
    try {
      setLoading(true);
      const data = await getVendorWiseReport({ ...params, vendors: vendor });
      setResult(data);
    } catch {
      toastError('Failed to get vendor-wise report');
    } finally {
      setLoading(false);
    }
  };

  const runPlantWise = async () => {
    try {
      setLoading(true);
      const data = await getPlantWiseReport({ ...params, plant });
      setResult(data);
    } catch {
      toastError('Failed to get plant-wise report');
    } finally {
      setLoading(false);
    }
  };

  const onExport = async () => {
    try {
      setLoading(true);
      const blob = await exportCsv({ ...params, groupBy: groupBy || 'vendor' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'report.csv';
      a.click();
      URL.revokeObjectURL(url);
      toastSuccess('Export started');
    } catch {
      toastError('Failed to export CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" />
      <FiltersBar onReset={onReset}>
        <FormField label="Type">
          <Select
            value={entryType}
            onChange={(e) =>
              setEntryType((e.target as HTMLSelectElement).value as 'sale' | 'purchase' | '')
            }
          >
            <option value="">All Types</option>
            <option value="sale">Sale</option>
            <option value="purchase">Purchase</option>
          </Select>
        </FormField>
        <FormField label="Vendor ID" hint="Leave blank for all vendors">
          <Input
            placeholder="Vendor ID"
            value={vendor}
            onChange={(e) => setVendor((e.target as HTMLInputElement).value)}
          />
        </FormField>
        <FormField label="Plant ID" hint="Leave blank for all plants">
          <Input
            placeholder="Plant ID"
            value={plant}
            onChange={(e) => setPlant((e.target as HTMLInputElement).value)}
          />
        </FormField>
        <FormField label="Start Date">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate((e.target as HTMLInputElement).value)}
          />
        </FormField>
        <FormField label="End Date">
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate((e.target as HTMLInputElement).value)}
          />
        </FormField>
        <FormField label="Group By">
          <Select
            value={groupBy}
            onChange={(e) =>
              setGroupBy((e.target as HTMLSelectElement).value as 'day' | 'week' | 'month' | '')
            }
          >
            <option value="">No Grouping</option>
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </Select>
        </FormField>
      </FiltersBar>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={runSummary} loading={loading} disabled={loading}>
          Summary
        </Button>
        <Button variant="outline" onClick={runDetailed} loading={loading} disabled={loading}>
          Detailed
        </Button>
        <Button variant="outline" onClick={runVendorWise} loading={loading} disabled={loading}>
          Vendor-wise
        </Button>
        <Button variant="outline" onClick={runPlantWise} loading={loading} disabled={loading}>
          Plant-wise
        </Button>
        <Button className="ml-auto" onClick={onExport} loading={loading} disabled={loading}>
          Export CSV
        </Button>
      </div>

      <pre className="bg-gray-50 border rounded p-3 text-xs overflow-auto max-h-[50vh]">
        {result ? JSON.stringify(result, null, 2) : 'No data'}
      </pre>
    </div>
  );
};

export default ReportsPage;
