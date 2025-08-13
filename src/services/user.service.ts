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
 * Service class for comprehensive user-related business logic and database operations.
 *
 * This service handles all user profile management including creation, retrieval, listing,
 * updates, validation, and data transformation. It integrates with Supabase database
 * to manage users, their music style associations, and related event data.
 *
 * @class UserService
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const userService = new UserService(supabaseClient);
 *
 * // Create a new user profile
 * const newUser = await userService.createUser({
 *   user_id: 'auth-user-id',
 *   artist_name: 'DJ Example',
 *   biography: 'Professional DJ...',
 *   music_style_ids: ['style-1', 'style-2']
 * });
 *
 * // Get paginated list of users
 * const users = await userService.getUsers({
 *   page: 1,
 *   limit: 20,
 *   search: 'techno'
 * });
 * ```
 *
 * @see {@link Database} For database type definitions
 * @see {@link UserResponseDto} For user response structure
 */
export class UserService {
  /**
   * Creates a new UserService instance.
   *
   * @param {SupabaseClient<Database>} supabase - Configured Supabase client for database operations
   *
   * @example
   * ```typescript
   * import { createClient } from '@supabase/supabase-js';
   *
   * const supabase = createClient(url, key);
   * const userService = new UserService(supabase);
   * ```
   */
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Creates a new user profile with music style associations.
   *
   * This method performs atomic user creation with full validation:
   * - Validates artist name uniqueness
   * - Verifies music style IDs exist
   * - Checks that user doesn't already have a profile
   * - Creates user record and associates music styles
   * - Implements rollback on failure
   *
   * @param {CreateUserCommand} command - Complete user creation data including authenticated user ID
   * @param {string} command.user_id - Authenticated user's UUID from auth system
   * @param {string} command.artist_name - Unique artist/DJ name for the profile
   * @param {string} command.biography - User's biography/description
   * @param {string[]} command.music_style_ids - Array of valid music style UUIDs
   * @param {string} [command.instagram_url] - Optional Instagram profile URL
   * @param {string} [command.facebook_url] - Optional Facebook profile URL
   *
   * @returns {Promise<UserResponseDto>} Created user profile with associated music styles
   *
   * @throws {Error} When artist name already exists
   * @throws {Error} When user profile already exists for authenticated user
   * @throws {Error} When music style IDs are invalid or don't exist
   * @throws {Error} When database operation fails
   *
   * @example
   * ```typescript
   * try {
   *   const newUser = await userService.createUser({
   *     user_id: 'auth-uuid-123',
   *     artist_name: 'DJ TechnoMaster',
   *     biography: 'Professional techno DJ with 10 years experience',
   *     music_style_ids: ['uuid-techno', 'uuid-house'],
   *     instagram_url: 'https://instagram.com/djtechnomaster'
   *   });
   *
   *   console.log('User created:', newUser.data.artist_name);
   * } catch (error) {
   *   console.error('Failed to create user:', error.message);
   * }
   * ```
   *
   * @see {@link validateArtistNameUniqueness} For artist name validation
   * @see {@link validateMusicStylesExist} For music style validation
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
   * Retrieves a paginated list of users with advanced filtering capabilities.
   *
   * This method provides comprehensive user listing with support for:
   * - Text search across artist names and biographies
   * - Music style filtering with multiple style support
   * - Location-based filtering through event venues
   * - Availability filtering based on event calendar
   * - Pagination with configurable limits
   * - Automatic upcoming events counting
   *
   * @param {UsersQueryParams} queryParams - Query parameters for filtering, search, and pagination
   * @param {number} [queryParams.page=1] - Page number (minimum: 1)
   * @param {number} [queryParams.limit=20] - Items per page (minimum: 1, maximum: 100)
   * @param {string} [queryParams.search] - Search term for artist name or biography
   * @param {string} [queryParams.music_styles] - Comma-separated list of music style UUIDs
   * @param {string} [queryParams.location] - Location search term (country, city, or venue)
   * @param {string} [queryParams.available_from] - Start date for availability check (YYYY-MM-DD)
   * @param {string} [queryParams.available_to] - End date for availability check (YYYY-MM-DD)
   *
   * @returns {Promise<UsersListResponseDto>} Paginated list of users with complete metadata
   *
   * @throws {Error} When invalid music style UUIDs are provided
   * @throws {Error} When database query fails
   *
   * @example
   * ```typescript
   * // Basic pagination
   * const users = await userService.getUsers({ page: 1, limit: 10 });
   *
   * // Search with filters
   * const filteredUsers = await userService.getUsers({
   *   page: 1,
   *   limit: 20,
   *   search: 'techno',
   *   music_styles: 'uuid-1,uuid-2',
   *   location: 'Berlin',
   *   available_from: '2024-03-01',
   *   available_to: '2024-03-31'
   * });
   *
   * console.log(`Found ${filteredUsers.pagination.total} users`);
   * console.log(`Page ${filteredUsers.pagination.page} of ${filteredUsers.pagination.total_pages}`);
   * ```
   *
   * @see {@link UsersQueryParams} For complete query parameter options
   * @see {@link UserListItemDto} For returned user item structure
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
   * Retrieves detailed user profile with complete event history and music styles.
   *
   * This method provides comprehensive user details including:
   * - Basic profile information
   * - Associated music styles
   * - Complete event history (categorized as upcoming/past)
   * - Profile creation and update timestamps
   *
   * @param {string} userId - Valid UUID of the user to retrieve
   *
   * @returns {Promise<UserDetailResponseDto>} Complete user profile with events categorized by date
   *
   * @throws {Error} When user ID format is invalid (not a valid UUID)
   * @throws {Error} When user is not found in the database
   * @throws {Error} When database query fails
   *
   * @example
   * ```typescript
   * try {
   *   const userDetail = await userService.getUserById('550e8400-e29b-41d4-a716-446655440000');
   *
   *   console.log(`Artist: ${userDetail.data.artist_name}`);
   *   console.log(`Upcoming events: ${userDetail.data.events.upcoming.length}`);
   *   console.log(`Past events: ${userDetail.data.events.past.length}`);
   *   console.log(`Music styles: ${userDetail.data.music_styles.map(s => s.style_name).join(', ')}`);
   * } catch (error) {
   *   if (error.message === 'User not found') {
   *     console.error('User does not exist');
   *   } else {
   *     console.error('Database error:', error.message);
   *   }
   * }
   * ```
   *
   * @see {@link UserDetailDto} For complete response structure
   * @see {@link UserEventDto} For event data structure
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
   * Updates user profile with comprehensive validation and ownership verification.
   *
   * This method provides safe profile updates with:
   * - User existence verification
   * - Artist name uniqueness validation (excluding current user)
   * - Music style validation for new associations
   * - Atomic music style association updates
   * - Automatic timestamp updates
   *
   * **Important Notes:**
   * - Only provided fields are updated (partial updates supported)
   * - Music style associations are completely replaced if provided
   * - Empty strings for URLs are converted to null
   * - Updated timestamp is automatically set
   *
   * @param {UpdateUserCommand} command - Update command with user ID and new data
   * @param {string} command.user_id - UUID of the user to update (must exist)
   * @param {string} [command.artist_name] - New artist name (must be unique if provided)
   * @param {string} [command.biography] - Updated biography text
   * @param {string} [command.instagram_url] - Instagram URL or empty string to clear
   * @param {string} [command.facebook_url] - Facebook URL or empty string to clear
   * @param {string[]} [command.music_style_ids] - New set of music style UUIDs (replaces all existing)
   *
   * @returns {Promise<UserResponseDto>} Updated user profile with current music styles
   *
   * @throws {Error} When user ID format is invalid
   * @throws {Error} When user is not found
   * @throws {Error} When artist name already exists for another user
   * @throws {Error} When music style IDs are invalid
   * @throws {Error} When database operation fails
   *
   * @example
   * ```typescript
   * // Partial update - only artist name and biography
   * const updatedUser = await userService.updateUser({
   *   user_id: 'user-uuid-123',
   *   artist_name: 'DJ NewName',
   *   biography: 'Updated biography with new information'
   * });
   *
   * // Complete update with new music styles
   * const fullyUpdatedUser = await userService.updateUser({
   *   user_id: 'user-uuid-123',
   *   artist_name: 'DJ Complete',
   *   biography: 'New bio',
   *   instagram_url: 'https://instagram.com/new',
   *   facebook_url: '', // This will clear the URL
   *   music_style_ids: ['new-style-1', 'new-style-2'] // Replaces all existing
   * });
   * ```
   *
   * @see {@link validateArtistNameUniqueness} For uniqueness validation
   * @see {@link validateMusicStylesExist} For style validation
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
   * Validates artist name uniqueness across the platform.
   *
   * Ensures that artist names remain unique to prevent confusion and maintain
   * platform integrity. Supports exclusion of a specific user ID for update operations.
   *
   * @param {string} artistName - Artist name to validate for uniqueness
   * @param {string} [excludeUserId] - User ID to exclude from uniqueness check (for updates)
   *
   * @returns {Promise<void>} Resolves if name is unique, rejects if not
   *
   * @throws {Error} When artist name already exists for another user
   * @throws {Error} When database validation query fails
   *
   * @example
   * ```typescript
   * // For new user creation
   * await userService.validateArtistNameUniqueness('DJ NewArtist');
   *
   * // For user updates (excludes current user)
   * await userService.validateArtistNameUniqueness('DJ UpdatedName', 'current-user-uuid');
   * ```
   *
   * @private This method is used internally by create and update operations
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
   * Determines user IDs that are available during a specified date range.
   *
   * This method checks event calendars to find users who don't have conflicting
   * events during the requested period. Useful for booking and availability queries.
   *
   * **Availability Logic:**
   * - If no date range provided, returns all users
   * - Checks for event date overlaps with requested period
   * - Returns users without conflicting events
   *
   * @param {string} [availableFrom] - Start date for availability check (YYYY-MM-DD format)
   * @param {string} [availableTo] - End date for availability check (YYYY-MM-DD format)
   *
   * @returns {Promise<string[]>} Array of user IDs who are available during the specified period
   *
   * @throws {Error} When date format is invalid or database query fails
   *
   * @example
   * ```typescript
   * // Check availability for specific date range
   * const availableUsers = await userService.getAvailableUserIds('2024-03-01', '2024-03-31');
   *
   * // Check availability from specific date onwards
   * const futureAvailable = await userService.getAvailableUserIds('2024-06-01');
   *
   * // Get all users (no date filtering)
   * const allUsers = await userService.getAvailableUserIds();
   * ```
   *
   * @private This method is used internally by the user listing functionality
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
   * Validates UUID format according to RFC 4122 specification.
   *
   * Performs strict UUID validation to ensure data integrity and prevent
   * database errors from malformed identifiers.
   *
   * @param {string} uuid - String to validate as UUID format
   *
   * @returns {boolean} True if the string is a valid UUID, false otherwise
   *
   * @example
   * ```typescript
   * // Valid UUIDs
   * userService.isValidUUID('550e8400-e29b-41d4-a716-446655440000'); // true
   * userService.isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8'); // true
   *
   * // Invalid formats
   * userService.isValidUUID('not-a-uuid'); // false
   * userService.isValidUUID('550e8400-e29b-41d4-a716'); // false (too short)
   * userService.isValidUUID(''); // false
   * ```
   *
   * @private This method is used internally for input validation
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Fetches complete user data with associated music styles for response formatting.
   *
   * This utility method standardizes user data retrieval with music style associations,
   * ensuring consistent response formatting across different operations.
   *
   * @param {string} userId - Valid UUID of the user to fetch
   *
   * @returns {Promise<UserResponseDto>} Complete user data with associated music styles
   *
   * @throws {Error} When user is not found
   * @throws {Error} When music styles cannot be fetched
   * @throws {Error} When database operation fails
   *
   * @example
   * ```typescript
   * // Used internally after user creation/update
   * const userResponse = await this.getUserWithMusicStyles('user-uuid-123');
   * console.log(userResponse.data.music_styles); // Array of associated music styles
   * ```
   *
   * @private This method is used internally by create and update operations
   * @see {@link UserResponseDto} For response structure
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
   * Validates that all provided music style IDs exist in the database.
   *
   * Ensures data integrity by verifying that all music style references
   * are valid before creating associations. Provides detailed error information
   * about missing style IDs.
   *
   * @param {string[]} styleIds - Array of music style UUIDs to validate
   *
   * @returns {Promise<void>} Resolves if all styles exist, rejects if any are missing
   *
   * @throws {Error} When any music style ID doesn't exist in the database
   * @throws {Error} When database validation query fails
   *
   * @example
   * ```typescript
   * // Validate before user creation
   * await userService.validateMusicStylesExist(['style-1', 'style-2', 'style-3']);
   *
   * // Will throw error with missing IDs
   * try {
   *   await userService.validateMusicStylesExist(['valid-id', 'invalid-id']);
   * } catch (error) {
   *   console.error(error.message); // "Invalid music style IDs: invalid-id"
   * }
   * ```
   *
   * @see {@link UserMusicStyleDto} For music style structure
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
