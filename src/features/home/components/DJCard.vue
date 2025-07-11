<template>
  <div
    class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 overflow-hidden h-full flex flex-col"
    data-testid="dj-card"
    :data-dj-id="dj.id"
    :data-dj-name="dj.artist_name"
  >
    <div class="p-6 flex-1 flex flex-col">
      <!-- Artist name with fixed height -->
      <div class="h-8 mb-3">
        <h3
          class="text-xl font-bold text-gray-900 line-clamp-1 leading-8"
          data-testid="dj-artist-name"
        >
          {{ dj.artist_name }}
        </h3>
      </div>

      <!-- Biography with fixed height -->
      <div class="h-16 mb-4">
        <p
          class="text-gray-600 text-sm line-clamp-3 leading-5"
          data-testid="dj-biography"
        >
          {{ truncatedBiography }}
        </p>
      </div>

      <!-- Music styles with fixed height -->
      <div class="h-12 mb-4 flex-shrink-0" data-testid="dj-music-styles">
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
        <div class="text-sm text-gray-500" data-testid="dj-events-count">
          <span class="flex items-center">
            <i
              class="pi pi-calendar text-gray-500 text-sm mr-1 flex-shrink-0"
              aria-hidden="true"
            ></i>
            {{ eventsText }}
          </span>
        </div>

        <Button
          size="small"
          severity="primary"
          outlined
          data-testid="view-profile-button"
          class="text-sm flex-shrink-0"
          @click="navigateToProfile"
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
