# API Endpoint Implementation Plan: User Management Endpoints

## 1. Endpoint Overview

This document provides comprehensive implementation plans for all user management endpoints in the Techno Ambassador platform. These endpoints handle DJ profile operations including creation, retrieval, listing, and updates. All endpoints implement comprehensive validation, security measures, and maintain data integrity through proper authentication and authorization.

**Covered Endpoints:**

- POST /api/users - Create new DJ profile
- GET /api/users - List all DJ profiles with filtering
- GET /api/users/{id} - Retrieve specific DJ profile
- PUT /api/users/{id} - Update DJ profile

---

# POST /api/users

## 1. Endpoint Overview

The POST /api/users endpoint allows authenticated users to create new DJ profiles in the Techno Ambassador platform. This endpoint handles user registration with artist information, biography, optional social media links, and required music style associations. The endpoint implements comprehensive validation, security measures, and maintains data integrity through transactional operations.

**Purpose:** Create new DJ profile with complete artist information and music style associations  
**Authentication:** Required (Supabase Auth JWT token)  
**Primary Business Logic:** User profile creation with music style relationships

## 2. Request Details

- **HTTP Method:** POST
- **URL Structure:** `/api/users`
- **Content-Type:** `application/json`
- **Authorization:** Bearer token in Authorization header

### Request Parameters

**Required Fields:**

- `artist_name` (string): Unique artist name, max 255 characters
- `biography` (string): Artist biography, max 10,000 characters
- `music_style_ids` (string[]): Array of music style UUIDs, minimum 1 element

**Optional Fields:**

- `instagram_url` (string): Instagram profile URL, max 500 characters
- `facebook_url` (string): Facebook profile URL, max 500 characters

### Request Body Example

```json
{
  "artist_name": "Techno Artist",
  "biography": "Experienced DJ specializing in underground techno...",
  "instagram_url": "https://instagram.com/technoartist",
  "facebook_url": "https://facebook.com/technoartist",
  "music_style_ids": ["uuid1", "uuid2"]
}
```

## 3. Utilized Types

### Command Models

- **CreateUserCommand**: Input validation model for user creation
- **UserInsert**: Database insert type derived from schema
- **UserMusicStyleInsert**: Junction table insert type

### Response DTOs

- **UserResponseDto**: Standardized response format with user data
- **UserMusicStyleDto**: Music style reference in responses
- **ErrorResponseDto**: Standard error response format
- **ValidationErrorDto**: Detailed validation error format

### Database Entities

- **UserEntity**: Base user table structure
- **MusicStyleEntity**: Music style reference data
- **UserMusicStyleEntity**: Junction table entity

## 4. Response Details

### Success Response (201 Created)

```json
{
  "data": {
    "id": "uuid",
    "artist_name": "Techno Artist",
    "biography": "Experienced DJ specializing in underground techno...",
    "instagram_url": "https://instagram.com/technoartist",
    "facebook_url": "https://facebook.com/technoartist",
    "music_styles": [
      {
        "id": "uuid1",
        "style_name": "Techno"
      },
      {
        "id": "uuid2",
        "style_name": "Progressive House"
      }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Error Responses

**400 Bad Request - Validation Error:**

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "artist_name",
        "message": "Artist name is required and must be less than 255 characters"
      }
    ]
  }
}
```

**401 Unauthorized:**

```json
{
  "error": {
    "message": "Authentication required",
    "code": "UNAUTHORIZED"
  }
}
```

**409 Conflict:**

```json
{
  "error": {
    "message": "Artist name already exists",
    "code": "CONFLICT"
  }
}
```

## 5. Data Flow

### 1. Request Processing

1. **Authentication Verification**: Validate JWT token from Authorization header
2. **Input Validation**: Parse and validate request body using Zod schema
3. **Business Logic Validation**: Check artist name uniqueness and music style existence
4. **Database Transaction**: Create user record and music style associations atomically
5. **Response Formation**: Fetch complete user data with music styles for response

### 2. Database Operations

```sql
-- Transaction flow:
BEGIN;
  INSERT INTO users (artist_name, biography, instagram_url, facebook_url, user_type);
  INSERT INTO user_music_styles (user_id, music_style_id) VALUES (...);
COMMIT;
```

### 3. Service Layer Architecture

