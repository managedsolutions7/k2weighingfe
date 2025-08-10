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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={onSubmit} className="bg-white shadow rounded p-6 space-y-4 w-full max-w-sm">
        <h1 className="text-xl font-semibold">Login</h1>
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="border rounded px-3 py-2 w-full"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded px-4 py-2 w-full disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default Login;
