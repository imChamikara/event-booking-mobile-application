import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast } from '../components/Toast';

export type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean; duration: number } | null>(null);

  const showToast = useCallback(({ message, type = 'info', duration = 3000 }: ToastOptions) => {
    setToast({ message, type, visible: true, duration });
    
    // Auto hide is handled by the Toast component itself via useEffect and timeout
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => prev ? { ...prev, visible: false } : null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onHide={hideToast}
          duration={toast.duration}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
