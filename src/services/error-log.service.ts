import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../db/database.types';

/**
 * Error types for classification and monitoring
 */
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR'
}

/**
 * Interface for error context information
 */
export interface ErrorContext {
  requestUrl?: string;
  userAgent?: string;
  userId?: string;
  requestBody?: any;
  requestHeaders?: Record<string, string>;
  timestamp?: string;
  method?: string;
  ipAddress?: string;
}

/**
 * Service class for comprehensive error logging to database
 * Handles structured error logging with full context for monitoring and debugging
 */
export class ErrorLogService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Logs an error to the database with full context
   * @param error - The error object or message
   * @param errorType - Classification of the error type
   * @param context - Additional context information about the request
   * @param stackTrace - Optional stack trace for debugging
   */
  async logError(
    error: Error | string,
    errorType: ErrorType,
    context: ErrorContext = {},
    stackTrace?: string
  ): Promise<void> {
    try {
      const errorMessage = error instanceof Error ? error.message : error;
      const errorStack = stackTrace || (error instanceof Error ? error.stack : undefined);

      const errorLogData = {
        error_message: errorMessage,
        error_type: errorType,
        request_url: context.requestUrl || null,
        user_agent: context.userAgent || null,
        user_id: context.userId || null,
        stack_trace: errorStack || null
      };

      const { error: logError } = await this.supabase
        .from('error_logs')
        .insert(errorLogData);

      if (logError) {
        // If logging to database fails, fall back to console logging
        console.error('Failed to log error to database:', logError);
        console.error('Original error:', {
          message: errorMessage,
          type: errorType,
          context,
          stack: errorStack
        });
      }
    } catch (loggingError) {
      // Ensure logging errors don't crash the application
      console.error('Critical error in error logging service:', loggingError);
      console.error('Original error details:', {
        message: error instanceof Error ? error.message : error,
        type: errorType,
        context
      });
    }
  }

  /**
   * Logs validation errors with detailed field information
   * @param validationErrors - Array of validation error details
   * @param context - Request context information
   */
  async logValidationError(
    validationErrors: Array<{ field: string; message: string }>,
    context: ErrorContext = {}
  ): Promise<void> {
    const errorMessage = `Validation failed: ${validationErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`;
    
    await this.logError(
      errorMessage,
      ErrorType.VALIDATION_ERROR,
      {
        ...context,
        requestBody: context.requestBody ? JSON.stringify(context.requestBody) : undefined
      }
    );
  }

  /**
   * Logs authentication/authorization errors
   * @param message - Error message
   * @param context - Request context information
   * @param isAuthN - True for authentication errors, false for authorization errors
   */
  async logAuthError(
    message: string,
    context: ErrorContext = {},
    isAuthN: boolean = true
  ): Promise<void> {
    await this.logError(
      message,
      isAuthN ? ErrorType.AUTHENTICATION_ERROR : ErrorType.AUTHORIZATION_ERROR,
      context
    );
  }

  /**
   * Logs business logic errors (conflicts, invalid operations, etc.)
   * @param message - Error message
   * @param context - Request context information
   * @param errorType - Specific business logic error type
   */
  async logBusinessError(
    message: string,
    context: ErrorContext = {},
    errorType: ErrorType = ErrorType.BUSINESS_LOGIC_ERROR
  ): Promise<void> {
    await this.logError(message, errorType, context);
  }

  /**
   * Logs database operation errors
   * @param error - Database error object
   * @param operation - Description of the database operation that failed
   * @param context - Request context information
   */
  async logDatabaseError(
    error: Error,
    operation: string,
    context: ErrorContext = {}
  ): Promise<void> {
    const errorMessage = `Database operation failed: ${operation} - ${error.message}`;
    
    await this.logError(
      errorMessage,
      ErrorType.DATABASE_ERROR,
      context,
      error.stack
    );
  }

  /**
   * Logs unexpected internal server errors
   * @param error - The unexpected error
   * @param context - Request context information
   */
  async logInternalError(
    error: Error,
    context: ErrorContext = {}
  ): Promise<void> {
    await this.logError(
      error,
      ErrorType.INTERNAL_SERVER_ERROR,
      context,
      error.stack
    );
  }

  /**
   * Creates error context from Astro APIContext
   * @param request - Request object from Astro
   * @param userId - Optional authenticated user ID
   * @returns ErrorContext object with extracted information
   */
  static createContextFromRequest(request: Request, userId?: string): ErrorContext {
    const url = new URL(request.url);
    
    return {
      requestUrl: url.pathname + url.search,
      userAgent: request.headers.get('user-agent') || undefined,
      userId: userId,
      method: request.method,
      timestamp: new Date().toISOString(),
      // Note: IP address would require additional middleware to extract from headers
      requestHeaders: Object.fromEntries(
        Array.from(request.headers.entries())
          .filter(([key]) => !key.toLowerCase().includes('authorization')) // Don't log auth headers
      )
    };
  }

  /**
   * Adds request body to existing context (for error logging after body parsing)
   * @param context - Existing error context
   * @param requestBody - Parsed request body
   * @returns Updated context with request body
   */
  static addRequestBodyToContext(context: ErrorContext, requestBody: any): ErrorContext {
    return {
      ...context,
      requestBody: requestBody
    };
  }
} 