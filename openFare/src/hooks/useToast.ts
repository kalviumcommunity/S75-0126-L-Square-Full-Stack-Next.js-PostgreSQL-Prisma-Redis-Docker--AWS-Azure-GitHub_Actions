import { useUIContext } from "@/context/UIContext";
import { showToast } from "@/components/ui/Toast";

// Custom hook that combines the UI context notifications with Sonner toast
export function useToast() {
  const { addNotification, removeNotification } = useUIContext();

  const toast = {
    success: (message: string, options?: object) => {
      addNotification(message, "success");
      return showToast.success(message, options);
    },
    
    error: (message: string, options?: object) => {
      addNotification(message, "error");
      return showToast.error(message, options);
    },
    
    warning: (message: string, options?: object) => {
      addNotification(message, "warning");
      return showToast.warning(message, options);
    },
    
    info: (message: string, options?: object) => {
      addNotification(message, "info");
      return showToast.info(message, options);
    },
    
    loading: (message: string, options?: object) => {
      return showToast.loading(message, options);
    },
    
    dismiss: (toastId?: string | number) => {
      showToast.dismiss(toastId);
    },
    
    promise: <T,>(
      promise: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: unknown) => string);
      }
    ) => showToast.promise(promise, options),
  };

  return toast;
}