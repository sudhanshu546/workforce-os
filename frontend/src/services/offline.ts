import { openDB } from 'idb';

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
