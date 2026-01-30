# Feedback UI System Documentation

## Overview

This documentation covers the comprehensive feedback UI system implemented in the OpenFare application. The system provides essential user feedback mechanisms including toasts, modals, and loaders to create a responsive, accessible, and human-centered user experience.

## Table of Contents

- [Core Components](#core-components)
- [Accessibility Features](#accessibility-features)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Integration Guide](#integration-guide)
- [Best Practices](#best-practices)

## Core Components

### 1. Toast Notifications

Toast notifications provide instant feedback for user actions and system events. Built with [Sonner](https://sonner.emilkowal.dev/), our toast system offers:

- **Position**: Top-right placement for optimal visibility
- **Auto-dismiss**: Automatically disappears after 4 seconds
- **Variants**: Success, Error, Warning, Info, and Loading states
- **Accessibility**: Screen reader support with proper ARIA attributes
- **Customization**: Rich colors, icons, and action buttons

#### Implementation Files
- `src/components/ui/Toast.tsx` - Core toast component and provider
- `src/hooks/useToast.ts` - Custom hook for toast management

### 2. Modal Dialogs

Accessible modal dialogs for user interactions and confirmations with:

- **Focus Management**: Automatic focus trapping and restoration
- **Keyboard Navigation**: ESC key to close, tab navigation
- **Semantic Markup**: Proper ARIA roles and labels
- **Multiple Sizes**: sm, md, lg, xl variants
- **Confirmation Modals**: Pre-built confirmation dialogs

#### Implementation Files
- `src/components/ui/Modal.tsx` - Modal and ConfirmModal components
- `src/hooks/useModal.ts` - Custom hook for modal management

### 3. Loading Indicators

Visual feedback for ongoing operations including:

- **Spinner**: Multiple sizes and color variants
- **Full Screen Loader**: Overlay with backdrop
- **Inline Loader**: Contextual loading states
- **Button Loader**: Loading state integrated with buttons
- **Progress Bar**: Determinate progress indication
- **Refresh Indicator**: Pull-to-refresh style component

#### Implementation Files
- `src/components/ui/Loader.tsx` - All loader components
- `src/hooks/useLoading.ts` - Loading state management

## Accessibility Features

### Keyboard Navigation
- **ESC key**: Closes modals and dismisses toasts
- **Tab navigation**: Focus trapping within modals
- **Enter/Space**: Activates focused elements

### Screen Reader Support
- `aria-live="polite"` for dynamic content updates
- `aria-modal="true"` for modal dialogs
- `role="status"` for loading indicators
- Proper labeling with `aria-label` attributes

### Focus Management
- Automatic focus on first interactive element in modals
- Focus restoration after modal closure
- Body scroll prevention during modal open

## Usage Examples

### Toast Notifications

```typescript
import { useToast } from '@/hooks/useToast';

function MyComponent() {
  const toast = useToast();
  
  const handleSave = async () => {
    try {
      // Show loading toast
      const toastId = toast.loading('Saving data...');
      
      await saveData();
      
      // Dismiss loading and show success
      toast.dismiss(toastId);
      toast.success('Data saved successfully!');
      
    } catch (error) {
      toast.error('Failed to save data');
    }
  };
  
  const handleAsyncOperation = () => {
    toast.promise(
      apiCall(),
      {
        loading: 'Processing...',
        success: 'Operation completed!',
        error: 'Something went wrong'
      }
    );
  };
  
  return (
    <button onClick={handleSave}>
      Save Data
    </button>
  );
}
```

### Modal Dialogs

```typescript
import { useModal } from '@/hooks/useModal';

function MyComponent() {
  const { showModal, showConfirmModal } = useModal();
  
  const openCustomModal = () => {
    showModal(
      'Edit Profile',
      <ProfileForm />,
      {
        size: 'lg',
        onClose: () => console.log('Modal closed')
      }
    );
  };
  
  const handleDelete = () => {
    showConfirmModal(
      'Delete Account',
      'Are you sure you want to delete your account?',
      () => {
        // Perform deletion
        deleteAccount();
      },
      {
        confirmText: 'Delete',
        confirmVariant: 'danger'
      }
    );
  };
  
  return (
    <div>
      <button onClick={openCustomModal}>Edit Profile</button>
      <button onClick={handleDelete}>Delete Account</button>
    </div>
  );
}
```

### Loading Indicators

```typescript
import { useLoading } from '@/hooks/useLoading';
import { ButtonLoader, ProgressBar } from '@/components';

function MyComponent() {
  const [progress, setProgress] = useState(0);
  const { isLoading, withLoading } = useLoading();
  
  const handleOperation = async () => {
    await withLoading(async () => {
      // Your async operation here
      await processData();
    });
  };
  
  const updateProgress = () => {
    // Simulate progress update
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };
  
  return (
    <div>
      <ButtonLoader isLoading={isLoading}>
        <button onClick={handleOperation}>Process Data</button>
      </ButtonLoader>
      
      <ProgressBar progress={progress} />
      <button onClick={updateProgress}>Update Progress</button>
    </div>
  );
}
```

## API Reference

### useToast Hook

```typescript
const toast = useToast();

// Basic toast methods
toast.success(message: string, options?: object)
toast.error(message: string, options?: object)
toast.warning(message: string, options?: object)
toast.info(message: string, options?: object)
toast.loading(message: string, options?: object)

// Advanced methods
toast.dismiss(toastId?: string | number)
toast.promise<T>(
  promise: Promise<T>,
  options: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  }
)
```

### useModal Hook

```typescript
const { 
  modal, 
  showModal, 
  closeModal,
  confirmModal,
  showConfirmModal,
  closeConfirmModal 
} = useModal();

// Show custom modal
showModal(
  title: string,
  content: ReactNode,
  options?: {
    size?: "sm" | "md" | "lg" | "xl";
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    onClose?: () => void;
  }
)

// Show confirmation modal
showConfirmModal(
  title: string,
  message: string,
  onConfirm: () => void,
  options?: {
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: "primary" | "danger";
  }
)
```

### useLoading Hook

```typescript
const { isLoading, showLoading, withLoading } = useLoading();

// Manual loading control
showLoading(true);  // Start loading
showLoading(false); // Stop loading

// Automatic loading wrapper
const result = await withLoading(async () => {
  return await someAsyncOperation();
});
```

## Integration Guide

### 1. Setup

The feedback system is already integrated into the application layout:

```typescript
// In src/app/layout.tsx
import { ToastProvider } from '@/components';

export default function RootLayout({ children }) {
  return (
    <UIProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </UIProvider>
  );
}
```

### 2. Context Integration

The system integrates with the existing UIContext for centralized state management:

```typescript
// Access through useUI hook
const { 
  modal, 
  confirmModal, 
  isLoading,
  openModal,
  closeModal,
  openConfirmModal,
  closeConfirmModal,
  showLoading
} = useUI();
```

### 3. Component Usage

All components are properly exported and can be imported directly:

```typescript
// Individual imports
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Spinner, ProgressBar } from '@/components/ui/Loader';
import { showToast } from '@/components/ui/Toast';

// Or through the main index
import { 
  Modal, 
  Spinner, 
  ProgressBar, 
  showToast 
} from '@/components';
```

## Best Practices

### Toast Notifications

✅ **DO:**
- Use success toasts for completed actions
- Use error toasts for failed operations
- Include descriptive messages
- Use loading toasts for longer operations
- Keep messages concise and actionable

❌ **DON'T:**
- Overuse toasts (max 3 visible at once)
- Use toasts for critical information that requires action
- Make toasts too long or complex
- Rely solely on toasts for important feedback

### Modal Dialogs

✅ **DO:**
- Use modals for important decisions
- Keep modal content focused and concise
- Provide clear action buttons
- Support keyboard navigation
- Include proper headings and labels

❌ **DON'T:**
- Use modals for simple confirmations that could be inline
- Create modals with complex forms without proper validation
- Block essential functionality with non-critical modals
- Forget to handle ESC key and overlay clicks

### Loading Indicators

✅ **DO:**
- Show loaders for operations > 500ms
- Use appropriate loader type for context
- Provide meaningful loading messages
- Maintain user context during loading
- Show progress when duration is predictable

❌ **DON'T:**
- Show loaders for instant operations
- Use full-screen loaders unnecessarily
- Leave loaders spinning indefinitely
- Block user interaction unnecessarily

## UX Principles

### 1. Non-Intrusive Feedback
Feedback should inform without disrupting the user's workflow. Toasts appear discretely, modals only when necessary, and loaders provide context without blocking.

### 2. Clear Communication
Each feedback element clearly communicates its purpose:
- Success = Green/Check icon
- Error = Red/X icon  
- Warning = Yellow/Triangle icon
- Info = Blue/Info icon

### 3. Accessible Design
Full keyboard navigation, screen reader support, proper focus management, and semantic HTML ensure all users can interact with feedback elements.

### 4. Consistent Timing
- Toasts: Auto-dismiss after 4 seconds
- Modals: User-controlled dismissal
- Loaders: Appear immediately for >500ms operations

## Demo and Testing

A comprehensive demo page is available at `/demo/feedback` showcasing all components in action with interactive examples.

### Testing Checklist

- [ ] Toasts appear and auto-dismiss correctly
- [ ] Modals trap focus and handle ESC key
- [ ] Loaders show during async operations
- [ ] Screen readers announce feedback properly
- [ ] Keyboard navigation works in all components
- [ ] Mobile responsiveness is maintained

## Dependencies

- [Sonner](https://sonner.emilkowal.dev/) - Toast notifications
- [Lucide React](https://lucide.dev/) - Icons
- React Context API - State management
- Tailwind CSS - Styling

## Contributing

When adding new feedback components:

1. Follow existing accessibility patterns
2. Maintain consistent API design
3. Add comprehensive TypeScript typing
4. Include usage examples in documentation
5. Test with screen readers and keyboard navigation
6. Ensure mobile responsiveness

---

*This feedback UI system was implemented following modern accessibility standards and best practices for user experience design.*