- **UserService**: Core business logic and validation
- **MusicStyleService**: Music style validation and fetching
- **ErrorLogService**: Comprehensive error logging
- **SupabaseClient**: Database operations with RLS

## 6. Security Considerations

### Authentication & Authorization

- **JWT Token Validation**: Verify Supabase Auth token in Authorization header
- **Row Level Security**: Database-level security policies ensure data isolation
- **User Context**: Extract user ID from authenticated JWT token

### Input Validation & Sanitization

- **Zod Schema Validation**: Comprehensive input validation with detailed error messages
- **URL Validation**: Validate Instagram and Facebook URL formats
- **SQL Injection Prevention**: Use parameterized queries through Supabase client
- **XSS Prevention**: Sanitize all text inputs before storage

### Data Security

- **HTTPS Only**: Enforce secure transport for all API communications
- **Rate Limiting**: Implement request rate limiting to prevent abuse
- **Error Information**: Avoid exposing sensitive system information in error messages

## 7. Error Handling

### Validation Errors (400 Bad Request)

- **Missing Required Fields**: artist_name, biography, music_style_ids
- **Invalid Field Formats**: URL format validation, string length limits
- **Business Rule Violations**: Empty music_style_ids array, invalid UUID formats
- **Non-existent Music Styles**: Invalid music_style_ids that don't exist in database

### Authentication Errors (401 Unauthorized)

- **Missing Authorization Header**: No Bearer token provided
- **Invalid JWT Token**: Expired, malformed, or invalid signature
- **Token Verification Failure**: Supabase Auth token validation failure

### Conflict Errors (409 Conflict)

- **Duplicate Artist Name**: artist_name already exists in system (case-sensitive)

### Server Errors (500 Internal Server Error)

- **Database Connection Issues**: Supabase connection failures
- **Transaction Failures**: Database constraint violations or deadlocks
- **Unexpected System Errors**: Unhandled exceptions and system failures

### Error Logging Strategy

- **Comprehensive Logging**: All errors logged to error_logs table with full context
- **Error Context**: Include request details, user context, and stack traces
- **Monitoring**: Error aggregation for system health monitoring

## 8. Performance Considerations

### Database Optimization

- **Prepared Statements**: Use parameterized queries for optimal performance
- **Transaction Scope**: Minimize transaction duration for better concurrency
- **Index Utilization**: Leverage unique index on artist_name for fast conflict detection
- **Batch Operations**: Efficient bulk insert for user_music_styles relationships

### Response Optimization

- **Selective Fetching**: Fetch only required fields for response formation
- **Music Style Caching**: Consider caching music style lookups for frequent access
- **Connection Pooling**: Utilize Supabase connection pooling for optimal resource usage

### Scalability Considerations

- **Rate Limiting**: Prevent abuse and ensure fair resource allocation
- **Input Size Limits**: Enforce reasonable limits on biography length and music styles count
- **Monitoring**: Track endpoint performance and resource utilization

## 9. Implementation Steps

### Step 1: Define Zod Validation Schema

```typescript
// src/schemas/user.schema.ts
export const createUserSchema = z.object({
  artist_name: z.string().min(1).max(255),
  biography: z.string().min(1).max(10000),
  instagram_url: z.string().url().max(500).optional(),
  facebook_url: z.string().url().max(500).optional(),
  music_style_ids: z.array(z.string().uuid()).min(1),
});
```

### Step 2: Create Service Layer

```typescript
// src/services/user.service.ts
export class UserService {
  async createUser(
    command: CreateUserCommand,
    userId: string
  ): Promise<UserResponseDto>;
  async validateArtistNameUniqueness(artistName: string): Promise<void>;
  async validateMusicStylesExist(styleIds: string[]): Promise<void>;
}
```

### Step 3: Implement API Route Handler

```typescript
// src/pages/api/users.ts
export async function POST({ request, locals }: APIContext): Promise<Response> {
  // 1. Authentication verification
  // 2. Input validation with Zod
  // 3. Business logic validation
  // 4. User creation with transaction
  // 5. Response formation
}
```

### Step 4: Add Error Handling Middleware

```typescript
// src/middleware/error-handler.ts
export async function handleApiError(
  error: unknown,
  context: APIContext
): Promise<Response>;
```

### Step 5: Add Monitoring and Logging

- **Error Logging**: Implement comprehensive error logging to error_logs table

---

# GET /api/users

## 1. Endpoint Overview

