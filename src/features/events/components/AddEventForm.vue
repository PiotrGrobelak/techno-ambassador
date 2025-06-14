<template>
  <EventFormContainer title="Add New Event">
    <form @submit.prevent="onSubmit" class="space-y-6">
      <!-- Event Name -->
      <div class="animate-fade-in">
        <label
          for="event-name"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Event Name <span class="text-red-500">*</span>
        </label>
        <InputText
          id="event-name"
          v-model="event_name"
          placeholder="Enter event name"
          :class="{ 'p-invalid': event_nameError }"
          :disabled="isLoading"
          class="w-full"
          data-testid="event-name-input"
        />
        <p v-if="event_nameError" class="p-error text-red-600 mt-1">
          {{ event_nameError }}
        </p>
      </div>

      <!-- Country -->
      <div class="animate-fade-in">
        <label
          for="country"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Country <span class="text-red-500">*</span>
        </label>
        <InputText
          id="country"
          v-model="country"
          placeholder="Enter country"
          :class="{ 'p-invalid': countryError }"
          :disabled="isLoading"
          class="w-full"
          data-testid="event-country-input"
        />
        <p v-if="countryError" class="p-error text-red-600 mt-1">
          {{ countryError }}
        </p>
      </div>

      <!-- City -->
      <div class="animate-fade-in">
        <label for="city" class="block text-sm font-medium text-gray-700 mb-1">
          City <span class="text-red-500">*</span>
        </label>
        <InputText
          id="city"
          v-model="city"
          placeholder="Enter city"
          :class="{ 'p-invalid': cityError }"
          :disabled="isLoading"
          class="w-full"
          data-testid="event-city-input"
        />
        <p v-if="cityError" class="p-error text-red-600 mt-1">
          {{ cityError }}
        </p>
      </div>

      <!-- Venue Name -->
      <div class="animate-fade-in">
        <label
          for="venue-name"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Venue Name <span class="text-red-500">*</span>
        </label>
        <InputText
          id="venue-name"
          v-model="venue_name"
          placeholder="Enter venue name"
          :class="{ 'p-invalid': venue_nameError }"
          :disabled="isLoading"
          class="w-full"
          data-testid="event-venue-input"
        />
        <p v-if="venue_nameError" class="p-error text-red-600 mt-1">
          {{ venue_nameError }}
        </p>
      </div>

      <!-- Event Date -->
      <div class="animate-fade-in">
        <label
          for="event-date"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Event Date <span class="text-red-500">*</span>
        </label>
        <DatePicker
          id="event-date"
          v-model="event_date"
          :min-date="getMinDate()"
          :max-date="getMaxDate()"
          :class="{ 'p-invalid': event_dateError }"
          :disabled="isLoading"
          class="w-full"
          date-format="yy-mm-dd"
          placeholder="Select event date"
          data-testid="event-date-input"
          show-icon
        />
        <p v-if="event_dateError" class="p-error text-red-600 mt-1">
          {{ event_dateError }}
        </p>
        <small class="text-gray-600 mt-1 block">
          Event must be scheduled for today or in the future (max 1 year ahead)
        </small>
      </div>

      <!-- Event Time (Optional) -->
      <div class="animate-fade-in">
        <label
          for="event-time"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Event Time
        </label>
        <InputMask
          id="event-time"
          v-model="event_time"
          mask="99:99"
          placeholder="HH:MM (24-hour format)"
          :class="{ 'p-invalid': event_timeError }"
          :disabled="isLoading"
          class="w-full"
          data-testid="event-time-input"
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
          label="Create Event"
          :loading="isLoading"
          :disabled="!meta.valid || isLoading"
          class="flex-1"
          data-testid="event-submit-button"
        />
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          outlined
          :disabled="isLoading"
          class="flex-1"
          data-testid="event-cancel-button"
          @click="handleCancel"
        />
      </div>

      <!-- Messages -->
      <EventFormMessages :error="errorMessage" :success="successMessage" />
    </form>
  </EventFormContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import InputMask from 'primevue/inputmask';
import Button from 'primevue/button';
import { createEventSchema } from '../schemas/eventSchemas';
import { useEventsManagementStore } from '../stores/useEventsManagementStore';
import EventFormContainer from './shared/EventFormContainer.vue';
import EventFormMessages from './shared/EventFormMessages.vue';

// Stores
const eventsStore = useEventsManagementStore();

// Local state for messages
const errorMessage = ref<string>('');
const successMessage = ref<string>('');

// Form setup with Vee-Validate and Zod
const { handleSubmit, meta, resetForm } = useForm({
  validationSchema: toTypedSchema(createEventSchema),
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
  useField<Date>('event_date');
const { value: event_time, errorMessage: event_timeError } =
  useField<string>('event_time');

// Computed properties
const isLoading = computed(() => eventsStore.loading);

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

    const success = await eventsStore.createEvent(formData);

    if (success) {
      successMessage.value = 'Event created successfully!';
      resetForm();
      // Form will be hidden by the store action
    } else {
      errorMessage.value = eventsStore.error || 'Failed to create event';
    }
  } catch (error) {
    errorMessage.value = 'An unexpected error occurred';
    console.error('Error creating event:', error);
  }
});

// Cancel handler
const handleCancel = (): void => {
  eventsStore.hideAddForm();
  resetForm();
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
