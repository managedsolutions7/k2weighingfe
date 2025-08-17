import { useCallback, useEffect, useState } from 'react';
import { profile as fetchProfile } from '@/api/auth';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/utils/date';
import Skeleton from '@/components/ui/Skeleton';
import { toastError } from '@/utils/toast';

const roleLabel: Record<'admin' | 'supervisor' | 'operator', string> = {
  admin: 'Administrator',
  supervisor: 'Supervisor',
  operator: 'Operator',
};

const RoleBadge = ({ role }: { role: 'admin' | 'supervisor' | 'operator' }) => (
  <Badge variant={role === 'admin' ? 'warning' : role === 'supervisor' ? 'default' : 'success'}>
    {roleLabel[role]}
  </Badge>
);

const ProfilePage = () => {
  const [data, setData] = useState<{
    id: string;
    username: string;
    name?: string;
    role: 'admin' | 'supervisor' | 'operator';
    empId?: string;
    plantId?: string;
    createdAt?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  // Read-only profile per requirement

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const me = await fetchProfile();
      setData(me as typeof data);
    } catch {
      toastError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Password change disabled on frontend

  return (
    <section className="space-y-6">
      <PageHeader title="Profile" />
      <Card>
        {loading ? (
          <Skeleton className="h-24" />
        ) : data ? (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{data.name ?? data.username}</div>
                <div className="text-xs text-gray-500">@{data.username}</div>
              </div>
              <RoleBadge role={data.role} />
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="card p-3">Emp ID: {data.empId ?? '—'}</div>
              <div className="card p-3">Plant: {data.plantId ?? '—'}</div>
              <div className="card p-3">Created: {formatDate(data.createdAt) || '—'}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No profile data</div>
        )}
      </Card>
      {/* Password change form removed per requirement */}
    </section>
  );
};

export default ProfilePage;
