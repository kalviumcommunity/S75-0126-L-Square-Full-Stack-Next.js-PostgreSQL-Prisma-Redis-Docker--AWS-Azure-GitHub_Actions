"use client";

import { useState, useEffect, useRef } from "react";
import { Card, Button } from "@/components";
import { 
  Spinner, 
  FullScreenLoader, 
  InlineLoader, 
  ButtonLoader, 
  ProgressBar,
  RefreshIndicator 
} from "@/components/ui/Loader";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/hooks/useToast";
import { useModal } from "@/hooks/useModal";
import { useLoading } from "@/hooks/useLoading";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  Loader2
} from "lucide-react";

export default function FeedbackDemoPage() {
  const [progress, setProgress] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showProgressCompleted, setShowProgressCompleted] = useState(false);
  const hasShownProgressToast = useRef(false);
  
  const toast = useToast();
  const { showModal, closeModal, showConfirmModal, closeConfirmModal } = useModal();
  const { isLoading, withLoading } = useLoading();

  // Demo functions
  const simulateAsyncOperation = () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve("Operation completed!"), 2000);
    });
  };

  const handleSuccessToast = () => {
    toast.success("Operation completed successfully!", {
      description: "Your data has been saved"
    });
  };

  const handleErrorToast = () => {
    toast.error("Something went wrong!", {
      description: "Please try again later"
    });
  };

  const handleWarningToast = () => {
    toast.warning("Warning message", {
      description: "This is just a warning"
    });
  };

  const handleInfoToast = () => {
    toast.info("Information message", {
      description: "Here's some useful information"
    });
  };

  const handlePromiseToast = () => {
    toast.promise(
      simulateAsyncOperation(),
      {
        loading: "Processing...",
        success: "Data processed successfully!",
        error: "Failed to process data"
      }
    );
  };

  const handleCustomModal = () => {
    setShowCustomModal(true);
  };

  const handleConfirmAction = () => {
    toast.success("Action confirmed!");
  };

  const handleDeleteConfirm = () => {
    showConfirmModal(
      "Delete Item",
      "Are you sure you want to delete this item? This action cannot be undone.",
      () => {
        toast.success("Item deleted successfully!");
      },
      {
        confirmText: "Delete",
        confirmVariant: "danger"
      }
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    toast.success("Data refreshed!");
  };

  const handleLoadingOperation = async () => {
    await withLoading(async () => {
      await simulateAsyncOperation();
      toast.success("Loading operation completed!");
    });
  };

  const handleProgressUpdate = () => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowProgressCompleted(true); // Trigger effect to show toast
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  // Effect to show toast when progress completes
  useEffect(() => {
    if (showProgressCompleted && !hasShownProgressToast.current) {
      toast.success("Progress completed!");
      hasShownProgressToast.current = true;
      
      // Reset the flag after a delay to allow reuse
      setTimeout(() => {
        hasShownProgressToast.current = false;
      }, 100);
    }
  }, [showProgressCompleted, toast]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback UI Components Demo</h1>
        <p className="text-gray-600">
          Interactive demonstration of toasts, modals, and loaders for user feedback
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Toasts Section */}
        <Card title="Toast Notifications">
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Instant feedback notifications that appear at the top-right of the screen
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleSuccessToast} variant="primary">
                <CheckCircle className="h-4 w-4 mr-2" />
                Success
              </Button>
              <Button onClick={handleErrorToast} variant="danger">
                <XCircle className="h-4 w-4 mr-2" />
                Error
              </Button>
              <Button onClick={handleWarningToast} variant="secondary">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Warning
              </Button>
              <Button onClick={handleInfoToast} variant="secondary">
                <Info className="h-4 w-4 mr-2" />
                Info
              </Button>
            </div>
            
            <Button 
              onClick={handlePromiseToast} 
              variant="primary" 
              className="w-full"
            >
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Promise Toast
            </Button>
          </div>
        </Card>

        {/* Modals Section */}
        <Card title="Modal Dialogs">
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Accessible modal dialogs for user interactions and confirmations
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleCustomModal}
                variant="primary"
                className="w-full"
              >
                Open Custom Modal
              </Button>
              
              <Button 
                onClick={handleDeleteConfirm}
                variant="danger"
                className="w-full"
              >
                Delete Confirmation
              </Button>
            </div>
          </div>
        </Card>

        {/* Loaders Section */}
        <Card title="Loading Indicators">
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Spinner Variants</h3>
              <div className="flex items-center space-x-4">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <Spinner size="md" color="secondary" />
                <Spinner size="md" color="white" />
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Inline Loaders</h3>
              <div className="space-y-2">
                <InlineLoader message="Loading data..." />
                <InlineLoader message="Processing..." size="sm" />
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Button Loaders</h3>
              <div className="flex space-x-3">
                <ButtonLoader isLoading={true}>
                  <span>Save Changes</span>
                </ButtonLoader>
                <Button variant="primary" onClick={handleLoadingOperation}>
                  Async Operation
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Progress Bar</h3>
              <div className="space-y-3">
                <ProgressBar progress={progress} />
                <Button onClick={handleProgressUpdate} variant="secondary" size="sm">
                  Update Progress
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Refresh Indicator</h3>
              <RefreshIndicator 
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            </div>
          </div>
        </Card>

        {/* Integration Demo */}
        <Card title="Integration Demo">
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Combined feedback flow demonstration
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Complete Flow Example</h4>
              <p className="text-gray-600 text-sm mb-4">
                This demonstrates a typical user flow: loading → confirmation → processing → success
              </p>
              
              <Button 
                onClick={async () => {
                  // Show loading
                  const toastId = toast.loading("Preparing operation...");
                  
                  // Simulate preparation
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
                  // Show confirmation
                  showConfirmModal(
                    "Process Data",
                    "This will process all your data. Are you sure you want to continue?",
                    async () => {
                      // Dismiss loading toast
                      toast.dismiss(toastId);
                      
                      // Show processing toast
                      const processingToast = toast.loading("Processing data...");
                      
                      // Simulate processing
                      await new Promise(resolve => setTimeout(resolve, 2000));
                      
                      // Show success
                      toast.dismiss(processingToast);
                      toast.success("Data processed successfully!", {
                        description: "All operations completed"
                      });
                    }
                  );
                }}
                variant="primary"
                className="w-full"
              >
                Start Complete Flow
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Custom Modal */}
      <Modal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        title="Custom Modal Example"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This is a custom modal with various content types. You can include forms, 
            images, or any other React components here.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Feature Highlight</h4>
            <p className="text-blue-800 text-sm">
              Modals are great for focused user interactions and can contain complex content
              while maintaining accessibility standards.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowCustomModal(false)}>
              Close
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                toast.success("Custom action completed!");
                setShowCustomModal(false);
              }}
            >
              Take Action
            </Button>
          </div>
        </div>
      </Modal>

      {/* Full Screen Loader Demo */}
      {isLoading && (
        <FullScreenLoader message="Processing your request..." />
      )}
    </div>
  );
}