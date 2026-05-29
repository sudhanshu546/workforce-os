import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getPendingActions, clearPendingActions } from './offline';
import { toastNotifier } from '../utils/toast-notifier';

export const syncOfflineData = async () => {
    const pendingActions = await getPendingActions();
    
    if (pendingActions.length === 0) return;

    toastNotifier.show(`Reconnected! Syncing ${pendingActions.length} pending actions...`, 'info');

    let successCount = 0;
    for (const action of pendingActions) {
        try {
            const method = action.method?.toLowerCase();
            if (method === 'post') await api.post(action.url, action.payload);
            else if (method === 'patch') await api.patch(action.url, action.payload);
            else if (method === 'delete') await api.delete(action.url, { data: action.payload });
            successCount++;
        } catch (err) {
            console.error('Failed to sync action:', action, err);
        }
    }

    if (successCount > 0) {
        await clearPendingActions();
        toastNotifier.show(`Sync complete! ${successCount} actions synchronized.`, 'success');
        // Note: For better UX, instead of full reload, trigger a global state refresh or event
        // window.location.reload(); 
    }
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
