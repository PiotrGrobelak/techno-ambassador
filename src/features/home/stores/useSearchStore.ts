import { defineStore } from 'pinia';
import { ref, computed, type Ref, type ComputedRef } from 'vue';
import { debouncedRef } from '@vueuse/core';

/**
 * Search functionality store with debouncing and validation
 * Manages search term state with 300ms debouncing
 */
export const useSearchStore = defineStore('search', () => {
  // State
  const searchTerm: Ref<string> = ref('');
  const isSearching: Ref<boolean> = ref(false);

  // Initialize debouncing with 300ms delay using VueUse
  const debouncedSearchTerm = debouncedRef(searchTerm, 300);

  // Getters
  const hasValidSearchTerm: ComputedRef<boolean> = computed(() => {
    const trimmed = searchTerm.value.trim();
    return trimmed.length >= 1 && trimmed.length <= 100;
  });

  const trimmedSearchTerm: ComputedRef<string> = computed(() => {
    return searchTerm.value.trim();
  });

  // Actions
  function setSearchTerm(term: string): void {
    if (term.length <= 100) {
      searchTerm.value = term;
    }
  }

  function clearSearch(): void {
    searchTerm.value = '';
    isSearching.value = false;
  }

  function setSearching(loading: boolean): void {
    isSearching.value = loading;
  }

  // Reset support
  function $reset(): void {
    searchTerm.value = '';
    isSearching.value = false;
  }

  return {
    // State
    searchTerm,
    debouncedSearchTerm,
    isSearching,

    // Getters
    hasValidSearchTerm,
    trimmedSearchTerm,

    // Actions
    setSearchTerm,
    clearSearch,
    setSearching,
    $reset,
  };
});
