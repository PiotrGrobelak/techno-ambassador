import { ref, computed, readonly, type Ref } from 'vue'
import { useErrorHandler, ClientErrorType, type ClientError } from '@/shared/composables/useErrorHandler'

/**
 * Standard error state interface for stores
 */
export interface StoreErrorState {
  error: string | null
  hasError: boolean
  errorType: ClientErrorType | null
  errorDetails: any
}

/**
 * Options for store error handling
 */
export interface StoreErrorOptions {
  showToast?: boolean
  logError?: boolean
  setLoadingState?: boolean
  context?: string
}

/**
 * Universal error handling composable for Pinia stores
 * Provides standardized error management, loading states, and user feedback
 */
export function useStoreErrorHandling(defaultContext?: string) {
  const errorHandler = useErrorHandler()

  // Error state
  const error: Ref<string | null> = ref(null)
  const errorType: Ref<ClientErrorType | null> = ref(null)
  const errorDetails: Ref<any> = ref(null)
  const isLoading: Ref<boolean> = ref(false)

  // Computed getters
  const hasError = computed(() => !!error.value)
  const isNetworkError = computed(() => errorType.value === ClientErrorType.NETWORK_ERROR)
  const isAuthError = computed(() => 
    errorType.value === ClientErrorType.AUTHENTICATION_ERROR ||
    errorType.value === ClientErrorType.AUTHORIZATION_ERROR
  )
  const isValidationError = computed(() => errorType.value === ClientErrorType.VALIDATION_ERROR)

  /**
   * Set loading state
   */
  function setLoading(loading: boolean): void {
    isLoading.value = loading
    // Clear errors when starting new operation
    if (loading) {
      clearError()
    }
  }

  /**
   * Clear error state
   */
  function clearError(): void {
    error.value = null
    errorType.value = null
    errorDetails.value = null
  }

  /**
   * Set error state manually
   */
  function setError(
    message: string, 
    type: ClientErrorType = ClientErrorType.UNKNOWN_ERROR,
    details?: any
  ): void {
    error.value = message
    errorType.value = type
    errorDetails.value = details
  }

  /**
   * Handle any error with standardized processing
   */
  async function handleError(
    err: unknown,
    operation?: string,
    options: StoreErrorOptions = {}
  ): Promise<ClientError> {
    const {
      showToast = true,
      logError = true,
      setLoadingState = true,
      context = defaultContext
    } = options

    // Clear loading if requested
    if (setLoadingState) {
      isLoading.value = false
    }

    const operationContext = context 
      ? (operation ? `${context} - ${operation}` : context)
      : operation

    // Process error using error handler
    const clientError = await errorHandler.handleStoreError(err, operationContext || 'Store Operation', {
      showToast,
      setErrorState: (errorMessage: string) => {
        error.value = errorMessage
      },
      setLoadingState: setLoadingState ? (loading: boolean) => { 
        isLoading.value = loading 
      } : undefined
    })

    // Set error state after clientError is fully available
    error.value = clientError.message
    errorType.value = clientError.type
    errorDetails.value = clientError.details

    return clientError
  }

  /**
   * Execute an async operation with automatic error handling
   */
  async function executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    operationName?: string,
    options: StoreErrorOptions = {}
  ): Promise<T | null> {
    const { setLoadingState = true } = options

    try {
      if (setLoadingState) {
        setLoading(true)
      }

      const result = await operation()
      
      if (setLoadingState) {
        setLoading(false)
      }

      return result
    } catch (err) {
      await handleError(err, operationName, options)
      return null
    }
  }

  /**
   * Check if error is recoverable (user can retry)
   */
  function isRecoverableError(): boolean {
    return errorType.value === ClientErrorType.NETWORK_ERROR ||
           errorType.value === ClientErrorType.UNKNOWN_ERROR
  }

  /**
   * Get user-friendly error message for display
   */
  function getDisplayError(): string {
    if (!error.value) return ''
    
    switch (errorType.value) {
      case ClientErrorType.NETWORK_ERROR:
        return 'Connection problem. Please check your internet and try again.'
      case ClientErrorType.AUTHENTICATION_ERROR:
        return 'Please log in to continue.'
      case ClientErrorType.AUTHORIZATION_ERROR:
        return 'You don\'t have permission for this action.'
      case ClientErrorType.VALIDATION_ERROR:
        return error.value // Show specific validation message
      case ClientErrorType.NOT_FOUND_ERROR:
        return 'The requested item was not found.'
      case ClientErrorType.CONFLICT_ERROR:
        return error.value // Show specific conflict message
      default:
        return error.value || 'An unexpected error occurred.'
    }
  }

  /**
   * Reset all state (useful for store $reset methods)
   */
  function resetErrorState(): void {
    error.value = null
    errorType.value = null
    errorDetails.value = null
    isLoading.value = false
  }

  return {
    // State
    error: readonly(error),
    errorType: readonly(errorType),
    errorDetails: readonly(errorDetails),
    isLoading: readonly(isLoading),

    // Computed
    hasError,
    isNetworkError,
    isAuthError,
    isValidationError,

    // Actions
    setLoading,
    clearError,
    setError,
    handleError,
    executeWithErrorHandling,
    isRecoverableError,
    getDisplayError,
    resetErrorState,

    // Error types for convenience
    ClientErrorType
  }
} 