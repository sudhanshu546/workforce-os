import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toastNotifier } from '../utils/toast-notifier';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

type ToastContextType = (message: string, type?: 'success' | 'error' | 'info') => void;

const ToastContext = createContext<ToastContextType>(() => {});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  // Register the showToast function with our central notifier
  useEffect(() => {
    toastNotifier.subscribe(showToast);
  }, [showToast]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{ 
            padding: '16px 24px', 
            borderRadius: '12px', 
            color: 'white', 
            fontWeight: '600',
            background: toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#22c55e' : '#3b82f6',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            {toast.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
