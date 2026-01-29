"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface UIContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  notifications: { id: string; message: string; type: "info" | "success" | "warning" | "error" }[];
  addNotification: (message: string, type: "info" | "success" | "warning" | "error") => void;
  removeNotification: (id: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: "info" | "success" | "warning" | "error" }[]>([]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));
  
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const addNotification = (message: string, type: "info" | "success" | "warning" | "error") => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <UIContext.Provider 
      value={{ 
        theme, 
        toggleTheme, 
        sidebarOpen, 
        toggleSidebar,
        notifications,
        addNotification,
        removeNotification
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext() {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUIContext must be used within a UIProvider");
  return context;
}