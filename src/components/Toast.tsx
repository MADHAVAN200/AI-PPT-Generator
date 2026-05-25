import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, X, Trash2, Edit3, Download, Key } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'login' | 'delete' | 'save' | 'export';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    
    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 3500);
  }, [dismissToast]);

  // Visual helper for toast decoration
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'login':
        return {
          bg: 'bg-emerald-50 dark:bg-[#072c1c] border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-100',
          accent: 'bg-emerald-500 text-white',
          Icon: Key
        };
      case 'delete':
        return {
          bg: 'bg-red-50 dark:bg-[#2d1215] border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-105',
          accent: 'bg-red-500 text-white',
          Icon: Trash2
        };
      case 'save':
        return {
          bg: 'bg-indigo-50 dark:bg-[#0f152d] border-indigo-200 dark:border-indigo-900/60 text-indigo-800 dark:text-indigo-100',
          accent: 'bg-indigo-600 text-white',
          Icon: Edit3
        };
      case 'export':
        return {
          bg: 'bg-amber-50 dark:bg-[#291e12] border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-100',
          accent: 'bg-amber-500 text-white',
          Icon: Download
        };
      case 'error':
        return {
          bg: 'bg-rose-50 dark:bg-[#2d1215] border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-100',
          accent: 'bg-rose-500 text-white',
          Icon: AlertTriangle
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-[#291e12] border-amber-100 dark:border-amber-900/60 text-amber-800 dark:text-amber-100',
          accent: 'bg-amber-500 text-white',
          Icon: AlertTriangle
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-[#0d213a] border-blue-150 dark:border-blue-900/60 text-blue-800 dark:text-blue-100',
          accent: 'bg-blue-500 text-white',
          Icon: Info
        };
      case 'success':
      default:
        return {
          bg: 'bg-emerald-50 dark:bg-[#072c1c] border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-100',
          accent: 'bg-emerald-500 text-white',
          Icon: CheckCircle2
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Render Target Container (Fixed in the viewport, layered high) */}
      <div 
        id="toast-viewport-container"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-[420px] w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const styles = getToastStyles(toast.type);
            const IconComponent = styles.Icon;
            
            return (
              <motion.div
                key={toast.id}
                id={`toast-message-${toast.id}`}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className={`flex items-start gap-3.5 p-4 rounded-xl border shadow-xl backdrop-blur-md pointer-events-auto transition-colors duration-150 ${styles.bg}`}
              >
                {/* Accent Icon Tag */}
                <div className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${styles.accent}`}>
                  <IconComponent className="h-4.5 w-4.5 stroke-[2]" />
                </div>

                {/* Content Message */}
                <div className="flex-1 space-y-0.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider opacity-90 select-none">
                    {toast.title || toast.type.replace('-', ' ')}
                  </h4>
                  <p className="text-xs leading-relaxed font-semibold">
                    {toast.message}
                  </p>
                </div>

                {/* Dismiss interactive Button */}
                <button
                  type="button"
                  id={`btn-close-toast-${toast.id}`}
                  onClick={() => dismissToast(toast.id)}
                  className="p-1 hover:bg-slate-200/40 dark:hover:bg-slate-800/40 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer transition"
                  title="Close Notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