The GET /api/users endpoint provides public access to retrieve a paginated list of all DJ profiles with advanced filtering and search capabilities. This endpoint supports full-text search, music style filtering, location-based search, availability checking, and comprehensive pagination. The endpoint is optimized for performance with proper indexing and caching strategies.

**Purpose:** Public listing of DJ profiles with advanced filtering and search capabilities  
**Authentication:** Not required (public endpoint)  
**Primary Business Logic:** Advanced search and filtering with pagination

## 2. Request Details

- **HTTP Method:** GET
- **URL Structure:** `/api/users`
- **Content-Type:** Not applicable (GET request)
- **Authorization:** Not required (public endpoint)

### Query Parameters

**Optional Filtering Parameters:**

- `search` (string): Full-text search in artist name and biography
- `music_styles` (string): Comma-separated list of music style UUIDs
- `location` (string): Search in event locations (country, city, venue)
- `available_from` (date): Check availability from date (YYYY-MM-DD format)
- `available_to` (date): Check availability to date (YYYY-MM-DD format)
- `page` (integer): Page number for pagination (default: 1, minimum: 1)
- `limit` (integer): Items per page (default: 20, minimum: 1, maximum: 100)

### Request URL Examples

```
GET /api/users
GET /api/users?search=techno&page=1&limit=20
GET /api/users?music_styles=uuid1,uuid2&location=Berlin
GET /api/users?available_from=2024-06-01&available_to=2024-06-30
```

## 3. Utilized Types

### Query Models

- **GetUsersQuery**: Input validation model for query parameters
- **PaginationQuery**: Reusable pagination parameters
- **UserSearchFilters**: Search and filtering parameters

### Response DTOs

- **UsersListResponseDto**: Paginated list response format
- **UserSummaryDto**: Simplified user data for list view
- **UserMusicStyleDto**: Music style reference in responses
- **PaginationDto**: Pagination metadata
- **ErrorResponseDto**: Standard error response format

### Database Entities

- **UserEntity**: Base user table structure
- **MusicStyleEntity**: Music style reference data
- **EventEntity**: Event data for availability checking

## 4. Response Details

### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "uuid",
      "artist_name": "Techno Artist",
      "biography": "Experienced DJ specializing in underground techno...",
      "instagram_url": "https://instagram.com/technoartist",
      "facebook_url": "https://facebook.com/technoartist",
      "music_styles": [
        {
          "id": "uuid1",
          "style_name": "Techno"
        },
        {
          "id": "uuid2",
          "style_name": "Progressive House"
        }
      ],
      "upcoming_events_count": 3,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

### Error Responses

**400 Bad Request - Invalid Query Parameters:**

```json
{
  "error": {
    "message": "Invalid query parameters",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "page",
        "message": "Page must be a positive integer"
      },
      {
        "field": "limit",
        "message": "Limit must be between 1 and 100"
      }
    ]
  }
}
```

**500 Internal Server Error:**

```json
{
  "error": {
    "message": "Internal server error",
    "code": "INTERNAL_ERROR"
  }
}
```

## 5. Data Flow

### 1. Request Processing

1. **Query Parameter Validation**: Parse and validate all query parameters using Zod schema
2. **Search Processing**: Process full-text search terms and location filters
3. **Music Style Filtering**: Validate music style UUIDs and build filter conditions
4. **Availability Checking**: Process date range filters for availability checking
5. **Database Query**: Execute optimized query with proper joins and indexing
6. **Response Formation**: Format results with pagination metadata

### 2. Database Operations

```sql
-- Complex query with multiple joins and filters:
SELECT u.*,
       array_agg(ms.style_name) as music_styles,
       COUNT(e.id) FILTER (WHERE e.event_date >= CURRENT_DATE) as upcoming_events_count
FROM users u
LEFT JOIN user_music_styles ums ON u.id = ums.user_id
LEFT JOIN music_styles ms ON ums.music_style_id = ms.id
LEFT JOIN events e ON u.id = e.user_id
WHERE (search conditions)
  AND (music_style conditions)
  AND (availability conditions)
GROUP BY u.id
ORDER BY u.created_at DESC
LIMIT ? OFFSET ?;
```

### 3. Service Layer Architecture

- **UserService**: Core business logic for user retrieval and filtering
- **SearchService**: Full-text search implementation
- **AvailabilityService**: Availability checking logic
- **PaginationService**: Pagination calculation and metadata
- **ErrorLogService**: Comprehensive error logging

