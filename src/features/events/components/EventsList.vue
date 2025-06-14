<template>
  <div class="events-list">
    <!-- Loading State -->
    <div v-if="eventsStore.loading" class="flex justify-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
      ></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="eventsStore.hasError"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
    >
      <div class="flex items-start">
        <svg
          class="h-5 w-5 text-red-400 mt-0.5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
        <div>
          <p class="text-sm text-red-700">{{ eventsStore.error }}</p>
          <button
            v-if="eventsStore.isNetworkError"
            @click="eventsStore.loadEvents()"
            class="mt-2 text-sm text-red-600 hover:text-red-500 underline"
          >
            Try again
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="eventsStore.events.length === 0" class="text-center py-12">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10h8V11m-8 0h8m-8 0H6a2 2 0 00-2 2v6a2 2 0 002 2h2m8-10V9a2 2 0 00-2-2H10a2 2 0 00-2 2v2m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2h-2"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No events</h3>
      <p class="mt-1 text-sm text-gray-500">
        Get started by creating your first event.
      </p>
      <div class="mt-6">
        <Button
          label="Add Event"
          @click="eventsStore.toggleAddForm()"
          data-testid="empty-state-add-event"
        />
      </div>
    </div>

    <!-- Events DataView -->
    <div v-else class="events-dataview">
      <DataView
        :value="eventsWithComputedData"
        :paginator="true"
        :rows="eventsStore.pagination.limit"
        :total-records="eventsStore.pagination.total"
        :lazy="true"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rows-per-page-options="[5, 10, 25, 50]"
        current-page-report-template="Showing {first} to {last} of {totalRecords} events"
        :loading="eventsStore.loading"
        class="events-dataview-container"
        data-testid="events-dataview"
        @page="onPageChange"
      >
        <template #empty>
          <div class="text-center py-8">
            <p class="text-gray-500">No events found.</p>
          </div>
        </template>

        <template #list="slotProps">
          <div class="grid grid-cols-1 gap-4">
            <div
              v-for="event in slotProps.items"
              :key="event.id"
              class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <!-- Event Info -->
                <div class="flex-1 space-y-2">
                  <!-- Event Name -->
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ event.event_name }}
                  </h3>

                  <!-- Location -->
                  <div class="flex items-center text-sm text-gray-600">
                    <svg
                      class="h-4 w-4 mr-2 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <div class="font-medium">{{ event.venue_name }}</div>
                      <div class="text-gray-500">
                        {{ event.city }}, {{ event.country }}
                      </div>
                    </div>
                  </div>

                  <!-- Date and Time -->
                  <div class="flex items-center text-sm text-gray-600">
                    <svg
                      class="h-4 w-4 mr-2 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10h8V11m-8 0h8m-8 0H6a2 2 0 00-2 2v6a2 2 0 002 2h2m8-10V9a2 2 0 00-2-2H10a2 2 0 00-2 2v2m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2h-2"
                      />
                    </svg>
                    <div>
                      <div class="font-medium">
                        {{ event.formattedDate }}
                      </div>
                      <div v-if="event.event_time" class="text-gray-500">
                        {{ event.event_time }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Status and Actions -->
                <div class="flex flex-col md:flex-row md:items-center gap-4">
                  <!-- Status Tag -->
                  <div class="flex justify-start md:justify-center">
                    <Tag
                      :value="event.statusValue"
                      :severity="event.statusSeverity"
                      class="text-xs"
                    />
                    <div
                      v-if="event.isPast"
                      class="text-xs text-gray-500 ml-2 self-center"
                    >
                      {{ event.viewOnlyText }}
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex gap-2">
                    <!-- Edit Button (only for events user can edit) -->
                    <Button
                      v-if="!event.isPast"
                      severity="secondary"
                      :disabled="eventsStore.loading"
                      @click="handleEdit(event)"
                      data-testid="edit-event-button"
                    >
                      Edit</Button
                    >

                    <!-- Delete Button (only for events user can edit) -->
                    <Button
                      v-if="!event.isPast"
                      severity="danger"
                      :disabled="eventsStore.loading"
                      @click="handleDelete(event)"
                      data-testid="delete-event-button"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </DataView>
    </div>

    <!-- PrimeVue ConfirmDialog - Required for useConfirm to work -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DataView from 'primevue/dataview';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { useEventsManagementStore } from '../stores/useEventsManagementStore';
import type { EventListItemDto } from '../../../types';

// Stores
const eventsStore = useEventsManagementStore();

// Computed properties for each event with all necessary calculations
const eventsWithComputedData = computed(() => {
  return eventsStore.events.map((event) => ({
    ...event,
    formattedDate: formatDate(event.event_date),
    isPast: eventsStore.isPastEvent(event.event_date),
    canEdit: eventsStore.canEditEvent(event),
    statusValue: eventsStore.isPastEvent(event.event_date)
      ? 'Past'
      : 'Upcoming',
    statusSeverity: eventsStore.isPastEvent(event.event_date)
      ? 'secondary'
      : 'success',
    viewOnlyText: eventsStore.isPastEvent(event.event_date)
      ? 'Past event'
      : 'View only',
  }));
});

// PrimeVue confirm dialog
const confirm = useConfirm();

// Date formatting helper
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Handle pagination
const onPageChange = async (event: any): Promise<void> => {
  const page = event.page + 1; // PrimeVue uses 0-based indexing
  const limit = event.rows;
  await eventsStore.loadEvents(page, limit);
};

// Handle edit event
const handleEdit = (event: EventListItemDto): void => {
  eventsStore.setEditingEvent(event.id);
};

// Handle delete event with confirmation
const handleDelete = (event: EventListItemDto): void => {
  confirm.require({
    message: `Are you sure you want to delete "${event.event_name}"?`,
    header: 'Delete Event',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      eventsStore.setDeletingEvent(event.id);
      await eventsStore.deleteEvent(event.id);
    },
    reject: () => {
      // User cancelled - do nothing
    },
  });
};
</script>
<!-- 
<style scoped>
.events-list {
  @apply w-full;
}

.events-dataview {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

.events-dataview-container {
  @apply w-full;
}

/* Custom loading spinner animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style> -->
