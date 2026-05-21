import api from './api';
import { STORAGE_KEYS } from '../utils/constants';

let trackingInterval: number | null = null;

export const startLiveTracking = (workerId: string) => {
    if (trackingInterval) return;

    const updateLocation = () => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    await api.post(`/workers/${workerId}/location`, {
                        latitude,
                        longitude,
                        status: 'IN_PROGRESS'
                    });
                } catch (err) {
                    console.error('Failed to update live location', err);
                }
            },
            (error) => {
                console.error('Geolocation error during live tracking', error);
            },
            { enableHighAccuracy: true }
        );
    };

    // Update every 1 minute
    updateLocation();
    trackingInterval = window.setInterval(updateLocation, 60000);
};

export const stopLiveTracking = () => {
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }
};
