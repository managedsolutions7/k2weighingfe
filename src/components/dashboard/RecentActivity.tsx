import { Clock, FileText, Package, Truck, AlertTriangle, CheckCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatDateTime } from '@/utils/date';
import type { Entry, Invoice } from '@/api/enhanced-dashboard';

interface RecentActivityProps {
  recentEntries: Entry[];
  recentInvoices: Invoice[];
  className?: string;
}

const RecentActivity = ({ recentEntries, recentInvoices, className = '' }: RecentActivityProps) => {
  const getEntryStatusIcon = (entry: Entry) => {
    if (entry.varianceFlag) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    if (entry.isReviewed) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <Clock className="w-4 h-4 text-blue-500" />;
  };

  const getEntryStatusText = (entry: Entry) => {
    if (entry.varianceFlag) return 'Variance Flagged';
    if (entry.isReviewed) return 'Reviewed';
    return 'Pending Review';
  };

  const getEntryStatusColor = (entry: Entry) => {
    if (entry.varianceFlag) return 'text-yellow-600';
    if (entry.isReviewed) return 'text-green-600';
    return 'text-blue-600';
  };

  const getInvoiceStatusIcon = (invoice: Invoice) => {
    if (invoice.status === 'paid') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (invoice.status === 'pending') {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  const getInvoiceStatusColor = (status: string) => {
    if (status === 'paid') return 'text-green-600';
    if (status === 'pending') return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* Recent Entries */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Entries</h3>
        </div>

        <div className="space-y-4">
          {recentEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No recent entries</p>
            </div>
          ) : (
            recentEntries.map((entry) => (
              <div key={entry._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-1">{getEntryStatusIcon(entry)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {entry.entryType === 'purchase' ? 'Purchase' : 'Sale'}
                      </span>
                      <span className="text-xs text-gray-500">#{entry.entryNumber || 'N/A'}</span>
                    </div>
                    <span className={`text-xs font-medium ${getEntryStatusColor(entry)}`}>
                      {getEntryStatusText(entry)}
                    </span>
                  </div>

                  <div className="mt-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3 h-3" />
                      <span>
                        {typeof entry.vendor === 'string'
                          ? entry.vendor
                          : entry.vendor?.name || 'N/A'}
                      </span>
                      <span>•</span>
                      <span>
                        {typeof entry.vehicle === 'string'
                          ? entry.vehicle
                          : entry.vehicle?.vehicleNumber || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span>Qty: {entry.quantity || entry.entryWeight || 0} kg</span>
                      {entry.driverName && <span>Driver: {entry.driverName}</span>}
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    {formatDateTime(entry.entryDate)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {recentEntries.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <span className="text-sm text-gray-500">
                Showing {recentEntries.length} recent entries
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Recent Invoices */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
        </div>

        <div className="space-y-4">
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No recent invoices</p>
            </div>
          ) : (
            recentInvoices.map((invoice) => (
              <div key={invoice._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-1">{getInvoiceStatusIcon(invoice)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber || 'N/A'}
                      </span>
                      <span className="text-xs text-gray-500">{invoice.invoiceType || 'N/A'}</span>
                    </div>
                    <span
                      className={`text-xs font-medium ${getInvoiceStatusColor(invoice.status || 'pending')}`}
                    >
                      {invoice.status || 'Pending'}
                    </span>
                  </div>

                  <div className="mt-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>
                        {typeof invoice.vendor === 'string'
                          ? invoice.vendor
                          : invoice.vendor?.name || 'N/A'}
                      </span>
                      <span>•</span>
                      <span>
                        {typeof invoice.plant === 'string'
                          ? invoice.plant
                          : invoice.plant?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span>Amount: ₹{invoice.totalAmount?.toLocaleString() || 0}</span>
                      {invoice.dueDate && <span>Due: {formatDateTime(invoice.dueDate)}</span>}
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    {formatDateTime(invoice.invoiceDate)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {recentInvoices.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <span className="text-sm text-gray-500">
                Showing {recentInvoices.length} recent invoices
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RecentActivity;
