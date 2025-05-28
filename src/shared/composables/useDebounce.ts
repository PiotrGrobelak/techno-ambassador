import { ref, watch, type Ref } from 'vue'

/**
 * Utility composable for debouncing reactive values
 * @param value - Reactive value to debounce
 * @param delay - Delay in milliseconds
 * @returns Object with debouncedValue
 */
export function useDebounce<T>(value: Ref<T>, delay: number) {
  const debouncedValue = ref(value.value) as Ref<T>
  let timeoutId: NodeJS.Timeout | null = null

  watch(
    value,
    (newValue) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(() => {
        debouncedValue.value = newValue
      }, delay)
    },
    { immediate: true }
  )

  return {
    debouncedValue
  }
} 