## 6. Security Considerations

### Public Access Security

- **Rate Limiting**: Implement request rate limiting to prevent abuse
- **Input Sanitization**: Sanitize all search inputs to prevent injection attacks
- **Data Exposure**: Ensure only public user data is exposed in responses
- **Query Optimization**: Prevent expensive queries that could impact performance

### Input Validation & Sanitization

- **Zod Schema Validation**: Comprehensive validation of all query parameters
- **SQL Injection Prevention**: Use parameterized queries through Supabase client
- **XSS Prevention**: Sanitize search terms and filter inputs
- **Date Validation**: Validate date formats and ranges

## 7. Error Handling

### Validation Errors (400 Bad Request)

- **Invalid Pagination**: Negative page numbers, excessive limit values
- **Invalid Date Formats**: Malformed date strings, invalid date ranges
- **Invalid UUIDs**: Malformed music style UUIDs
- **Invalid Search Terms**: Excessively long search strings

### Server Errors (500 Internal Server Error)

- **Database Connection Issues**: Supabase connection failures
- **Query Performance Issues**: Timeout on complex queries
- **Unexpected System Errors**: Unhandled exceptions and system failures

## 8. Performance Considerations

### Database Optimization

- **Indexing Strategy**: Proper indexes on searchable fields (artist_name, biography)
- **Query Optimization**: Efficient joins and subqueries for complex filtering
- **Connection Pooling**: Utilize Supabase connection pooling
- **Result Caching**: Consider caching for frequently accessed data

### Search Performance

- **Full-Text Search**: Utilize PostgreSQL full-text search capabilities
- **Search Indexing**: Proper text search indexes for performance
- **Query Limits**: Enforce reasonable limits on search complexity

---

# GET /api/users/{id}

## 1. Endpoint Overview

The GET /api/users/{id} endpoint provides public access to retrieve detailed information about a specific DJ profile. This endpoint returns comprehensive user data including full event history (both upcoming and past events), complete music style associations, and all profile information. The endpoint is optimized for performance and includes proper error handling for non-existent users.

**Purpose:** Retrieve detailed DJ profile with complete event history and music styles  
**Authentication:** Not required (public endpoint)  
**Primary Business Logic:** Detailed user profile retrieval with event aggregation

## 2. Request Details

- **HTTP Method:** GET
- **URL Structure:** `/api/users/{id}`
- **Content-Type:** Not applicable (GET request)
- **Authorization:** Not required (public endpoint)

### Path Parameters

**Required Parameters:**

- `id` (UUID): Unique identifier of the DJ profile to retrieve

### Request URL Examples

```
GET /api/users/550e8400-e29b-41d4-a716-446655440000
```

## 3. Utilized Types

### Path Models

- **GetUserByIdParams**: Path parameter validation model
- **UUIDParam**: Reusable UUID validation

### Response DTOs

- **UserDetailResponseDto**: Complete user profile response format
- **UserDetailDto**: Detailed user data with events
- **UserEventDto**: Event data in user context
- **UserMusicStyleDto**: Music style reference in responses
- **EventGroupDto**: Grouped events (upcoming/past)

### Database Entities

- **UserEntity**: Base user table structure
- **EventEntity**: Event data with full details
- **MusicStyleEntity**: Music style reference data

## 4. Response Details

### Success Response (200 OK)

