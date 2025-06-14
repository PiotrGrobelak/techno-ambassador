import { computed, watch } from 'vue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { createEventSchema, updateEventSchema } from '../schemas/eventSchemas';
import { useEventsManagementStore } from '../stores/useEventsManagementStore';
import { useEventFormHelpers } from './useEventFormHelpers';
import { useEventFormMessages } from './useEventFormMessages';
import { EventFormService } from '../services/eventFormService';
import type { EventListItemDto } from '@/types';

/**
 * Event form configuration options
 */
export interface EventFormOptions {
  mode: 'create' | 'edit';
  initialData?: EventListItemDto;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Form field names type
 */
type FormFieldName = 'event_name' | 'country' | 'city' | 'venue_name' | 'event_date' | 'event_time';

/**
 * Main event form composable
 * Integrates form validation, submission, and state management
 */
export const useEventForm = (options: EventFormOptions) => {
  const { mode, initialData, onSuccess, onCancel } = options;
  
  // Dependencies
  const eventsStore = useEventsManagementStore();
  const helpers = useEventFormHelpers();
  const messages = useEventFormMessages();

  // Form setup with appropriate schema
  const validationSchema = mode === 'create' ? createEventSchema : updateEventSchema;
  const initialValues = helpers.getInitialValues(mode, initialData);

  const { handleSubmit, meta, resetForm, setFieldValue, validate } = useForm({
    validationSchema: toTypedSchema(validationSchema),
    initialValues,
  });

  // Form fields with validation
  const { value: event_name, errorMessage: event_nameError } = useField<string>('event_name');
  const { value: country, errorMessage: countryError } = useField<string>('country');
  const { value: city, errorMessage: cityError } = useField<string>('city');
  const { value: venue_name, errorMessage: venue_nameError } = useField<string>('venue_name');
  const { value: event_date, errorMessage: event_dateError } = useField<Date>('event_date');
  const { value: event_time, errorMessage: event_timeError } = useField<string>('event_time');

  // Watch for field changes and trigger validation
  // This ensures form.meta.valid updates when users modify form fields
  watch([event_name, country, city, venue_name, event_date, event_time], () => {
    // Trigger validation when any field changes
    validate();
  }, { deep: true });

  // Computed properties
  const isLoading = computed(() => eventsStore.loading);
  const isPastEvent = computed(() => {
    if (mode === 'create' || !initialData) return false;
    return helpers.isPastDate(initialData.event_date);
  });

  // Form submission handler
  const onSubmit = handleSubmit(async (values) => {
    messages.clearMessages();

    try {
      // Prepare form data with proper date formatting
      const formData = {
        event_name: values.event_name,
        country: values.country,
        city: values.city,
        venue_name: values.venue_name,
        event_date: helpers.formatDateForApi(values.event_date),
        event_time: values.event_time || '',
      };

      // Call appropriate service method
      const result = mode === 'create'
        ? await EventFormService.createEvent(formData)
        : await EventFormService.updateEvent(initialData!.id, formData);

      if (result.success) {
        const successMessage = mode === 'create' 
          ? 'Event created successfully!' 
          : 'Event updated successfully!';
        
        messages.setSuccess(successMessage);
        
        // Refresh events list
        await eventsStore.loadEvents();
        
        // Handle form state based on mode
        if (mode === 'create') {
          eventsStore.hideAddForm();
          resetForm();
        } else {
          eventsStore.setEditingEvent(null);
        }
        
        // Call success callback if provided
        if (onSuccess) onSuccess();
        
        return true;
      } else {
        messages.setError(result.error || 'Operation failed');
        return false;
      }
    } catch (error) {
      messages.setError('An unexpected error occurred');
      console.error(`Error ${mode}ing event:`, error);
      return false;
    }
  });

  // Cancel handler
  const handleCancel = (): void => {
    if (mode === 'create') {
      eventsStore.hideAddForm();
      resetForm();
    } else {
      eventsStore.setEditingEvent(null);
    }
    
    messages.clearMessages();
    
    // Call cancel callback if provided
    if (onCancel) onCancel();
  };

  // Watch for store errors and sync with local messages
  watch(
    () => eventsStore.error,
    (newError) => {
      if (newError) {
        messages.setError(newError);
      }
    }
  );

  // For edit mode, watch for prop changes and update form
  if (mode === 'edit' && initialData) {
    watch(
      () => initialData,
      (newData) => {
        if (newData) {
          const newValues = helpers.getInitialValues('edit', newData);
          // Type-safe field value setting
          (Object.entries(newValues) as [FormFieldName, any][]).forEach(([key, value]) => {
            setFieldValue(key, value);
          });
        }
      },
      { deep: true }
    );
  }

  // Return form interface
  return {
    // Form state
    meta,
    isLoading,
    isPastEvent,
    
    // Form fields
    fields: {
      event_name,
      country,
      city,
      venue_name,
      event_date,
      event_time,
    },
    
    // Field errors
    errors: {
      event_name: event_nameError,
      country: countryError,
      city: cityError,
      venue_name: venue_nameError,
      event_date: event_dateError,
      event_time: event_timeError,
    },
    
    // Messages
    errorMessage: messages.errorMessage,
    successMessage: messages.successMessage,
    
    // Actions
    onSubmit,
    handleCancel,
    resetForm,
    setFieldValue,
    
    // Helpers
    helpers,
  };
}; 