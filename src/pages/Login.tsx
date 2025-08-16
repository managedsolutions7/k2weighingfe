import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/api/auth';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/slices/authSlice';
import { toastError, toastSuccess } from '@/utils/toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const resp = await login({ username, password });

      dispatch(setCredentials({ user: resp.user, accessToken: resp.accessToken }));
      toastSuccess('Logged in successfully');
      const roleToPath: Record<string, string> = {
        admin: '/admin/dashboard',
        supervisor: '/supervisor/dashboard',
        operator: '/operator/dashboard',
      };
      navigate(roleToPath[resp.user.role] ?? '/');
    } catch {
      toastError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-neutral))] p-4">
      <div className="w-full max-w-md">
        <div className="card p-6">
          <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-4">Sign in to your account</p>
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block text-sm">
              <span className="sr-only">Username</span>
              <input
                className="border rounded px-3 py-2 w-full"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </label>
            <label className="block text-sm">
              <span className="sr-only">Password</span>
              <input
                type="password"
                className="border rounded px-3 py-2 w-full"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="text-center mt-3 text-xs text-gray-500">Biofuel Management</p>
      </div>
    </div>
  );
};

export default Login;
