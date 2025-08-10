import { useEffect, useState } from 'react';
import { getPlants, type Plant } from '@/api/plants';
import { getVendors } from '@/api/vendors';
import { getVehicles, type Vehicle } from '@/api/vehicles';
import { useAppSelector } from '@/store';

export interface Option {
  value: string;
  label: string;
}

export const usePlantsOptions = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const list = await getPlants({ isActive: true });
        const filtered: Plant[] =
          user?.role === 'supervisor' && user.plantId
            ? list.filter((p) => p._id === user.plantId)
            : list;
        setOptions(filtered.map((p) => ({ value: p._id, label: `${p.name} (${p.code})` })));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user?.role, user?.plantId]);

  return { options, loading };
};

export const useVendorsOptions = (params?: { plantId?: string }) => {
  const user = useAppSelector((s) => s.auth.user);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const list = await getVendors({
          isActive: true,
          plantId: user?.role === 'supervisor' ? user.plantId : params?.plantId,
        });
        setOptions(list.map((v) => ({ value: v._id, label: v.name })));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user?.role, user?.plantId, params?.plantId]);

  return { options, loading };
};

export const useVehiclesOptions = () => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const list: Vehicle[] = await getVehicles({ isActive: true });
        setOptions(
          list.map((v) => ({ value: v._id, label: `${v.vehicleNumber} (${v.vehicleType})` })),
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);
  return { options, loading };
};
