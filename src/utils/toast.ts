// src/utils/toast.ts
import { toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';
// Default options (customize as needed)
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'colored',
};

// Specialized helpers for different toast types
export const toastSuccess = (message: string, options?: ToastOptions) =>
  toast.success(message, { ...defaultOptions, ...options });

export const toastError = (message: string, options?: ToastOptions) =>
  toast.error(message, { ...defaultOptions, ...options });

export const toastInfo = (message: string, options?: ToastOptions) =>
  toast.info(message, { ...defaultOptions, ...options });

export const toastWarning = (message: string, options?: ToastOptions) =>
  toast.warning(message, { ...defaultOptions, ...options });

// For simple default toasts
export const toastDefault = (message: string, options?: ToastOptions) =>
  toast(message, { ...defaultOptions, ...options });
