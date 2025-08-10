import { useState } from 'react';
import FiltersBar from '@/components/common/FiltersBar';
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
      const data = await getReportSummary(params);
      setResult(data);
    } catch {
      toastError('Failed to get summary');
    }
  };

  const runDetailed = async () => {
    try {
      const data = await getDetailedReport(params);
      setResult(data);
    } catch {
      toastError('Failed to get detailed report');
    }
  };

  const runVendorWise = async () => {
    try {
      const data = await getVendorWiseReport({ ...params, vendors: vendor });
      setResult(data);
    } catch {
      toastError('Failed to get vendor-wise report');
    }
  };

  const runPlantWise = async () => {
    try {
      const data = await getPlantWiseReport({ ...params, plant });
      setResult(data);
    } catch {
      toastError('Failed to get plant-wise report');
    }
  };

  const onExport = async () => {
    try {
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
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Reports</h1>
      <FiltersBar onReset={onReset}>
        <select
          className="border rounded px-3 py-2"
          value={entryType}
          onChange={(e) =>
            setEntryType((e.target as HTMLSelectElement).value as 'sale' | 'purchase' | '')
          }
        >
          <option value="">All Types</option>
          <option value="sale">Sale</option>
          <option value="purchase">Purchase</option>
        </select>
        <input
          className="border rounded px-3 py-2"
          placeholder="Vendor ID"
          value={vendor}
          onChange={(e) => setVendor((e.target as HTMLInputElement).value)}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Plant ID"
          value={plant}
          onChange={(e) => setPlant((e.target as HTMLInputElement).value)}
        />
        <input
          type="date"
          className="border rounded px-3 py-2"
          value={startDate}
          onChange={(e) => setStartDate((e.target as HTMLInputElement).value)}
        />
        <input
          type="date"
          className="border rounded px-3 py-2"
          value={endDate}
          onChange={(e) => setEndDate((e.target as HTMLInputElement).value)}
        />
        <select
          className="border rounded px-3 py-2"
          value={groupBy}
          onChange={(e) =>
            setGroupBy((e.target as HTMLSelectElement).value as 'day' | 'week' | 'month' | '')
          }
        >
          <option value="">No Grouping</option>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
      </FiltersBar>

      <div className="flex flex-wrap gap-2">
        <button className="px-3 py-2 border rounded" onClick={runSummary}>
          Summary
        </button>
        <button className="px-3 py-2 border rounded" onClick={runDetailed}>
          Detailed
        </button>
        <button className="px-3 py-2 border rounded" onClick={runVendorWise}>
          Vendor-wise
        </button>
        <button className="px-3 py-2 border rounded" onClick={runPlantWise}>
          Plant-wise
        </button>
        <button className="ml-auto px-3 py-2 bg-blue-600 text-white rounded" onClick={onExport}>
          Export CSV
        </button>
      </div>

      <pre className="bg-gray-50 border rounded p-3 text-xs overflow-auto max-h-[50vh]">
        {result ? JSON.stringify(result, null, 2) : 'No data'}
      </pre>
    </div>
  );
};

export default ReportsPage;
