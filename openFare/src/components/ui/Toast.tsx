"use client";

import { Toaster, toast } from "sonner";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        richColors
        expand
        closeButton
        toastOptions={{
          className: "shadow-lg border border-gray-200",
          duration: 4000,
          style: {
            background: "white",
            border: "1px solid #e5e7eb",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          },
        }}
      />
    </>
  );
}

// Toast utility functions
export const showToast = {
  success: (message: string, options?: object) => {
    return toast.success(message, { 
      ...options, 
      icon: <CheckCircle className="h-5 w-5 text-green-500" /> 
    });
  },
  
  error: (message: string, options?: object) => {
    return toast.error(message, { 
      ...options, 
      icon: <XCircle className="h-5 w-5 text-red-500" /> 
    });
  },
  
  warning: (message: string, options?: object) => {
    return toast.warning(message, { 
      ...options, 
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" /> 
    });
  },
  
  info: (message: string, options?: object) => {
    return toast.info(message, { 
      ...options, 
      icon: <Info className="h-5 w-5 text-blue-500" /> 
    });
  },
  
  loading: (message: string, options?: object) => {
    return toast.loading(message, options);
  },
  
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },
  
  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => toast.promise(promise, options),
};

export default ToastProvider;