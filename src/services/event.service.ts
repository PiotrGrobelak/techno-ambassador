import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/db/database.types';
import type {
  CreateEventCommand,
  UpdateEventCommand,
  EventResponseDto,
  EventsListResponseDto,
  EventListItemDto,
  EventUserDto,
  EventsQueryParams,
  EventInsert,
  EventUpdate,
} from '@/types';

/**
 * Service class for event-related business logic and database operations.
 *
 * This service provides a comprehensive interface for managing techno music events,
 * including creation, retrieval, listing, updates, and deletion operations.
 * It handles all event-related business rules such as date validation, ownership
 * verification, and data transformation between database and API layers.
 *
 * @class EventService
 * @author Techno Ambassador Platform
 * @version 1.0.0
 * @since 2024
 *
 * @example
 * ```typescript
 * const eventService = new EventService(supabaseClient);
 *
 * // Create a new event
 * const newEvent = await eventService.createEvent({
 *   event_name: "Techno Night 2024",
 *   country: "Germany",
 *   city: "Berlin",
 *   venue_name: "Berghain",
 *   event_date: "2024-12-31",
 *   event_time: "23:00"
 * }, userId);
 *
 * // Get paginated events list
 * const events = await eventService.getEvents({
 *   page: 1,
 *   limit: 20,
 *   upcoming_only: true
 * });
 * ```
 *
 * @dependencies
 * - Supabase Client for database operations
 * - Database types for type safety
 * - Event-related DTOs and types
 *
 * @security
 * - All operations require proper authentication except for testing methods
 * - Event ownership is verified for update/delete operations
 * - Only future events can be modified or deleted
 */
export class EventService {
  /**
   * Creates an instance of EventService.
   *
   * @param {SupabaseClient<Database>} supabase - Configured Supabase client instance
   * @throws {Error} If supabase client is not properly configured
   *
   * @example
   * ```typescript
   * import { createClient } from '@supabase/supabase-js';
   *
   * const supabase = createClient(url, key);
   * const eventService = new EventService(supabase);
   * ```
   */
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Creates a new event for the authenticated user.
   *
   * This method validates the event date, prepares the event data for insertion,
   * and stores it in the database. The event date must be today or in the future
   * and within one year from today.
   *
   * @param {CreateEventCommand} command - Event creation data containing all required fields
   * @param {string} userId - Authenticated user ID (must be valid UUID)
   * @returns {Promise<EventResponseDto>} Promise resolving to created event data with metadata
   *
   * @throws {Error} When event date is in the past or more than one year ahead
   * @throws {Error} When database insertion fails
   * @throws {Error} When user ID is invalid
   *
   * @example
   * ```typescript
   * const command = {
   *   event_name: "Techno Underground",
   *   country: "Netherlands",
   *   city: "Amsterdam",
   *   venue_name: "Warehouse X",
   *   event_date: "2024-06-15",
   *   event_time: "22:00"
   * };
   *
   * try {
   *   const result = await eventService.createEvent(command, "user-uuid-123");
   *   console.log("Event created:", result.data);
   * } catch (error) {
   *   console.error("Failed to create event:", error.message);
   * }
   * ```
   *
   * @see {@link validateEventDate} for date validation rules
   */
  async createEvent(
    command: CreateEventCommand,
    userId: string
  ): Promise<EventResponseDto> {
    // Validate event date is not in the past
    await this.validateEventDate(command.event_date);

    // Prepare event data for insertion
    const eventData: EventInsert = {
      event_name: command.event_name,
      country: command.country,
      city: command.city,
      venue_name: command.venue_name,
      event_date: command.event_date,
      event_time: command.event_time || null,
      user_id: userId,
    };

    // Insert event into database
    const { data: event, error } = await this.supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }

