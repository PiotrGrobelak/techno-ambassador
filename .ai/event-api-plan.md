# API Endpoint Implementation Plan: Event Management Endpoints

## 1. Endpoint Overview

This document provides comprehensive implementation plans for all event management endpoints in the Techno Ambassador platform. These endpoints handle DJ event operations including creation, retrieval, listing, updates, and deletion. All endpoints implement comprehensive validation, security measures, and maintain data integrity through proper authentication and authorization.

**Covered Endpoints:**

- POST /api/events - Create new event for authenticated DJ
- GET /api/events - List all events with filtering (public calendar view)
- GET /api/events/{id} - Retrieve specific event details
- PUT /api/events/{id} - Update event (own events only, future events only)
- DELETE /api/events/{id} - Delete event (own events only, future events only)

---

# POST /api/events

## 1. Endpoint Overview

The POST /api/events endpoint allows authenticated DJs to create new events in the Techno Ambassador platform. This endpoint handles event creation with comprehensive validation ensuring events can only be created for current or future dates, proper location information, and maintains data integrity through proper authentication and business rule enforcement.

**Purpose:** Create new DJ event with complete event information  
**Authentication:** Required (Supabase Auth JWT token)  
**Primary Business Logic:** Event creation with date validation and user association

## 2. Request Details

- **HTTP Method:** POST
- **URL Structure:** `/api/events`
- **Content-Type:** `application/json`
- **Authorization:** Bearer token in Authorization header

### Request Parameters

**Required Fields:**

- `event_name` (string): Event name, max 10,000 characters
- `country` (string): Event country, max 100 characters
- `city` (string): Event city, max 100 characters
- `venue_name` (string): Venue name, max 200 characters
- `event_date` (date): Event date in YYYY-MM-DD format, must be today or future date, max one year ahead

**Optional Fields:**

- `event_time` (time): Event time in HH:MM format (24-hour)

### Request Body Example

```json
{
  "event_name": "Underground Techno Night",
  "country": "Germany",
  "city": "Berlin",
  "venue_name": "Berghain",
  "event_date": "2024-06-15",
  "event_time": "23:00"
}
```

## 3. Utilized Types

### Command Models

- **CreateEventCommand**: Input validation model for event creation
- **EventInsert**: Database insert type derived from schema
- **DateValidation**: Date range validation utilities

### Response DTOs

- **EventResponseDto**: Standardized response format with event data
- **EventDetailDto**: Complete event information
- **ErrorResponseDto**: Standard error response format
- **ValidationErrorDto**: Detailed validation error format

### Database Entities

- **EventEntity**: Base event table structure
- **UserEntity**: User reference for event ownership

## 4. Response Details

### Success Response (201 Created)

```json
{
  "data": {
    "id": "uuid",
    "event_name": "Underground Techno Night",
    "country": "Germany",
    "city": "Berlin",
    "venue_name": "Berghain",
    "event_date": "2024-06-15",
    "event_time": "23:00",
    "user_id": "uuid",
    "created_at": "2024-01-15T10:30:00Z"
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
        "field": "event_date",
        "message": "Event date must be today or in the future"
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

## 5. Data Flow

### 1. Request Processing

1. **Authentication Verification**: Validate JWT token from Authorization header
2. **Input Validation**: Parse and validate request body using Zod schema
3. **Date Validation**: Ensure event date is today or future, within one year limit
4. **Database Insert**: Create event record with authenticated user ID
5. **Response Formation**: Return created event data

### 2. Database Operations

```sql
-- Event creation:
INSERT INTO events (
  event_name, country, city, venue_name, event_date, event_time, user_id, created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, NOW());
