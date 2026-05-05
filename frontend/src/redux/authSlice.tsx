import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  customerId: number | null;
  isAuthenticated: boolean;
}

interface CredentialsPayload {
  accessToken: string;
  refreshToken: string;
  role: string;
  customerId?: number;
}

const storedAccessToken = localStorage.getItem('accessToken');
const storedRefreshToken = localStorage.getItem('refreshToken');
const storedRole = localStorage.getItem('role');
const storedCustomerId = localStorage.getItem('customerId');

const isValidToken = (token: string | null) => token && token !== 'undefined' && token !== 'null';

const initialState: AuthState = {
  accessToken: isValidToken(storedAccessToken) ? storedAccessToken : null,
  refreshToken: isValidToken(storedRefreshToken) ? storedRefreshToken : null,
  role: storedRole && storedRole !== 'undefined' ? storedRole : null,
  customerId: storedCustomerId && storedCustomerId !== 'undefined' ? Number(storedCustomerId) : null,
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
      const { accessToken, refreshToken, role, customerId } =
        action.payload;

      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.role = role;
      state.customerId = customerId ?? null;
      state.isAuthenticated = true;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('role', role);

      if (customerId) {
        localStorage.setItem('customerId', customerId.toString());
      }
    },

    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.role = null;
      state.customerId = null;
      state.isAuthenticated = false;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      localStorage.removeItem('customerId');
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
  logout,
  updateToken,
} = authSlice.actions;

export default authSlice.reducer;