'use client';

import { toast as sonnerToast, Toaster as SonnerToaster } from 'sonner';
import React, { ReactNode } from 'react';

interface ToastOptions {
  id?: string;
  duration?: number;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  onAutoClose?: () => void;
  className?: string;
  description?: ReactNode;
}

// Interface for object-style toast params
interface ToastParams {
  title?: ReactNode;
  description?: ReactNode;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
  action?: ToastOptions['action'];
  cancel?: ToastOptions['cancel'];
  onDismiss?: () => void;
  onAutoClose?: () => void;
  className?: string;
  icon?: ReactNode;
}

// Function to handle object-style toast calls
function handleObjectStyleToast(params: ToastParams) {
  const { title, description, variant, duration, ...rest } = params;
  
  // Convert variant to Sonner toast type
  if (variant === 'destructive') {
    return sonnerToast.error(title as string, {
      description,
      duration,
      ...rest
    });
  } else if (variant === 'success') {
    return sonnerToast.success(title as string, {
      description,
      duration,
      ...rest
    });
  } else {
    return sonnerToast(title as string, {
      description,
      duration,
      ...rest
    });
  }
}

// Main toast function that handles both styles
function toast(messageOrParams: ReactNode | ToastParams, options?: ToastOptions) {
  // Check if it's an object-style call (but not a React element)
  if (typeof messageOrParams === 'object' && messageOrParams !== null && !React.isValidElement(messageOrParams)) {
    return handleObjectStyleToast(messageOrParams as ToastParams);
  }
  
  // Standard Sonner toast call
  return sonnerToast(messageOrParams as ReactNode, options);
}

// Original methods
toast.success = (message: ReactNode, options?: ToastOptions) => {
  return sonnerToast.success(message, options);
};

toast.error = (message: ReactNode, options?: ToastOptions) => {
  return sonnerToast.error(message, options);
};

toast.warning = (message: ReactNode, options?: ToastOptions) => {
  return sonnerToast.warning(message, options);
};

toast.info = (message: ReactNode, options?: ToastOptions) => {
  return sonnerToast.info(message, options);
};

toast.promise = <T,>(
  promise: Promise<T>,
  {
    loading,
    success,
    error,
    ...options
  }: {
    loading: ReactNode;
    success: ReactNode | ((data: T) => ReactNode);
    error: ReactNode | ((error: unknown) => ReactNode);
  } & ToastOptions
) => {
  return sonnerToast.promise(promise, {
    loading,
    success,
    error,
    ...options
  });
};

toast.dismiss = (id?: string) => {
  return sonnerToast.dismiss(id);
};

function useToast() {
  return { toast };
}

// Export the Toaster component for use in your layout
export { SonnerToaster as Toaster };
export { useToast, toast };