"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ModalState {
  isOpen: boolean;
  title: string;
  content: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  onClose?: () => void;
}

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger";
}

interface UIContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  notifications: { id: string; message: string; type: "info" | "success" | "warning" | "error" }[];
  addNotification: (message: string, type: "info" | "success" | "warning" | "error") => void;
  removeNotification: (id: string) => void;
  // Modal state
  modal: ModalState;
  openModal: (modal: Omit<ModalState, "isOpen">) => void;
  closeModal: () => void;
  // Confirm modal state
  confirmModal: ConfirmModalState;
  openConfirmModal: (modal: Omit<ConfirmModalState, "isOpen">) => void;
  closeConfirmModal: () => void;
  // Loading state
  isLoading: boolean;
  showLoading: (loading?: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: "info" | "success" | "warning" | "error" }[]>([]);
  const [modal, setModal] = useState<ModalState>({ 
    isOpen: false, 
    title: "", 
    content: null 
  });
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ 
    isOpen: false, 
    title: "", 
    message: "",
    onConfirm: () => {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notificationIdCounter, setNotificationIdCounter] = useState(0);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));
  
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const addNotification = (message: string, type: "info" | "success" | "warning" | "error") => {
    const id = `notification-${notificationIdCounter}`;
    setNotificationIdCounter(prev => prev + 1);
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const openModal = (modalConfig: Omit<ModalState, "isOpen">) => {
    setModal({
      ...modalConfig,
      isOpen: true
    });
  };

  const closeModal = () => {
    setModal(prev => ({
      ...prev,
      isOpen: false
    }));
    // Call onClose callback if provided
    if (modal.onClose) {
      modal.onClose();
    }
  };

  const openConfirmModal = (modalConfig: Omit<ConfirmModalState, "isOpen">) => {
    setConfirmModal({
      ...modalConfig,
      isOpen: true
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  const showLoading = (loading: boolean = true) => {
    setIsLoading(loading);
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
        removeNotification,
        modal,
        openModal,
        closeModal,
        confirmModal,
        openConfirmModal,
        closeConfirmModal,
        isLoading,
        showLoading
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