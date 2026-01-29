import { useUIContext } from "@/context/UIContext";

export function useUI() {
  const { 
    theme, 
    toggleTheme, 
    sidebarOpen, 
    toggleSidebar,
    notifications,
    addNotification,
    removeNotification
  } = useUIContext();

  return {
    theme,
    toggleTheme,
    sidebarOpen,
    toggleSidebar,
    notifications,
    addNotification,
    removeNotification,
  };
}