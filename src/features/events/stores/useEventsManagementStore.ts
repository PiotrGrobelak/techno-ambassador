import { defineStore } from 'pinia';
import { ref, computed, readonly, type Ref, type ComputedRef } from 'vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { useStoreErrorHandling } from '@/shared/composables/useStoreErrorHandling';
import type {
  EventListItemDto,
  EventsListResponseDto,
  EventResponseDto,
  CreateEventCommand,
  UpdateEventCommand,
  EventsQueryParams,
  PaginationDto,
  SuccessMessageDto,
} from '@/types';
import type { CreateEventFormData, UpdateEventFormData } from '../types';

/**
 * Events management store for CRUD operations on events
 * Handles loading, creating, updating, and deleting events with proper error handling
 */
export const useEventsManagementStore = defineStore('eventsManagement', () => {
  // Dependencies
  const authStore = useAuthStore();
  const errorHandling = useStoreErrorHandling('Events Management');

  // State
  const events: Ref<EventListItemDto[]> = ref([]);
  const pagination: Ref<PaginationDto> = ref({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  });
  const showAddForm: Ref<boolean> = ref(false);
  const editingEventId: Ref<string | null> = ref(null);
  const deletingEventId: Ref<string | null> = ref(null);

  // Re-export error handling state
  const loading = errorHandling.isLoading;
  const error = errorHandling.error;
  const hasError = errorHandling.hasError;
  const isNetworkError = errorHandling.isNetworkError;

  // Getters
  const isAuthenticated: ComputedRef<boolean> = computed(() => {
    return authStore.isAuthenticated;
  });
  const userId: ComputedRef<string | undefined> = computed(
    () => authStore.userId
  );

  const upcomingEvents: ComputedRef<EventListItemDto[]> = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events.value.filter((event) => new Date(event.event_date) >= today);
  });

  const pastEvents: ComputedRef<EventListItemDto[]> = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events.value.filter((event) => new Date(event.event_date) < today);
  });

  const upcomingEventsCount: ComputedRef<number> = computed(
    () => upcomingEvents.value.length
  );
  const pastEventsCount: ComputedRef<number> = computed(
    () => pastEvents.value.length
  );

  const canCreateEvents: ComputedRef<boolean> = computed(
    () => isAuthenticated.value
  );

  const isAddFormVisible: ComputedRef<boolean> = computed(
    () => showAddForm.value
  );
  const isEditingEvent: ComputedRef<boolean> = computed(
    () => editingEventId.value !== null
  );

  // Actions
  const toggleAddForm = (): void => {
    showAddForm.value = !showAddForm.value;
    // Close editing form when opening add form
    if (showAddForm.value) {
      editingEventId.value = null;
    }
  };

  const hideAddForm = (): void => {
    showAddForm.value = false;
  };

  const setEditingEvent = (eventId: string | null): void => {
    editingEventId.value = eventId;
    // Close add form when editing
    if (eventId) {
      showAddForm.value = false;
    }
  };

  const setDeletingEvent = (eventId: string | null): void => {
    deletingEventId.value = eventId;
  };

  /**
   * Load events from API with optional pagination
   */
  const loadEvents = async (
    page: number = 1,
    limit: number = 10
  ): Promise<void> => {
    if (!isAuthenticated.value || !userId.value) {
      errorHandling.setError('User must be authenticated to load events');
      return;
    }

    const result = await errorHandling.executeWithErrorHandling(
      async () => {
        const queryParams: EventsQueryParams = {
          user_id: userId.value,
          page,
          limit,
        };

        const response = await fetch(
          '/api/events?' +
            new URLSearchParams(
              Object.entries(queryParams).reduce(
                (acc, [key, value]) => {
                  if (value !== undefined) {
                    acc[key] = value.toString();
                  }
                  return acc;
                },
                {} as Record<string, string>
              )
            )
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to load events');
        }

        const data: EventsListResponseDto = await response.json();

        events.value = data.data;
        pagination.value = data.pagination;

        return data;
      },
      'Load events',
      { showToast: false } // Don't show toast for loading
    );

    if (!result) {
      events.value = [];
      pagination.value = {
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false,
      };
    }
  };

  /**
   * Create a new event
   */
  const createEvent = async (
    formData: CreateEventFormData
  ): Promise<boolean> => {
    if (!isAuthenticated.value) {
      errorHandling.setError('User must be authenticated to create events');
      return false;
    }

    const command: CreateEventCommand = {
      event_name: formData.event_name,
      country: formData.country,
      city: formData.city,
      venue_name: formData.venue_name,
      event_date: formData.event_date,
      event_time: formData.event_time || undefined,
    };

    const result = await errorHandling.executeWithErrorHandling(
      async () => {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to create event');
        }

        const data: EventResponseDto = await response.json();

        // Refresh events list
        await loadEvents(pagination.value.page, pagination.value.limit);

        // Hide add form on success
        hideAddForm();

        return data;
      },
      'Create event',
      {
        showToast: true,
      }
    );

    return !!result;
  };

  /**
   * Update an existing event
   */
  const updateEvent = async (
    eventId: string,
    formData: UpdateEventFormData
  ): Promise<boolean> => {
    if (!isAuthenticated.value) {
      errorHandling.setError('User must be authenticated to update events');
      return false;
    }

    const command: UpdateEventCommand = {
      event_name: formData.event_name,
      country: formData.country,
      city: formData.city,
      venue_name: formData.venue_name,
      event_date: formData.event_date,
      event_time: formData.event_time || undefined,
    };

    const result = await errorHandling.executeWithErrorHandling(
      async () => {
        const response = await fetch(`/api/events/${eventId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to update event');
        }

        const data: EventResponseDto = await response.json();

        // Refresh events list
        await loadEvents(pagination.value.page, pagination.value.limit);

        // Clear editing state on success
        setEditingEvent(null);

        return data;
      },
      'Update event',
      {
        showToast: true,
      }
    );

    return !!result;
  };

  /**
   * Delete an event
   */
  const deleteEvent = async (eventId: string): Promise<boolean> => {
    if (!isAuthenticated.value) {
      errorHandling.setError('User must be authenticated to delete events');
      return false;
    }

    const result = await errorHandling.executeWithErrorHandling(
      async () => {
        const response = await fetch(`/api/events/${eventId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to delete event');
        }

        const data: SuccessMessageDto = await response.json();

        // Refresh events list
        await loadEvents(pagination.value.page, pagination.value.limit);

        // Clear deleting state
        setDeletingEvent(null);

        return data;
      },
      'Delete event',
      {
        showToast: true,
      }
    );

    return !!result;
  };

  /**
   * Check if an event is in the past
   */
  const isPastEvent = (eventDate: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(eventDate) < today;
  };

  /**
   * Check if user can edit/delete an event
   */
  const canEditEvent = (event: EventListItemDto): boolean => {
    return !isPastEvent(event.event_date) && event.user.id === userId.value;
  };

  /**
   * Reset store state
   */
  const resetState = (): void => {
    events.value = [];
    pagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      total_pages: 0,
      has_next: false,
      has_prev: false,
    };
    showAddForm.value = false;
    editingEventId.value = null;
    deletingEventId.value = null;
    errorHandling.clearError();
  };

  return {
    // State
    events: readonly(events),
    pagination: readonly(pagination),
    showAddForm: readonly(showAddForm),
    editingEventId: readonly(editingEventId),
    deletingEventId: readonly(deletingEventId),

    // Error handling state
    loading,
    error,
    hasError,
    isNetworkError,

    // Getters
    isAuthenticated,
    userId,
    upcomingEvents,
    pastEvents,
    upcomingEventsCount,
    pastEventsCount,
    canCreateEvents,
    isAddFormVisible,
    isEditingEvent,

    // Actions
    toggleAddForm,
    hideAddForm,
    setEditingEvent,
    setDeletingEvent,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    isPastEvent,
    canEditEvent,
    resetState,
  };
});
