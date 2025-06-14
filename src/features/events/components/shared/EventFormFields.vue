<template>
  <div class="space-y-6">
    <!-- Event Name Field -->
    <div class="animate-fade-in">
      <label
        :for="`${fieldPrefix}-event-name`"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        Event Name <span class="text-red-500">*</span>
      </label>
      <InputText
        :id="`${fieldPrefix}-event-name`"
        v-model="eventName"
        placeholder="Enter event name"
        :class="{ 'p-invalid': errors.event_name.value }"
        :disabled="disabled"
        class="w-full"
        :data-testid="`${fieldPrefix}-event-name-input`"
      />
      <p v-if="errors.event_name.value" class="p-error text-red-600 mt-1">
        {{ errors.event_name.value }}
      </p>
    </div>

    <!-- Country Field -->
    <div class="animate-fade-in">
      <label
        :for="`${fieldPrefix}-country`"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        Country <span class="text-red-500">*</span>
      </label>
      <InputText
        :id="`${fieldPrefix}-country`"
        v-model="country"
        placeholder="Enter country"
        :class="{ 'p-invalid': errors.country.value }"
        :disabled="disabled"
        class="w-full"
        :data-testid="`${fieldPrefix}-event-country-input`"
      />
      <p v-if="errors.country.value" class="p-error text-red-600 mt-1">
        {{ errors.country.value }}
      </p>
    </div>

    <!-- City Field -->
    <div class="animate-fade-in">
      <label
        :for="`${fieldPrefix}-city`"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        City <span class="text-red-500">*</span>
      </label>
      <InputText
        :id="`${fieldPrefix}-city`"
        v-model="city"
        placeholder="Enter city"
        :class="{ 'p-invalid': errors.city.value }"
        :disabled="disabled"
        class="w-full"
        :data-testid="`${fieldPrefix}-event-city-input`"
      />
      <p v-if="errors.city.value" class="p-error text-red-600 mt-1">
        {{ errors.city.value }}
      </p>
    </div>

    <!-- Venue Name Field -->
    <div class="animate-fade-in">
      <label
        :for="`${fieldPrefix}-venue-name`"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        Venue Name <span class="text-red-500">*</span>
      </label>
      <InputText
        :id="`${fieldPrefix}-venue-name`"
        v-model="venueName"
        placeholder="Enter venue name"
        :class="{ 'p-invalid': errors.venue_name.value }"
        :disabled="disabled"
        class="w-full"
        :data-testid="`${fieldPrefix}-event-venue-input`"
      />
      <p v-if="errors.venue_name.value" class="p-error text-red-600 mt-1">
        {{ errors.venue_name.value }}
      </p>
    </div>

    <!-- Event Date Field -->
    <div class="animate-fade-in">
      <label
        :for="`${fieldPrefix}-event-date`"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        Event Date <span class="text-red-500">*</span>
      </label>
      <DatePicker
        :id="`${fieldPrefix}-event-date`"
        v-model="eventDate"
        :min-date="helpers.getMinDate()"
        :max-date="helpers.getMaxDate()"
        :class="{ 'p-invalid': errors.event_date.value }"
        :disabled="disabled || isPastEvent"
        class="w-full"
        date-format="yy-mm-dd"
        placeholder="Select event date"
        :data-testid="`${fieldPrefix}-event-date-input`"
        show-icon
      />
      <p v-if="errors.event_date.value" class="p-error text-red-600 mt-1">
        {{ errors.event_date.value }}
      </p>
      <p v-if="isPastEvent" class="text-amber-600 text-sm mt-1">
        Warning: This event is in the past and cannot be rescheduled to an
        earlier date.
      </p>
      <small v-else class="text-gray-600 mt-1 block">
        Event must be scheduled for today or in the future (max 1 year ahead)
      </small>
    </div>

    <!-- Event Time Field (Optional) -->
    <div class="animate-fade-in">
      <label
        :for="`${fieldPrefix}-event-time`"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        Event Time
      </label>
      <InputMask
        :id="`${fieldPrefix}-event-time`"
        v-model="eventTime"
        mask="99:99"
        placeholder="HH:MM (24-hour format)"
        :class="{ 'p-invalid': errors.event_time.value }"
        :disabled="disabled"
        class="w-full"
        :data-testid="`${fieldPrefix}-event-time-input`"
      />
      <p v-if="errors.event_time.value" class="p-error text-red-600 mt-1">
        {{ errors.event_time.value }}
      </p>
      <small class="text-gray-600 mt-1 block">
        Optional - Enter time in 24-hour format (e.g., 22:30)
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Ref } from 'vue';
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import InputMask from 'primevue/inputmask';
import type { useEventFormHelpers } from '../../composables/useEventFormHelpers';

// Props interface - now simplified without the field values
interface Props {
  errors: {
    event_name: Ref<string | undefined>;
    country: Ref<string | undefined>;
    city: Ref<string | undefined>;
    venue_name: Ref<string | undefined>;
    event_date: Ref<string | undefined>;
    event_time: Ref<string | undefined>;
  };
  helpers: ReturnType<typeof useEventFormHelpers>;
  disabled?: boolean;
  isPastEvent?: boolean;
  fieldPrefix?: string;
}

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  isPastEvent: false,
  fieldPrefix: 'event',
});

// Define models for two-way binding - these replace the manual emits
const eventName = defineModel<string>('eventName', { required: true });
const country = defineModel<string>('country', { required: true });
const city = defineModel<string>('city', { required: true });
const venueName = defineModel<string>('venueName', { required: true });
const eventDate = defineModel<Date | null>('eventDate', { required: true });
const eventTime = defineModel<string>('eventTime', { required: true });
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
