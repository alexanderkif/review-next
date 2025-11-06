// Helper type for standalone toast usage
// This is a type-only export to help with toast function signatures
export type ToastFunction = (message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