```json
{
  "data": {
    "id": "uuid",
    "artist_name": "Techno Artist",
    "biography": "Experienced DJ specializing in underground techno with over 10 years of experience...",
    "instagram_url": "https://instagram.com/technoartist",
    "facebook_url": "https://facebook.com/technoartist",
    "music_styles": [
      {
        "id": "uuid1",
        "style_name": "Techno"
      },
      {
        "id": "uuid2",
        "style_name": "Progressive House"
      }
    ],
    "events": {
      "upcoming": [
        {
          "id": "uuid",
          "event_name": "Underground Techno Night",
          "country": "Germany",
          "city": "Berlin",
          "venue_name": "Berghain",
          "event_date": "2024-06-15",
          "event_time": "23:00"
        }
      ],
      "past": [
        {
          "id": "uuid",
          "event_name": "Techno Festival 2024",
          "country": "Netherlands",
          "city": "Amsterdam",
          "venue_name": "Paradiso",
          "event_date": "2024-03-20",
          "event_time": "22:00"
        }
      ]
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Error Responses

**404 Not Found:**

```json
{
  "error": {
    "message": "User not found",
    "code": "NOT_FOUND"
  }
}
```

**400 Bad Request - Invalid UUID:**

```json
{
  "error": {
    "message": "Invalid user ID format",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "id",
        "message": "Must be a valid UUID"
      }
    ]
  }
}
```

## 5. Data Flow

### 1. Request Processing

1. **Path Parameter Validation**: Validate UUID format of user ID
2. **User Existence Check**: Verify user exists in database
3. **Data Aggregation**: Fetch user data with music styles and events
4. **Event Categorization**: Separate events into upcoming and past categories
5. **Response Formation**: Format complete user profile with all associations

### 2. Database Operations

```sql
-- Main user query with music styles:
SELECT u.*, array_agg(DISTINCT jsonb_build_object('id', ms.id, 'style_name', ms.style_name)) as music_styles
FROM users u
LEFT JOIN user_music_styles ums ON u.id = ums.user_id
LEFT JOIN music_styles ms ON ums.music_style_id = ms.id
WHERE u.id = ?
GROUP BY u.id;

-- Events query with categorization:
SELECT e.*,
       CASE WHEN e.event_date >= CURRENT_DATE THEN 'upcoming' ELSE 'past' END as category
FROM events e
WHERE e.user_id = ?
ORDER BY e.event_date DESC;
```

### 3. Service Layer Architecture

- **UserService**: Core user retrieval and data aggregation
- **EventService**: Event categorization and formatting
- **MusicStyleService**: Music style association handling
- **ErrorLogService**: Comprehensive error logging

## 6. Security Considerations

### Public Access Security

- **Rate Limiting**: Implement request rate limiting to prevent abuse
- **Data Exposure**: Ensure only public user data is exposed
- **Input Validation**: Validate UUID format to prevent injection attacks
- **Error Information**: Avoid exposing sensitive system information

### Input Validation

- **UUID Validation**: Strict UUID format validation for path parameter
- **Existence Verification**: Proper handling of non-existent user IDs

## 7. Error Handling

### Validation Errors (400 Bad Request)

- **Invalid UUID Format**: Malformed user ID parameter
- **Missing Path Parameter**: Empty or missing user ID

### Not Found Errors (404 Not Found)

- **User Not Found**: Valid UUID but user doesn't exist in database

### Server Errors (500 Internal Server Error)

- **Database Connection Issues**: Supabase connection failures
- **Query Execution Errors**: Database query failures
- **Data Aggregation Errors**: Issues with complex data joining

## 8. Performance Considerations

### Database Optimization

- **Primary Key Lookup**: Efficient user retrieval by UUID primary key
- **Optimized Joins**: Efficient joins for music styles and events
- **Index Utilization**: Proper indexing on foreign keys and date fields
- **Query Batching**: Minimize database round trips

### Response Optimization

- **Data Aggregation**: Efficient aggregation of related data
- **JSON Building**: Optimized JSON response construction
- **Caching Strategy**: Consider caching for frequently accessed profiles

---

# PUT /api/users/{id}

## 1. Endpoint Overview

The PUT /api/users/{id} endpoint allows authenticated users to update their own DJ profiles in the Techno Ambassador platform. This endpoint handles complete profile updates including artist information, biography, social media links, and music style associations. The endpoint implements strict authorization ensuring users can only update their own profiles, comprehensive validation, and maintains data integrity through transactional operations.

**Purpose:** Update existing DJ profile with complete data replacement  
**Authentication:** Required (Supabase Auth JWT token)  
**Primary Business Logic:** Profile update with ownership verification and music style management

## 2. Request Details

- **HTTP Method:** PUT
- **URL Structure:** `/api/users/{id}`
- **Content-Type:** `application/json`
- **Authorization:** Bearer token in Authorization header

### Path Parameters

**Required Parameters:**

- `id` (UUID): Unique identifier of the DJ profile to update

### Request Parameters

**Required Fields:**

- `artist_name` (string): Unique artist name, max 255 characters
- `biography` (string): Artist biography, max 10,000 characters
- `music_style_ids` (string[]): Array of music style UUIDs, minimum 1 element

**Optional Fields:**

- `instagram_url` (string): Instagram profile URL, max 500 characters
- `facebook_url` (string): Facebook profile URL, max 500 characters

### Request Body Example

```json
{
  "artist_name": "Updated Techno Artist",
  "biography": "Updated biography with new information about recent performances...",
  "instagram_url": "https://instagram.com/updatedtechnoartist",
  "facebook_url": "https://facebook.com/updatedtechnoartist",
  "music_style_ids": ["uuid1", "uuid3", "uuid4"]
}
```

## 3. Utilized Types

### Command Models

- **UpdateUserCommand**: Input validation model for user updates
- **UserUpdate**: Database update type derived from schema
- **UserMusicStyleUpdate**: Junction table management type

### Response DTOs

- **UserResponseDto**: Standardized response format with updated user data
- **UserMusicStyleDto**: Music style reference in responses
- **ErrorResponseDto**: Standard error response format
- **ValidationErrorDto**: Detailed validation error format

### Database Entities

- **UserEntity**: Base user table structure
- **MusicStyleEntity**: Music style reference data
- **UserMusicStyleEntity**: Junction table entity

## 4. Response Details

### Success Response (200 OK)

```json
{
  "data": {
    "id": "uuid",
    "artist_name": "Updated Techno Artist",
    "biography": "Updated biography with new information about recent performances...",
    "instagram_url": "https://instagram.com/updatedtechnoartist",
    "facebook_url": "https://facebook.com/updatedtechnoartist",
    "music_styles": [
      {
        "id": "uuid1",
        "style_name": "Techno"
      },
      {
        "id": "uuid3",
        "style_name": "Deep House"
      },
      {
        "id": "uuid4",
        "style_name": "Minimal"
      }
    ],
    "updated_at": "2024-01-15T15:45:00Z"
  }
}
```

### Error Responses

**400 Bad Request - Validation Error:**

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "artist_name",
        "message": "Artist name is required and must be less than 255 characters"
      }
    ]
  }
}
```

