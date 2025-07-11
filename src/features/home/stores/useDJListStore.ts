import { defineStore } from 'pinia';
import { ref, computed, watch, type Ref, type ComputedRef } from 'vue';
import { useApiClient } from '@/shared/composables/useApiClient';
import { useStoreErrorHandling } from '@/shared/composables/useStoreErrorHandling';
import { useSearchStore } from './useSearchStore';
import { useMusicStylesStore } from './useMusicStylesStore';
import type {
  UserListItemDto,
  UsersListResponseDto,
  PaginationDto,
  UsersQueryParams,
} from '@/types';

/**
 * DJ list data, pagination, and filtering coordination store
 * Manages DJ search results with reactive filtering and pagination
 */
export const useDJListStore = defineStore('djList', () => {
  const apiClient = useApiClient();
  const errorHandling = useStoreErrorHandling('DJ List');
  const searchStore = useSearchStore();
  const musicStylesStore = useMusicStylesStore();

  // State
  const djList: Ref<UserListItemDto[]> = ref([]);
  const pagination: Ref<PaginationDto> = ref({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  });
  const isLoadingMore: Ref<boolean> = ref(false);
  const filters: Ref<UsersQueryParams> = ref({
    page: 1,
    limit: 20,
  });

  // Getters
  const hasMorePages: ComputedRef<boolean> = computed(() => {
    return pagination.value.has_next;
  });

  const totalResults: ComputedRef<number> = computed(() => {
    return pagination.value.total;
  });

  const isEmpty: ComputedRef<boolean> = computed(() => {
    return djList.value.length === 0 && !errorHandling.isLoading.value;
  });

  const currentFilters: ComputedRef<UsersQueryParams> = computed(() => {
    return { ...filters.value };
  });

  // Re-export error handling state
  const isLoading = errorHandling.isLoading;
  const error = errorHandling.error;
  const hasError = errorHandling.hasError;
  const isNetworkError = errorHandling.isNetworkError;

  // Actions
  async function fetchDJs(params?: UsersQueryParams): Promise<void> {
    if (isLoading.value) return;

    const result = await errorHandling.executeWithErrorHandling(async () => {
      const queryParams = { ...filters.value, ...params };

      // Build query string
      const searchParams = new URLSearchParams();

      if (queryParams.search && queryParams.search.trim()) {
        searchParams.append('search', queryParams.search.trim());
      }

      if (queryParams.music_styles) {
        searchParams.append('music_styles', queryParams.music_styles);
      }

      if (queryParams.page) {
        searchParams.append('page', queryParams.page.toString());
      }

      if (queryParams.limit) {
        searchParams.append('limit', queryParams.limit.toString());
      }

      const queryString = searchParams.toString();
      const endpoint = queryString ? `/users?${queryString}` : '/users';

      const response = await apiClient.get<UsersListResponseDto>(endpoint);

      // Reset list if it's a new search (page 1)
      if (queryParams.page === 1) {
        djList.value = response.data;
      } else {
        // Append to existing list for pagination
        djList.value.push(...response.data);
      }

      pagination.value = response.pagination;
      filters.value = queryParams;

      return response;
    }, 'Fetch DJs');

    return result ? Promise.resolve() : Promise.reject();
  }

  async function loadMoreDJs(): Promise<void> {
    if (isLoadingMore.value || !hasMorePages.value) return;

    try {
      isLoadingMore.value = true;

      const nextPage = pagination.value.page + 1;
      await fetchDJs({ ...filters.value, page: nextPage });
    } catch (err) {
      await errorHandling.handleError(err, 'Load more DJs', {
        showToast: true,
        setLoadingState: false, // Don't affect main loading state
      });
    } finally {
      isLoadingMore.value = false;
    }
  }

  function resetList(): void {
    djList.value = [];
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      total_pages: 0,
      has_next: false,
      has_prev: false,
    };
    filters.value = {
      page: 1,
      limit: 20,
    };
  }

  function updateFilters(newFilters: Partial<UsersQueryParams>): void {
    filters.value = {
      ...filters.value,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    };
  }

  // Reset support
  function $reset(): void {
    djList.value = [];
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      total_pages: 0,
      has_next: false,
      has_prev: false,
    };
    isLoadingMore.value = false;
    filters.value = {
      page: 1,
      limit: 20,
    };
    errorHandling.resetErrorState();
  }

  // Reactive filtering based on other stores
  watch(
    () => searchStore.debouncedSearchTerm,
    (newSearchTerm) => {
      updateFilters({ search: newSearchTerm || undefined });
      fetchDJs();
    }
  );

  watch(
    () => musicStylesStore.selectedStyles,
    (newSelectedStyles) => {
      const musicStylesParam =
        newSelectedStyles.length > 0 ? newSelectedStyles.join(',') : undefined;

      updateFilters({ music_styles: musicStylesParam });
      fetchDJs();
    },
    { deep: true }
  );

  return {
    // State
    djList,
    pagination,
    isLoadingMore,
    filters,

    // Error handling state (re-exported)
    isLoading,
    error,
    hasError,
    isNetworkError,

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
    $reset,

    // Error handling actions
    clearError: errorHandling.clearError,
    isRecoverableError: errorHandling.isRecoverableError,
    getDisplayError: errorHandling.getDisplayError,
  };
});
