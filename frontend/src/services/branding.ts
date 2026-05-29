import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import { setBranding } from '../redux/orgSlice';
import type { RootState } from '../redux/store';

export const useBranding = () => {
    const dispatch = useDispatch();
    const { role, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const isBrandingLoaded = useSelector((state: RootState) => state.org.isBrandingLoaded);

    useEffect(() => {
        // Skip branding for customers or unauthenticated users
        if (!isAuthenticated || role === 'CUSTOMER' || isBrandingLoaded) return;

        const fetchAndApplyBranding = async () => {
            try {
                const res: any = await api.get('/organization/branding');
                if (res) {
                    const brandingData = {
                        primaryColor: res.primaryColor || '#4f46e5',
                        secondaryColor: res.secondaryColor || '#4338ca',
                        logoUrl: res.logoUrl || ''
                    };

                    // Apply to CSS variables
                    document.documentElement.style.setProperty('--primary', brandingData.primaryColor);
                    document.documentElement.style.setProperty('--primary-hover', brandingData.secondaryColor);
                    
                    if (brandingData.logoUrl) {
                        localStorage.setItem('orgLogo', brandingData.logoUrl);
                    }

                    // Store in Redux
                    dispatch(setBranding(brandingData));
                }
            } catch (e: any) {
                console.error('Failed to fetch branding:', e);
            }
        };

        fetchAndApplyBranding();
    }, [isBrandingLoaded, dispatch]);
};
