'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
  onCancel,
}: ConfirmDialogProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const handleCancel = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onCancel();
    }, 200);
  }, [onCancel]);

  const handleConfirm = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onConfirm();
    }, 200);
  }, [onConfirm]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = 'hidden';

      // Focus the cancel button when dialog opens
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 100);
    } else {
      setTimeout(() => setIsVisible(false), 10);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Focus trap: handle Tab key to keep focus within dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
        return;
      }

      if (e.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusableElements = dialog.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleCancel]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmBtn: 'bg-gradient-to-r from-red-600 to-red-700 text-white',
        };
      case 'warning':
        return {
          icon: 'text-amber-600',
          iconBg: 'bg-amber-100',
          confirmBtn: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white',
        };
      case 'info':
      default:
        return {
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100',
          confirmBtn: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={`relative w-full max-w-md transform rounded-2xl bg-white shadow-2xl transition-all duration-300 ${
          isVisible ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div
            className={`h-12 w-12 flex-shrink-0 rounded-full ${styles.iconBg} flex items-center justify-center`}
            aria-hidden="true"
          >
            <AlertTriangle className={styles.icon} size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="dialog-title" className="mb-2 text-lg font-semibold text-slate-900">
              {title}
            </h3>
            <p id="dialog-description" className="text-sm whitespace-pre-wrap text-slate-600">
              {message}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="flex-shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-6 pb-6">
          <button
            ref={cancelButtonRef}
            onClick={handleCancel}
            className="flex-1 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium ${styles.confirmBtn} shadow-lg transition-all duration-200 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
