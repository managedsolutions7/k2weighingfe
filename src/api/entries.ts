import api, { unwrap } from '@/utils/api';

export interface Entry {
  _id: string;
  entryType: 'sale' | 'purchase';
  vendor: string;
  vehicle: string;
  plant: string;
  entryWeight?: number;
  exitWeight?: number;
  rate?: number;
  entryDate?: string;
  isActive: boolean;
}

export const createEntry = async (data: Partial<Entry>) =>
  unwrap<Entry>(api.post('/api/entries', data));

export const getEntries = async (params?: Record<string, unknown>) =>
  unwrap<Entry[]>(api.get('/api/entries', { params }));

export const getEntryById = async (id: string) => unwrap<Entry>(api.get(`/api/entries/${id}`));

export const updateEntry = async (id: string, data: Partial<Entry>) =>
  unwrap<Entry>(api.put(`/api/entries/${id}`, data));

export const deleteEntry = async (id: string) =>
  unwrap<{ success: boolean }>(api.delete(`/api/entries/${id}`));

export const updateEntryExit = async (id: string, exitWeight: number) =>
  unwrap<Entry>(api.patch(`/api/entries/${id}/exit`, { exitWeight }));
