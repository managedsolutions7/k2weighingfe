import api, { unwrap } from '@/utils/api';

export interface InvoiceVendor {
  _id: string;
  name: string;
  code?: string;
}
export interface InvoicePlant {
  _id: string;
  name: string;
  code?: string;
}
export interface InvoiceEntry {
  _id: string;
  [key: string]: unknown;
}

export interface Invoice {
  _id: string;
  vendor: string | InvoiceVendor;
  plant: string | InvoicePlant;
  entries: Array<string | InvoiceEntry>;
  totalQuantity?: number;
  totalAmount?: number;
  invoiceDate?: string;
  dueDate?: string;
  status?: 'draft' | 'sent' | 'paid';
  invoiceNumber?: string;
  isActive: boolean;
}

export const createInvoice = async (data: Partial<Invoice>) =>
  unwrap<Invoice>(api.post('/api/invoices', data));

export interface InvoicesList {
  items: Invoice[];
  total: number;
}

export const getInvoices = async (params?: Record<string, unknown>): Promise<InvoicesList> => {
  const data = await unwrap<unknown>(api.get('/api/invoices', { params }));
  if (Array.isArray(data)) {
    const items = data as Invoice[];
    return { items, total: items.length };
  }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const items = (obj.items as Invoice[]) ?? (obj.invoices as Invoice[]) ?? [];
    const total = (obj.total as number) ?? (Array.isArray(items) ? items.length : 0);
    return { items, total };
  }
  return { items: [], total: 0 };
};

export const updateInvoice = async (id: string, data: Partial<Invoice>) =>
  unwrap<Invoice>(api.put(`/api/invoices/${id}`, data));

export const deleteInvoice = async (id: string) =>
  unwrap<{ success: boolean }>(api.delete(`/api/invoices/${id}`));

export const downloadInvoice = async (id: string) =>
  unwrap<Blob>(api.get(`/api/invoices/${id}/download`, { responseType: 'blob' }));
