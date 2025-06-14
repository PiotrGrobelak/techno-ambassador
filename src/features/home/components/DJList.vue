<template>
  <div data-testid="dj-list-container">
    <!-- Loading state -->
    <LoadingSkeletons
      v-if="isLoading && djList.length === 0"
      :count="8"
      data-testid="dj-list-loading"
    />

    <!-- Results grid -->
    <div
      v-else-if="djList.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      data-testid="dj-results-grid"
    >
      <DJCard v-for="dj in djList" :key="dj.id" :dj="dj" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="isEmpty"
      class="text-center py-12"
      data-testid="dj-list-empty-state"
    >
      <div class="max-w-md mx-auto">
        <!-- Empty state icon -->
        <div class="mb-4">
          <i
            class="pi pi-volume-up text-gray-400 text-6xl mx-auto block"
            aria-hidden="true"
          ></i>
        </div>

        <!-- Empty state message -->
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ emptyStateTitle }}
        </h3>
        <p class="text-gray-500 mb-6">
          {{ emptyStateMessage }}
        </p>

        <!-- Suggestions -->
        <div class="text-sm text-gray-400">
          <p class="mb-2">Try:</p>
          <ul class="space-y-1">
            <li>• Checking your spelling</li>
            <li>• Using different keywords</li>
            <li>• Removing some filters</li>
            <li>• Browsing all DJs</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DJCard from './DJCard.vue';
import LoadingSkeletons from './LoadingSkeletons.vue';
import type { UserListItemDto } from '@/types';

interface Props {
  djList: UserListItemDto[];
  isLoading: boolean;
  isEmpty: boolean;
  hasActiveFilters?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hasActiveFilters: false,
});

// Computed properties for empty state
const emptyStateTitle = computed(() => {
  if (props.hasActiveFilters) {
    return 'No DJs found';
  }
  return 'No DJs available';
});

const emptyStateMessage = computed(() => {
  if (props.hasActiveFilters) {
    return 'No DJs match your current search criteria. Try adjusting your filters or search terms.';
  }
  return 'There are currently no DJs registered on the platform. Check back later!';
});
</script>
