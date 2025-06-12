<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h2 class="text-xl font-bold text-gray-900 mb-4">Recent Events</h2>
    <ul>
      <li
        v-for="event in recentEvents"
        :key="event.id"
        class="py-2 border-b last:border-none"
      >
        <a
          :href="`/dashboard/events`"
          class="flex justify-between items-center hover:text-blue-600"
        >
          <span>{{ event.event_name }}</span>
          <span class="text-sm text-gray-500">
            {{ formatDate(event.event_date) }}
          </span>
        </a>
      </li>
    </ul>
    <div v-if="!recentEvents.length" class="text-gray-500 py-4 text-center">
      No recent events.
      <a href="/dashboard/events" class="text-blue-600 hover:underline"
        >Manage Events</a
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useEventsManagementStore } from '@/features/events/stores/useEventsManagementStore';
import { format } from 'date-fns';

const eventsStore = useEventsManagementStore();

onMounted(async () => {
  if (eventsStore.isAuthenticated) {
    await eventsStore.loadEvents();
  }
});

const recentEvents = computed(() => {
  return [...eventsStore.events]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);
});

function formatDate(date: string) {
  return format(new Date(date), 'dd MMM yyyy');
}
</script>

<style scoped>
/* Add component-specific styles here if needed */
</style>
