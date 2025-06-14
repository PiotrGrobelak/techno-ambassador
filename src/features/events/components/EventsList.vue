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
        <i
          class="pi pi-exclamation-triangle h-5 w-5 text-red-400 mt-0.5 mr-3"
        ></i>
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
      <i
        class="pi pi-calendar mx-auto h-12 w-12 text-gray-400 text-6xl block"
      ></i>
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
                    <i class="pi pi-map-marker h-4 w-4 mr-2 text-gray-400"></i>
                    <div>
                      <div class="font-medium">{{ event.venue_name }}</div>
                      <div class="text-gray-500">
                        {{ event.city }}, {{ event.country }}
                      </div>
                    </div>
                  </div>

                  <!-- Date and Time -->
                  <div class="flex items-center text-sm text-gray-600">
                    <i class="pi pi-calendar h-4 w-4 mr-2 text-gray-400"></i>
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
                      label="Edit"
                      icon="pi pi-pencil"
                      severity="secondary"
                      :disabled="eventsStore.loading"
                      @click="handleEdit(event)"
                      data-testid="edit-event-button"
                    />

                    <!-- Delete Button (only for events user can edit) -->
                    <Button
                      v-if="!event.isPast"
                      label="Delete"
                      icon="pi pi-trash"
                      severity="danger"
                      :disabled="eventsStore.loading"
                      @click="handleDelete(event)"
                      data-testid="delete-event-button"
                    />
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
