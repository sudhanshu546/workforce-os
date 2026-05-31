import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { updateToken, logout } from './authSlice';
import { startLoading, stopLoading } from './uiSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken');
    if (token && token !== 'undefined' && token !== 'null') {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  api.dispatch(startLoading());
  try {
    let result = await baseQuery(args, api, extraOptions);
    
    if (result.error && result.error.status === 401) {
      // Attempt to refresh the token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
        const refreshResult = await baseQuery(
          {
            url: '/auth/refresh',
            method: 'POST',
            body: refreshToken,
            headers: { 'Content-Type': 'text/plain' },
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          // We got a new token!
          const data = (refreshResult.data as any).data || refreshResult.data;
          const newAccessToken = data.access_token || data.accessToken;
          const newRefreshToken = data.refresh_token || data.refreshToken;

          if (newAccessToken && newRefreshToken) {
            api.dispatch(updateToken({ accessToken: newAccessToken, refreshToken: newRefreshToken }));
            // Retry the original request
            result = await baseQuery(args, api, extraOptions);
          } else {
            api.dispatch(logout());
          }
        } else {
          api.dispatch(logout());
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } else {
        api.dispatch(logout());
      }
    }

    // Automatically unwrap ApiResponse structure if present
    if (result.data && typeof result.data === 'object' && 'success' in result.data) {
      const apiResponse = result.data as { success: boolean; data?: any; message?: string };
      return { data: apiResponse.data !== undefined ? apiResponse.data : apiResponse };
    }

    return result;
  } finally {
    api.dispatch(stopLoading());
  }
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Worker', 'WorkOrder', 'Service', 'Lead', 'Invoice', 'Customer', 'Expense', 'Payment', 'Inventory', 'Chat', 'Attendance'],
  endpoints: () => ({}),
});
