<template>
  <div
    class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
    data-testid="search-filters-container"
  >
    <div class="space-y-4">
      <!-- Search input -->
      <div>
        <label
          for="search-djs-input"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Search DJs
        </label>
        <SearchInput
          id="search-djs-input"
          v-model="searchTerm"
          :disabled="isLoading"
          placeholder="Search by artist name..."
          label="Search DJs"
        />
      </div>

      <!-- Music style filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Music Styles
        </label>
        <MusicStyleFilter
          v-model="selectedMusicStyles"
          :music-styles="musicStyles"
          :disabled="isLoading || isLoadingMusicStyles"
        />
      </div>

      <!-- Clear filters button -->
      <div
        class="flex justify-between items-center pt-4 border-t border-gray-200"
      >
        <div class="text-sm text-gray-500" data-testid="active-filters-text">
          <span v-if="hasActiveFilters">
            {{ activeFiltersText }}
          </span>
          <span v-else> No filters applied </span>
        </div>

        <Button
          :disabled="!hasActiveFilters || isLoading"
          severity="secondary"
          text
          size="small"
          class="text-sm"
          data-testid="clear-filters-button"
          @click="clearAllFilters"
        >
          <i class="pi pi-times text-sm mr-1" aria-hidden="true"></i>
          Clear filters
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';
import SearchInput from './SearchInput.vue';
import MusicStyleFilter from './MusicStyleFilter.vue';
import type { MusicStyleDto } from '@/types';

interface Props {
  musicStyles: MusicStyleDto[];
  isLoading?: boolean;
  isLoadingMusicStyles?: boolean;
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
  isLoadingMusicStyles: false,
});

// Using defineModel for two-way data binding
const searchTerm = defineModel<string>('searchTerm', { default: '' });
const selectedMusicStyles = defineModel<string[]>('selectedMusicStyles', {
  default: () => [],
});

// Computed properties
const hasActiveFilters = computed(() => {
  return (
    searchTerm.value.trim().length > 0 || selectedMusicStyles.value.length > 0
  );
});

const activeFiltersText = computed(() => {
  const filters = [];

  if (searchTerm.value.trim().length > 0) {
    filters.push(`Search: "${searchTerm.value.trim()}"`);
  }

  if (selectedMusicStyles.value.length > 0) {
    const styleCount = selectedMusicStyles.value.length;
    filters.push(`${styleCount} music style${styleCount !== 1 ? 's' : ''}`);
  }

  return filters.join(' • ');
});

// Event handlers
function clearAllFilters(): void {
  searchTerm.value = '';
  selectedMusicStyles.value = [];
}
</script>
