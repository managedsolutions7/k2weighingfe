import api, { unwrap } from '@/utils/api';

export interface Material {
  _id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

interface MaterialApi {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export const getMaterials = async (params?: { isActive?: boolean; q?: string }) => {
  const qp: Record<string, unknown> = {};
  if (typeof params?.isActive === 'boolean') qp.isActive = String(params.isActive);
  if (params?.q) qp.q = params.q;
  const list = await unwrap<MaterialApi[]>(api.get('/api/materials', { params: qp }));
  return list.map((m) => ({
    _id: m.id,
    name: m.name,
    description: m.description,
    isActive: m.isActive,
  }));
};

export const getMaterialById = async (id: string) => {
  const m = await unwrap<MaterialApi>(api.get(`/api/materials/${id}`));
  return { _id: m.id, name: m.name, description: m.description, isActive: m.isActive } as Material;
};

export const createMaterial = async (data: Partial<Material>) => {
  const m = await unwrap<MaterialApi>(api.post('/api/materials', data));
  return { _id: m.id, name: m.name, description: m.description, isActive: m.isActive } as Material;
};

export const updateMaterial = async (id: string, data: Partial<Material>) => {
  const m = await unwrap<MaterialApi>(api.put(`/api/materials/${id}`, data));
  return { _id: m.id, name: m.name, description: m.description, isActive: m.isActive } as Material;
};

export const deleteMaterial = async (id: string) =>
  unwrap<{ success: boolean }>(api.delete(`/api/materials/${id}`));
