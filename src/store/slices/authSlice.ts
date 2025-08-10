import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'admin' | 'supervisor' | 'operator' | null;

export interface AuthUser {
  id: string;
  username: string;
  name?: string;
  role: Exclude<UserRole, null>;
  plantId?: string;
  empId?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
}

const getInitialAuthState = (): AuthState => {
  try {
    if (typeof localStorage === 'undefined') return { user: null, accessToken: null };
    const token = localStorage.getItem('auth_token');
    const raw = localStorage.getItem('auth_user');
    const user = raw ? (JSON.parse(raw) as AuthUser) : null;
    return { user, accessToken: token };
  } catch {
    return { user: null, accessToken: null };
  }
};

const initialState: AuthState = getInitialAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: AuthUser; accessToken: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('auth_token', action.payload.accessToken);
        localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
      }
    },
    hydrateFromStorage(state) {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const userRaw =
        typeof localStorage !== 'undefined' ? localStorage.getItem('auth_user') : null;
      state.accessToken = token;
      state.user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      if (typeof localStorage !== 'undefined') localStorage.clear();
    },
  },
});

export const { setCredentials, hydrateFromStorage, logout } = authSlice.actions;
export default authSlice.reducer;
