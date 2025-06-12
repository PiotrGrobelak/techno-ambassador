<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h2 class="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="text-center p-4 bg-purple-50 rounded-lg">
        <div class="text-2xl font-bold text-purple-600">
          {{ upcomingEventsCount }}
        </div>
        <div class="text-sm text-gray-600">Upcoming Events</div>
      </div>
      <div class="text-center p-4 bg-blue-50 rounded-lg">
        <div class="text-2xl font-bold text-blue-600">
          {{ totalEventsCount }}
        </div>
        <div class="text-sm text-gray-600">Total Events</div>
      </div>
      <div class="text-center p-4 bg-green-50 rounded-lg">
        <div class="text-2xl font-bold text-green-600">{{ profileViews }}</div>
        <div class="text-sm text-gray-600">Profile Views</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useEventsManagementStore } from '@/features/events/stores/useEventsManagementStore';

const eventsStore = useEventsManagementStore();

onMounted(async () => {
  if (eventsStore.isAuthenticated) {
    await eventsStore.loadEvents();
  }
});

const upcomingEventsCount = computed(() => eventsStore.upcomingEvents.length);
const totalEventsCount = computed(() => eventsStore.events.length);
const profileViews = computed(() => 0); // Placeholder until analytics is implemented
</script>

<style scoped>
/* Add any component-specific styles if needed */
</style>
