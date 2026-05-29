import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

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
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Logic for token refresh could go here, similar to api.ts
    // For now, let's just log and clear
    console.error('Unauthorized access - potential session expiry');
  }

  // Automatically unwrap ApiResponse structure if present
  if (result.data && typeof result.data === 'object' && 'success' in result.data) {
    const apiResponse = result.data as { success: boolean; data?: any; message?: string };
    return { data: apiResponse.data !== undefined ? apiResponse.data : apiResponse };
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Worker', 'WorkOrder', 'Service', 'Lead', 'Invoice', 'Customer', 'Expense'],
  endpoints: () => ({}),
});