**401 Unauthorized:**

```json
{
  "error": {
    "message": "Authentication required",
    "code": "UNAUTHORIZED"
  }
}
```

**403 Forbidden:**

```json
{
  "error": {
    "message": "Cannot update other user's profile",
    "code": "FORBIDDEN"
  }
}
```

**404 Not Found:**

```json
{
  "error": {
    "message": "User not found",
    "code": "NOT_FOUND"
  }
}
```

**409 Conflict:**

```json
{
  "error": {
    "message": "Artist name already exists",
    "code": "CONFLICT"
  }
}
```

## 5. Data Flow

### 1. Request Processing

1. **Authentication Verification**: Validate JWT token from Authorization header
2. **Path Parameter Validation**: Validate UUID format of user ID
3. **Authorization Check**: Verify authenticated user owns the profile being updated
4. **Input Validation**: Parse and validate request body using Zod schema
5. **Business Logic Validation**: Check artist name uniqueness (excluding current user) and music style existence
6. **Database Transaction**: Update user record and replace music style associations atomically
7. **Response Formation**: Fetch updated user data with music styles for response

### 2. Database Operations

```sql
-- Transaction flow:
BEGIN;
  -- Check ownership
  SELECT id FROM users WHERE id = ? AND id = auth.uid();

  -- Update user data
  UPDATE users
  SET artist_name = ?, biography = ?, instagram_url = ?, facebook_url = ?, updated_at = NOW()
  WHERE id = ?;

  -- Replace music style associations
  DELETE FROM user_music_styles WHERE user_id = ?;
  INSERT INTO user_music_styles (user_id, music_style_id) VALUES (...);
COMMIT;
```

### 3. Service Layer Architecture

- **UserService**: Core business logic and validation
- **AuthorizationService**: Ownership verification
- **MusicStyleService**: Music style validation and management
- **ErrorLogService**: Comprehensive error logging
- **SupabaseClient**: Database operations with RLS

## 6. Security Considerations

### Authentication & Authorization

- **JWT Token Validation**: Verify Supabase Auth token in Authorization header
- **Ownership Verification**: Ensure authenticated user can only update their own profile
- **Row Level Security**: Database-level security policies ensure data isolation
- **User Context**: Extract user ID from authenticated JWT token for authorization

### Input Validation & Sanitization

- **Zod Schema Validation**: Comprehensive input validation with detailed error messages
- **URL Validation**: Validate Instagram and Facebook URL formats
- **SQL Injection Prevention**: Use parameterized queries through Supabase client
- **XSS Prevention**: Sanitize all text inputs before storage

