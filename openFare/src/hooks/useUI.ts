import { useUIContext } from "@/context/UIContext";

export function useUI() {
  const { 
    theme, 
    toggleTheme, 
    sidebarOpen, 
    toggleSidebar,
    notifications,
    addNotification,
    removeNotification,
    modal,
    openModal,
    closeModal,
    confirmModal,
    openConfirmModal,
    closeConfirmModal,
    isLoading,
    showLoading
  } = useUIContext();

  return {
    theme,
    toggleTheme,
    sidebarOpen,
    toggleSidebar,
    notifications,
    addNotification,
    removeNotification,
    modal,
    openModal,
    closeModal,
    confirmModal,
    openConfirmModal,
    closeConfirmModal,
    isLoading,
    showLoading,
  };
}