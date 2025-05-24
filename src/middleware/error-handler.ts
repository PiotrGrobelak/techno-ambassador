import type { APIContext } from 'astro';
import { ErrorLogService, ErrorType, type ErrorContext } from '../services/error-log.service';
import type { ErrorResponseDto, ValidationErrorDto } from '../types';

/**
 * Custom error class for API errors with structured information
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public errorCode: string,
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
  static validation(errors: Array<{ field: string; message: string }>): ApiError {
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

  static invalidJson(message: string = 'Invalid JSON in request body'): ApiError {
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
          details: error.details
        }
      };
      return new Response(JSON.stringify(validationResponse), {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Standard error response
    const errorResponse: ErrorResponseDto = {
      error: {
        message: error.message,
        code: error.errorCode,
        details: error.details
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: error.statusCode,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Handle native Error objects
  if (error instanceof Error) {
    await errorLogService.logInternalError(error, fullContext);

    const errorResponse: ErrorResponseDto = {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Handle unknown error types
  const unknownError = `Unknown error type: ${typeof error}`;
  await errorLogService.logError(unknownError, ErrorType.INTERNAL_SERVER_ERROR, fullContext);

  const errorResponse: ErrorResponseDto = {
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  };

  return new Response(JSON.stringify(errorResponse), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
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
 * Helper function to safely parse JSON request body with error handling
 * @param request - The incoming request
 * @returns Parsed JSON body or throws ApiError
 */
export async function parseJsonBody(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch (parseError) {
    throw ApiErrors.invalidJson();
  }
}

/**
 * Helper function to verify authentication and return user info
 * @param request - The incoming request
 * @param supabase - Supabase client
 * @returns User object or throws ApiError
 */
export async function verifyAuthentication(request: Request, supabase: any): Promise<any> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiErrors.unauthorized();
  }

  const token = authHeader.replace('Bearer ', '');
  
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    throw ApiErrors.unauthorized('Invalid or expired token');
  }

  return user;
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

  // Map common service errors to appropriate API errors
  if (message === 'Artist name already exists') {
    await errorLogService.logBusinessError(message, context, ErrorType.CONFLICT_ERROR);
    return ApiErrors.conflict(message);
  }

  if (message.includes('Invalid music style IDs')) {
    await errorLogService.logBusinessError(message, context, ErrorType.VALIDATION_ERROR);
    return ApiErrors.businessLogic(message, 400);
  }

  if (message.includes('Failed to create user') || message.includes('Failed to associate music styles')) {
    await errorLogService.logDatabaseError(error, 'User creation operation', context);
    return ApiErrors.database(message);
  }

  if (message.includes('Failed to validate') || message.includes('Failed to fetch')) {
    await errorLogService.logDatabaseError(error, 'Database validation operation', context);
    return ApiErrors.database(message);
  }

  // Default to internal server error for unknown service errors
  await errorLogService.logInternalError(error, context);
  return ApiErrors.internal();
} 