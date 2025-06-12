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
          icon="pi pi-plus"
          @click="eventsStore.toggleAddForm()"
          data-testid="empty-state-add-event"
        />
      </div>
    </div>

    <!-- Events Table -->
    <div v-else class="events-table">
      <DataTable
        :value="tableEvents"
        :paginator="true"
        :rows="eventsStore.pagination.limit"
        :total-records="eventsStore.pagination.total"
        :lazy="true"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rows-per-page-options="[5, 10, 25, 50]"
        current-page-report-template="Showing {first} to {last} of {totalRecords} events"
        :loading="eventsStore.loading"
        responsive-layout="scroll"
        striped-rows
        class="p-datatable-sm"
        data-testid="events-datatable"
        @page="onPageChange"
        @sort="onSort"
      >
        <template #empty>
          <div class="text-center py-4">
            <p class="text-gray-500">No events found.</p>
          </div>
        </template>

        <template #loading>
          <div class="flex justify-center py-4">
            <div
              class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"
            ></div>
          </div>
        </template>

        <!-- Event Name Column -->
        <Column field="event_name" header="Event" sortable class="min-w-48">
          <template #body="{ data }">
            <div class="font-medium text-gray-900">{{ data.event_name }}</div>
          </template>
        </Column>

        <!-- Location Column -->
        <Column header="Location" class="min-w-48">
          <template #body="{ data }">
            <div class="text-sm">
              <div class="font-medium text-gray-900">{{ data.venue_name }}</div>
              <div class="text-gray-500">
                {{ data.city }}, {{ data.country }}
              </div>
            </div>
          </template>
        </Column>

        <!-- Date Column -->
        <Column field="event_date" header="Date" sortable class="min-w-32">
          <template #body="{ data }">
            <div class="text-sm">
              <div class="font-medium text-gray-900">
                {{ formatDate(data.event_date) }}
              </div>
              <div v-if="data.event_time" class="text-gray-500">
                {{ data.event_time }}
              </div>
              <div
                v-if="isPastEvent(data.event_date)"
                class="text-xs text-gray-500 mt-1"
              >
                Past event
              </div>
            </div>
          </template>
        </Column>

        <!-- Status Column -->
        <Column header="Status" class="min-w-28">
          <template #body="{ data }">
            <Tag
              :value="isPastEvent(data.event_date) ? 'Past' : 'Upcoming'"
              :severity="isPastEvent(data.event_date) ? 'secondary' : 'success'"
              class="text-xs"
            />
          </template>
        </Column>

        <!-- Actions Column -->
        <Column header="Actions" class="min-w-32">
          <template #body="{ data }">
            <div class="flex gap-2">
              <!-- Edit Button (only for future events) -->
              <Button
                v-if="!isPastEvent(data.event_date)"
                icon="pi pi-pencil"
                severity="secondary"
                text
                rounded
                size="small"
                :disabled="eventsStore.loading"
                @click="handleEdit(data)"
                v-tooltip.top="'Edit event'"
                data-testid="edit-event-button"
              />

              <!-- Delete Button (only for future events) -->
              <Button
                v-if="!isPastEvent(data.event_date)"
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                size="small"
                :disabled="eventsStore.loading"
                @click="handleDelete(data)"
                v-tooltip.top="'Delete event'"
                data-testid="delete-event-button"
              />

              <!-- View Only for Past Events -->
              <span
                v-if="isPastEvent(data.event_date)"
                class="text-xs text-gray-400 px-2"
              >
                View only
              </span>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import { useConfirm } from 'primevue/useconfirm';
import { useEventsManagementStore } from '../stores/useEventsManagementStore';
import type { EventListItemDto } from '../../../types';

// Stores
const eventsStore = useEventsManagementStore();

// Create mutable array copy for DataTable (cast to any[] to satisfy DataTable type)
const tableEvents = computed<any[]>(() => eventsStore.events.slice() as any[]);

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

// Check if event is in the past
const isPastEvent = (dateString: string): boolean => {
  return eventsStore.isPastEvent(dateString);
};

// Handle pagination
const onPageChange = async (event: any): Promise<void> => {
  const page = event.page + 1; // PrimeVue uses 0-based indexing
  const limit = event.rows;
  await eventsStore.loadEvents(page, limit);
};

// Handle sorting
const onSort = async (event: any): Promise<void> => {
  // For now, we'll reload with current pagination
  // In future, we can add sorting support to the API
  await eventsStore.loadEvents(
    eventsStore.pagination.page,
    eventsStore.pagination.limit
  );
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

<style scoped>
.events-list {
  @apply w-full;
}

.events-table {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
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
</style>
