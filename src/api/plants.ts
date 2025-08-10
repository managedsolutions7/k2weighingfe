import api, { unwrap } from '@/utils/api';

export interface Plant {
  _id: string;
  name: string;
  code: string;
  location?: string;
  address?: string;
  isActive: boolean;
}

export const createPlant = async (data: Partial<Plant>) =>
  unwrap<Plant>(api.post('/api/plants', data));

export const getPlants = async (params?: { isActive?: boolean; search?: string }) =>
  unwrap<Plant[]>(api.get('/api/plants', { params }));

export const getPlantById = async (id: string) => unwrap<Plant>(api.get(`/api/plants/${id}`));

export const updatePlant = async (id: string, data: Partial<Plant>) =>
  unwrap<Plant>(api.put(`/api/plants/${id}`, data));

export const deletePlant = async (id: string) =>
  unwrap<{ success: boolean }>(api.delete(`/api/plants/${id}`));
