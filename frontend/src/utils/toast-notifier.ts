type ToastType = 'success' | 'error' | 'info';

type ToastListener = (message: string, type: ToastType) => void;

let listener: ToastListener | null = null;

export const toastNotifier = {
    subscribe: (fn: ToastListener) => {
        listener = fn;
    },
    show: (message: string, type: ToastType = 'info') => {
        if (listener) {
            listener(message, type);
        } else {
            console.warn('[ToastNotifier] No listener registered. Message:', message);
        }
    }
};
