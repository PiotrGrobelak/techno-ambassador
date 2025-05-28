import { useToast as usePrimeToast } from 'primevue/usetoast'

/**
 * Toast notification management with PrimeVue integration
 * Provides standardized methods for user feedback and error display
 */
export function useToast() {
  const toast = usePrimeToast()

  /**
   * Show success toast notification
   * @param message - Success message to display
   * @param detail - Optional detailed message
   */
  function showSuccess(message: string, detail?: string) {
    toast.add({
      severity: 'success',
      summary: message,
      detail,
      life: 3000
    })
  }

  /**
   * Show error toast notification
   * @param message - Error message to display
   * @param detail - Optional detailed error message
   */
  function showError(message: string, detail?: string) {
    toast.add({
      severity: 'error',
      summary: message,
      detail,
      life: 5000
    })
  }

  /**
   * Show warning toast notification
   * @param message - Warning message to display
   * @param detail - Optional detailed warning message
   */
  function showWarning(message: string, detail?: string) {
    toast.add({
      severity: 'warn',
      summary: message,
      detail,
      life: 4000
    })
  }

  /**
   * Show info toast notification
   * @param message - Info message to display
   * @param detail - Optional detailed info message
   */
  function showInfo(message: string, detail?: string) {
    toast.add({
      severity: 'info',
      summary: message,
      detail,
      life: 3000
    })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
} 