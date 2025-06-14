import { ref, readonly } from 'vue';

/**
 * Event form message handling composable
 * Centralizes success and error message management
 */
export const useEventFormMessages = () => {
  // Internal reactive state
  const errorMessage = ref<string>('');
  const successMessage = ref<string>('');

  /**
   * Clear all messages
   */
  const clearMessages = (): void => {
    errorMessage.value = '';
    successMessage.value = '';
  };

  /**
   * Set error message and clear success message
   */
  const setError = (message: string): void => {
    errorMessage.value = message;
    successMessage.value = '';
  };

  /**
   * Set success message and clear error message
   */
  const setSuccess = (message: string): void => {
    successMessage.value = message;
    errorMessage.value = '';
  };

  /**
   * Check if there's an active error message
   */
  const hasError = (): boolean => {
    return errorMessage.value.length > 0;
  };

  /**
   * Check if there's an active success message
   */
  const hasSuccess = (): boolean => {
    return successMessage.value.length > 0;
  };

  // Return readonly refs to prevent external mutation
  return {
    errorMessage: readonly(errorMessage),
    successMessage: readonly(successMessage),
    clearMessages,
    setError,
    setSuccess,
    hasError,
    hasSuccess,
  };
}; 