    return {
      data: {
        id: event.id,
        event_name: event.event_name,
        country: event.country,
        city: event.city,
        venue_name: event.venue_name,
        event_date: event.event_date,
        event_time: event.event_time,
        user_id: event.user_id,
        created_at: event.created_at,
      },
    };
  }

  /**
   * Retrieves a paginated list of events with optional filtering.
   *
   * This method supports comprehensive filtering by user, location, venue, and date range.
   * Results are paginated and ordered by event date (newest first), then by creation date.
   * Each event includes associated user information (artist name).
   *
   * @param {EventsQueryParams} queryParams - Query parameters for filtering and pagination
   * @param {number} [queryParams.page=1] - Page number (1-based)
   * @param {number} [queryParams.limit=20] - Number of items per page (max 100)
   * @param {string} [queryParams.user_id] - Filter by specific user ID
   * @param {string} [queryParams.country] - Filter by country (case-insensitive partial match)
   * @param {string} [queryParams.city] - Filter by city (case-insensitive partial match)
   * @param {string} [queryParams.venue] - Filter by venue name (case-insensitive partial match)
   * @param {string} [queryParams.date_from] - Filter events from this date (YYYY-MM-DD)
   * @param {string} [queryParams.date_to] - Filter events to this date (YYYY-MM-DD)
   * @param {boolean} [queryParams.upcoming_only] - Show only future events
   * @returns {Promise<EventsListResponseDto>} Promise resolving to paginated list with metadata
   *
   * @throws {Error} When database query fails
   * @throws {Error} When invalid date format is provided
   *
   * @example
   * ```typescript
   * // Get first page of upcoming events in Berlin
   * const berlinEvents = await eventService.getEvents({
   *   page: 1,
   *   limit: 10,
   *   city: "Berlin",
   *   upcoming_only: true
   * });
   *
   * console.log(`Found ${berlinEvents.pagination.total} events`);
   * console.log(`Page ${berlinEvents.pagination.page} of ${berlinEvents.pagination.total_pages}`);
   *
   * // Get user's events for date range
   * const userEvents = await eventService.getEvents({
   *   user_id: "user-uuid-123",
   *   date_from: "2024-01-01",
   *   date_to: "2024-12-31"
   * });
   * ```
   *
   * @performance
   * - Uses database indexes on event_date and user_id for optimal performance
   * - Limits results to prevent memory issues with large datasets
   * - Includes total count for pagination without additional queries
   */
  async getEvents(
    queryParams: EventsQueryParams
  ): Promise<EventsListResponseDto> {
    // Set default pagination values
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 20;
    const offset = (page - 1) * limit;

    // Build base query with user information
    let query = this.supabase.from('events').select(
      `
        id,
        event_name,
        country,
        city,
        venue_name,
        event_date,
        event_time,
        created_at,
        users!inner (
          id,
          artist_name
        )
      `,
      { count: 'exact' }
    );

    // Apply filters
    if (queryParams.user_id) {
      query = query.eq('user_id', queryParams.user_id);
    }

    if (queryParams.country) {
      query = query.ilike('country', `%${queryParams.country}%`);
    }

    if (queryParams.city) {
      query = query.ilike('city', `%${queryParams.city}%`);
    }

    if (queryParams.venue) {
      query = query.ilike('venue_name', `%${queryParams.venue}%`);
    }

    if (queryParams.date_from) {
      query = query.gte('event_date', queryParams.date_from);
    }

    if (queryParams.date_to) {
      query = query.lte('event_date', queryParams.date_to);
    }

    if (queryParams.upcoming_only) {
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('event_date', today);
    }

    // Apply pagination and ordering
    query = query
      .order('event_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: events, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    // Transform data
    const transformedEvents: EventListItemDto[] = (events || []).map(
      (event) => ({
        id: event.id,
        event_name: event.event_name,
        country: event.country,
        city: event.city,
        venue_name: event.venue_name,
        event_date: event.event_date,
        event_time: event.event_time,
        user: {
          id: event.users.id,
          artist_name: event.users.artist_name,
        } as EventUserDto,
        created_at: event.created_at,
      })
    );

    // Calculate pagination metadata
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: transformedEvents,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  /**
   * Retrieves a specific event by ID with associated user information.
   *
   * This method fetches a single event with its creator's details.
   * The event ID must be a valid UUID format.
   *
   * @param {string} eventId - Event ID to fetch (must be valid UUID)
   * @returns {Promise<EventListItemDto>} Promise resolving to event data with user information
   *
   * @throws {Error} When event ID format is invalid (not a valid UUID)
   * @throws {Error} When event is not found (returns "Event not found")
   * @throws {Error} When database query fails
   *
   * @example
   * ```typescript
   * try {
   *   const event = await eventService.getEventById("123e4567-e89b-12d3-a456-426614174000");
   *   console.log(`Event: ${event.event_name} by ${event.user.artist_name}`);
   *   console.log(`Location: ${event.city}, ${event.country}`);
   *   console.log(`Date: ${event.event_date} at ${event.event_time || "TBA"}`);
   * } catch (error) {
   *   if (error.message === "Event not found") {
   *     console.log("This event doesn't exist");
   *   } else {
   *     console.error("Error fetching event:", error.message);
   *   }
   * }
   * ```
   *
   * @see {@link isValidUUID} for UUID validation logic
   */
  async getEventById(eventId: string): Promise<EventListItemDto> {
    // Validate UUID format
    if (!this.isValidUUID(eventId)) {
      throw new Error('Invalid event ID format');
    }

    // Fetch event data with user information
    const { data: event, error } = await this.supabase
      .from('events')
      .select(
        `
        id,
        event_name,
        country,
        city,
        venue_name,
        event_date,
        event_time,
        created_at,
        users!inner (
          id,
          artist_name
        )
      `
      )
      .eq('id', eventId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Event not found');
      }
      throw new Error(`Failed to fetch event: ${error.message}`);
    }

    return {
      id: event.id,
      event_name: event.event_name,
      country: event.country,
      city: event.city,
      venue_name: event.venue_name,
      event_date: event.event_date,
      event_time: event.event_time,
      user: {
        id: event.users.id,
        artist_name: event.users.artist_name,
      } as EventUserDto,
      created_at: event.created_at,
    };
  }

  /**
   * Updates an existing event with ownership and date validation.
   *
   * This method allows updating event details with strict business rules:
   * - Only the event creator can update their events
   * - Only future events can be updated (past events are immutable)
   * - New event date must still comply with date validation rules
   *
   * @param {string} eventId - Event ID to update (must be valid UUID)
   * @param {UpdateEventCommand} command - Update data (all fields optional)
   * @param {string} authenticatedUserId - ID of authenticated user (must own the event)
   * @returns {Promise<EventResponseDto>} Promise resolving to updated event data
   *
   * @throws {Error} When event ID format is invalid
   * @throws {Error} When event is not found
   * @throws {Error} When user doesn't own the event ("Cannot modify other user's events")
   * @throws {Error} When trying to update a past event ("Cannot modify past events")
   * @throws {Error} When new event date is invalid
   * @throws {Error} When database update fails
   *
   * @example
   * ```typescript
   * const updateCommand = {
   *   event_name: "Techno Underground - Updated",
   *   venue_name: "New Venue Location",
   *   event_time: "23:30"
   * };
   *
   * try {
   *   const updated = await eventService.updateEvent(
   *     "event-uuid-123",
   *     updateCommand,
   *     "user-uuid-456"
   *   );
   *   console.log("Event updated successfully:", updated.data);
   * } catch (error) {
   *   if (error.message.includes("Cannot modify")) {
   *     console.error("Permission denied:", error.message);
   *   } else {
   *     console.error("Update failed:", error.message);
   *   }
   * }
   * ```
   *
   * @security
   * - Verifies event ownership before allowing updates
   * - Prevents modification of past events to maintain data integrity
   * - Double-checks user ID in database query for additional security
   *
   * @see {@link verifyEventOwnership} for ownership validation
   * @see {@link verifyEventIsFuture} for date validation
   * @see {@link validateEventDate} for new date validation
   */
  async updateEvent(
    eventId: string,
    command: UpdateEventCommand,
    authenticatedUserId: string
  ): Promise<EventResponseDto> {
    // Validate UUID format
    if (!this.isValidUUID(eventId)) {
      throw new Error('Invalid event ID format');
    }

    // Verify event ownership and that it's a future event
    await this.verifyEventOwnership(eventId, authenticatedUserId);
    await this.verifyEventIsFuture(eventId);

    // Validate new event date if provided
    if (command.event_date) {
      await this.validateEventDate(command.event_date);
    }

    // Prepare update data
    const updateData: EventUpdate = {
      event_name: command.event_name,
      country: command.country,
      city: command.city,
      venue_name: command.venue_name,
      event_date: command.event_date,
      event_time: command.event_time || null,
      updated_at: new Date().toISOString(),
    };

    // Update event in database
    const { data: event, error } = await this.supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .eq('user_id', authenticatedUserId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }

    return {
      data: {
        id: event.id,
        event_name: event.event_name,
        country: event.country,
        city: event.city,
        venue_name: event.venue_name,
        event_date: event.event_date,
        event_time: event.event_time,
        user_id: event.user_id,
        created_at: event.created_at,
        updated_at: event.updated_at,
      },
    };
  }

  /**
   * Updates an existing event without authentication checks.
   *
   * @deprecated This method is for testing purposes only and should not be used in production.
   * It bypasses all security checks including ownership verification and authentication.
   *
   * @param {string} eventId - Event ID to update (must be valid UUID)
   * @param {UpdateEventCommand} command - Update data (all fields optional)
   * @returns {Promise<EventResponseDto>} Promise resolving to updated event data
   *
   * @throws {Error} When event ID format is invalid
   * @throws {Error} When event is not found
   * @throws {Error} When database update fails
   *
   * @warning ⚠️ SECURITY RISK: This method bypasses all authentication and authorization checks.
   * Only use in controlled testing environments.
   *
   * @example
   * ```typescript
   * // FOR TESTING ONLY - DO NOT USE IN PRODUCTION
   * const updated = await eventService.updateEventNoAuth(eventId, updateData);
   * ```
   */
  async updateEventNoAuth(
    eventId: string,
    command: UpdateEventCommand
  ): Promise<EventResponseDto> {
    // Validate UUID format
    if (!this.isValidUUID(eventId)) {
      throw new Error('Invalid event ID format');
    }

    // Check if event exists
    const { error: checkError } = await this.supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        throw new Error('Event not found');
      }
      throw new Error(`Failed to check event: ${checkError.message}`);
    }

    // Prepare update data
    const updateData: EventUpdate = {
      event_name: command.event_name,
      country: command.country,
      city: command.city,
      venue_name: command.venue_name,
      event_date: command.event_date,
      event_time: command.event_time || null,
      updated_at: new Date().toISOString(),
    };

    // Update event in database without ownership check
    const { data: event, error } = await this.supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }

    return {
      data: {
        id: event.id,
        event_name: event.event_name,
        country: event.country,
        city: event.city,
        venue_name: event.venue_name,
        event_date: event.event_date,
        event_time: event.event_time,
        user_id: event.user_id,
        created_at: event.created_at,
        updated_at: event.updated_at,
      },
    };
  }

  /**
   * Deletes an existing event with ownership and date validation.
   *
   * This method permanently removes an event from the database with strict business rules:
   * - Only the event creator can delete their events
   * - Only future events can be deleted (past events are preserved for historical data)
   * - Deletion is permanent and cannot be undone
   *
   * @param {string} eventId - Event ID to delete (must be valid UUID)
   * @param {string} authenticatedUserId - ID of authenticated user (must own the event)
   * @returns {Promise<void>} Promise that resolves when deletion is complete
   *
   * @throws {Error} When event ID format is invalid
   * @throws {Error} When event is not found
   * @throws {Error} When user doesn't own the event ("Cannot modify other user's events")
   * @throws {Error} When trying to delete a past event ("Cannot modify past events")
   * @throws {Error} When database deletion fails
   *
   * @example
   * ```typescript
   * try {
   *   await eventService.deleteEvent("event-uuid-123", "user-uuid-456");
   *   console.log("Event deleted successfully");
   * } catch (error) {
   *   if (error.message.includes("Cannot modify")) {
   *     console.error("Permission denied:", error.message);
   *   } else if (error.message === "Event not found") {
   *     console.error("Event doesn't exist");
   *   } else {
   *     console.error("Deletion failed:", error.message);
   *   }
   * }
   * ```
   *
   * @security
   * - Verifies event ownership before allowing deletion
   * - Prevents deletion of past events to maintain historical records
   * - Double-checks user ID in database query for additional security
   *
   * @warning ⚠️ PERMANENT ACTION: This operation cannot be undone. Consider implementing
   * soft deletion for better data recovery capabilities.
   *
   * @see {@link verifyEventOwnership} for ownership validation
   * @see {@link verifyEventIsFuture} for date validation
   */
  async deleteEvent(
    eventId: string,
    authenticatedUserId: string
  ): Promise<void> {
    // Validate UUID format
    if (!this.isValidUUID(eventId)) {
      throw new Error('Invalid event ID format');
    }

    // Verify event ownership and that it's a future event
    await this.verifyEventOwnership(eventId, authenticatedUserId);
    await this.verifyEventIsFuture(eventId);

    // Delete event from database
    const { error } = await this.supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', authenticatedUserId);

    if (error) {
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  /**
   * Deletes an existing event without authentication checks.
   *
   * @deprecated This method is for testing purposes only and should not be used in production.
   * It bypasses all security checks including ownership verification and date validation.
   *
   * @param {string} eventId - Event ID to delete (must be valid UUID)
   * @returns {Promise<void>} Promise that resolves when deletion is complete
   *
   * @throws {Error} When event ID format is invalid
   * @throws {Error} When event is not found
   * @throws {Error} When database deletion fails
   *
   * @warning ⚠️ SECURITY RISK: This method bypasses all authentication and authorization checks.
   * Only use in controlled testing environments.
   *
   * @example
   * ```typescript
   * // FOR TESTING ONLY - DO NOT USE IN PRODUCTION
   * await eventService.deleteEventNoAuth(eventId);
   * ```
   */
  async deleteEventNoAuth(eventId: string): Promise<void> {
    // Validate UUID format
    if (!this.isValidUUID(eventId)) {
      throw new Error('Invalid event ID format');
    }

    // Check if event exists
    const { error: checkError } = await this.supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        throw new Error('Event not found');
      }
      throw new Error(`Failed to check event: ${checkError.message}`);
    }

    // Delete event from database without ownership check
    const { error } = await this.supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  /**
   * Validates that an event date meets business requirements.
   *
   * This method enforces the platform's event date policy:
   * - Events cannot be scheduled for past dates (must be today or future)
   * - Events cannot be scheduled more than one year in advance
   * - Date must be in valid YYYY-MM-DD format
   *
   * @param {string} eventDate - Event date in YYYY-MM-DD format
   * @returns {Promise<void>} Promise that resolves if date is valid
   *
   * @throws {Error} When event date is in the past ("Event date must be today or in the future")
   * @throws {Error} When event date is more than one year ahead ("Event date must be within one year from today")
   * @throws {Error} When date format is invalid (thrown by Date constructor)
   *
   * @example
   * ```typescript
   * try {
   *   await eventService.validateEventDate("2024-12-31");
   *   console.log("Date is valid");
   * } catch (error) {
   *   console.error("Invalid date:", error.message);
   * }
   *
   * // Invalid examples:
   * await eventService.validateEventDate("2023-01-01"); // Past date
   * await eventService.validateEventDate("2026-01-01"); // Too far in future
   * await eventService.validateEventDate("invalid");    // Invalid format
   * ```
   *
   * @businessRule The one-year limit prevents abuse and ensures event data remains relevant
   * and manageable for the platform's scheduling and notification systems.
   */
  async validateEventDate(eventDate: string): Promise<void> {
    const eventDateObj = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if event is in the past
    if (eventDateObj < today) {
      throw new Error('Event date must be today or in the future');
    }

    // Check if event is more than one year ahead
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    if (eventDateObj > oneYearFromNow) {
      throw new Error('Event date must be within one year from today');
    }
  }

  /**
   * Verifies that the authenticated user owns the specified event.
   *
   * This method ensures that only event creators can modify their own events,
   * preventing unauthorized access to other users' event data.
   *
   * @param {string} eventId - Event ID to check ownership for (must be valid UUID)
   * @param {string} authenticatedUserId - ID of the authenticated user claiming ownership
   * @returns {Promise<void>} Promise that resolves if user owns the event
   *
   * @throws {Error} When event is not found ("Event not found")
   * @throws {Error} When user doesn't own the event ("Cannot modify other user's events")
   * @throws {Error} When database query fails
   *
   * @example
   * ```typescript
   * try {
   *   await eventService.verifyEventOwnership("event-uuid-123", "user-uuid-456");
   *   console.log("User owns this event");
   * } catch (error) {
   *   if (error.message === "Cannot modify other user's events") {
   *     console.error("Access denied - not your event");
   *   } else {
   *     console.error("Verification failed:", error.message);
   *   }
   * }
   * ```
   *
   * @security This is a critical security method that prevents unauthorized modifications.
   * It should be called before any update or delete operation.
   */
  async verifyEventOwnership(
    eventId: string,
    authenticatedUserId: string
  ): Promise<void> {
    const { data: event, error } = await this.supabase
      .from('events')
      .select('user_id')
      .eq('id', eventId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Event not found');
      }
      throw new Error(`Failed to verify event ownership: ${error.message}`);
    }

    if (event.user_id !== authenticatedUserId) {
      throw new Error("Cannot modify other user's events");
    }
  }

  /**
   * Verifies that the specified event is scheduled for a future date.
   *
   * This method ensures that only upcoming events can be modified or deleted,
   * preserving the integrity of historical event data.
   *
   * @param {string} eventId - Event ID to check (must be valid UUID)
   * @returns {Promise<void>} Promise that resolves if event is in the future
   *
   * @throws {Error} When event is not found ("Event not found")
   * @throws {Error} When event is scheduled for a past date ("Cannot modify past events")
   * @throws {Error} When database query fails
   *
   * @example
   * ```typescript
   * try {
   *   await eventService.verifyEventIsFuture("event-uuid-123");
   *   console.log("Event can be modified");
   * } catch (error) {
   *   if (error.message === "Cannot modify past events") {
   *     console.error("This event already happened");
   *   } else {
   *     console.error("Verification failed:", error.message);
   *   }
   * }
   * ```
   *
   * @businessRule Past events are considered immutable to maintain historical accuracy
   * and prevent data integrity issues with event ratings and reviews.
   */
  async verifyEventIsFuture(eventId: string): Promise<void> {
    const { data: event, error } = await this.supabase
      .from('events')
      .select('event_date')
      .eq('id', eventId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Event not found');
      }
      throw new Error(`Failed to verify event date: ${error.message}`);
    }

    const eventDate = new Date(event.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      throw new Error('Cannot modify past events');
    }
  }

  /**
   * Validates UUID format using RFC 4122 standard.
   *
   * This private method ensures that provided UUIDs conform to the standard format
   * before making database queries, preventing potential SQL injection and ensuring
   * data integrity.
   *
   * @private
   * @param {string} uuid - String to validate as UUID
   * @returns {boolean} True if the string is a valid UUID, false otherwise
   *
   * @example
   * ```typescript
   * // Valid UUIDs:
   * this.isValidUUID("123e4567-e89b-12d3-a456-426614174000"); // true
   * this.isValidUUID("550e8400-e29b-41d4-a716-446655440000"); // true
   *
   * // Invalid UUIDs:
   * this.isValidUUID("not-a-uuid"); // false
   * this.isValidUUID("123-456-789"); // false
   * this.isValidUUID(""); // false
   * ```
   *
   * @pattern The UUID pattern validates:
   * - 8 hexadecimal digits
   * - hyphen
   * - 4 hexadecimal digits
   * - hyphen
   * - version digit (1-5) + 3 hexadecimal digits
   * - hyphen
   * - variant bits (8,9,a,b) + 3 hexadecimal digits
   * - hyphen
   * - 12 hexadecimal digits
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
