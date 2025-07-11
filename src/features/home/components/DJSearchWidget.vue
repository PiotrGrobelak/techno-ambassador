<template>
  <div
    class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    data-testid="dj-search-widget"
  >
    <!-- Results summary -->
    <div
      v-if="!djListStore.isLoading || djListStore.djList.length > 0"
      class="mb-6"
      data-testid="search-results-summary"
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
          <i
            class="pi pi-spinner pi-spin text-gray-500 text-sm -ml-1 mr-2"
            aria-hidden="true"
          ></i>
          Updating results...
        </div>
      </div>
    </div>

    <!-- Search filters -->
    <SearchFilters
      v-model:search-term="searchStore.searchTerm"
      v-model:selected-music-styles="musicStylesStore.selectedStyles"
      :music-styles="musicStylesStore.musicStyles"
      :is-loading="djListStore.isLoading"
      :is-loading-music-styles="musicStylesStore.isLoading"
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
          <i
            class="pi pi-exclamation-circle text-red-400 text-lg flex-shrink-0"
            aria-hidden="true"
          ></i>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading DJs</h3>
            <p class="mt-1 text-sm text-red-700">
              {{ djListStore.error }}
            </p>
            <div class="mt-3">
              <Button
                size="small"
                severity="danger"
                outlined
                @click="handleRetry"
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
import Button from 'primevue/button';
import SearchFilters from './SearchFilters.vue';
import DJList from './DJList.vue';
import LoadMoreButton from './LoadMoreButton.vue';
import { useSearchStore } from '@/features/home/stores/useSearchStore';
import { useMusicStylesStore } from '@/features/home/stores/useMusicStylesStore';
import { useDJListStore } from '@/features/home/stores/useDJListStore';

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
