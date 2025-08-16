import { useEffect, useState } from 'react';
import { profile as fetchProfile, changePassword } from '@/api/auth';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Skeleton from '@/components/ui/Skeleton';
import { toastError, toastSuccess } from '@/utils/toast';

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
  const [changing, setChanging] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState<{ currentPassword?: string; newPassword?: string }>({});

  const load = async () => {
    try {
      setLoading(true);
      const me = await fetchProfile();
      setData(me as any);
    } catch {
      toastError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: { currentPassword?: string; newPassword?: string } = {};
    if (!currentPassword) next.currentPassword = 'Current password is required';
    if (!newPassword || newPassword.length < 8)
      next.newPassword = 'New password must be at least 8 characters';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    try {
      setChanging(true);
      await changePassword({ currentPassword, newPassword });
      toastSuccess('Password changed');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toastError(err?.message ?? 'Failed to change password');
    } finally {
      setChanging(false);
    }
  };

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
              <div className="card p-3">Created: {data.createdAt?.slice(0, 10) ?? '—'}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No profile data</div>
        )}
      </Card>

      <Card>
        <h3 className="font-medium mb-3">Change Password</h3>
        <form onSubmit={onChangePassword} className="grid sm:grid-cols-2 gap-4">
          <FormField
            label="Current Password"
            htmlFor="currentPassword"
            error={errors.currentPassword}
          >
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword((e.target as HTMLInputElement).value)}
              describedById={errors.currentPassword ? 'currentPassword-error' : undefined}
              invalid={Boolean(errors.currentPassword)}
            />
          </FormField>
          <FormField label="New Password" htmlFor="newPassword" error={errors.newPassword}>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword((e.target as HTMLInputElement).value)}
              describedById={errors.newPassword ? 'newPassword-error' : undefined}
              invalid={Boolean(errors.newPassword)}
            />
          </FormField>
          <div className="sm:col-span-2">
            <Button type="submit" loading={changing} disabled={changing}>
              Change Password
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
};

export default ProfilePage;
