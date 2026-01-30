import { useUIContext } from "@/context/UIContext";

export function useLoading() {
  const { isLoading, showLoading } = useUIContext();

  const withLoading = async <T,>(asyncFunction: () => Promise<T>): Promise<T> => {
    showLoading(true);
    try {
      const result = await asyncFunction();
      return result;
    } finally {
      showLoading(false);
    }
  };

  return {
    isLoading,
    showLoading,
    withLoading
  };
}