import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Branding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
}

interface OrgState {
  branding: Branding | null;
  isBrandingLoaded: boolean;
}

const initialState: OrgState = {
  branding: null,
  isBrandingLoaded: false,
};

const orgSlice = createSlice({
  name: 'org',
  initialState,
  reducers: {
    setBranding: (state, action: PayloadAction<Branding>) => {
      state.branding = action.payload;
      state.isBrandingLoaded = true;
    },
    clearBranding: (state) => {
      state.branding = null;
      state.isBrandingLoaded = false;
    },
  },
});

export const { setBranding, clearBranding } = orgSlice.actions;
export default orgSlice.reducer;
