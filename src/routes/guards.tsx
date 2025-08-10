import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store';
import type { UserRole } from '@/store/slices/authSlice';

export const ProtectedRoute = () => {
  const user = useAppSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export const RoleRoute = ({ allowed }: { allowed: Exclude<UserRole, null>[] }) => {
  const user = useAppSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
};
