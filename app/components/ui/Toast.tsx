'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast = ({ message, type = 'info', duration = 5000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);

    // Auto close
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-emerald-600" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-amber-600" />;
      case 'info':
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getStyles = () => {
    const base = 'shadow-lg border backdrop-blur-md';
    switch (type) {
      case 'success':
        return `${base} bg-gradient-to-br from-emerald-50/95 to-emerald-100/95 border-emerald-200`;
      case 'error':
        return `${base} bg-gradient-to-br from-red-50/95 to-red-100/95 border-red-200`;
      case 'warning':
        return `${base} bg-gradient-to-br from-amber-50/95 to-amber-100/95 border-amber-200`;
      case 'info':
      default:
        return `${base} bg-gradient-to-br from-blue-50/95 to-blue-100/95 border-blue-200`;
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`w-full max-w-md transform transition-all duration-300 ease-out ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} `}
    >
      <div className={`${getStyles()} flex items-start gap-3 rounded-xl p-4`}>
        <div className="mt-0.5 flex-shrink-0" aria-hidden="true">
          {getIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium break-words text-slate-800">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 rounded text-slate-400 transition-colors hover:text-slate-600 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
