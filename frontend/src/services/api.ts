import axios from 'axios';
import { STORAGE_KEYS, ERROR_MESSAGES } from '../utils/constants';
import { queueAction } from './offline';
import { toastNotifier } from '../utils/toast-notifier';
import { store } from '../redux/store';
import { startLoading, stopLoading } from '../redux/uiSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    store.dispatch(startLoading());
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    store.dispatch(stopLoading());
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration and unwrap ApiResponse
api.interceptors.response.use(
  (response) => {
    store.dispatch(stopLoading());
    // Return only the data part of the axios response
    const data = response.data;
    
    // If it's our ApiResponse structure, unwrap the nested data
    if (data && typeof data === 'object' && data.hasOwnProperty('success')) {
      return data.data !== undefined ? data.data : data;
    }
    
    return data;
  },
  async (error) => {
    store.dispatch(stopLoading());
    const originalRequest = error.config;

    // Handle Offline State: Queue POST/PATCH/DELETE requests if network is down
    if (!navigator.onLine || error.message === 'Network Error') {
        const method = originalRequest.method?.toUpperCase();
        if (['POST', 'PATCH', 'DELETE'].includes(method || '')) {
            try {
                await queueAction(originalRequest.url || '', originalRequest.data, method);
                toastNotifier.show('Offline: Your action has been saved and will sync when you are back online.', 'info');
                // Return a "fake" successful response so the UI doesn't crash/show error
                return Promise.resolve({ success: true, message: 'Queued' });
            } catch (queueErr) {
                console.error('Failed to queue offline action', queueErr);
            }
        }
    }
    
    // Handle Token Expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) throw new Error('No refresh token');

        // Use standard axios for refresh to avoid interceptor loop
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, refreshToken, {
          headers: { 'Content-Type': 'text/plain' }
        });
        
        const data = response.data.data || response.data;
        const accessToken = data.access_token;
        const newRefreshToken = data.refresh_token;
        const role = data.role;
        const workerId = data.workerId;
        const customerId = data.customerId;

        if (accessToken) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        if (newRefreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
        if (role) localStorage.setItem(STORAGE_KEYS.ROLE, role);
        if (workerId) localStorage.setItem(STORAGE_KEYS.WORKER_ID, workerId.toString());
        if (customerId) localStorage.setItem(STORAGE_KEYS.CUSTOMER_ID, customerId.toString());
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    // Global Error Feedback
    const errorData = error.response?.data;
    const message = errorData?.message || errorData?.error || error.message || ERROR_MESSAGES.GENERIC;
    const details = errorData?.details;
    const status = error.response?.status;
    
    // Only show toast for non-401 errors (401 is handled by redirect/refresh)
    if (status !== 401) {
        // If there are validation details, show them specifically
        if (details && typeof details === 'object') {
          const firstError = Object.values(details)[0];
          toastNotifier.show(`${message}: ${firstError}`, 'error');
        } else {
          toastNotifier.show(message, 'error');
        }
    }
    
    console.error('[API Error]', { message, status, details });
    
    return Promise.reject({
        message,
        status,
        details,
        originalError: error
    });
  }
);

export default api;

