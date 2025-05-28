<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Results summary -->
    <div
      v-if="!djListStore.isLoading || djListStore.djList.length > 0"
      class="mb-6"
    >
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-600">
          <span v-if="djListStore.totalResults > 0">
            Showing {{ djListStore.djList.length }} of
            {{ djListStore.totalResults }} DJs
          </span>
          <span v-else-if="!djListStore.isLoading"> No DJs found </span>
        </div>

        <!-- Loading indicator for search -->
        <div
          v-if="djListStore.isLoading && djListStore.djList.length > 0"
          class="flex items-center text-sm text-gray-500"
        >
          <svg
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Updating results...
        </div>
      </div>
    </div>

    <!-- Search filters -->
    <SearchFilters
      :search-term="searchStore.searchTerm"
      :selected-music-styles="musicStylesStore.selectedStyles"
      :music-styles="musicStylesStore.musicStyles"
      :is-loading="djListStore.isLoading"
      :is-loading-music-styles="musicStylesStore.isLoading"
      @update:search-term="handleSearchTermUpdate"
      @update:selected-music-styles="handleMusicStylesUpdate"
      @clear-filters="handleClearFilters"
    />

    <!-- DJ List -->
    <DJList
      :dj-list="djListStore.djList"
      :is-loading="djListStore.isLoading"
      :is-empty="djListStore.isEmpty"
      :has-active-filters="hasActiveFilters"
    />

    <!-- Load more button -->
    <LoadMoreButton
      v-if="djListStore.djList.length > 0"
      :pagination="djListStore.pagination"
      :is-loading="djListStore.isLoadingMore"
      @load-more="handleLoadMore"
    />

    <!-- Error handling -->
    <div v-if="djListStore.error && !djListStore.isLoading" class="mt-8">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <svg
            class="h-5 w-5 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading DJs</h3>
            <p class="mt-1 text-sm text-red-700">
              {{ djListStore.error }}
            </p>
            <div class="mt-3">
              <Button
                @click="handleRetry"
                size="small"
                severity="danger"
                outlined
              >
                Try again
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import SearchFilters from './SearchFilters.vue';
import DJList from './DJList.vue';
import LoadMoreButton from './LoadMoreButton.vue';
import { useSearchStore } from '../stores/useSearchStore';
import { useMusicStylesStore } from '../stores/useMusicStylesStore';
import { useDJListStore } from '../stores/useDJListStore';

// Initialize stores
const searchStore = useSearchStore();
const musicStylesStore = useMusicStylesStore();
const djListStore = useDJListStore();

// Computed properties
const hasActiveFilters = computed(() => {
  return (
    searchStore.searchTerm.trim().length > 0 ||
    musicStylesStore.selectedStyles.length > 0
  );
});

// Event handlers
function handleSearchTermUpdate(value: string): void {
  searchStore.setSearchTerm(value);
}

function handleMusicStylesUpdate(value: string[]): void {
  musicStylesStore.setSelectedStyles(value);
}

function handleClearFilters(): void {
  searchStore.clearSearch();
  musicStylesStore.clearStyles();
}

function handleLoadMore(): void {
  djListStore.loadMoreDJs();
}

function handleRetry(): void {
  djListStore.fetchDJs();
}

// Lifecycle
onMounted(async () => {
  // Initialize data on component mount
  try {
    // Fetch music styles first
    await musicStylesStore.fetchMusicStyles();

    // Then fetch initial DJ list
    await djListStore.fetchDJs();
  } catch (error) {
    console.error('Error initializing DJ search widget:', error);
  }
});
</script>