```

### 3. Service Layer Architecture

- **EventService**: Core business logic and validation
- **DateValidationService**: Date range and format validation
- **ErrorLogService**: Comprehensive error logging
- **SupabaseClient**: Database operations with RLS

## 6. Security Considerations

### Authentication & Authorization

- **JWT Token Validation**: Verify Supabase Auth token in Authorization header
- **Row Level Security**: Database-level security policies ensure data isolation
- **User Context**: Extract user ID from authenticated JWT token

### Input Validation & Sanitization

- **Zod Schema Validation**: Comprehensive input validation with detailed error messages
- **Date Format Validation**: Strict date and time format validation
- **SQL Injection Prevention**: Use parameterized queries through Supabase client
- **XSS Prevention**: Sanitize all text inputs before storage

### Data Security

- **HTTPS Only**: Enforce secure transport for all API communications
- **Rate Limiting**: Implement request rate limiting to prevent abuse
- **Error Information**: Avoid exposing sensitive system information in error messages

## 7. Error Handling

### Validation Errors (400 Bad Request)

- **Missing Required Fields**: event_name, country, city, venue_name, event_date
- **Invalid Field Formats**: Date format validation, time format validation, string length limits
- **Business Rule Violations**: Past date events, events more than one year ahead
- **Invalid Data Types**: Non-string values for text fields, invalid date/time formats

### Authentication Errors (401 Unauthorized)

- **Missing Authorization Header**: No Bearer token provided
- **Invalid JWT Token**: Expired, malformed, or invalid signature
- **Token Verification Failure**: Supabase Auth token validation failure

### Server Errors (500 Internal Server Error)

- **Database Connection Issues**: Supabase connection failures
- **Insert Failures**: Database constraint violations
- **Unexpected System Errors**: Unhandled exceptions and system failures

### Error Logging Strategy

- **Comprehensive Logging**: All errors logged to error_logs table with full context
- **Error Context**: Include request details, user context, and stack traces
- **Monitoring**: Error aggregation for system health monitoring

## 8. Performance Considerations

### Database Optimization

- **Prepared Statements**: Use parameterized queries for optimal performance
- **Index Utilization**: Leverage indexes on user_id and event_date for efficient queries
- **Connection Pooling**: Utilize Supabase connection pooling for optimal resource usage

### Validation Optimization

- **Date Calculation**: Efficient date validation and range checking
- **Input Sanitization**: Optimized text processing and validation

## 9. Implementation Steps

### Step 1: Define Zod Validation Schema

```typescript
// src/schemas/event.schema.ts
export const createEventSchema = z.object({
  event_name: z.string().min(1).max(10000),
  country: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  venue_name: z.string().min(1).max(200),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  event_time: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
});
```

### Step 2: Create Service Layer

```typescript
// src/services/event.service.ts
export class EventService {
  async createEvent(
    command: CreateEventCommand,
    userId: string
  ): Promise<EventResponseDto>;
  async validateEventDate(eventDate: string): Promise<void>;
}
```

### Step 3: Implement API Route Handler

```typescript
// src/pages/api/events.ts
export async function POST({ request, locals }: APIContext): Promise<Response> {
  // 1. Authentication verification
  // 2. Input validation with Zod
  // 3. Date validation
  // 4. Event creation
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

# GET /api/events

## 1. Endpoint Overview

The GET /api/events endpoint provides public access to retrieve a paginated list of all events with advanced filtering capabilities. This endpoint supports filtering by DJ, location, date ranges, and provides a comprehensive public calendar view. The endpoint is optimized for performance with proper indexing and supports both upcoming and historical event viewing.

**Purpose:** Public listing of all events with advanced filtering capabilities  
**Authentication:** Not required (public endpoint)  
**Primary Business Logic:** Event listing with comprehensive filtering and pagination

## 2. Request Details

- **HTTP Method:** GET
- **URL Structure:** `/api/events`
- **Content-Type:** Not applicable (GET request)
- **Authorization:** Not required (public endpoint)

### Query Parameters

**Optional Filtering Parameters:**

- `user_id` (UUID): Filter events by specific DJ
- `country` (string): Filter by country
- `city` (string): Filter by city
- `venue` (string): Filter by venue name
- `date_from` (date): Filter events from date (YYYY-MM-DD format)
- `date_to` (date): Filter events to date (YYYY-MM-DD format)
- `upcoming_only` (boolean): Show only future events (default: false)
- `page` (integer): Page number for pagination (default: 1, minimum: 1)
- `limit` (integer): Items per page (default: 20, minimum: 1, maximum: 100)

### Request URL Examples

```
GET /api/events
GET /api/events?upcoming_only=true&page=1&limit=20
GET /api/events?user_id=uuid&country=Germany
GET /api/events?date_from=2024-06-01&date_to=2024-06-30&city=Berlin
```

## 3. Utilized Types

### Query Models

- **GetEventsQuery**: Input validation model for query parameters
- **EventSearchFilters**: Search and filtering parameters
- **PaginationQuery**: Reusable pagination parameters

### Response DTOs

- **EventsListResponseDto**: Paginated list response format
- **EventSummaryDto**: Event data for list view with user information
- **EventUserDto**: User reference in event context
- **PaginationDto**: Pagination metadata
- **ErrorResponseDto**: Standard error response format

### Database Entities

- **EventEntity**: Base event table structure
- **UserEntity**: User reference data

## 4. Response Details

### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "uuid",
      "event_name": "Underground Techno Night",
      "country": "Germany",
      "city": "Berlin",
      "venue_name": "Berghain",
      "event_date": "2024-06-15",
      "event_time": "23:00",
      "user": {
        "id": "uuid",
        "artist_name": "Techno Artist"
      },
      "created_at": "2024-01-15T10:30:00Z"
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
        "field": "date_from",
        "message": "Invalid date format. Use YYYY-MM-DD"
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
2. **Filter Processing**: Process location, date, and user filters
3. **Database Query**: Execute optimized query with proper joins and filtering
4. **Response Formation**: Format results with pagination metadata

### 2. Database Operations

```sql
-- Events query with user information:
SELECT e.*, u.artist_name
FROM events e
LEFT JOIN users u ON e.user_id = u.id
WHERE (filter conditions)
ORDER BY e.event_date DESC, e.created_at DESC
LIMIT ? OFFSET ?;
```

### 3. Service Layer Architecture

- **EventService**: Core business logic for event retrieval and filtering
- **FilterService**: Query filter processing
- **PaginationService**: Pagination calculation and metadata
- **ErrorLogService**: Comprehensive error logging

## 6. Security Considerations

### Public Access Security

- **Rate Limiting**: Implement request rate limiting to prevent abuse
- **Input Sanitization**: Sanitize all filter inputs to prevent injection attacks
- **Data Exposure**: Ensure only public event data is exposed in responses
- **Query Optimization**: Prevent expensive queries that could impact performance

### Input Validation & Sanitization

- **Zod Schema Validation**: Comprehensive validation of all query parameters
- **SQL Injection Prevention**: Use parameterized queries through Supabase client
- **Date Validation**: Validate date formats and ranges
- **UUID Validation**: Validate user_id format when provided

## 7. Error Handling

### Validation Errors (400 Bad Request)

- **Invalid Pagination**: Negative page numbers, excessive limit values
- **Invalid Date Formats**: Malformed date strings, invalid date ranges
- **Invalid UUIDs**: Malformed user_id parameter
- **Invalid Boolean Values**: Malformed upcoming_only parameter

### Server Errors (500 Internal Server Error)

- **Database Connection Issues**: Supabase connection failures
- **Query Performance Issues**: Timeout on complex queries
- **Unexpected System Errors**: Unhandled exceptions and system failures

## 8. Performance Considerations

### Database Optimization

- **Indexing Strategy**: Proper indexes on filterable fields (user_id, event_date, country, city)
- **Query Optimization**: Efficient joins and filtering
- **Connection Pooling**: Utilize Supabase connection pooling
- **Result Caching**: Consider caching for frequently accessed data

### Search Performance

- **Filter Optimization**: Efficient processing of multiple filter combinations
- **Query Limits**: Enforce reasonable limits on query complexity

## 9. Implementation Steps

### Step 1: Define Zod Validation Schema

```typescript
// src/schemas/event.schema.ts
export const getEventsQuerySchema = z.object({
  user_id: z.string().uuid().optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  venue: z.string().max(200).optional(),
  date_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  date_to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  upcoming_only: z.boolean().default(false),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
```

### Step 2: Create Service Layer

```typescript
// src/services/event.service.ts
export class EventService {
  async getEvents(query: GetEventsQuery): Promise<EventsListResponseDto>;

  async buildEventFilters(query: GetEventsQuery): Promise<FilterConditions>;
  async validateDateRange(dateFrom?: string, dateTo?: string): Promise<void>;
}
```

### Step 3: Implement API Route Handler

```typescript
// src/pages/api/events.ts
export async function GET({ request }: APIContext): Promise<Response> {
  // 1. Query parameter validation with Zod
  // 2. Filter processing and validation
  // 3. Database query execution
  // 4. Response formation with pagination
}
```

### Step 4: Add Filter Processing Middleware

```typescript
// src/middleware/filter-processor.ts
export async function processEventFilters(
  query: GetEventsQuery
): Promise<FilterConditions>;
```

### Step 5: Add Monitoring and Logging

- **Performance Monitoring**: Track query performance and filter usage
- **Query Optimization**: Monitor slow queries and optimize indexes

---

# GET /api/events/{id}

## 1. Endpoint Overview

The GET /api/events/{id} endpoint provides public access to retrieve detailed information about a specific event. This endpoint returns comprehensive event data including complete location information, timing details, and associated DJ information. The endpoint is optimized for performance and includes proper error handling for non-existent events.

**Purpose:** Retrieve detailed event information with complete DJ context  
**Authentication:** Not required (public endpoint)  
**Primary Business Logic:** Detailed event retrieval with user information

## 2. Request Details

- **HTTP Method:** GET
- **URL Structure:** `/api/events/{id}`
- **Content-Type:** Not applicable (GET request)
- **Authorization:** Not required (public endpoint)

### Path Parameters

**Required Parameters:**

- `id` (UUID): Unique identifier of the event to retrieve

### Request URL Examples

```
GET /api/events/550e8400-e29b-41d4-a716-446655440000
```

## 3. Utilized Types

### Path Models

- **GetEventByIdParams**: Path parameter validation model
- **UUIDParam**: Reusable UUID validation

### Response DTOs

- **EventDetailResponseDto**: Complete event response format
- **EventDetailDto**: Detailed event data with user information
- **EventUserDto**: User data in event context

### Database Entities

- **EventEntity**: Base event table structure
- **UserEntity**: User reference data

## 4. Response Details

### Success Response (200 OK)

```json
{
  "data": {
    "id": "uuid",
    "event_name": "Underground Techno Night",
    "country": "Germany",
    "city": "Berlin",
    "venue_name": "Berghain",
    "event_date": "2024-06-15",
    "event_time": "23:00",
    "user": {
      "id": "uuid",
      "artist_name": "Techno Artist"
    },
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Error Responses

**404 Not Found:**

```json
{
  "error": {
    "message": "Event not found",
    "code": "NOT_FOUND"
  }
}
```

**400 Bad Request - Invalid UUID:**

```json
{
  "error": {
    "message": "Invalid event ID format",
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

1. **Path Parameter Validation**: Validate UUID format of event ID
2. **Event Existence Check**: Verify event exists in database
3. **Data Retrieval**: Fetch event data with associated user information
4. **Response Formation**: Format complete event details

### 2. Database Operations

```sql
-- Event query with user information:
SELECT e.*, u.artist_name
FROM events e
LEFT JOIN users u ON e.user_id = u.id
WHERE e.id = ?;
```

### 3. Service Layer Architecture

- **EventService**: Core event retrieval and data aggregation
- **UserService**: User information handling
- **ErrorLogService**: Comprehensive error logging

## 6. Security Considerations

### Public Access Security

- **Rate Limiting**: Implement request rate limiting to prevent abuse
- **Data Exposure**: Ensure only public event data is exposed
- **Input Validation**: Validate UUID format to prevent injection attacks
- **Error Information**: Avoid exposing sensitive system information

### Input Validation

- **UUID Validation**: Strict UUID format validation for path parameter
- **Existence Verification**: Proper handling of non-existent event IDs

## 7. Error Handling

### Validation Errors (400 Bad Request)

- **Invalid UUID Format**: Malformed event ID parameter
- **Missing Path Parameter**: Empty or missing event ID

### Not Found Errors (404 Not Found)

- **Event Not Found**: Valid UUID but event doesn't exist in database

### Server Errors (500 Internal Server Error)

- **Database Connection Issues**: Supabase connection failures
- **Query Execution Errors**: Database query failures

## 8. Performance Considerations

### Database Optimization

- **Primary Key Lookup**: Efficient event retrieval by UUID primary key
- **Optimized Joins**: Efficient joins for user information
- **Index Utilization**: Proper indexing on foreign keys

### Response Optimization

- **Data Aggregation**: Efficient aggregation of related data
- **JSON Building**: Optimized JSON response construction
- **Caching Strategy**: Consider caching for frequently accessed events

## 9. Implementation Steps

### Step 1: Define Zod Validation Schema

```typescript
// src/schemas/event.schema.ts
export const eventIdParamSchema = z.object({
  id: z.string().uuid(),
});
```

### Step 2: Create Service Layer

```typescript
// src/services/event.service.ts
export class EventService {
  async getEventById(eventId: string): Promise<EventDetailResponseDto>;
  async validateEventExists(eventId: string): Promise<void>;
}
```

### Step 3: Implement API Route Handler

```typescript
// src/pages/api/events/[id].ts
export async function GET({ params }: APIContext): Promise<Response> {
  // 1. Path parameter validation with Zod
  // 2. Event existence check
  // 3. Data retrieval with user information
  // 4. Response formation
}
```

### Step 4: Add Validation Middleware

```typescript
// src/middleware/param-validator.ts
export async function validateUUIDParam(
  paramName: string,
  paramValue: string
): Promise<void>;
```

### Step 5: Add Monitoring and Logging

- **Performance Monitoring**: Track event retrieval performance
- **Cache Optimization**: Monitor cache hit rates for frequently accessed events

---

# PUT /api/events/{id}

## 1. Endpoint Overview

The PUT /api/events/{id} endpoint allows authenticated DJs to update their own events in the Techno Ambassador platform. This endpoint handles complete event updates with strict authorization ensuring users can only update their own events and only future events. The endpoint implements comprehensive validation and maintains data integrity through proper authentication and business rule enforcement.

**Purpose:** Update existing event with complete data replacement  
**Authentication:** Required (Supabase Auth JWT token)  
**Primary Business Logic:** Event update with ownership verification and future date restriction

## 2. Request Details

- **HTTP Method:** PUT
- **URL Structure:** `/api/events/{id}`
- **Content-Type:** `application/json`
- **Authorization:** Bearer token in Authorization header

### Path Parameters

**Required Parameters:**

- `id` (UUID): Unique identifier of the event to update

### Request Parameters

**Required Fields:**

- `event_name` (string): Event name, max 10,000 characters
- `country` (string): Event country, max 100 characters
- `city` (string): Event city, max 100 characters
- `venue_name` (string): Venue name, max 200 characters
- `event_date` (date): Event date in YYYY-MM-DD format, must be today or future date

**Optional Fields:**

- `event_time` (time): Event time in HH:MM format (24-hour)

### Request Body Example

```json
{
  "event_name": "Updated Underground Techno Night",
  "country": "Germany",
  "city": "Berlin",
  "venue_name": "Watergate",
  "event_date": "2024-07-20",
  "event_time": "22:30"
}
```

## 3. Utilized Types

### Command Models

- **UpdateEventCommand**: Input validation model for event updates
- **EventUpdate**: Database update type derived from schema

### Response DTOs

- **EventResponseDto**: Standardized response format with updated event data
- **ErrorResponseDto**: Standard error response format
- **ValidationErrorDto**: Detailed validation error format

### Database Entities

- **EventEntity**: Base event table structure

## 4. Response Details

### Success Response (200 OK)

```json
{
  "data": {
    "id": "uuid",
    "event_name": "Updated Underground Techno Night",
    "country": "Germany",
    "city": "Berlin",
    "venue_name": "Watergate",
    "event_date": "2024-07-20",
    "event_time": "22:30",
    "updated_at": "2024-01-15T15:45:00Z"
  }
}
```

### Error Responses

**400 Bad Request - Past Event:**

```json
{
  "error": {
    "message": "Cannot update past events",
    "code": "VALIDATION_ERROR"
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
    "message": "Cannot update other user's events",
    "code": "FORBIDDEN"
  }
}
```

**404 Not Found:**

```json
{
  "error": {
    "message": "Event not found",
    "code": "NOT_FOUND"
  }
}
```

## 5. Data Flow

### 1. Request Processing

1. **Authentication Verification**: Validate JWT token from Authorization header
2. **Path Parameter Validation**: Validate UUID format of event ID
3. **Event Existence Check**: Verify event exists and get current data
4. **Authorization Check**: Verify authenticated user owns the event
5. **Past Event Check**: Ensure event is not in the past
6. **Input Validation**: Parse and validate request body using Zod schema
7. **Database Update**: Update event record
8. **Response Formation**: Return updated event data

### 2. Database Operations

```sql
-- Check ownership and date:
SELECT user_id, event_date FROM events WHERE id = ?;

-- Update event:
UPDATE events
SET event_name = ?, country = ?, city = ?, venue_name = ?, event_date = ?, event_time = ?, updated_at = NOW()
WHERE id = ? AND user_id = ?;
```

### 3. Service Layer Architecture

- **EventService**: Core business logic and validation
- **AuthorizationService**: Ownership verification
- **DateValidationService**: Past event checking
- **ErrorLogService**: Comprehensive error logging

## 6. Security Considerations

### Authentication & Authorization

- **JWT Token Validation**: Verify Supabase Auth token in Authorization header
- **Ownership Verification**: Ensure authenticated user can only update their own events
- **Row Level Security**: Database-level security policies ensure data isolation

### Input Validation & Sanitization

- **Zod Schema Validation**: Comprehensive input validation with detailed error messages
- **Date Validation**: Ensure updated event date is not in the past
- **SQL Injection Prevention**: Use parameterized queries through Supabase client

## 7. Error Handling

### Validation Errors (400 Bad Request)

- **Missing Required Fields**: event_name, country, city, venue_name, event_date
- **Invalid Field Formats**: Date format validation, time format validation, string length limits
- **Past Event Update**: Attempt to update event with past date
- **Invalid UUID Format**: Malformed event ID in path parameter

### Authentication Errors (401 Unauthorized)

- **Missing Authorization Header**: No Bearer token provided
- **Invalid JWT Token**: Expired, malformed, or invalid signature

### Authorization Errors (403 Forbidden)

- **Event Ownership**: Authenticated user attempting to update another user's event

### Not Found Errors (404 Not Found)

- **Event Not Found**: Valid UUID but event doesn't exist in database

### Server Errors (500 Internal Server Error)

- **Database Connection Issues**: Supabase connection failures
- **Update Failures**: Database constraint violations

### Error Logging Strategy

- **Comprehensive Logging**: All errors logged to error_logs table with full context
- **Error Context**: Include request details, user context, and stack traces
- **Monitoring**: Error aggregation for system health monitoring

## 8. Performance Considerations

### Database Optimization

- **Prepared Statements**: Use parameterized queries for optimal performance
- **Index Utilization**: Leverage indexes on id and user_id for efficient queries
- **Atomic Operations**: Ensure update operations are atomic

### Authorization Optimization

- **Single Query Verification**: Combine existence, ownership, and date checks where possible
- **RLS Policies**: Utilize Row Level Security for efficient authorization at database level
- **Connection Pooling**: Utilize Supabase connection pooling for optimal resource usage

### Response Optimization

- **Selective Fetching**: Fetch only required fields for response formation
- **Optimistic Updates**: Consider optimistic update patterns for better user experience

## 9. Implementation Steps

### Step 1: Define Zod Validation Schemas

```typescript
// src/schemas/event.schema.ts
export const eventIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const updateEventSchema = z.object({
  event_name: z.string().min(1).max(10000),
  country: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  venue_name: z.string().min(1).max(200),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  event_time: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
});
```

### Step 2: Create Service Layer Methods

```typescript
// src/services/event.service.ts
export class EventService {
  async updateEvent(
    eventId: string,
    command: UpdateEventCommand,
    authenticatedUserId: string
  ): Promise<EventResponseDto>;

  async verifyEventOwnership(
    eventId: string,
    authenticatedUserId: string
  ): Promise<void>;

  async verifyEventIsFuture(eventId: string): Promise<void>;
}
```

### Step 3: Implement API Route Handler

```typescript
// src/pages/api/events/[id].ts
export async function PUT({
  request,
  params,
  locals,
}: APIContext): Promise<Response> {
  // 1. Authentication verification
  // 2. Path parameter validation
  // 3. Authorization and date checks
  // 4. Input validation with Zod
  // 5. Event update
  // 6. Response formation
}
```

### Step 4: Add Authorization Middleware

```typescript
// src/middleware/event-authorization.ts
export async function verifyEventOwnership(
  eventId: string,
  authenticatedUserId: string
): Promise<void>;

export async function verifyEventIsFuture(eventId: string): Promise<void>;
```

### Step 5: Add Monitoring and Logging

- **Error Logging**: Implement comprehensive error logging to error_logs table
- **Performance Monitoring**: Track update operation performance
- **Authorization Logging**: Log authorization attempts and failures

---

# DELETE /api/events/{id}

## 1. Endpoint Overview

The DELETE /api/events/{id} endpoint allows authenticated DJs to delete their own events in the Techno Ambassador platform. This endpoint implements strict authorization ensuring users can only delete their own events and only future events. The endpoint maintains data integrity through proper authentication and business rule enforcement.

**Purpose:** Delete existing event with ownership and date restrictions  
**Authentication:** Required (Supabase Auth JWT token)  
**Primary Business Logic:** Event deletion with ownership verification and future date restriction

## 2. Request Details

- **HTTP Method:** DELETE
- **URL Structure:** `/api/events/{id}`
- **Content-Type:** Not applicable (DELETE request)
- **Authorization:** Bearer token in Authorization header

### Path Parameters

**Required Parameters:**

- `id` (UUID): Unique identifier of the event to delete

### Request URL Examples

```
DELETE /api/events/550e8400-e29b-41d4-a716-446655440000
```

## 3. Utilized Types

### Path Models

- **DeleteEventParams**: Path parameter validation model
- **UUIDParam**: Reusable UUID validation

### Response DTOs

- **DeleteEventResponseDto**: Success message response format
- **ErrorResponseDto**: Standard error response format

### Database Entities

- **EventEntity**: Base event table structure for validation

## 4. Response Details

### Success Response (200 OK)

```json
{
  "message": "Event successfully deleted"
}
```

### Error Responses

**400 Bad Request - Past Event:**

```json
{
  "error": {
    "message": "Cannot delete past events",
    "code": "VALIDATION_ERROR"
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
    "message": "Cannot delete other user's events",
    "code": "FORBIDDEN"
  }
}
```

**404 Not Found:**

```json
{
  "error": {
    "message": "Event not found",
    "code": "NOT_FOUND"
  }
}
```

## 5. Data Flow

### 1. Request Processing

1. **Authentication Verification**: Validate JWT token from Authorization header
2. **Path Parameter Validation**: Validate UUID format of event ID
3. **Event Existence Check**: Verify event exists and get current data
4. **Authorization Check**: Verify authenticated user owns the event
5. **Past Event Check**: Ensure event is not in the past
6. **Database Deletion**: Delete event record
7. **Response Formation**: Return success message

### 2. Database Operations

```sql
-- Check ownership and date:
SELECT user_id, event_date FROM events WHERE id = ?;

-- Delete event:
DELETE FROM events WHERE id = ? AND user_id = ?;
```

### 3. Service Layer Architecture

- **EventService**: Core business logic and validation
- **AuthorizationService**: Ownership verification
- **DateValidationService**: Past event checking
- **ErrorLogService**: Comprehensive error logging

## 6. Security Considerations

### Authentication & Authorization

- **JWT Token Validation**: Verify Supabase Auth token in Authorization header
- **Ownership Verification**: Ensure authenticated user can only delete their own events
- **Row Level Security**: Database-level security policies ensure data isolation

### Data Integrity

- **Soft Delete Consideration**: Consider implementing soft delete for audit trails
- **Cascade Handling**: Ensure proper handling of related data if applicable

## 7. Error Handling

### Validation Errors (400 Bad Request)

- **Past Event Deletion**: Attempt to delete event with past date
- **Invalid UUID Format**: Malformed event ID in path parameter

### Authentication Errors (401 Unauthorized)

- **Missing Authorization Header**: No Bearer token provided
- **Invalid JWT Token**: Expired, malformed, or invalid signature

### Authorization Errors (403 Forbidden)

- **Event Ownership**: Authenticated user attempting to delete another user's event

### Not Found Errors (404 Not Found)

- **Event Not Found**: Valid UUID but event doesn't exist in database

### Server Errors (500 Internal Server Error)

- **Database Connection Issues**: Supabase connection failures
- **Deletion Failures**: Database constraint violations

### Error Logging Strategy

- **Comprehensive Logging**: All errors logged to error_logs table with full context
- **Error Context**: Include request details, user context, and stack traces
- **Monitoring**: Error aggregation for system health monitoring

## 8. Performance Considerations

### Database Optimization

- **Prepared Statements**: Use parameterized queries for optimal performance
- **Index Utilization**: Leverage indexes on id and user_id for efficient queries
- **Atomic Operations**: Ensure deletion operations are atomic

### Authorization Optimization

- **Single Query Verification**: Combine existence, ownership, and date checks where possible
- **RLS Policies**: Utilize Row Level Security for efficient authorization at database level
- **Connection Pooling**: Utilize Supabase connection pooling for optimal resource usage

### Data Integrity

- **Audit Trail**: Consider implementing audit logging for event deletions
- **Soft Delete**: Consider soft delete pattern for data recovery capabilities

## 9. Implementation Steps

### Step 1: Define Zod Validation Schemas

```typescript
// src/schemas/event.schema.ts
export const eventIdParamSchema = z.object({
  id: z.string().uuid(),
});
```

### Step 2: Create Service Layer Methods

```typescript
// src/services/event.service.ts
export class EventService {
  async deleteEvent(
    eventId: string,
    authenticatedUserId: string
  ): Promise<void>;

  async verifyEventOwnership(
    eventId: string,
    authenticatedUserId: string
  ): Promise<void>;

  async verifyEventIsFuture(eventId: string): Promise<void>;
}
```

### Step 3: Implement API Route Handler

```typescript
// src/pages/api/events/[id].ts
export async function DELETE({
  params,
  locals,
}: APIContext): Promise<Response> {
  // 1. Authentication verification
  // 2. Path parameter validation
  // 3. Authorization and date checks
  // 4. Event deletion
  // 5. Response formation
}
```

### Step 4: Add Authorization Middleware

```typescript
// src/middleware/event-authorization.ts
export async function verifyEventOwnership(
  eventId: string,
  authenticatedUserId: string
): Promise<void>;

export async function verifyEventIsFuture(eventId: string): Promise<void>;
```

### Step 5: Add Monitoring and Logging

- **Error Logging**: Implement comprehensive error logging to error_logs table
- **Performance Monitoring**: Track operation performance
- **Authorization Logging**: Log authorization attempts and failures
- **Audit Trail**: Consider implementing audit logging for event deletions
