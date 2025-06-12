<template>
  <div class="events-management-view">
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
            <svg
              class="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10h8V11m-8 0h8m-8 0H6a2 2 0 00-2 2v6a2 2 0 002 2h2m8-10V9a2 2 0 00-2-2H10a2 2 0 00-2 2v2m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2h-2"
              />
            </svg>
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
            <svg
              class="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
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
            <svg
              class="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
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

        <!-- <EventsList /> -->
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
  if (eventsStore.isAuthenticated) {
    await eventsStore.loadEvents();
  }
});

onUnmounted(() => {
  // Reset store state when leaving the page
  eventsStore.resetState();
});
</script>
