import api, { unwrap } from '@/utils/api';

export interface Vehicle {
  _id: string;
  vehicleCode?: string;
  vehicleNumber: string;
  vehicleType: 'buy' | 'sell';
  capacity?: number;
  driverName?: string;
  driverPhone?: string;
  tareWeight?: number;
  isActive: boolean;
}

export const createVehicle = async (data: Partial<Vehicle>) =>
  unwrap<Vehicle>(api.post('/api/vehicles', data));

export const getVehicles = async (params?: {
  isActive?: boolean;
  vehicleType?: 'buy' | 'sell';
  q?: string;
}) => unwrap<Vehicle[]>(api.get('/api/vehicles', { params }));

export const getVehicleById = async (id: string) => unwrap<Vehicle>(api.get(`/api/vehicles/${id}`));

export const updateVehicle = async (id: string, data: Partial<Vehicle>) =>
  unwrap<Vehicle>(api.put(`/api/vehicles/${id}`, data));

export const deleteVehicle = async (id: string) =>
  unwrap<{ success: boolean }>(api.delete(`/api/vehicles/${id}`));
