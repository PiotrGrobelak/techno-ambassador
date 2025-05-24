import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, TablesInsert } from '../db/database.types';
import type { 
  CreateUserCommand, 
  UserResponseDto, 
  UserMusicStyleInsert,
  UserMusicStyleDto 
} from '../types';

/**
 * Service class for user-related business logic and database operations
 * Handles user creation, validation, and data transformation
 */
export class UserService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Creates a new user with music style associations
   * @param command - User creation data
   * @returns Promise<UserResponseDto> - Created user with music styles
   */
  async createUser(command: CreateUserCommand): Promise<UserResponseDto> {
    // Early validation checks
    await this.validateArtistNameUniqueness(command.artist_name);
    await this.validateMusicStylesExist(command.music_style_ids);

    // Prepare user data for insertion
    const userInsertData = {
      artist_name: command.artist_name,
      biography: command.biography,
      instagram_url: command.instagram_url || null,
      facebook_url: command.facebook_url || null,
      user_type: 'artist' // Default user type for DJ profiles
    };

    // Start transaction for atomic operations
    const { data: createdUser, error: userError } = await this.supabase
      .from('users')
      .insert(userInsertData as any) // Cast to any due to incorrect database type definition
      .select('*')
      .single();

    if (userError) {
      throw new Error(`Failed to create user: ${userError.message}`);
    }

    // Create music style associations
    const musicStyleInserts: UserMusicStyleInsert[] = command.music_style_ids.map(styleId => ({
      user_id: createdUser.id,
      music_style_id: styleId
    }));

    const { error: musicStyleError } = await this.supabase
      .from('user_music_styles')
      .insert(musicStyleInserts);

    if (musicStyleError) {
      // Rollback user creation if music style association fails
      await this.supabase.from('users').delete().eq('id', createdUser.id);
      throw new Error(`Failed to associate music styles: ${musicStyleError.message}`);
    }

    // Fetch complete user data with music styles for response
    return await this.getUserWithMusicStyles(createdUser.id);
  }

  /**
   * Validates that the artist name is unique in the system
   * @param artistName - Artist name to validate
   * @throws Error if artist name already exists
   */
  async validateArtistNameUniqueness(artistName: string): Promise<void> {
    const { data: existingUser, error } = await this.supabase
      .from('users')
      .select('id')
      .eq('artist_name', artistName)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to validate artist name uniqueness: ${error.message}`);
    }

    if (existingUser) {
      throw new Error('Artist name already exists');
    }
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
      const existingIds = existingStyles?.map(style => style.id) || [];
      const missingIds = styleIds.filter(id => !existingIds.includes(id));
      throw new Error(`Invalid music style IDs: ${missingIds.join(', ')}`);
    }
  }

  /**
   * Fetches user data with associated music styles for response formatting
   * @param userId - User ID to fetch
   * @returns Promise<UserResponseDto> - User data with music styles
   */
  private async getUserWithMusicStyles(userId: string): Promise<UserResponseDto> {
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
    const { data: userMusicStyles, error: musicStyleError } = await this.supabase
      .from('user_music_styles')
      .select(`
        music_styles (
          id,
          style_name
        )
      `)
      .eq('user_id', userId);

    if (musicStyleError) {
      throw new Error(`Failed to fetch user music styles: ${musicStyleError.message}`);
    }

    // Transform music styles data
    const musicStyles: UserMusicStyleDto[] = userMusicStyles?.map((item: any) => ({
      id: item.music_styles.id,
      style_name: item.music_styles.style_name
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
        updated_at: user.updated_at
      }
    };
  }
} 