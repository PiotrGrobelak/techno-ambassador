import { defineStore } from 'pinia'
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useApiClient } from '@/shared/composables/useApiClient'
import { useStoreErrorHandling } from '@/shared/composables/useStoreErrorHandling'
import type { MusicStyleDto, MusicStylesListResponseDto } from '@/types'

/**
 * Music styles data management and selection state store
 * Handles fetching music styles and managing user selections
 */
export const useMusicStylesStore = defineStore('musicStyles', () => {
  const apiClient = useApiClient()
  const errorHandling = useStoreErrorHandling('Music Styles')

  // State
  const musicStyles: Ref<MusicStyleDto[]> = ref([])
  const selectedStyles: Ref<string[]> = ref([])

  // Getters
  const selectedStylesCount: ComputedRef<number> = computed(() => {
    return selectedStyles.value.length
  })

  const hasSelectedStyles: ComputedRef<boolean> = computed(() => {
    return selectedStyles.value.length > 0
  })

  const availableStyles: ComputedRef<MusicStyleDto[]> = computed(() => {
    return musicStyles.value.filter(style => style.user_count > 0)
  })

  // Re-export error handling state and computed
  const isLoading = errorHandling.isLoading
  const error = errorHandling.error
  const hasError = errorHandling.hasError
  const isNetworkError = errorHandling.isNetworkError

  // Actions
  async function fetchMusicStyles(): Promise<void> {
    if (isLoading.value) return

    const result = await errorHandling.executeWithErrorHandling(
      async () => {
        const response = await apiClient.get<MusicStylesListResponseDto>('/music-styles')
        musicStyles.value = response.data
        return response
      },
      'Fetch music styles'
    )

    // Operation completed successfully if result is not null
    return result ? Promise.resolve() : Promise.reject()
  }

  function toggleStyle(styleId: string): void {
    const index = selectedStyles.value.indexOf(styleId)
    
    if (index === -1) {
      selectedStyles.value.push(styleId)
    } else {
      selectedStyles.value.splice(index, 1)
    }
  }

  function clearStyles(): void {
    selectedStyles.value = []
  }

  function setSelectedStyles(styleIds: string[]): void {
    // Validate that all style IDs exist in available styles
    const validStyleIds = styleIds.filter(id => 
      musicStyles.value.some(style => style.id === id)
    )
    selectedStyles.value = validStyleIds
  }

  // Reset support
  function $reset(): void {
    musicStyles.value = []
    selectedStyles.value = []
    errorHandling.resetErrorState()
  }

  return {
    // State
    musicStyles,
    selectedStyles,
    
    // Error handling state (re-exported)
    isLoading,
    error,
    hasError,
    isNetworkError,
    
    // Getters
    selectedStylesCount,
    hasSelectedStyles,
    availableStyles,
    
    // Actions
    fetchMusicStyles,
    toggleStyle,
    clearStyles,
    setSelectedStyles,
    $reset,
    
    // Error handling actions
    clearError: errorHandling.clearError,
    isRecoverableError: errorHandling.isRecoverableError,
    getDisplayError: errorHandling.getDisplayError
  }
}) 