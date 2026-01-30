import { useUIContext } from "@/context/UIContext";
import { ReactNode } from "react";

export function useModal() {
  const { 
    modal, 
    openModal, 
    closeModal,
    confirmModal,
    openConfirmModal,
    closeConfirmModal
  } = useUIContext();

  const showModal = (
    title: string,
    content: ReactNode,
    options?: {
      size?: "sm" | "md" | "lg" | "xl";
      showCloseButton?: boolean;
      closeOnOverlayClick?: boolean;
      onClose?: () => void;
    }
  ) => {
    openModal({
      title,
      content,
      size: options?.size || "md",
      showCloseButton: options?.showCloseButton ?? true,
      closeOnOverlayClick: options?.closeOnOverlayClick ?? true,
      onClose: options?.onClose
    });
  };

  const showConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      confirmVariant?: "primary" | "danger";
    }
  ) => {
    openConfirmModal({
      title,
      message,
      onConfirm,
      confirmText: options?.confirmText || "Confirm",
      cancelText: options?.cancelText || "Cancel",
      confirmVariant: options?.confirmVariant || "primary"
    });
  };

  return {
    // Modal state
    modal,
    showModal,
    closeModal,
    // Confirm modal state
    confirmModal,
    showConfirmModal,
    closeConfirmModal
  };
}