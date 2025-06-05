<template>
  <div
    class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 overflow-hidden h-full flex flex-col"
  >
    <div class="p-6 flex-1 flex flex-col">
      <!-- Artist name with fixed height -->
      <div class="h-8 mb-3">
        <h3 class="text-xl font-bold text-gray-900 line-clamp-1 leading-8">
          {{ dj.artist_name }}
        </h3>
      </div>

      <!-- Biography with fixed height -->
      <div class="h-16 mb-4">
        <p class="text-gray-600 text-sm line-clamp-3 leading-5">
          {{ truncatedBiography }}
        </p>
      </div>

      <!-- Music styles with fixed height -->
      <div class="h-12 mb-4 flex-shrink-0">
        <div class="flex flex-wrap gap-2 overflow-hidden">
          <Tag
            v-for="style in displayedStyles"
            :key="style.id"
            :value="style.style_name"
            severity="info"
            class="text-xs whitespace-nowrap"
          />
          <span v-if="hasMoreStyles" class="text-xs text-gray-500 self-center">
            +{{ remainingStylesCount }} more
          </span>
        </div>
      </div>

      <!-- Footer with events count and profile link -->
      <div class="flex items-center justify-between mt-auto">
        <div class="text-sm text-gray-500">
          <span class="flex items-center">
            <svg
              class="w-4 h-4 mr-1 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {{ eventsText }}
          </span>
        </div>

        <Button
          @click="navigateToProfile"
          size="small"
          severity="primary"
          outlined
          class="text-sm flex-shrink-0"
        >
          View Profile
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import type { UserListItemDto } from '@/types';

interface Props {
  dj: UserListItemDto;
}

const props = defineProps<Props>();

// Computed properties
const truncatedBiography = computed(() => {
  const maxLength = 150;
  if (!props.dj.biography || props.dj.biography.length <= maxLength) {
    return props.dj.biography || 'No biography available';
  }
  return props.dj.biography.substring(0, maxLength) + '...';
});

const displayedStyles = computed(() => {
  // Show maximum 3 styles to prevent overflow
  return props.dj.music_styles?.slice(0, 3) || [];
});

const hasMoreStyles = computed(() => {
  return (props.dj.music_styles?.length || 0) > 3;
});

const remainingStylesCount = computed(() => {
  return Math.max(0, (props.dj.music_styles?.length || 0) - 3);
});

const eventsText = computed(() => {
  const count = props.dj.upcoming_events_count || 0;
  if (count === 0) {
    return 'No upcoming events';
  } else if (count === 1) {
    return '1 upcoming event';
  } else {
    return `${count} upcoming events`;
  }
});

// Event handlers
function navigateToProfile(): void {
  // Create URL-friendly slug from artist name
  const slug = props.dj.artist_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Navigate to DJ profile page
  window.location.href = `/dj/${slug}`;
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
