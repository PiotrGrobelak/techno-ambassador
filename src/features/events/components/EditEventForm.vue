<template>
  <EventFormContainer title="Edit Event">
    <form @submit.prevent="onSubmit" class="space-y-6">
      <!-- Event Name -->
      <div class="animate-fade-in">
        <label
          for="edit-event-name"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Event Name <span class="text-red-500">*</span>
        </label>
        <InputText
          id="edit-event-name"
          v-model="event_name"
          placeholder="Enter event name"
          :class="{ 'p-invalid': event_nameError }"
          :disabled="isLoading"
          class="w-full"
          data-testid="edit-event-name-input"
        />
        <p v-if="event_nameError" class="p-error text-red-600 mt-1">
          {{ event_nameError }}
        </p>
      </div>

      <!-- Country -->
      <div class="animate-fade-in">
        <label
          for="edit-country"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Country <span class="text-red-500">*</span>
        </label>
        <InputText
          id="edit-country"
          v-model="country"
          placeholder="Enter country"
          :class="{ 'p-invalid': countryError }"
          :disabled="isLoading"
          class="w-full"
          data-testid="edit-event-country-input"
        />
        <p v-if="countryError" class="p-error text-red-600 mt-1">
          {{ countryError }}
        </p>
      </div>

      <!-- City -->
      <div class="animate-fade-in">
        <label
          for="edit-city"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          City <span class="text-red-500">*</span>
        </label>
        <InputText
          id="edit-city"
          v-model="city"
          placeholder="Enter city"
          :class="{ 'p-invalid': cityError }"
          :disabled="isLoading"
          class="w-full"
          data-testid="edit-event-city-input"
        />
        <p v-if="cityError" class="p-error text-red-600 mt-1">
          {{ cityError }}
        </p>
      </div>

      <!-- Venue Name -->
      <div class="animate-fade-in">
        <label
          for="edit-venue-name"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Venue Name <span class="text-red-500">*</span>
        </label>
        <InputText
          id="edit-venue-name"
          v-model="venue_name"
          placeholder="Enter venue name"
          :class="{ 'p-invalid': venue_nameError }"
          :disabled="isLoading"
          class="w-full"
          data-testid="edit-event-venue-input"
        />
        <p v-if="venue_nameError" class="p-error text-red-600 mt-1">
          {{ venue_nameError }}
        </p>
      </div>

      <!-- Event Date -->
      <div class="animate-fade-in">
        <label
          for="edit-event-date"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Event Date <span class="text-red-500">*</span>
        </label>
        <DatePicker
          id="edit-event-date"
          v-model="event_date as Date"
          :min-date="getMinDate()"
          :max-date="getMaxDate()"
          :class="{ 'p-invalid': event_dateError }"
          :disabled="isLoading || isPastEvent"
          class="w-full"
          date-format="yy-mm-dd"
          placeholder="Select event date"
          data-testid="edit-event-date-input"
          show-icon
        />
        <p v-if="event_dateError" class="p-error text-red-600 mt-1">
          {{ event_dateError }}
        </p>
        <p v-if="isPastEvent" class="text-amber-600 text-sm mt-1">
          Warning: This event is in the past and cannot be rescheduled to an
          earlier date.
        </p>
        <small v-else class="text-gray-600 mt-1 block">
          Event must be scheduled for today or in the future (max 1 year ahead)
        </small>
      </div>

      <!-- Event Time (Optional) -->
      <div class="animate-fade-in">
        <label
          for="edit-event-time"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Event Time
        </label>
        <InputMask
          id="edit-event-time"
          v-model="event_time"
          mask="99:99"
          placeholder="HH:MM (24-hour format)"
          :class="{ 'p-invalid': event_timeError }"
          :disabled="isLoading"
          class="w-full"
          data-testid="edit-event-time-input"
        />
        <p v-if="event_timeError" class="p-error text-red-600 mt-1">
          {{ event_timeError }}
        </p>
        <small class="text-gray-600 mt-1 block">
          Optional - Enter time in 24-hour format (e.g., 22:30)
        </small>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          label="Update Event"
          :loading="isLoading"
          :disabled="!meta.valid || isLoading"
          class="flex-1"
          data-testid="edit-event-submit-button"
        />
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          outlined
          :disabled="isLoading"
          class="flex-1"
          data-testid="edit-event-cancel-button"
          @click="handleCancel"
        />
      </div>

      <!-- Messages -->
      <EventFormMessages :error="errorMessage" :success="successMessage" />
    </form>
  </EventFormContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import InputMask from 'primevue/inputmask';
