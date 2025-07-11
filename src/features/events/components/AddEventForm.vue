<template>
  <EventFormContainer title="Add New Event">
    <form
      class="space-y-6"
      data-testid="add-event-form"
      @submit.prevent="form.onSubmit"
    >
      <!-- Form Fields -->
      <EventFormFields
        v-model:event-name="form.fields.event_name.value"
        v-model:country="form.fields.country.value"
        v-model:city="form.fields.city.value"
        v-model:venue-name="form.fields.venue_name.value"
        v-model:event-date="form.fields.event_date.value"
        v-model:event-time="form.fields.event_time.value"
        :errors="form.errors"
        :helpers="form.helpers"
        :disabled="form.isLoading.value"
        field-prefix="add"
      />

      <!-- Action Buttons -->
      <EventFormActions
        submit-label="Create Event"
        :is-loading="form.isLoading.value"
        :is-valid="form.meta.value.valid"
        test-id-prefix="add-event"
        @cancel="form.handleCancel"
      />

      <!-- Messages -->
      <EventFormMessages
        :error="form.errorMessage.value"
        :success="form.successMessage.value"
      />
    </form>
  </EventFormContainer>
</template>

<script setup lang="ts">
import { useEventForm } from '../composables/useEventForm';
import EventFormContainer from './shared/EventFormContainer.vue';
import EventFormMessages from './shared/EventFormMessages.vue';
import EventFormFields from './shared/EventFormFields.vue';
import EventFormActions from './shared/EventFormActions.vue';

// Initialize form with create mode
const form = useEventForm({
  mode: 'create',
});
</script>

<style scoped>
/* Styles are now handled by the shared components */
</style>
