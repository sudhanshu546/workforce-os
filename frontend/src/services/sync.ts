import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getPendingActions, clearPendingActions } from './offline';

export const syncOfflineData = async () => {
    const pendingActions = await getPendingActions();
    
    if (pendingActions.length === 0) return;

    for (const action of pendingActions) {
        try {
            await api.post(action.action, action.payload);
        } catch (err) {
            console.error('Failed to sync action:', action, err);
            // Re-queue or log failure
        }
    }
    await clearPendingActions();
};

export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            syncOfflineData();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
};
