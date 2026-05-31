import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  isLoading: boolean;
  activeRequests: number;
}

const initialState: UiState = {
  isLoading: false,
  activeRequests: 0,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.activeRequests += 1;
      state.isLoading = true;
    },
    stopLoading: (state) => {
      state.activeRequests = Math.max(0, state.activeRequests - 1);
      if (state.activeRequests === 0) {
        state.isLoading = false;
      }
    },
    forceResetLoading: (state) => {
      state.activeRequests = 0;
      state.isLoading = false;
    },
  },
});

export const { startLoading, stopLoading, forceResetLoading } = uiSlice.actions;
export default uiSlice.reducer;
