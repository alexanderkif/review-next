'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  onConfirm,
  onCancel
}: ConfirmDialogProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setIsVisible(false), 10);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmBtn: 'bg-gradient-to-r from-red-600 to-red-700 text-white'
        };
      case 'warning':
        return {
          icon: 'text-amber-600',
          iconBg: 'bg-amber-100',
          confirmBtn: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
        };
      case 'info':
      default:
        return {
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100',
          confirmBtn: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    setIsVisible(false);
    setTimeout(() => {
      onConfirm();
    }, 200);
  };

  const handleCancel = () => {
    setIsVisible(false);
    setTimeout(() => {
      onCancel();
    }, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center`}>
            <AlertTriangle className={styles.icon} size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">
              {message}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-6 pb-6">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 hover:text-slate-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm ${styles.confirmBtn} shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
