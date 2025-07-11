import type { APIContext } from 'astro';
import {
  ErrorLogService,
  ErrorType,
  type ErrorContext,
} from '@/services/error-log.service';
import type { ErrorResponseDto, ValidationErrorDto } from '@/types';
import type { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * Custom error class for API errors with structured information
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public errorCode: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public details?: any,
    public errorType: ErrorType = ErrorType.INTERNAL_SERVER_ERROR
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Predefined API error constructors for common scenarios
 */
export class ApiErrors {
  static validation(
    errors: Array<{ field: string; message: string }>
  ): ApiError {
    return new ApiError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      errors,
      ErrorType.VALIDATION_ERROR
    );
  }

  static unauthorized(message: string = 'Authentication required'): ApiError {
    return new ApiError(
      message,
      401,
      'UNAUTHORIZED',
      undefined,
      ErrorType.AUTHENTICATION_ERROR
    );
  }

  static forbidden(message: string = 'Access forbidden'): ApiError {
    return new ApiError(
      message,
      403,
      'FORBIDDEN',
      undefined,
      ErrorType.AUTHORIZATION_ERROR
    );
  }

  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(
      message,
      404,
      'NOT_FOUND',
      undefined,
      ErrorType.NOT_FOUND_ERROR
    );
  }

  static conflict(message: string): ApiError {
    return new ApiError(
      message,
      409,
      'CONFLICT',
      undefined,
      ErrorType.CONFLICT_ERROR
    );
  }

  static invalidJson(
    message: string = 'Invalid JSON in request body'
  ): ApiError {
    return new ApiError(
      message,
      400,
      'INVALID_JSON',
      undefined,
      ErrorType.VALIDATION_ERROR
    );
  }

  static businessLogic(message: string, statusCode: number = 400): ApiError {
    return new ApiError(
      message,
      statusCode,
      'BUSINESS_LOGIC_ERROR',
      undefined,
      ErrorType.BUSINESS_LOGIC_ERROR
    );
  }

  static database(message: string): ApiError {
    return new ApiError(
      'Database operation failed',
      500,
      'DATABASE_ERROR',
      { originalMessage: message },
      ErrorType.DATABASE_ERROR
    );
  }

  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(
      message,
      500,
      'INTERNAL_ERROR',
      undefined,
      ErrorType.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Main error handling function for API endpoints
 * Provides centralized error processing, logging, and response formatting
 */
export async function handleApiError(
  error: unknown,
  context: APIContext,
  userId?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestBody?: any
): Promise<Response> {
  const errorLogService = new ErrorLogService(context.locals.supabase);
  const errorContext: ErrorContext = ErrorLogService.createContextFromRequest(
    context.request,
    userId
  );

  // Add request body to context if available
  const fullContext = requestBody
    ? ErrorLogService.addRequestBodyToContext(errorContext, requestBody)
    : errorContext;

  // Handle different types of errors
  if (error instanceof ApiError) {
    // Log the API error with appropriate level
    await errorLogService.logError(error, error.errorType, fullContext);

    // Create appropriate response based on error type
    if (error.errorType === ErrorType.VALIDATION_ERROR && error.details) {
      const validationResponse: ValidationErrorDto = {
        error: {
          message: error.message,
          code: 'VALIDATION_ERROR',
          details: error.details,
        },
      };
      return new Response(JSON.stringify(validationResponse), {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Standard error response
    const errorResponse: ErrorResponseDto = {
      error: {
        message: error.message,
        code: error.errorCode,
        details: error.details,
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: error.statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Handle native Error objects
  if (error instanceof Error) {
    await errorLogService.logInternalError(error, fullContext);

    const errorResponse: ErrorResponseDto = {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Handle unknown error types
  const unknownError = `Unknown error type: ${typeof error}`;
  await errorLogService.logError(
    unknownError,
    ErrorType.INTERNAL_SERVER_ERROR,
    fullContext
  );

  const errorResponse: ErrorResponseDto = {
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  };

  return new Response(JSON.stringify(errorResponse), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Wrapper function for API routes to handle errors consistently
 * @param handler - The actual API route handler function
 * @returns Wrapped handler with automatic error handling
 */
export function withErrorHandling(
  handler: (context: APIContext) => Promise<Response>
) {
  return async (context: APIContext): Promise<Response> => {
    try {
      return await handler(context);
    } catch (error) {
      return await handleApiError(error, context);
    }
  };
}

/**
 * Helper function to parse JSON body with better error messages
 * @param request - The incoming request
 * @returns Parsed JSON object or throws ApiError
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function parseJsonBody(request: Request): Promise<any> {
  try {
    const contentType = request.headers.get('content-type');

    // Check if content type is JSON
    if (!contentType || !contentType.includes('application/json')) {
      throw ApiErrors.invalidJson(
        `Expected JSON content type, received: ${contentType || 'none'}`
      );
    }

    const text = await request.text();

    // Check if the body looks like HTML (common issue when forms submit as HTML)
    if (text.trim().startsWith('<')) {
      throw ApiErrors.invalidJson(
        'Received HTML content instead of JSON. Make sure to send JSON data with proper Content-Type header.'
      );
    }

    // Check if body is empty
    if (!text.trim()) {
      throw ApiErrors.invalidJson(
        'Request body is empty. JSON data is required.'
      );
    }

    return JSON.parse(text);
  } catch (parseError) {
    // If it's already an ApiError, re-throw it
    if (parseError instanceof ApiError) {
      throw parseError;
    }

    // Handle JSON parsing errors
    const errorMessage =
      parseError instanceof Error
        ? parseError.message
        : 'Unknown parsing error';
    throw ApiErrors.invalidJson(`Invalid JSON format: ${errorMessage}`);
  }
}

/**
 * Helper function to verify authentication and return user info
 * @param request - The incoming request
 * @param supabase - Supabase client
 * @returns User object or throws ApiError
 */
export async function verifyAuthentication(
  request: Request,
  supabase: SupabaseClient
): Promise<User> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiErrors.unauthorized();
  }

  const token = authHeader.replace('Bearer ', '');

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    throw ApiErrors.unauthorized('Invalid or expired token');
  }

  return user;
}

/**
 * Helper function to sanitize text inputs to prevent XSS and other security issues
 * @param input - Text input to sanitize
 * @returns Sanitized text
 */
export function sanitizeTextInput(input: string): string {
  if (!input) return input;

  return (
    input
      .trim()
      // Remove potentially dangerous HTML tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove javascript: and data: URLs
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      // Remove on* event handlers
      .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/\s*on\w+\s*=\s*[^>\s]+/gi, '')
  );
}

/**
 * Helper function to sanitize user command objects
 * @param command - User command object to sanitize
 * @returns Sanitized command object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeCreateUserCommand(command: any): any {
  const sanitized = { ...command };

  // Sanitize text fields
  if (sanitized.artist_name) {
    sanitized.artist_name = sanitizeTextInput(sanitized.artist_name);
  }

  if (sanitized.biography) {
    sanitized.biography = sanitizeTextInput(sanitized.biography);
  }

  // Social media URLs - only basic trimming, no format validation required
  if (sanitized.instagram_url) {
    sanitized.instagram_url = sanitized.instagram_url.trim();
  }

  if (sanitized.facebook_url) {
    sanitized.facebook_url = sanitized.facebook_url.trim();
  }

  return sanitized;
}

/**
 * Helper function to sanitize update user command objects
 * @param command - Update user command object to sanitize
 * @returns Sanitized command object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeUpdateUserCommand(command: any): any {
  const sanitized = { ...command };

  // Sanitize text fields if they exist
  if (sanitized.artist_name) {
    sanitized.artist_name = sanitizeTextInput(sanitized.artist_name);
  }

  if (sanitized.biography) {
    sanitized.biography = sanitizeTextInput(sanitized.biography);
  }

  // Social media URLs - only basic trimming, no format validation required
  if (sanitized.instagram_url) {
    sanitized.instagram_url = sanitized.instagram_url.trim();
  }

  if (sanitized.facebook_url) {
    sanitized.facebook_url = sanitized.facebook_url.trim();
  }

  return sanitized;
}

/**
 * Helper function to handle business logic errors from services
 * @param error - Service error
 * @param context - Error context for logging
 * @param errorLogService - Error logging service
 */
export async function handleServiceError(
  error: Error,
  context: ErrorContext,
  errorLogService: ErrorLogService
): Promise<ApiError> {
  const message = error.message;

  // Event creation and validation errors
  if (message === 'Event date must be today or in the future') {
    await errorLogService.logBusinessError(
      message,
      context,
      ErrorType.VALIDATION_ERROR
    );
    return ApiErrors.businessLogic(message, 400);
  }

  if (message === 'Event date must be within one year from today') {
    await errorLogService.logBusinessError(
      message,
      context,
      ErrorType.VALIDATION_ERROR
    );
    return ApiErrors.businessLogic(message, 400);
  }

  if (
    message === 'Event date must be today or in the future, and within one year'
  ) {
    await errorLogService.logBusinessError(
      message,
      context,
      ErrorType.VALIDATION_ERROR
    );
    return ApiErrors.businessLogic(message, 400);
  }

  // Event retrieval errors
  if (message === 'Event not found') {
    await errorLogService.logBusinessError(
      message,
      context,
      ErrorType.NOT_FOUND_ERROR
    );
    return ApiErrors.notFound(message);
  }

  if (message === 'Invalid event ID format') {
    await errorLogService.logBusinessError(
      message,
      context,
      ErrorType.VALIDATION_ERROR
    );
    return ApiErrors.businessLogic(message, 400);
  }

  // Event authorization errors
  if (message === "Cannot modify other user's events") {
    await errorLogService.logBusinessError(
      message,
      context,
      ErrorType.AUTHORIZATION_ERROR
    );
    return ApiErrors.forbidden(message);
  }

  if (message === 'Cannot modify past events') {
    await errorLogService.logBusinessError(
      message,
      context,
      ErrorType.VALIDATION_ERROR
    );
    return ApiErrors.businessLogic(message, 400);
  }

  // Event database operation errors
  if (
    message.includes('Failed to create event') ||
    message.includes('Failed to update event') ||
    message.includes('Failed to delete event')
  ) {
    await errorLogService.logDatabaseError(
      error,
      'Event database operation',
      context
    );
    return ApiErrors.database(message);
  }

  if (
    message.includes('Failed to fetch events') ||
    message.includes('Failed to fetch event') ||
    message.includes('Failed to verify event ownership') ||
    message.includes('Failed to verify event date')
  ) {
    await errorLogService.logDatabaseError(
      error,
      'Event query operation',
      context
    );
    return ApiErrors.database(message);
  }

  // User creation and validation errors
  if (message === 'Artist name already exists') {
    await errorLogService.logBusinessError(
      message,
      context,
      ErrorType.CONFLICT_ERROR
    );
    return ApiErrors.conflict(message);
  }

  if (message === 'User profile already exists') {
    await errorLogService.logBusinessError(
      message,
      context,
      ErrorType.CONFLICT_ERROR
    );
    return ApiErrors.conflict(message);
  }

  if (message.includes('Invalid music style IDs')) {
    await errorLogService.logBusinessError(
      message,
      context,
      ErrorType.VALIDATION_ERROR
    );
    return ApiErrors.businessLogic(message, 400);
  }

  // User retrieval errors
  if (message === 'User not found') {
    await errorLogService.logBusinessError(
      message,
      context,
      ErrorType.NOT_FOUND_ERROR
    );
    return ApiErrors.notFound(message);
  }

  if (message === 'Invalid user ID format') {
    await errorLogService.logBusinessError(
      message,
      context,
      ErrorType.VALIDATION_ERROR
    );
    return ApiErrors.businessLogic(message, 400);
  }

  // Database operation errors
  if (
    message.includes('Failed to create user') ||
    message.includes('Failed to associate music styles') ||
    message.includes('Failed to update user') ||
    message.includes('Failed to create new music style associations') ||
    message.includes('Failed to update music style associations')
  ) {
    await errorLogService.logDatabaseError(
      error,
      'User database operation',
      context
    );
    return ApiErrors.database(message);
  }

  if (
    message.includes('Failed to validate') ||
    message.includes('Failed to fetch') ||
    message.includes('Failed to fetch user') ||
    message.includes('Failed to fetch user events') ||
    message.includes('Failed to fetch user music styles')
  ) {
    await errorLogService.logDatabaseError(
      error,
      'Database query operation',
      context
    );
    return ApiErrors.database(message);
  }

  // Search and filtering errors
  if (message.includes('Failed to fetch users')) {
    await errorLogService.logDatabaseError(
      error,
      'User search operation',
      context
    );
    return ApiErrors.database(message);
  }

  // Default to internal server error for unknown service errors
  await errorLogService.logInternalError(error, context);
  return ApiErrors.internal();
}
