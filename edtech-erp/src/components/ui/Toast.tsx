import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { removeToast } from '@/store/slices/uiSlice';
import type { Toast } from '@/types';

const TOAST_ICONS: Record<Toast['type'], React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />,
  error: <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />,
  info: <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />,
};

const TOAST_STYLES: Record<Toast['type'], string> = {
  success: 'border-emerald-200 dark:border-emerald-800',
  error: 'border-red-200 dark:border-red-800',
  warning: 'border-amber-200 dark:border-amber-800',
  info: 'border-blue-200 dark:border-blue-800',
};

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const duration = toast.duration ?? 4000;
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), duration);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 bg-card border rounded-xl shadow-elevated px-4 py-3.5 w-full max-w-sm animate-fade-in',
        TOAST_STYLES[toast.type]
      )}
      role="alert"
    >
      {TOAST_ICONS[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold font-display text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useAppSelector((s) => s.ui);

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 items-end pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
