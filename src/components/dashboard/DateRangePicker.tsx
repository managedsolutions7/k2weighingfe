import { useState, useEffect } from 'react';
import { Calendar, RefreshCw, Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { type PresetRange, getPresetRange } from '@/utils/date';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  showExport?: boolean;
  className?: string;
}

const DateRangePicker = ({
  startDate,
  endDate,
  onDateChange,
  onRefresh,
  onExport,
  showExport = false,
  className = '',
}: DateRangePickerProps) => {
  const [preset, setPreset] = useState<PresetRange>('24h');
  const [customStartDate, setCustomStartDate] = useState(startDate);
  const [customEndDate, setCustomEndDate] = useState(endDate);

  useEffect(() => {
    if (preset !== 'custom') {
      const { from, to } = getPresetRange(preset);
      onDateChange(from, to);
    }
  }, [preset, onDateChange]);

  useEffect(() => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
  }, [startDate, endDate]);

  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      onDateChange(customStartDate, customEndDate);
      setPreset('custom');
    }
  };

  const handlePresetChange = (newPreset: PresetRange) => {
    setPreset(newPreset);
    if (newPreset !== 'custom') {
      const { from, to } = getPresetRange(newPreset);
      onDateChange(from, to);
    }
  };

  const presetOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Date Range:</span>
      </div>

      <Select
        value={preset}
        onChange={(e) => handlePresetChange(e.target.value as PresetRange)}
        className="min-w-[140px]"
      >
        {presetOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      {preset === 'custom' && (
        <>
          <Input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="min-w-[140px]"
          />
          <span className="text-gray-500">to</span>
          <Input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="min-w-[140px]"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCustomDateChange}
            disabled={!customStartDate || !customEndDate}
          >
            Apply
          </Button>
        </>
      )}

      <div className="flex items-center gap-2 ml-auto">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        )}

        {showExport && onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;
