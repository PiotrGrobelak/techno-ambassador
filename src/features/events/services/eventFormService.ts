import type { CreateEventFormData, UpdateEventFormData } from '../types';
import type {
  CreateEventCommand,
  UpdateEventCommand,
  EventResponseDto,
} from '@/types';

/**
 * Result type for form service operations
 */
export interface EventFormResult {
  success: boolean;
  data?: EventResponseDto;
  error?: string;
}

/**
 * Event form service layer
 * Handles API calls and data transformation for event forms
 */
export class EventFormService {
  /**
   * Create a new event
   */
  static async createEvent(
    formData: CreateEventFormData
  ): Promise<EventFormResult> {
    try {
      const command = this.transformToCreateCommand(formData);

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

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Update an existing event
   */
  static async updateEvent(
    eventId: string,
    formData: UpdateEventFormData
  ): Promise<EventFormResult> {
    try {
      const command = this.transformToUpdateCommand(formData);

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

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Transform form data to create command
   */
  private static transformToCreateCommand(
    formData: CreateEventFormData
  ): CreateEventCommand {
    return {
      event_name: formData.event_name,
      country: formData.country,
      city: formData.city,
      venue_name: formData.venue_name,
      event_date: formData.event_date,
      event_time: formData.event_time || undefined,
    };
  }

  /**
   * Transform form data to update command
   */
  private static transformToUpdateCommand(
    formData: UpdateEventFormData
  ): UpdateEventCommand {
    return {
      event_name: formData.event_name,
      country: formData.country,
      city: formData.city,
      venue_name: formData.venue_name,
      event_date: formData.event_date,
      event_time: formData.event_time || undefined,
    };
  }
}
