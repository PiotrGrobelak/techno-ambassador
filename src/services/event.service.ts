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
  PaginationDto,
  EventInsert,
  EventUpdate
} from '@/types';

/**
 * Service class for event-related business logic and database operations
 * Handles event creation, retrieval, listing, updates, deletion, validation, and data transformation
 */
export class EventService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Creates a new event for the authenticated user
   * @param command - Event creation data
   * @param userId - Authenticated user ID
   * @returns Promise<EventResponseDto> - Created event data
   */
  async createEvent(command: CreateEventCommand, userId: string): Promise<EventResponseDto> {
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
      user_id: userId
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
        created_at: event.created_at
      }
    };
  }

  /**
   * Retrieves a paginated list of events with filtering
   * @param queryParams - Query parameters for filtering and pagination
   * @returns Promise<EventsListResponseDto> - Paginated list of events
   */
  async getEvents(queryParams: EventsQueryParams): Promise<EventsListResponseDto> {
    // Set default pagination values
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 20;
    const offset = (page - 1) * limit;

    // Build base query with user information
    let query = this.supabase
      .from('events')
      .select(`
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
      `, { count: 'exact' });

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
    const transformedEvents: EventListItemDto[] = (events || []).map((event: any) => ({
      id: event.id,
      event_name: event.event_name,
      country: event.country,
      city: event.city,
      venue_name: event.venue_name,
      event_date: event.event_date,
      event_time: event.event_time,
      user: {
        id: event.users.id,
        artist_name: event.users.artist_name
      } as EventUserDto,
      created_at: event.created_at
    }));

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
        has_prev: page > 1
      }
    };
  }

  /**
   * Retrieves a specific event by ID with user information
   * @param eventId - Event ID to fetch
   * @returns Promise<EventListItemDto> - Event data with user information
   */
  async getEventById(eventId: string): Promise<EventListItemDto> {
    // Validate UUID format
    if (!this.isValidUUID(eventId)) {
      throw new Error('Invalid event ID format');
    }

    // Fetch event data with user information
    const { data: event, error } = await this.supabase
      .from('events')
      .select(`
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
      `)
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
        id: (event as any).users.id,
        artist_name: (event as any).users.artist_name
      } as EventUserDto,
      created_at: event.created_at
    };
  }

  /**
   * Updates an existing event (only for future events and own events)
   * @param eventId - Event ID to update
   * @param command - Update data
   * @param authenticatedUserId - ID of authenticated user
   * @returns Promise<EventResponseDto> - Updated event data
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
      updated_at: new Date().toISOString()
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
        updated_at: event.updated_at
      }
    };
  }

  /**
   * Updates an existing event without authentication (FOR TESTING ONLY)
   * @param eventId - Event ID to update
   * @param command - Update data
   * @returns Promise<EventResponseDto> - Updated event data
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
    const { data: existingEvent, error: checkError } = await this.supabase
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
      updated_at: new Date().toISOString()
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
        updated_at: event.updated_at
      }
    };
  }

  /**
   * Deletes an existing event (only for future events and own events)
   * @param eventId - Event ID to delete
   * @param authenticatedUserId - ID of authenticated user
   * @returns Promise<void>
   */
  async deleteEvent(eventId: string, authenticatedUserId: string): Promise<void> {
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
   * Deletes an existing event without authentication (FOR TESTING ONLY)
   * @param eventId - Event ID to delete
   * @returns Promise<void>
   */
  async deleteEventNoAuth(eventId: string): Promise<void> {
    // Validate UUID format
    if (!this.isValidUUID(eventId)) {
      throw new Error('Invalid event ID format');
    }

    // Check if event exists
    const { data: existingEvent, error: checkError } = await this.supabase
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
   * Validates that an event date is today or in the future and within one year
   * @param eventDate - Event date in YYYY-MM-DD format
   * @returns Promise<void>
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
   * Verifies that the authenticated user owns the event
   * @param eventId - Event ID to check
   * @param authenticatedUserId - ID of authenticated user
   * @returns Promise<void>
   */
  async verifyEventOwnership(eventId: string, authenticatedUserId: string): Promise<void> {
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
      throw new Error('Cannot modify other user\'s events');
    }
  }

  /**
   * Verifies that the event is in the future (not past)
   * @param eventId - Event ID to check
   * @returns Promise<void>
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
   * Validates UUID format
   * @param uuid - String to validate
   * @returns boolean - True if valid UUID
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
} 