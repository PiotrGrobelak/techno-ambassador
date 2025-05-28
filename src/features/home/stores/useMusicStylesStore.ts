import { defineStore } from 'pinia'
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useApiClient } from '../../../shared/composables/useApiClient'
import { useToast } from '../../../shared/composables/useToast'
import type { MusicStyleDto, MusicStylesListResponseDto } from '../../../types'

/**
 * Music styles data management and selection state store
 * Handles fetching music styles and managing user selections
 */
export const useMusicStylesStore = defineStore('musicStyles', () => {
  const apiClient = useApiClient()
  const toast = useToast()

  // State
  const musicStyles: Ref<MusicStyleDto[]> = ref([])
  const selectedStyles: Ref<string[]> = ref([])
  const isLoading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

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

  // Actions
  async function fetchMusicStyles(): Promise<void> {
    if (isLoading.value) return

    try {
      isLoading.value = true
      error.value = null

      const response = await apiClient.get<MusicStylesListResponseDto>('/music-styles')
      musicStyles.value = response.data

    } catch (err) {
      const errorMessage = 'Failed to load music styles'
      error.value = errorMessage
      toast.showError('Error', errorMessage)
      console.error('Error fetching music styles:', err)
    } finally {
      isLoading.value = false
    }
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
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    musicStyles,
    selectedStyles,
    isLoading,
    error,
    
    // Getters
    selectedStylesCount,
    hasSelectedStyles,
    availableStyles,
    
    // Actions
    fetchMusicStyles,
    toggleStyle,
    clearStyles,
    setSelectedStyles,
    $reset
  }
}) 