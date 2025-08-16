import api, { unwrap } from '@/utils/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    username: string;
    name?: string;
    role: 'admin' | 'supervisor' | 'operator';
    plantId?: string;
    empId?: string;
  };
}

export const login = async (payload: LoginRequest) => {
  // Backend returns: { success, data: { token, refreshToken, user }, message }
  const data = await unwrap<{
    token: string;
    refreshToken?: string;
    user: {
      id: string;
      username: string;
      name?: string;
      role: 'admin' | 'supervisor' | 'operator';
      empId?: string;
      plantId?: string;
    };
  }>(api.post('/api/auth/login', payload));
  const normalized: LoginResponse = {
    accessToken: data.token,
    refreshToken: data.refreshToken,
    user: {
      id: data.user.id,
      username: data.user.username,
      name: data.user.name,
      role: data.user.role,
      plantId: data.user.plantId,
      empId: data.user.empId,
    },
  };
  return normalized;
};

export const profile = async () => {
  return unwrap<LoginResponse['user']>(api.get('/api/auth/profile'));
};

export const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
  return unwrap<{ success: boolean; message?: string }>(
    api.post('/api/auth/change-password', payload),
  );
};
