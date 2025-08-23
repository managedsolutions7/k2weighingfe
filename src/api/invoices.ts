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

// Create invoice - supports both explicit entries and date-range generation
export interface CreateInvoiceFromEntriesPayload {
  vendor: string;
  plant: string;
  entries: string[];
  materialRates?: Record<string, number>;
  paletteRates?: { loose: number; packed: number };
  invoiceDate?: string;
  dueDate?: string;
  invoiceType?: 'purchase' | 'sale';
}

export type CreateInvoicePayload = CreateInvoiceFromEntriesPayload | GenerateFromRangePayload;

const isRangePayload = (p: CreateInvoicePayload): p is GenerateFromRangePayload =>
  'startDate' in p && 'endDate' in p && 'invoiceType' in p;

export const createInvoice = async (data: CreateInvoicePayload) => {
  if (isRangePayload(data)) {
    return unwrap<Invoice>(api.post('/api/invoices/generate-from-range', data));
  }
  return unwrap<Invoice>(api.post('/api/invoices', data));
};

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

// New enhanced invoice APIs
export interface AvailableEntriesResponse {
  entries: Array<{
    _id: string;
    entryNumber: string;
    entryType: 'purchase' | 'sale';
    entryDate: string;
    exactWeight?: number;
    finalWeight?: number;
    exitWeight?: number;
    entryWeight?: number;
    quantity: number;
    materialType?: { _id: string; name: string } | null;
    palletteType?: 'loose' | 'packed';
    noOfBags?: number;
    weightPerBag?: number;
    packedWeight?: number;
    moisture?: number;
    dust?: number;
    moistureWeight?: number;
    dustWeight?: number;
    vendor: { _id: string; name: string; code?: string };
    plant: { _id: string; name: string; code?: string };
    vehicle: { _id: string; vehicleNumber: string; driverName?: string };
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getAvailableEntries = async (
  params: Partial<{
    vendor: string;
    plant: string;
    invoiceType: 'purchase' | 'sale';
    startDate: string;
    endDate: string;
    page: number;
    limit: number;
  }>,
) => unwrap<AvailableEntriesResponse>(api.get('/api/invoices/available-entries', { params }));

export interface GenerateFromRangePayload {
  vendor: string;
  plant: string;
  invoiceType: 'purchase' | 'sale';
  startDate: string;
  endDate: string;
  materialRates?: Record<string, number>;
  paletteRates?: { loose: number; packed: number };
  invoiceDate?: string;
  dueDate?: string;
}

export const generateInvoiceFromRange = async (payload: GenerateFromRangePayload) =>
  unwrap<Invoice>(api.post('/api/invoices/generate-from-range', payload));

export interface InvoicePdfMeta {
  url: string;
}
export const getInvoicePdf = async (id: string) =>
  unwrap<InvoicePdfMeta>(api.get(`/api/invoices/${id}/download`));
