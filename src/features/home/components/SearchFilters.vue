<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
    <div class="space-y-4">
      <!-- Search input -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Search DJs
        </label>
        <SearchInput
          :model-value="searchTerm"
          @update:model-value="handleSearchChange"
          :disabled="isLoading"
          placeholder="Search by artist name..."
        />
      </div>

      <!-- Music style filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Music Styles
        </label>
        <MusicStyleFilter
          :music-styles="musicStyles"
          :model-value="selectedMusicStyles"
          @update:model-value="handleMusicStylesChange"
          :disabled="isLoading || isLoadingMusicStyles"
        />
      </div>

      <!-- Clear filters button -->
      <div
        class="flex justify-between items-center pt-4 border-t border-gray-200"
      >
        <div class="text-sm text-gray-500">
          <span v-if="hasActiveFilters">
            {{ activeFiltersText }}
          </span>
          <span v-else> No filters applied </span>
        </div>

        <Button
          @click="clearAllFilters"
          :disabled="!hasActiveFilters || isLoading"
          severity="secondary"
          text
          size="small"
          class="text-sm"
        >
          <svg
            class="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
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
import type { MusicStyleDto } from '../../../types';

interface Props {
  searchTerm: string;
  selectedMusicStyles: string[];
  musicStyles: MusicStyleDto[];
  isLoading?: boolean;
  isLoadingMusicStyles?: boolean;
}

interface Emits {
  (e: 'update:searchTerm', value: string): void;
  (e: 'update:selectedMusicStyles', value: string[]): void;
  (e: 'clear-filters'): void;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  isLoadingMusicStyles: false,
});

const emit = defineEmits<Emits>();

// Computed properties
const hasActiveFilters = computed(() => {
  return (
    props.searchTerm.trim().length > 0 || props.selectedMusicStyles.length > 0
  );
});

const activeFiltersText = computed(() => {
  const filters = [];

  if (props.searchTerm.trim().length > 0) {
    filters.push(`Search: "${props.searchTerm.trim()}"`);
  }

  if (props.selectedMusicStyles.length > 0) {
    const styleCount = props.selectedMusicStyles.length;
    filters.push(`${styleCount} music style${styleCount !== 1 ? 's' : ''}`);
  }

  return filters.join(' • ');
});

// Event handlers
function handleSearchChange(value: string): void {
  emit('update:searchTerm', value);
}

function handleMusicStylesChange(value: string[]): void {
  emit('update:selectedMusicStyles', value);
}

function clearAllFilters(): void {
  emit('clear-filters');
}
</script>
