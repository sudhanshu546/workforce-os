import { useEffect } from 'react';
import api from '../services/api';

export const useBranding = () => {
    useEffect(() => {
        const fetchAndApplyBranding = async () => {
            try {
                const res: any = await api.get('/organization/branding');
                if (res) {
                    if (res.primaryColor) {
                        document.documentElement.style.setProperty('--primary', res.primaryColor);
                        // Generate a slightly darker version for hover if possible, or just use secondary
                        if (res.secondaryColor) {
                            document.documentElement.style.setProperty('--primary-hover', res.secondaryColor);
                        }
                    }
                    if (res.logoUrl) {
                        localStorage.setItem('orgLogo', res.logoUrl);
                    }
                }
            } catch (e) {
                // Ignore if not logged in or fetch fails
            }
        };

        fetchAndApplyBranding();
    }, []);
};