import Button from 'primevue/button';
import { updateEventSchema } from '../schemas/eventSchemas';
import { useEventsManagementStore } from '../stores/useEventsManagementStore';
import EventFormContainer from './shared/EventFormContainer.vue';
import EventFormMessages from './shared/EventFormMessages.vue';
import type { EventListItemDto } from '../../../types';

// Props
interface Props {
  event: EventListItemDto;
}

const props = defineProps<Props>();

// Stores
const eventsStore = useEventsManagementStore();

// Local state for messages
const errorMessage = ref<string>('');
const successMessage = ref<string>('');

// Form setup with Vee-Validate and Zod
const { handleSubmit, meta, setFieldValue } = useForm({
  validationSchema: toTypedSchema(updateEventSchema),
});

// Form fields with Vee-Validate
const { value: event_name, errorMessage: event_nameError } =
  useField<string>('event_name');
const { value: country, errorMessage: countryError } =
  useField<string>('country');
const { value: city, errorMessage: cityError } = useField<string>('city');
const { value: venue_name, errorMessage: venue_nameError } =
  useField<string>('venue_name');
const { value: event_date, errorMessage: event_dateError } =
  useField<any>('event_date');
const { value: event_time, errorMessage: event_timeError } =
  useField<string>('event_time');

// Computed properties
const isLoading = computed(() => eventsStore.loading);
const isPastEvent = computed(() =>
  eventsStore.isPastEvent(props.event.event_date)
);

// Date helpers
const getMinDate = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getMaxDate = (): Date => {
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  return maxDate;
};

// Convert Date to string format for API
const formatDateForApi = (date: Date | string | null): string => {
  if (!date) return '';
  if (typeof date === 'string') return date;
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Convert string date to Date object for Calendar
const parseDate = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00');
};

// Initialize form with event data
const setFormValues = (): void => {
  setFieldValue('event_name', props.event.event_name);
  setFieldValue('country', props.event.country);
  setFieldValue('city', props.event.city);
  setFieldValue('venue_name', props.event.venue_name);
  // @ts-ignore Allow assigning Date to event_date field
  setFieldValue('event_date', parseDate(props.event.event_date));
  setFieldValue('event_time', props.event.event_time || '');
};

// Form submission
const onSubmit = handleSubmit(async (values) => {
  clearMessages();

  try {
    // Prepare form data for API
    const formData = {
      event_name: values.event_name,
      country: values.country,
      city: values.city,
      venue_name: values.venue_name,
      event_date: formatDateForApi(values.event_date),
      event_time: values.event_time || '',
    };

    const success = await eventsStore.updateEvent(props.event.id, formData);

    if (success) {
      successMessage.value = 'Event updated successfully!';
      // Editing state will be cleared by the store action
    } else {
      errorMessage.value = eventsStore.error || 'Failed to update event';
    }
  } catch (error) {
    errorMessage.value = 'An unexpected error occurred';
    console.error('Error updating event:', error);
  }
});

// Cancel handler
const handleCancel = (): void => {
  eventsStore.setEditingEvent(null);
  clearMessages();
};

// Clear messages
const clearMessages = (): void => {
  errorMessage.value = '';
  successMessage.value = '';
};

// Watch for store errors and sync with local state
import { watch } from 'vue';
watch(
  () => eventsStore.error,
  (newError) => {
    if (newError) {
      errorMessage.value = newError;
    }
  }
);

// Initialize form when component mounts
onMounted(() => {
  setFormValues();
});

// Watch for props.event changes
watch(
  () => props.event,
  () => {
    setFormValues();
  }
);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
