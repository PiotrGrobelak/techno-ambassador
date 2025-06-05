<template>
  <div class="flex justify-center mt-8">
    <Button
      v-if="showButton"
      @click="handleLoadMore"
      :loading="isLoading"
      :disabled="isLoading || !hasMore"
      class="px-8 py-3 text-lg"
      severity="secondary"
      outlined
    >
      <template v-if="!isLoading">
        {{ buttonText }}
      </template>
      <template v-else> Loading more DJs... </template>
    </Button>

    <!-- No more results message -->
    <div
      v-else-if="!hasMore && totalResults > 0"
      class="text-gray-500 text-center py-4"
    >
      You've reached the end of the results
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';
import type { PaginationDto } from '@/types';

interface Props {
  pagination: PaginationDto;
  isLoading?: boolean;
}

interface Emits {
  (e: 'load-more'): void;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
});

const emit = defineEmits<Emits>();

// Computed properties
const hasMore = computed(() => {
  return props.pagination.has_next;
});

const totalResults = computed(() => {
  return props.pagination.total;
});

const showButton = computed(() => {
  return hasMore.value && totalResults.value > 0;
});

const buttonText = computed(() => {
  const remaining =
    totalResults.value - props.pagination.page * props.pagination.limit;
  if (remaining > 0) {
    return `Load more (${remaining} remaining)`;
  }
  return 'Load more';
});

// Event handlers
function handleLoadMore(): void {
  if (!props.isLoading && hasMore.value) {
    emit('load-more');
  }
}
</script>
