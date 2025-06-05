import type { Tables, TablesInsert, TablesUpdate } from './db/database.types'

// ============================================================================
// BASE ENTITY TYPES
// ============================================================================

/** Base User entity from database */
export type UserEntity = Tables<'users'>

/** Base Event entity from database */
export type EventEntity = Tables<'events'>

/** Base Music Style entity from database */
export type MusicStyleEntity = Tables<'music_styles'>

/** Base User Music Style relation from database */
export type UserMusicStyleEntity = Tables<'user_music_styles'>

// ============================================================================
// PAGINATION DTO
// ============================================================================

/** Standard pagination metadata for API responses */
export interface PaginationDto {
  page: number
  limit: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

// ============================================================================
// MUSIC STYLES DTOs
// ============================================================================

/** Music style with user count for GET /api/music-styles */
export interface MusicStyleDto {
  id: string
  style_name: string
  user_count: number
  created_at: string
}

/** Response for GET /api/music-styles */
export interface MusicStylesListResponseDto {
  data: MusicStyleDto[]
  pagination: PaginationDto
}

// ============================================================================
// USER DTOs
// ============================================================================

/** Basic music style reference for user responses */
export interface UserMusicStyleDto {
  id: string
  style_name: string
}

/** User data for list responses - GET /api/users */
export interface UserListItemDto {
  id: string
  artist_name: string
  biography: string
  instagram_url: string | null
  facebook_url: string | null
  music_styles: UserMusicStyleDto[]
  upcoming_events_count: number
  created_at: string
  updated_at: string
}

/** Response for GET /api/users */
export interface UsersListResponseDto {
  data: UserListItemDto[]
  pagination: PaginationDto
}

/** Event data for user detail responses */
export interface UserEventDto {
  id: string
  event_name: string
  country: string
  city: string
  venue_name: string
  event_date: string
  event_time: string | null
}

/** User events grouped by time for GET /api/users/{id} */
export interface UserEventsDto {
  upcoming: UserEventDto[]
  past: UserEventDto[]
}

/** Full user profile data for GET /api/users/{id} */
export interface UserDetailDto {
  id: string
  artist_name: string
  biography: string
  instagram_url: string | null
  facebook_url: string | null
  music_styles: UserMusicStyleDto[]
  events: UserEventsDto
  created_at: string
  updated_at: string
}

/** Response for GET /api/users/{id} */
export interface UserDetailResponseDto {
  data: UserDetailDto
}

// ============================================================================
// USER COMMAND MODELS
// ============================================================================

/** Command model for creating a new user - POST /api/users */
export interface CreateUserCommand {
  user_id: string
  artist_name: string
  biography: string
  instagram_url?: string
  facebook_url?: string
  music_style_ids: string[]
}

/** Command model for updating user profile - PUT /api/users/{id} */
export interface UpdateUserCommand {
  user_id: string
  artist_name?: string
  biography?: string
  instagram_url?: string
  facebook_url?: string
  music_style_ids?: string[]
}

/** Response for user create/update operations */
export interface UserResponseDto {
  data: {
    id: string
    artist_name: string
    biography: string
    instagram_url: string | null
    facebook_url: string | null
    music_styles: UserMusicStyleDto[]
    created_at: string
    updated_at: string
  }
}

// ============================================================================
// EVENT DTOs
// ============================================================================

/** Basic user info for event responses */
export interface EventUserDto {
  id: string
  artist_name: string
}

/** Event data for list responses - GET /api/events */
export interface EventListItemDto {
  id: string
  event_name: string
  country: string
  city: string
  venue_name: string
  event_date: string
  event_time: string | null
  user: EventUserDto
  created_at: string
}

/** Response for GET /api/events */
export interface EventsListResponseDto {
  data: EventListItemDto[]
  pagination: PaginationDto
}

/** Response for GET /api/events/{id} */
export interface EventDetailResponseDto {
  data: EventListItemDto
}

/** Response for GET /api/users/{user_id}/events */
export interface UserEventsResponseDto {
  data: UserEventsDto
}

// ============================================================================
// EVENT COMMAND MODELS
// ============================================================================

/** Command model for creating a new event - POST /api/events */
export interface CreateEventCommand {
  event_name: string
  country: string
  city: string
  venue_name: string
  event_date: string
  event_time?: string
}

/** Command model for updating an event - PUT /api/events/{id} */
export interface UpdateEventCommand {
  event_name: string
  country: string
  city: string
  venue_name: string
  event_date: string
  event_time?: string
}

/** Event response for create/update operations */
export interface EventResponseDto {
  data: {
    id: string
    event_name: string
    country: string
    city: string
    venue_name: string
    event_date: string
    event_time: string | null
    user_id: string
    created_at: string
    updated_at?: string
  }
}

// ============================================================================
// QUERY PARAMETERS DTOs
// ============================================================================

/** Query parameters for GET /api/users */
export interface UsersQueryParams {
  search?: string
  music_styles?: string
  location?: string
  available_from?: string
  available_to?: string
  page?: number
  limit?: number
}

/** Query parameters for GET /api/events */
export interface EventsQueryParams {
  user_id?: string
  country?: string
  city?: string
  venue?: string
  date_from?: string
  date_to?: string
  upcoming_only?: boolean
  page?: number
  limit?: number
}

/** Query parameters for GET /api/users/{user_id}/events */
export interface UserEventsQueryParams {
  upcoming_only?: boolean
  page?: number
  limit?: number
}

/** Query parameters for GET /api/music-styles */
export interface MusicStylesQueryParams {
  search?: string
  page?: number
  limit?: number
}

// ============================================================================
// GENERIC RESPONSE DTOs
// ============================================================================

/** Standard success message response */
export interface SuccessMessageDto {
  message: string
}

/** Standard error response */
export interface ErrorResponseDto {
  error: {
    message: string
    code?: string
    details?: Record<string, any>
  }
}

/** Validation error response */
export interface ValidationErrorDto {
  error: {
    message: string
    code: 'VALIDATION_ERROR'
    details: {
      field: string
      message: string
    }[]
  }
}

// ============================================================================
// DATABASE OPERATION TYPES
// ============================================================================

/** User database insert type derived from database schema */
export type UserInsert = Omit<TablesInsert<'users'>, 'id' | 'created_at' | 'updated_at' | 'search_vector'>

/** User database update type derived from database schema */
export type UserUpdate = Omit<TablesUpdate<'users'>, 'id' | 'created_at' | 'search_vector'>

/** Event database insert type derived from database schema */
export type EventInsert = Omit<TablesInsert<'events'>, 'id' | 'created_at' | 'updated_at' | 'location_search_vector'>

/** Event database update type derived from database schema */
export type EventUpdate = Omit<TablesUpdate<'events'>, 'id' | 'created_at' | 'location_search_vector'>

/** User music style relation insert type */
export type UserMusicStyleInsert = Omit<TablesInsert<'user_music_styles'>, 'id' | 'created_at'> 