### Data Security

- **HTTPS Only**: Enforce secure transport for all API communications
- **Rate Limiting**: Implement request rate limiting to prevent abuse
- **Error Information**: Avoid exposing sensitive system information in error messages

## 7. Error Handling

### Validation Errors (400 Bad Request)

- **Missing Required Fields**: artist_name, biography, music_style_ids
- **Invalid Field Formats**: URL format validation, string length limits, invalid UUID format for path parameter
- **Business Rule Violations**: Empty music_style_ids array, invalid UUID formats
- **Non-existent Music Styles**: Invalid music_style_ids that don't exist in database

### Authentication Errors (401 Unauthorized)

- **Missing Authorization Header**: No Bearer token provided
- **Invalid JWT Token**: Expired, malformed, or invalid signature
- **Token Verification Failure**: Supabase Auth token validation failure

### Authorization Errors (403 Forbidden)

- **Profile Ownership**: Authenticated user attempting to update another user's profile
- **Permission Denied**: User lacks permission to perform update operation

### Not Found Errors (404 Not Found)

- **User Not Found**: Valid UUID but user doesn't exist in database

### Conflict Errors (409 Conflict)

- **Duplicate Artist Name**: artist_name already exists for another user (case-sensitive)

### Server Errors (500 Internal Server Error)

- **Database Connection Issues**: Supabase connection failures
- **Transaction Failures**: Database constraint violations or deadlocks
- **Unexpected System Errors**: Unhandled exceptions and system failures

### Error Logging Strategy

- **Comprehensive Logging**: All errors logged to error_logs table with full context
- **Error Context**: Include request details, user context, and stack traces
- **Monitoring**: Error aggregation for system health monitoring

## 8. Performance Considerations

### Database Optimization

- **Prepared Statements**: Use parameterized queries for optimal performance
- **Transaction Scope**: Minimize transaction duration for better concurrency
- **Index Utilization**: Leverage unique index on artist_name for fast conflict detection
- **Efficient Updates**: Update only changed fields when possible

### Authorization Optimization

- **Ownership Caching**: Consider caching ownership verification for frequent updates
- **RLS Policies**: Utilize Row Level Security for efficient authorization at database level
- **Connection Pooling**: Utilize Supabase connection pooling for optimal resource usage

### Response Optimization

- **Selective Fetching**: Fetch only required fields for response formation
- **Music Style Caching**: Consider caching music style lookups for frequent access
- **Optimistic Updates**: Consider optimistic update patterns for better user experience

## 9. Implementation Steps

### Step 1: Define Zod Validation Schemas

```typescript
// src/schemas/user.schema.ts
export const updateUserSchema = z.object({
  artist_name: z.string().min(1).max(255),
  biography: z.string().min(1).max(10000),
  instagram_url: z.string().url().max(500).optional(),
  facebook_url: z.string().url().max(500).optional(),
  music_style_ids: z.array(z.string().uuid()).min(1),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid(),
});
```

### Step 2: Create Service Layer Methods

```typescript
// src/services/user.service.ts
export class UserService {
  async updateUser(
    userId: string,
    command: UpdateUserCommand,
    authenticatedUserId: string
  ): Promise<UserResponseDto>;

  async verifyUserOwnership(
    userId: string,
    authenticatedUserId: string
  ): Promise<void>;

  async validateArtistNameUniqueness(
    artistName: string,
    excludeUserId: string
  ): Promise<void>;
}
```

### Step 3: Implement API Route Handler

```typescript
// src/pages/api/users/[id].ts
export async function PUT({
  request,
  params,
  locals,
}: APIContext): Promise<Response> {
  // 1. Authentication verification
  // 2. Path parameter validation
  // 3. Authorization check (ownership)
  // 4. Input validation with Zod
  // 5. Business logic validation
  // 6. User update with transaction
  // 7. Response formation
}
```

### Step 4: Add Authorization Middleware

```typescript
// src/middleware/authorization.ts
export async function verifyUserOwnership(
  userId: string,
  authenticatedUserId: string
): Promise<void>;
```

### Step 5: Add Monitoring and Logging

- **Error Logging**: Implement comprehensive error logging to error_logs table
- **Performance Monitoring**: Track update operation performance
- **Authorization Logging**: Log authorization attempts and failures
