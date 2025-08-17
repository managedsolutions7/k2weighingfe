import api, { unwrap } from '@/utils/api';

export interface Entry {
  _id: string;
  entryNumber?: string;
  entryType: 'sale' | 'purchase';
  vendor: string | { _id: string; name?: string };
  vehicle: string | { _id: string; vehicleNumber?: string };
  plant?: string | { _id: string; name?: string };
  entryWeight?: number;
  exitWeight?: number;
  driverName?: string;
  driverPhone?: string;
  rate?: number;
  quantity?: number;
  entryDate?: string;
  manualWeight?: boolean;
  isActive: boolean;
  // New fields
  palletteType?: 'loose' | 'packed'; // sale only
  noOfBags?: number; // when palletteType = 'packed'
  weightPerBag?: number; // when palletteType = 'packed'
  packedWeight?: number; // derived client-side; backend may also compute
  materialType?: string | { _id: string; name: string }; // purchase only
  varianceFlag?: boolean; // false => pass, true => fail
  flagged?: boolean;
  flagReason?: string;
  expectedWeight?: number;
  exactWeight?: number;
  createdBy?: { _id: string; username?: string; name?: string } | string;
  updatedBy?: { _id: string; username?: string; name?: string } | string;
  // Purchase exit derived fields (read-only)
  moisture?: number;
  dust?: number;
  moistureWeight?: number;
  dustWeight?: number;
  finalWeight?: number;
  // Review fields (optional, backend may provide)
  isReviewed?: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export const createEntry = async (data: Partial<Entry>) =>
  unwrap<Entry>(api.post('/api/entries', data));

export interface EntriesResponse {
  entries: Entry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getEntries = async (
  params?: { q?: string; page?: number; limit?: number } & Record<string, unknown>,
) => unwrap<EntriesResponse>(api.get('/api/entries', { params }));

export const getEntryById = async (id: string) => unwrap<Entry>(api.get(`/api/entries/${id}`));

export const updateEntry = async (id: string, data: Partial<Entry>) =>
  unwrap<Entry>(api.put(`/api/entries/${id}`, data));

export const deleteEntry = async (id: string) =>
  unwrap<{ success: boolean }>(api.delete(`/api/entries/${id}`));

// legacy signature removed; use payload variant below

export const reviewEntry = async (
  id: string,
  payload: { isReviewed: boolean; reviewNotes?: string },
) => unwrap<Entry>(api.patch(`/api/entries/${id}/review`, payload));

export type ExitUpdatePayload =
  | { exitWeight: number; palletteType?: 'loose'; moisture?: number; dust?: number }
  | {
      exitWeight: number;
      palletteType: 'packed';
      noOfBags: number;
      weightPerBag: number;
      moisture?: number;
      dust?: number;
    };

export const updateEntryExit = async (id: string, payload: ExitUpdatePayload) =>
  unwrap<Entry>(api.patch(`/api/entries/${id}/exit`, payload));

export const downloadEntryReceipt = async (id: string) =>
  unwrap<Blob>(api.get(`/api/entries/${id}/receipt`, { responseType: 'blob' }));

export const flagEntry = async (id: string, payload: { flagged: boolean; flagReason?: string }) =>
  unwrap<Entry>(api.patch(`/api/entries/${id}/flag`, payload));
