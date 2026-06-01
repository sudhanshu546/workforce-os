import { openDB } from 'idb';
import api from './api';

const DB_NAME = 'WorkforceOfflineDB';
const DB_VERSION = 1;

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            db.createObjectStore('tasks', { keyPath: 'id' });
            db.createObjectStore('attendance', { keyPath: 'id', autoIncrement: true });
            db.createObjectStore('pending_actions', { keyPath: 'id', autoIncrement: true });
        },
    });
};

export const saveTasksOffline = async (tasks: any[]) => {
    const db = await initDB();
    const tx = db.transaction('tasks', 'readwrite');
    for (const task of tasks) {
        await tx.store.put(task);
    }
    await tx.done;
};

export const getTasksOffline = async () => {
    const db = await initDB();
    return await db.getAll('tasks');
};

export const queueAction = async (url: string, payload: any, method: string = 'POST') => {
    const db = await initDB();
    await db.add('pending_actions', { url, payload, method, timestamp: Date.now() });
};

export const getPendingActions = async () => {
    const db = await initDB();
    return await db.getAll('pending_actions');
};

export const clearPendingActions = async () => {
    const db = await initDB();
    await db.clear('pending_actions');
};

export const syncOfflineData = async () => {
    const actions = await getPendingActions();
    if (actions.length === 0) return;

    console.log(`[Offline Sync] Attempting to sync ${actions.length} actions...`);
    
    // Sort by timestamp to ensure chronological order
    const sortedActions = [...actions].sort((a, b) => a.timestamp - b.timestamp);
    const failedActions = [];

    for (const action of sortedActions) {
        try {
            // Include a 'last_modified' header to help the backend detect conflicts
            await api.request({
                url: action.url,
                method: action.method,
                data: { ...action.payload, _offline_ts: action.timestamp },
                headers: { 'X-Sync-Timestamp': action.timestamp.toString() }
            });
        } catch (error: any) {
            // If it's a conflict (409) or validation error (400), we might want to drop or flag it
            if (error.status === 409) {
                console.warn('[Offline Sync] Conflict detected for action:', action);
                // Last-Write-Wins logic: The server already has a newer version
            } else {
                failedActions.push(action);
            }
        }
    }

    await clearPendingActions();
    
    // Re-queue only the actions that failed due to network issues, not logic conflicts
    if (failedActions.length > 0) {
        const db = await initDB();
        for (const action of failedActions) {
            await db.add('pending_actions', action);
        }
    }
};
