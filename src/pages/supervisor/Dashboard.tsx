import { useEffect, useState } from 'react';
import { getEntries } from '@/api/entries';
import { getVendors } from '@/api/vendors';
import { getVehicles } from '@/api/vehicles';
import { useAppSelector } from '@/store';

const SupervisorDashboard = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [kpis, setKpis] = useState<{ totalEntries: number; vendors: number; vehicles: number }>({
    totalEntries: 0,
    vendors: 0,
    vehicles: 0,
  });

  useEffect(() => {
    const load = async () => {
      const plantId = user?.plantId;
      const [entries, vendors, vehicles] = await Promise.all([
        getEntries({ plant: plantId }),
        getVendors({ plantId }),
        getVehicles({}),
      ]);
      setKpis({ totalEntries: entries.length, vendors: vendors.length, vehicles: vehicles.length });
    };
    void load();
  }, [user?.plantId]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Supervisor Dashboard</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Total Entries</div>
          <div className="text-2xl font-semibold">{kpis.totalEntries}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Vendors</div>
          <div className="text-2xl font-semibold">{kpis.vendors}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Vehicles</div>
          <div className="text-2xl font-semibold">{kpis.vehicles}</div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
