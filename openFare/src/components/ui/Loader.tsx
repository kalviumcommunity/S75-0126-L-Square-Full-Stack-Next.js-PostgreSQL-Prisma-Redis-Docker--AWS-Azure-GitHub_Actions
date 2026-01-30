"use client";

import { Loader2, RefreshCw } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8",
};

const colorClasses = {
  primary: "text-blue-600",
  secondary: "text-gray-500",
  white: "text-white",
};

export function Spinner({ 
  size = "md", 
  color = "primary",
  className = "" 
}: SpinnerProps) {
  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`} 
    />
  );
}

interface FullScreenLoaderProps {
  message?: string;
  showBackdrop?: boolean;
}

export function FullScreenLoader({ 
  message = "Loading...", 
  showBackdrop = true 
}: FullScreenLoaderProps) {
  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        ${showBackdrop ? "bg-white bg-opacity-75" : ""}
      `}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="lg" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

interface InlineLoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function InlineLoader({ 
  message = "Loading...", 
  size = "md" 
}: InlineLoaderProps) {
  return (
    <div 
      className="flex items-center space-x-2"
      role="status"
      aria-live="polite"
    >
      <Spinner size={size} />
      <span className="text-gray-600">{message}</span>
    </div>
  );
}

interface ButtonLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  size?: "sm" | "md" | "lg";
}

export function ButtonLoader({ 
  isLoading, 
  children, 
  loadingText = "Loading...",
  size = "sm"
}: ButtonLoaderProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="flex items-center justify-center space-x-2">
      <Spinner size={size} color="white" />
      <span>{loadingText}</span>
    </div>
  );
}

// Progress bar loader
interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
}

export function ProgressBar({ progress, className = "" }: ProgressBarProps) {
  return (
    <div 
      className={`w-full bg-gray-200 rounded-full h-2 ${className}`}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}

// Refresh indicator
interface RefreshIndicatorProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  className?: string;
}

export function RefreshIndicator({ 
  isRefreshing, 
  onRefresh,
  className = "" 
}: RefreshIndicatorProps) {
  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className={`
        p-2 rounded-full hover:bg-gray-100 transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className}
        ${isRefreshing ? "cursor-not-allowed" : "cursor-pointer"}
      `}
      aria-label={isRefreshing ? "Refreshing..." : "Refresh"}
    >
      <RefreshCw 
        className={`
          h-5 w-5 text-gray-600
          ${isRefreshing ? "animate-spin" : "hover:text-gray-800"}
        `} 
      />
    </button>
  );
}

export default {
  Spinner,
  FullScreenLoader,
  InlineLoader,
  ButtonLoader,
  ProgressBar,
  RefreshIndicator
};