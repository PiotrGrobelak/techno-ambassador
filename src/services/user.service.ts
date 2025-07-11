import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, TablesInsert } from '@/db/database.types';
import type {
  CreateUserCommand,
  UpdateUserCommand,
  UserResponseDto,
  UsersListResponseDto,
  UserDetailResponseDto,
  UserListItemDto,
  UserDetailDto,
  UserEventDto,
  UserMusicStyleInsert,
  UserMusicStyleDto,
  UsersQueryParams,
} from '@/types';

/**
 * Service class for user-related business logic and database operations
 * Handles user creation, retrieval, listing, updates, validation, and data transformation
 */
export class UserService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Creates a new user with music style associations
   * @param command - User creation data including user ID
   * @returns Promise<UserResponseDto> - Created user with music styles
   */
  async createUser(command: CreateUserCommand): Promise<UserResponseDto> {
    // Early validation checks
    await this.validateArtistNameUniqueness(command.artist_name);
    await this.validateMusicStylesExist(command.music_style_ids);

    // Validate that the authenticated user doesn't already have a profile
    const { data: existingUser, error: checkError } = await this.supabase
      .from('users')
      .select('id')
      .eq('id', command.user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Failed to check existing user: ${checkError.message}`);
    }

    if (existingUser) {
      throw new Error('User profile already exists');
    }

    // Prepare user data for insertion using authenticated user ID
    const userInsertData = {
      id: command.user_id, // Use user ID from command
      artist_name: command.artist_name,
      biography: command.biography,
      instagram_url: command.instagram_url || null,
      facebook_url: command.facebook_url || null,
      user_type: 'artist', // Default user type for DJ profiles
    };

    // Start transaction for atomic operations
    const { data: createdUser, error: userError } = await this.supabase
      .from('users')
      .insert(userInsertData)
      .select('*')
      .single();

    if (userError) {
      throw new Error(`Failed to create user: ${userError.message}`);
    }

    // Create music style associations
    const musicStyleInserts: UserMusicStyleInsert[] =
      command.music_style_ids.map((styleId) => ({
        user_id: createdUser.id,
        music_style_id: styleId,
      }));

    const { error: musicStyleError } = await this.supabase
      .from('user_music_styles')
      .insert(musicStyleInserts);

    if (musicStyleError) {
      // Rollback user creation if music style association fails
      await this.supabase.from('users').delete().eq('id', createdUser.id);
      throw new Error(
        `Failed to associate music styles: ${musicStyleError.message}`
      );
    }

    // Fetch complete user data with music styles for response
    return await this.getUserWithMusicStyles(createdUser.id);
  }

  /**
   * Retrieves a paginated list of users with advanced filtering capabilities
   * @param queryParams - Query parameters for filtering and pagination
   * @returns Promise<UsersListResponseDto> - Paginated list of users with metadata
   */
  async getUsers(queryParams: UsersQueryParams): Promise<UsersListResponseDto> {
    // Set default pagination values
    const page = Math.max(1, queryParams.page || 1);
    const limit = Math.min(100, Math.max(1, queryParams.limit || 20));
    const offset = (page - 1) * limit;

    // Build base query with joins for music styles and event counts
    let query = this.supabase.from('users').select(
      `
        id,
        artist_name,
        biography,
        instagram_url,
        facebook_url,
        created_at,
        updated_at,
        user_music_styles!inner (
          music_styles (
            id,
            style_name
          )
        )
      `,
      { count: 'exact' }
    );

    // Apply search filter if provided
    if (queryParams.search) {
      const searchTerm = queryParams.search.trim();
      query = query.or(
        `artist_name.ilike.%${searchTerm}%,biography.ilike.%${searchTerm}%`
      );
    }

    // Apply music style filter if provided
    if (queryParams.music_styles) {
      const musicStyleIds = queryParams.music_styles
        .split(',')
        .map((id) => id.trim());
      // Validate music style UUIDs
      await this.validateMusicStylesExist(musicStyleIds);

      query = query.in('user_music_styles.music_style_id', musicStyleIds);
    }

    // Apply location filter if provided (search in events)
    if (queryParams.location) {
      const locationTerm = queryParams.location.trim();
      const { data: userIdsWithLocation } = await this.supabase
        .from('events')
        .select('user_id')
        .or(
          `country.ilike.%${locationTerm}%,city.ilike.%${locationTerm}%,venue_name.ilike.%${locationTerm}%`
        );

      if (userIdsWithLocation && userIdsWithLocation.length > 0) {
        const userIds = userIdsWithLocation.map((event) => event.user_id);
        query = query.in('id', userIds);
      } else {
        // No users found with this location, return empty result
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            total_pages: 0,
            has_next: false,
            has_prev: false,
          },
        };
      }
    }

    // Apply availability filter if provided
    if (queryParams.available_from || queryParams.available_to) {
      const availableUserIds = await this.getAvailableUserIds(
        queryParams.available_from,
        queryParams.available_to
      );

      if (availableUserIds.length > 0) {
        query = query.in('id', availableUserIds);
      } else {
        // No available users found, return empty result
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            total_pages: 0,
            has_next: false,
            has_prev: false,
          },
        };
      }
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    // Transform data and add upcoming events count
    const transformedUsers: UserListItemDto[] = await Promise.all(
      (users || []).map(async (user) => {
        // Get upcoming events count
        const { count: upcomingEventsCount } = await this.supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('event_date', new Date().toISOString().split('T')[0]);

        // Transform music styles
        const musicStyles: UserMusicStyleDto[] =
          user.user_music_styles?.map((ums) => ({
            id: ums.music_styles.id,
            style_name: ums.music_styles.style_name,
          })) || [];

        return {
          id: user.id,
          artist_name: user.artist_name,
          biography: user.biography,
          instagram_url: user.instagram_url,
          facebook_url: user.facebook_url,
          music_styles: musicStyles,
          upcoming_events_count: upcomingEventsCount || 0,
          created_at: user.created_at,
          updated_at: user.updated_at,
        };
      })
    );

    // Calculate pagination metadata
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: transformedUsers,
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
   * Retrieves detailed user profile with events and music styles
   * @param userId - User ID to fetch
   * @returns Promise<UserDetailResponseDto> - Detailed user profile with events
   */
  async getUserById(userId: string): Promise<UserDetailResponseDto> {
    // Validate UUID format
    if (!this.isValidUUID(userId)) {
      throw new Error('Invalid user ID format');
    }

    // Fetch user data with music styles
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select(
        `
        id,
        artist_name,
        biography,
        instagram_url,
        facebook_url,
        created_at,
        updated_at,
        user_music_styles (
          music_styles (
            id,
            style_name
          )
        )
      `
      )
      .eq('id', userId)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        throw new Error('User not found');
      }
      throw new Error(`Failed to fetch user: ${userError.message}`);
    }

    // Fetch user events
    const { data: events, error: eventsError } = await this.supabase
      .from('events')
      .select(
        'id, event_name, country, city, venue_name, event_date, event_time'
      )
      .eq('user_id', userId)
      .order('event_date', { ascending: false });

    if (eventsError) {
      throw new Error(`Failed to fetch user events: ${eventsError.message}`);
    }

    // Categorize events into upcoming and past
    const currentDate = new Date().toISOString().split('T')[0];
    const upcomingEvents: UserEventDto[] = [];
    const pastEvents: UserEventDto[] = [];

    (events || []).forEach((event) => {
      const eventDto: UserEventDto = {
        id: event.id,
        event_name: event.event_name,
        country: event.country,
        city: event.city,
        venue_name: event.venue_name,
        event_date: event.event_date,
        event_time: event.event_time,
      };

      if (event.event_date >= currentDate) {
        upcomingEvents.push(eventDto);
      } else {
        pastEvents.push(eventDto);
      }
    });

    // Transform music styles
    const musicStyles: UserMusicStyleDto[] =
      user.user_music_styles?.map((ums) => ({
        id: ums.music_styles.id,
        style_name: ums.music_styles.style_name,
      })) || [];

    const userDetail: UserDetailDto = {
      id: user.id,
      artist_name: user.artist_name,
      biography: user.biography,
      instagram_url: user.instagram_url,
      facebook_url: user.facebook_url,
      music_styles: musicStyles,
      events: {
        upcoming: upcomingEvents,
        past: pastEvents,
      },
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return { data: userDetail };
  }

  /**
   * Updates user profile with ownership verification
   * @param command - Update command with user ID and new data
   * @returns Promise<UserResponseDto> - Updated user data
   */
  async updateUser(command: UpdateUserCommand): Promise<UserResponseDto> {
    // Validate UUID format
    if (!this.isValidUUID(command.user_id)) {
      throw new Error('Invalid user ID format');
    }

    // Verify user exists
    const { data: existingUser, error: userExistsError } = await this.supabase
      .from('users')
      .select('id')
      .eq('id', command.user_id)
      .single();

    if (userExistsError || !existingUser) {
      throw new Error('User not found');
    }

    // Validate artist name uniqueness if provided
    if (command.artist_name) {
      await this.validateArtistNameUniqueness(
        command.artist_name,
        command.user_id
      );
    }

    // Validate music styles if provided
    if (command.music_style_ids) {
      await this.validateMusicStylesExist(command.music_style_ids);
    }

    // Prepare update data
    const updateData: Partial<TablesInsert<'users'>> = {
      updated_at: new Date().toISOString(),
    };

    if (command.artist_name !== undefined)
      updateData.artist_name = command.artist_name;
    if (command.biography !== undefined)
      updateData.biography = command.biography;
    if (command.instagram_url !== undefined)
      updateData.instagram_url = command.instagram_url || null;
    if (command.facebook_url !== undefined)
      updateData.facebook_url = command.facebook_url || null;

    // Update user data
    const { error: updateError } = await this.supabase
      .from('users')
      .update(updateData)
      .eq('id', command.user_id);

    if (updateError) {
      throw new Error(`Failed to update user: ${updateError.message}`);
    }

    // Update music style associations if provided
    if (command.music_style_ids) {
      // Delete existing associations
      const { error: deleteError } = await this.supabase
        .from('user_music_styles')
        .delete()
        .eq('user_id', command.user_id);

      if (deleteError) {
        throw new Error(
          `Failed to update music style associations: ${deleteError.message}`
        );
      }

      // Insert new associations
      const musicStyleInserts: UserMusicStyleInsert[] =
        command.music_style_ids.map((styleId) => ({
          user_id: command.user_id,
          music_style_id: styleId,
        }));

      const { error: insertError } = await this.supabase
        .from('user_music_styles')
        .insert(musicStyleInserts);

      if (insertError) {
        throw new Error(
          `Failed to create new music style associations: ${insertError.message}`
        );
      }
    }

    // Return updated user data
    return await this.getUserWithMusicStyles(command.user_id);
  }

  /**
   * Validates artist name uniqueness excluding a specific user
   * @param artistName - Artist name to validate
   * @param excludeUserId - User ID to exclude from uniqueness check
   * @throws Error if artist name already exists for another user
   */
  async validateArtistNameUniqueness(
    artistName: string,
    excludeUserId?: string
  ): Promise<void> {
    let query = this.supabase
      .from('users')
      .select('id')
      .eq('artist_name', artistName);

    if (excludeUserId) {
      query = query.neq('id', excludeUserId);
    }

    const { data: existingUser, error } = await query.maybeSingle();

    if (error) {
      throw new Error(
        `Failed to validate artist name uniqueness: ${error.message}`
      );
    }

    if (existingUser) {
      throw new Error('Artist name already exists');
    }
  }

  /**
   * Gets user IDs that are available during the specified date range
   * @param availableFrom - Start date for availability check
   * @param availableTo - End date for availability check
   * @returns Promise<string[]> - Array of available user IDs
   */
  private async getAvailableUserIds(
    availableFrom?: string,
    availableTo?: string
  ): Promise<string[]> {
    if (!availableFrom && !availableTo) {
      // If no date range specified, return all user IDs
      const { data: allUsers } = await this.supabase.from('users').select('id');
      return allUsers?.map((user) => user.id) || [];
    }

    // Build query to find users with conflicting events
    let conflictQuery = this.supabase.from('events').select('user_id');

    if (availableFrom && availableTo) {
      // Check for events that overlap with the requested period
      conflictQuery = conflictQuery
        .gte('event_date', availableFrom)
        .lte('event_date', availableTo);
    } else if (availableFrom) {
      conflictQuery = conflictQuery.gte('event_date', availableFrom);
    } else if (availableTo) {
      conflictQuery = conflictQuery.lte('event_date', availableTo);
    }

    const { data: conflictingEvents } = await conflictQuery;
    const busyUserIds = conflictingEvents?.map((event) => event.user_id) || [];

    // Get all user IDs and filter out busy ones
    const { data: allUsers } = await this.supabase.from('users').select('id');

    const allUserIds = allUsers?.map((user) => user.id) || [];
    return allUserIds.filter((userId) => !busyUserIds.includes(userId));
  }

  /**
   * Validates UUID format
   * @param uuid - String to validate as UUID
   * @returns boolean - True if valid UUID format
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Fetches user data with associated music styles for response formatting
   * @param userId - User ID to fetch
   * @returns Promise<UserResponseDto> - User data with music styles
   */
  private async getUserWithMusicStyles(
    userId: string
  ): Promise<UserResponseDto> {
    // Fetch user data
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error(`Failed to fetch user data: ${userError?.message}`);
    }

    // Fetch associated music styles
    const { data: userMusicStyles, error: musicStyleError } =
      await this.supabase
        .from('user_music_styles')
        .select(
          `
        music_styles (
          id,
          style_name
        )
      `
        )
        .eq('user_id', userId);

    if (musicStyleError) {
      throw new Error(
        `Failed to fetch user music styles: ${musicStyleError.message}`
      );
    }

    // Transform music styles data
    const musicStyles: UserMusicStyleDto[] =
      userMusicStyles?.map((item) => ({
        id: item.music_styles.id,
        style_name: item.music_styles.style_name,
      })) || [];

    return {
      data: {
        id: user.id,
        artist_name: user.artist_name,
        biography: user.biography,
        instagram_url: user.instagram_url,
        facebook_url: user.facebook_url,
        music_styles: musicStyles,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    };
  }

  /**
   * Validates that all provided music style IDs exist in the database
   * @param styleIds - Array of music style UUIDs to validate
   * @throws Error if any music style ID doesn't exist
   */
  async validateMusicStylesExist(styleIds: string[]): Promise<void> {
    const { data: existingStyles, error } = await this.supabase
      .from('music_styles')
      .select('id')
      .in('id', styleIds);

    if (error) {
      throw new Error(`Failed to validate music styles: ${error.message}`);
    }

    if (!existingStyles || existingStyles.length !== styleIds.length) {
      const existingIds = existingStyles?.map((style) => style.id) || [];
      const missingIds = styleIds.filter((id) => !existingIds.includes(id));
      throw new Error(`Invalid music style IDs: ${missingIds.join(', ')}`);
    }
  }
}
