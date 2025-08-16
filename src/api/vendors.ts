import api, { unwrap } from '@/utils/api';

export interface Vendor {
  _id: string;
  vendorNumber?: string;
  name: string;
  code?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  linkedPlants?: string[];
  isActive: boolean;
}

export const createVendor = async (data: Partial<Vendor>) =>
  unwrap<Vendor>(api.post('/api/vendors', data));

export const getVendors = async (params?: { plantId?: string; isActive?: boolean; q?: string }) =>
  unwrap<Vendor[]>(api.get('/api/vendors', { params }));

export const getVendorById = async (id: string) => unwrap<Vendor>(api.get(`/api/vendors/${id}`));

export const updateVendor = async (id: string, data: Partial<Vendor>) =>
  unwrap<Vendor>(api.put(`/api/vendors/${id}`, data));

export const deleteVendor = async (id: string) =>
  unwrap<{ success: boolean }>(api.delete(`/api/vendors/${id}`));
