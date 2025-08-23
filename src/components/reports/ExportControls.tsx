import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Printer, Settings, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import type { ExportOptions } from '@/api/enhanced-reports';

interface ExportControlsProps {
  onExport: (options: ExportOptions) => void;
  onPrint: () => void;
  isLoading?: boolean;
  className?: string;
}

const ExportControls = ({
  onExport,
  onPrint,
  isLoading = false,
  className = '',
}: ExportControlsProps) => {
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeCharts: true,
    includeSummary: true,
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Asia/Kolkata',
  });

  const formatOptions = [
    {
      value: 'pdf',
      label: 'PDF Document',
      icon: FileText,
      description: 'High-quality printable format',
    },
    {
      value: 'excel',
      label: 'Excel Spreadsheet',
      icon: FileSpreadsheet,
      description: 'Editable data format',
    },
    { value: 'csv', label: 'CSV File', icon: FileSpreadsheet, description: 'Simple data format' },
  ];

  const dateFormatOptions = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
  ];

  const timezoneOptions = [
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'Europe/London', label: 'London (GMT)' },
  ];

  const handleExport = () => {
    // Ensure boolean values are properly set
    const validatedOptions: ExportOptions = {
      ...exportOptions,
      includeCharts: Boolean(exportOptions.includeCharts),
      includeSummary: Boolean(exportOptions.includeSummary),
    };
    onExport(validatedOptions);
    setShowExportOptions(false);
  };

  const handleQuickExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Ensure boolean values are properly set for quick export
    const validatedOptions: ExportOptions = {
      ...exportOptions,
      format,
      includeCharts: Boolean(exportOptions.includeCharts),
      includeSummary: Boolean(exportOptions.includeSummary),
    };
    onExport(validatedOptions);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Quick Export Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickExport('pdf')}
          disabled={isLoading}
          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
        >
          <FileText className="w-4 h-4 mr-1" />
          PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickExport('excel')}
          disabled={isLoading}
          className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
        >
          <FileSpreadsheet className="w-4 h-4 mr-1" />
          Excel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickExport('csv')}
          disabled={isLoading}
          className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
        >
          <FileSpreadsheet className="w-4 h-4 mr-1" />
          CSV
        </Button>
      </div>

      {/* Advanced Export Options */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowExportOptions(!showExportOptions)}
        disabled={isLoading}
      >
        <Settings className="w-4 h-4 mr-1" />
        Options
      </Button>

      {/* Print Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onPrint}
        disabled={isLoading}
        className="text-purple-600 hover:text-purple-700 border-purple-200 hover:border-purple-300"
      >
        <Printer className="w-4 h-4 mr-1" />
        Print
      </Button>

      {/* Export Options Modal */}
      {showExportOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Export Options</h3>
              <button
                onClick={() => setShowExportOptions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="space-y-2">
                  {formatOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        exportOptions.format === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={option.value}
                        checked={exportOptions.format === option.value}
                        onChange={(e) =>
                          setExportOptions((prev) => ({
                            ...prev,
                            format: e.target.value as 'pdf' | 'excel' | 'csv',
                          }))
                        }
                        className="mr-3"
                      />
                      <div className="flex items-center gap-3">
                        <div
                          className={`text-lg ${exportOptions.format === option.value ? 'text-blue-600' : 'text-gray-500'}`}
                        >
                          <option.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeCharts}
                    onChange={(e) =>
                      setExportOptions((prev) => ({ ...prev, includeCharts: e.target.checked }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Include Charts & Graphs</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeSummary}
                    onChange={(e) =>
                      setExportOptions((prev) => ({ ...prev, includeSummary: e.target.checked }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Include Summary Section</span>
                </label>
              </div>

              {/* Date Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                <Select
                  value={exportOptions.dateFormat}
                  onChange={(e) =>
                    setExportOptions((prev) => ({ ...prev, dateFormat: e.target.value }))
                  }
                >
                  {dateFormatOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <Select
                  value={exportOptions.timezone}
                  onChange={(e) =>
                    setExportOptions((prev) => ({ ...prev, timezone: e.target.value }))
                  }
                >
                  {timezoneOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              <Button onClick={handleExport} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export {exportOptions.format.toUpperCase()}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowExportOptions(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportControls;
