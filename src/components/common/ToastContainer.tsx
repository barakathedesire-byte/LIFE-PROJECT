import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let bg = 'bg-neutral-900 text-white border-neutral-800';
        let icon = <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />;

        if (toast.type === 'error') {
          bg = 'bg-red-900 text-white border-red-800';
          icon = <AlertCircle className="text-red-300 shrink-0" size={18} />;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-900 text-white border-amber-800';
          icon = <AlertTriangle className="text-amber-300 shrink-0" size={18} />;
        } else if (toast.type === 'info') {
          bg = 'bg-neutral-900 text-white border-neutral-700';
          icon = <Info className="text-sky-400 shrink-0" size={18} />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-xl border flex items-start gap-3 transform transition-all duration-300 animate-in slide-in-from-bottom-2 ${bg}`}
          >
            {icon}
            <div className="flex-1 text-xs sm:text-sm">
              {toast.title && <div className="font-bold text-white mb-0.5">{toast.title}</div>}
              <div className="text-neutral-200 leading-snug">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-white p-0.5 rounded transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
