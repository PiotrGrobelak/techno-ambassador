<template>
  <div class="p-8">
    <!-- Page Header -->
    <div class="page-header mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Events Management</h1>
          <p class="mt-2 text-sm text-gray-700">
            Manage your upcoming and past techno events. Create, edit, and
            organize your performance schedule.
          </p>
        </div>
        <div class="mt-4 sm:mt-0">
          <Button
            v-if="!eventsStore.isAddFormVisible"
            label="Add Event"
            icon="pi pi-plus"
            :disabled="!eventsStore.canCreateEvents || eventsStore.loading"
            @click="eventsStore.toggleAddForm()"
            data-testid="add-event-button"
          />
        </div>
      </div>
    </div>

    <!-- Stats Cards (Optional Enhancement) -->
    <div class="stats-cards grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <i class="pi pi-calendar w-6 h-6 text-green-600 text-2xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Upcoming Events</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ eventsStore.upcomingEventsCount }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-gray-100 rounded-lg">
            <i class="pi pi-clock w-6 h-6 text-gray-600 text-2xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Past Events</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ eventsStore.pastEventsCount }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <i class="pi pi-chart-bar w-6 h-6 text-blue-600 text-2xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Events</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ eventsStore.events.length }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Event Form -->
    <div v-if="eventsStore.isAddFormVisible" class="mb-8">
      <AddEventForm />
    </div>

    <!-- Edit Event Form -->
    <div v-if="eventsStore.isEditingEvent && currentEditingEvent" class="mb-8">
      <EditEventForm :event="currentEditingEvent" />
    </div>

    <!-- Events List -->
    <div class="events-section">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-medium text-gray-900">Your Events</h2>
          <div class="text-sm text-gray-500">
            {{ eventsStore.pagination.total }} total events
          </div>
        </div>

        <EventsList />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import Button from 'primevue/button';
import { useEventsManagementStore } from '../stores/useEventsManagementStore';
import AddEventForm from './AddEventForm.vue';
import EditEventForm from './EditEventForm.vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import EventsList from './EventsList.vue';

// Stores
const authStore = useAuthStore();
const eventsStore = useEventsManagementStore();

// Computed properties
const currentEditingEvent = computed(() => {
  if (!eventsStore.editingEventId) return null;
  return (
    eventsStore.events.find(
      (event) => event.id === eventsStore.editingEventId
    ) || null
  );
});

// Lifecycle hooks
onMounted(async () => {
  // Initialize authentication before loading events
  await authStore.initializeAuth();
  // Load events when component mounts

  console.log('eventsStore.isAuthenticated', eventsStore.isAuthenticated);
  console.log('eventsStore.canCreateEvents', eventsStore.canCreateEvents);

  if (eventsStore.isAuthenticated) {
    await eventsStore.loadEvents();
  }
});

onUnmounted(() => {
  // Reset store state when leaving the page
  eventsStore.resetState();
});
</script>
