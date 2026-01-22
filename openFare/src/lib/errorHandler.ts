/**
 * Centralized error handling middleware for Next.js API routes
 * Provides consistent error responses and secure logging across the application
 */

import { NextResponse } from "next/server";
import { logger } from "./logger";
import { sendError } from "./responseHandler";

// Custom error classes for better error categorization
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = "Access denied") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class DatabaseError extends Error {
  constructor(message: string = "Database operation failed") {
    super(message);
    this.name = "DatabaseError";
  }
}

/**
 * Centralized error handler that provides environment-aware responses
 * @param error - The caught error (can be any type)
 * @param context - Context information (e.g., route name, operation)
 * @returns NextResponse with appropriate error format
 */
export function handleError(error: unknown, context: string) {
  const isProd = process.env.NODE_ENV === "production";
  
  // Ensure we're working with an Error object
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  // Map different error types to appropriate HTTP status codes
  let statusCode = 500;
  let errorCode = "INTERNAL_ERROR";
  let userMessage = "Something went wrong. Please try again later.";

  // Handle specific error types
  if (errorObj instanceof ValidationError) {
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    userMessage = errorObj.message;
  } else if (errorObj instanceof AuthenticationError) {
    statusCode = 401;
    errorCode = "AUTHENTICATION_ERROR";
    userMessage = errorObj.message;
  } else if (errorObj instanceof AuthorizationError) {
    statusCode = 403;
    errorCode = "AUTHORIZATION_ERROR";
    userMessage = errorObj.message;
  } else if (errorObj instanceof NotFoundError) {
    statusCode = 404;
    errorCode = "NOT_FOUND_ERROR";
    userMessage = errorObj.message;
  } else if (errorObj instanceof DatabaseError) {
    statusCode = 500;
    errorCode = "DATABASE_ERROR";
    userMessage = isProd ? "Service temporarily unavailable" : errorObj.message;
  }

  // Log the error with full context (safe for production)
  logger.error(`Error in ${context}`, {
    errorName: errorObj.name,
    errorMessage: errorObj.message,
    stack: isProd ? "REDACTED" : errorObj.stack,
    context,
    statusCode,
  });

  // Return appropriate response based on environment
  if (isProd) {
    // Production: Minimal, user-safe response
    return sendError(
      userMessage,
      errorCode,
      statusCode
    );
  } else {
    // Development: Detailed response for debugging
    return sendError(
      errorObj.message,
      errorCode,
      statusCode,
      {
        stack: errorObj.stack,
        context,
        name: errorObj.name,
      }
    );
  }
}

/**
 * Wrapper function for API route handlers to automatically catch and handle errors
 * @param handler - Async route handler function
 * @returns Wrapped handler with automatic error handling
 */
export function withErrorHandling(
  handler: (req: Request, params?: { params: Record<string, string> }) => Promise<NextResponse>
) {
  return async (req: Request, params?: { params: Record<string, string> }) => {
    try {
      return await handler(req, params);
    } catch (error) {
      // Extract context from request for better logging
      const url = new URL(req.url);
      const method = req.method;
      const context = `${method} ${url.pathname}${url.search}`;
      
      return handleError(error, context);
    }
  };
}