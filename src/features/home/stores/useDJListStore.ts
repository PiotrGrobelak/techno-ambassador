import { defineStore } from 'pinia'
import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'
import { useApiClient } from '../../../shared/composables/useApiClient'
import { useToast } from '../../../shared/composables/useToast'
import { useSearchStore } from './useSearchStore'
import { useMusicStylesStore } from './useMusicStylesStore'
import type { 
  UserListItemDto, 
  UsersListResponseDto, 
  PaginationDto, 
  UsersQueryParams 
} from '../../../types'

/**
 * DJ list data, pagination, and filtering coordination store
 * Manages DJ search results with reactive filtering and pagination
 */
export const useDJListStore = defineStore('djList', () => {
  const apiClient = useApiClient()
  const toast = useToast()
  const searchStore = useSearchStore()
  const musicStylesStore = useMusicStylesStore()

  // State
  const djList: Ref<UserListItemDto[]> = ref([])
  const pagination: Ref<PaginationDto> = ref({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  })
  const isLoading: Ref<boolean> = ref(false)
  const isLoadingMore: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const filters: Ref<UsersQueryParams> = ref({
    page: 1,
    limit: 20
  })

  // Getters
  const hasMorePages: ComputedRef<boolean> = computed(() => {
    return pagination.value.has_next
  })

  const totalResults: ComputedRef<number> = computed(() => {
    return pagination.value.total
  })

  const isEmpty: ComputedRef<boolean> = computed(() => {
    return djList.value.length === 0 && !isLoading.value
  })

  const currentFilters: ComputedRef<UsersQueryParams> = computed(() => {
    return { ...filters.value }
  })

  // Actions
  async function fetchDJs(params?: UsersQueryParams): Promise<void> {
    if (isLoading.value) return

    try {
      isLoading.value = true
      error.value = null

      const queryParams = { ...filters.value, ...params }
      
      // Build query string
      const searchParams = new URLSearchParams()
      
      if (queryParams.search && queryParams.search.trim()) {
        searchParams.append('search', queryParams.search.trim())
      }
      
      if (queryParams.music_styles) {
        searchParams.append('music_styles', queryParams.music_styles)
      }
      
      if (queryParams.page) {
        searchParams.append('page', queryParams.page.toString())
      }
      
      if (queryParams.limit) {
        searchParams.append('limit', queryParams.limit.toString())
      }

      const queryString = searchParams.toString()
      const endpoint = queryString ? `/users?${queryString}` : '/users'

      const response = await apiClient.get<UsersListResponseDto>(endpoint)
      
      // Reset list if it's a new search (page 1)
      if (queryParams.page === 1) {
        djList.value = response.data
      } else {
        // Append to existing list for pagination
        djList.value.push(...response.data)
      }
      
      pagination.value = response.pagination
      filters.value = queryParams

    } catch (err) {
      const errorMessage = 'Failed to load DJs'
      error.value = errorMessage
      toast.showError('Error', errorMessage)
      console.error('Error fetching DJs:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function loadMoreDJs(): Promise<void> {
    if (isLoadingMore.value || !hasMorePages.value) return

    try {
      isLoadingMore.value = true
      
      const nextPage = pagination.value.page + 1
      await fetchDJs({ ...filters.value, page: nextPage })
      
    } catch (err) {
      toast.showError('Error', 'Failed to load more DJs')
      console.error('Error loading more DJs:', err)
    } finally {
      isLoadingMore.value = false
    }
  }

  function resetList(): void {
    djList.value = []
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      total_pages: 0,
      has_next: false,
      has_prev: false
    }
    filters.value = {
      page: 1,
      limit: 20
    }
  }

  function updateFilters(newFilters: Partial<UsersQueryParams>): void {
    filters.value = {
      ...filters.value,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }
  }

  // Reset support
  function $reset(): void {
    djList.value = []
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      total_pages: 0,
      has_next: false,
      has_prev: false
    }
    isLoading.value = false
    isLoadingMore.value = false
    error.value = null
    filters.value = {
      page: 1,
      limit: 20
    }
  }

  // Reactive filtering based on other stores
  watch(
    () => searchStore.debouncedSearchTerm,
    (newSearchTerm) => {
      updateFilters({ search: newSearchTerm || undefined })
      fetchDJs()
    }
  )

  watch(
    () => musicStylesStore.selectedStyles,
    (newSelectedStyles) => {
      const musicStylesParam = newSelectedStyles.length > 0 
        ? newSelectedStyles.join(',') 
        : undefined
      
      updateFilters({ music_styles: musicStylesParam })
      fetchDJs()
    },
    { deep: true }
  )

  return {
    // State
    djList,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    filters,
    
    // Getters
    hasMorePages,
    totalResults,
    isEmpty,
    currentFilters,
    
    // Actions
    fetchDJs,
    loadMoreDJs,
    resetList,
    updateFilters,
    $reset
  }
}) 