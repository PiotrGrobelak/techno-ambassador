import { useToast } from '@/shared/composables/useToast'

/**
 * Standard error types for client-side error handling
 */
export enum ClientErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Structured error information for client-side handling
 */
export interface ClientError {
  type: ClientErrorType
  message: string
  code?: string
  details?: any
  statusCode?: number
  originalError?: Error
}

/**
 * Error details for user-friendly display
 */
export interface ErrorDisplayInfo {
  title: string
  message: string
  showToast: boolean
  severity: 'error' | 'warn' | 'info'
}

/**
 * Client-side error handler with toast integration and standardized error processing
 */
export function useErrorHandler() {
  const toast = useToast()

  /**
   * Parse HTTP error response and extract error information
   */
  async function parseHttpError(response: Response): Promise<ClientError> {
    let errorData: any = {}
    
    try {
      errorData = await response.json()
    } catch {
      // If response is not JSON, use status text
      errorData = { message: response.statusText || 'Unknown error' }
    }

    const statusCode = response.status
    let type = ClientErrorType.UNKNOWN_ERROR

    // Map HTTP status codes to error types
    switch (statusCode) {
      case 400:
        type = errorData.error?.code === 'VALIDATION_ERROR' 
          ? ClientErrorType.VALIDATION_ERROR 
          : ClientErrorType.BUSINESS_LOGIC_ERROR
        break
      case 401:
        type = ClientErrorType.AUTHENTICATION_ERROR
        break
      case 403:
        type = ClientErrorType.AUTHORIZATION_ERROR
        break
      case 404:
        type = ClientErrorType.NOT_FOUND_ERROR
        break
      case 409:
        type = ClientErrorType.CONFLICT_ERROR
        break
      case 500:
      case 502:
      case 503:
      case 504:
        type = ClientErrorType.NETWORK_ERROR
        break
      default:
        type = ClientErrorType.UNKNOWN_ERROR
    }

    return {
      type,
      message: errorData.error?.message || errorData.message || 'An error occurred',
      code: errorData.error?.code,
      details: errorData.error?.details,
      statusCode
    }
  }

  /**
   * Handle network/fetch errors
   */
  function handleNetworkError(error: Error): ClientError {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        type: ClientErrorType.NETWORK_ERROR,
        message: 'Network connection failed. Please check your internet connection.',
        originalError: error
      }
    }

    return {
      type: ClientErrorType.NETWORK_ERROR,
      message: 'Network error occurred. Please try again.',
      originalError: error
    }
  }

  /**
   * Process any error and convert to ClientError
   */
  async function processError(error: unknown, context?: string): Promise<ClientError> {
    // If it's already a ClientError, return as is
    if (isClientError(error)) {
      return error
    }

    // Handle Response objects (from fetch)
    if (error instanceof Response) {
      return await parseHttpError(error)
    }

    // Handle Error objects
    if (error instanceof Error) {
      // Check if it's a network error
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return handleNetworkError(error)
      }

      // Check for HTTP error messages from our API client
      if (error.message.includes('HTTP error! status:')) {
        const statusMatch = error.message.match(/status: (\d+)/)
        const statusCode = statusMatch ? parseInt(statusMatch[1]) : 500
        
        let type = ClientErrorType.UNKNOWN_ERROR
        switch (statusCode) {
          case 400: type = ClientErrorType.VALIDATION_ERROR; break
          case 401: type = ClientErrorType.AUTHENTICATION_ERROR; break
          case 403: type = ClientErrorType.AUTHORIZATION_ERROR; break
          case 404: type = ClientErrorType.NOT_FOUND_ERROR; break
          case 409: type = ClientErrorType.CONFLICT_ERROR; break
          default: type = ClientErrorType.NETWORK_ERROR
        }

        return {
          type,
          message: getDefaultErrorMessage(type),
          statusCode,
          originalError: error
        }
      }

      return {
        type: ClientErrorType.UNKNOWN_ERROR,
        message: error.message || 'An unexpected error occurred',
        originalError: error
      }
    }

    // Handle unknown error types
    return {
      type: ClientErrorType.UNKNOWN_ERROR,
      message: 'An unexpected error occurred',
      details: error
    }
  }

  /**
   * Get user-friendly error display information
   */
  function getErrorDisplayInfo(clientError: ClientError, context?: string): ErrorDisplayInfo {
    const contextPrefix = context ? `${context}: ` : ''

    switch (clientError.type) {
      case ClientErrorType.NETWORK_ERROR:
        return {
          title: 'Connection Error',
          message: `${contextPrefix}${clientError.message}`,
          showToast: true,
          severity: 'error'
        }

      case ClientErrorType.AUTHENTICATION_ERROR:
        return {
          title: 'Authentication Required',
          message: `${contextPrefix}Please log in to continue`,
          showToast: true,
          severity: 'warn'
        }

      case ClientErrorType.AUTHORIZATION_ERROR:
        return {
          title: 'Access Denied',
          message: `${contextPrefix}You don't have permission to perform this action`,
          showToast: true,
          severity: 'warn'
        }

      case ClientErrorType.VALIDATION_ERROR:
        return {
          title: 'Validation Error',
          message: `${contextPrefix}${clientError.message}`,
          showToast: false, // Validation errors are usually shown inline
          severity: 'warn'
        }

      case ClientErrorType.NOT_FOUND_ERROR:
        return {
          title: 'Not Found',
          message: `${contextPrefix}${clientError.message}`,
          showToast: true,
          severity: 'warn'
        }

      case ClientErrorType.CONFLICT_ERROR:
        return {
          title: 'Conflict',
          message: `${contextPrefix}${clientError.message}`,
          showToast: true,
          severity: 'warn'
        }

      case ClientErrorType.BUSINESS_LOGIC_ERROR:
        return {
          title: 'Error',
          message: `${contextPrefix}${clientError.message}`,
          showToast: true,
          severity: 'warn'
        }

      default:
        return {
          title: 'Error',
          message: `${contextPrefix}${clientError.message || 'An unexpected error occurred'}`,
          showToast: true,
          severity: 'error'
        }
    }
  }

  /**
   * Handle error with optional toast display
   */
  async function handleError(
    error: unknown, 
    context?: string, 
    options: { showToast?: boolean; logError?: boolean } = {}
  ): Promise<ClientError> {
    const { showToast: forceShowToast, logError = true } = options
    
    const clientError = await processError(error, context)
    const displayInfo = getErrorDisplayInfo(clientError, context)

    // Log error for debugging
    if (logError) {
      console.error(`[${context || 'Error'}]`, {
        type: clientError.type,
        message: clientError.message,
        code: clientError.code,
        statusCode: clientError.statusCode,
        originalError: clientError.originalError
      })
    }

    // Show toast notification if requested or if display info suggests it
    const shouldShowToast = forceShowToast ?? displayInfo.showToast
    if (shouldShowToast) {
      if (displayInfo.severity === 'error') {
        toast.showError(displayInfo.title, displayInfo.message)
      } else if (displayInfo.severity === 'warn') {
        toast.showWarning(displayInfo.title, displayInfo.message)
      } else {
        toast.showInfo(displayInfo.title, displayInfo.message)
      }
    }

    return clientError
  }

  /**
   * Handle error specifically for store operations
   */
  async function handleStoreError(
    error: unknown,
    operation: string,
    options: { 
      showToast?: boolean
      setErrorState?: (error: string) => void
      setLoadingState?: (loading: boolean) => void
    } = {}
  ): Promise<ClientError> {
    const { showToast = true, setErrorState, setLoadingState } = options
    
    // Clear loading state if provided
    if (setLoadingState) {
      setLoadingState(false)
    }

    const clientError = await handleError(error, operation, { showToast })
    
    // Set error state if provided
    if (setErrorState) {
      const displayInfo = getErrorDisplayInfo(clientError, operation)
      setErrorState(displayInfo.message)
    }

    return clientError
  }

  return {
    ClientErrorType,
    processError,
    handleError,
    handleStoreError,
    getErrorDisplayInfo,
    parseHttpError
  }
}

// Type guard for ClientError
function isClientError(error: unknown): error is ClientError {
  return typeof error === 'object' && 
         error !== null && 
         'type' in error && 
         'message' in error &&
         Object.values(ClientErrorType).includes((error as any).type)
}

// Default error messages for each type
function getDefaultErrorMessage(type: ClientErrorType): string {
  switch (type) {
    case ClientErrorType.NETWORK_ERROR:
      return 'Network connection failed. Please try again.'
    case ClientErrorType.AUTHENTICATION_ERROR:
      return 'Authentication required. Please log in.'
    case ClientErrorType.AUTHORIZATION_ERROR:
      return 'You don\'t have permission to perform this action.'
    case ClientErrorType.VALIDATION_ERROR:
      return 'Please check your input and try again.'
    case ClientErrorType.NOT_FOUND_ERROR:
      return 'The requested resource was not found.'
    case ClientErrorType.CONFLICT_ERROR:
      return 'A conflict occurred. Please try again.'
    case ClientErrorType.BUSINESS_LOGIC_ERROR:
      return 'Unable to complete the operation.'
    default:
      return 'An unexpected error occurred.'
  }
} 