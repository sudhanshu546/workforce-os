import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  workerId: number | null;
  customerId: number | null;
  user: { id: number; name: string; email: string; role: string; number: string } | null;
  isAuthenticated: boolean;
}

interface CredentialsPayload {
  accessToken: string;
  refreshToken: string;
  role: string;
  user: any;
  workerId?: number;
  customerId?: number;
}

const storedAccessToken = localStorage.getItem('accessToken');
const storedRefreshToken = localStorage.getItem('refreshToken');
const storedRole = localStorage.getItem('role');
const storedWorkerId = localStorage.getItem('worker_id');
const storedCustomerId = localStorage.getItem('customerId');
const storedUser = localStorage.getItem('user');

const isValidToken = (token: string | null) => token && token !== 'undefined' && token !== 'null';

const initialState: AuthState = {
  accessToken: isValidToken(storedAccessToken) ? storedAccessToken : null,
  refreshToken: isValidToken(storedRefreshToken) ? storedRefreshToken : null,
  role: storedRole && storedRole !== 'undefined' ? storedRole : null,
  workerId: storedWorkerId && storedWorkerId !== 'undefined' ? Number(storedWorkerId) : null,
  customerId: storedCustomerId && storedCustomerId !== 'undefined' ? Number(storedCustomerId) : null,
  user: (storedUser && storedUser !== 'undefined') ? JSON.parse(storedUser) : null,
  isAuthenticated: !!isValidToken(storedAccessToken),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<CredentialsPayload>
    ) => {
      const { accessToken, refreshToken, role, workerId, customerId, user } =
        action.payload;

      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.role = role;
      state.workerId = workerId ?? null;
      state.customerId = customerId ?? null;
      state.user = user;
      state.isAuthenticated = true;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('role', role);
      localStorage.setItem('user', JSON.stringify(user));

      if (workerId) {
        localStorage.setItem('worker_id', workerId.toString());
      }
      if (customerId) {
        localStorage.setItem('customerId', customerId.toString());
      }
    },

    setUserProfile: (
      state,
      action: PayloadAction<{ id: number; name: string; email: string; role: string; number: string }>
    ) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },

    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.role = null;
      state.workerId = null;
      state.customerId = null;
      state.user = null;
      state.isAuthenticated = false;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      localStorage.removeItem('worker_id');
      localStorage.removeItem('customerId');
      localStorage.removeItem('user');
    },

    updateToken: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;

      localStorage.setItem(
        'accessToken',
        action.payload.accessToken
      );
      localStorage.setItem(
        'refreshToken',
        action.payload.refreshToken
      );
    },
  },
});

export const {
  setCredentials,
  setUserProfile,
  logout,
  updateToken,
} = authSlice.actions;

export default authSlice.reducer;