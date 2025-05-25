# REST API Plan - Techno Ambassador

## 1. Resources

### 1.1 Users (DJs)

- **Database Table**: `users`
- **Description**: DJ profiles with artist information, biography, and social media links
- **Access**: Public read, authenticated write (own profile only)

### 1.2 Events

- **Database Table**: `events`
- **Description**: DJ performances and events with location and timing information
- **Access**: Public read, authenticated write (own events only)

### 1.3 Music Styles

- **Database Table**: `music_styles`
- **Description**: Lookup table for music genres and styles
- **Access**: Public read, admin write

### 1.4 User Music Styles

- **Database Table**: `user_music_styles`
- **Description**: Junction table managing DJ-to-music-style relationships
- **Access**: Managed through user endpoints

## 2. Endpoints

### 2.1 User Management

#### GET /api/users

**Description**: Retrieve list of all DJs with filtering and search capabilities

**Query Parameters**:

- `search` (string): Full-text search in artist name and biography
- `music_styles` (string): Comma-separated list of music style IDs
- `location` (string): Search in event locations (country, city, venue)
- `available_from` (date): Check availability from date (YYYY-MM-DD)
- `available_to` (date): Check availability to date (YYYY-MM-DD)
- `page` (integer): Page number for pagination (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)

**Request Payload**: None

**Response Payload**:

```json
{
  "data": [
    {
      "id": "uuid",
      "artist_name": "string",
      "biography": "string",
      "instagram_url": "string",
      "facebook_url": "string",
      "music_styles": [
        {
          "id": "uuid",
          "style_name": "string"
        }
      ],
      "upcoming_events_count": 0,
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

**Success Codes**:

- `200 OK`: Successfully retrieved users

**Error Codes**:

- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server error

#### GET /api/users/{id}

**Description**: Retrieve specific DJ profile with full details

**Query Parameters**: None

**Request Payload**: None

**Response Payload**:

```json
{
  "data": {
    "id": "uuid",
    "artist_name": "string",
    "biography": "string",
    "instagram_url": "string",
    "facebook_url": "string",
    "music_styles": [
      {
        "id": "uuid",
        "style_name": "string"
      }
    ],
    "events": {
      "upcoming": [
        {
          "id": "uuid",
          "event_name": "string",
          "country": "string",
          "city": "string",
          "venue_name": "string",
          "event_date": "date",
          "event_time": "time"
        }
      ],
      "past": [
        {
          "id": "uuid",
          "event_name": "string",
          "country": "string",
          "city": "string",
          "venue_name": "string",
          "event_date": "date",
          "event_time": "time"
        }
      ]
    },
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Success Codes**:

- `200 OK`: Successfully retrieved user

**Error Codes**:

- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

#### POST /api/users

**Description**: Create new DJ profile

**Query Parameters**: None

**Request Payload**:

```json
{
  "artist_name": "string",
  "biography": "string",
  "instagram_url": "string",
  "facebook_url": "string",
  "music_style_ids": ["uuid"]
}
```

**Response Payload**:

```json
{
  "data": {
    "id": "uuid",
    "artist_name": "string",
    "biography": "string",
    "instagram_url": "string",
    "facebook_url": "string",
    "music_styles": [
      {
        "id": "uuid",
        "style_name": "string"
      }
    ],
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Success Codes**:

- `201 Created`: Profile successfully created

**Error Codes**:

- `400 Bad Request`: Validation errors (missing required fields, invalid data)
- `409 Conflict`: Artist name already exists
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

#### PUT /api/users/{id}

**Description**: Update DJ profile (authenticated user can only update own profile)

**Query Parameters**: None

**Request Payload**:

```json
{
  "artist_name": "string",
  "biography": "string",
  "instagram_url": "string",
  "facebook_url": "string",
  "music_style_ids": ["uuid"]
}
```

**Response Payload**:

```json
{
  "data": {
    "id": "uuid",
    "artist_name": "string",
    "biography": "string",
    "instagram_url": "string",
    "facebook_url": "string",
    "music_styles": [
      {
        "id": "uuid",
        "style_name": "string"
      }
    ],
    "updated_at": "timestamp"
  }
}
```

**Success Codes**:

- `200 OK`: Profile successfully updated

**Error Codes**:

- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Cannot update other user's profile
- `404 Not Found`: User not found
- `409 Conflict`: Artist name already exists
- `500 Internal Server Error`: Server error

### 2.2 Event Management

#### GET /api/events

**Description**: Retrieve list of all events (public calendar view)

**Query Parameters**:

- `user_id` (uuid): Filter events by specific DJ
- `country` (string): Filter by country
- `city` (string): Filter by city
- `venue` (string): Filter by venue name
- `date_from` (date): Filter events from date (YYYY-MM-DD)
- `date_to` (date): Filter events to date (YYYY-MM-DD)
- `upcoming_only` (boolean): Show only future events (default: false)
- `page` (integer): Page number for pagination (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)

**Request Payload**: None

**Response Payload**:

```json
{
  "data": [
    {
      "id": "uuid",
      "event_name": "string",
      "country": "string",
      "city": "string",
      "venue_name": "string",
      "event_date": "date",
      "event_time": "time",
      "user": {
        "id": "uuid",
        "artist_name": "string"
      },
      "created_at": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

**Success Codes**:

- `200 OK`: Successfully retrieved events

**Error Codes**:

- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server error

#### GET /api/events/{id}

**Description**: Get single event details

**Query Parameters**: None

**Request Payload**: None

**Response Payload**:

```json
{
  "data": {
    "id": "uuid",
    "event_name": "string",
    "country": "string",
    "city": "string",
    "venue_name": "string",
    "event_date": "date",
    "event_time": "time",
    "user": {
      "id": "uuid",
      "artist_name": "string"
    },
    "created_at": "timestamp"
  }
}
```

**Success Codes**:

- `200 OK`: Successfully retrieved event

**Error Codes**:

- `404 Not Found`: Event not found
- `500 Internal Server Error`: Server error

#### POST /api/events

**Description**: Create new event for authenticated DJ

**Query Parameters**: None

**Request Payload**:

```json
{
  "event_name": "string",
  "country": "string",
  "city": "string",
  "venue_name": "string",
  "event_date": "date",
  "event_time": "time"
}
```

**Response Payload**:

```json
{
  "data": {
    "id": "uuid",
    "event_name": "string",
    "country": "string",
    "city": "string",
    "venue_name": "string",
    "event_date": "date",
    "event_time": "time",
    "user_id": "uuid",
    "created_at": "timestamp"
  }
}
```

**Success Codes**:

- `201 Created`: Event successfully created

**Error Codes**:

- `400 Bad Request`: Validation errors (past date, missing fields, name too long)
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

#### PUT /api/events/{id}

**Description**: Update event (authenticated user can only update own events, only future events)

**Query Parameters**: None

**Request Payload**:

```json
{
  "event_name": "string",
  "country": "string",
  "city": "string",
  "venue_name": "string",
  "event_date": "date",
  "event_time": "time"
}
```

**Response Payload**:

```json
{
  "data": {
    "id": "uuid",
    "event_name": "string",
    "country": "string",
    "city": "string",
    "venue_name": "string",
    "event_date": "date",
    "event_time": "time",
    "updated_at": "timestamp"
  }
}
```

**Success Codes**:

- `200 OK`: Event successfully updated

**Error Codes**:

- `400 Bad Request`: Validation errors or attempt to edit past event
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Cannot update other user's events
- `404 Not Found`: Event not found
- `500 Internal Server Error`: Server error

#### DELETE /api/events/{id}

**Description**: Delete event (authenticated user can only delete own events, only future events)

**Query Parameters**: None

**Request Payload**: None

**Response Payload**:

```json
{
  "message": "Event successfully deleted"
}
```

**Success Codes**:

- `200 OK`: Event successfully deleted

**Error Codes**:

- `400 Bad Request`: Attempt to delete past event
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Cannot delete other user's events
- `404 Not Found`: Event not found
- `500 Internal Server Error`: Server error

### 2.3 Music Styles

#### GET /api/music-styles

**Description**: Retrieve list of all available music styles

**Query Parameters**:

- `search` (string): Search in style names
- `page` (integer): Page number for pagination (default: 1)
- `limit` (integer): Items per page (default: 50, max: 100)

**Request Payload**: None

**Response Payload**:

```json
{
  "data": [
    {
      "id": "uuid",
      "style_name": "string",
      "user_count": 15,
      "created_at": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

**Success Codes**:

- `200 OK`: Successfully retrieved music styles

**Error Codes**:

- `500 Internal Server Error`: Server error

## 3. Authentication and Authorization

### 3.1 Authentication Method

- **Technology**: Supabase Auth with JWT tokens
- **Implementation**: Bearer token in Authorization header
- **Format**: `Authorization: Bearer <jwt_token>`

### 3.2 Authorization Rules

- **Public Read Access**: All user profiles, events, and music styles are publicly readable
- **User Write Access**: Authenticated users can only modify their own profiles and events
- **Admin Access**: Only administrators can manage music styles (not implemented in MVP)

### 3.3 Row Level Security (RLS)

- Implemented at database level using Supabase RLS policies
- Public read policies for all main tables
- User-specific write policies based on `auth.uid()`

## 4. Validation and Business Logic

### 4.1 User Profile Validation

- **artist_name**: Required, unique, max 255 characters
- **biography**: Required, max 10,000 characters
- **instagram_url**: Optional, valid URL format, max 500 characters
- **facebook_url**: Optional, valid URL format, max 500 characters
- **music_style_ids**: Required, at least one style must be selected, all IDs must exist

### 4.2 Event Validation

- **event_name**: Required, max 10,000 characters
- **country**: Required, max 100 characters
- **city**: Required, max 100 characters
- **venue_name**: Required, max 200 characters
- **event_date**: Required, must be today or future date, max one year ahead
- **event_time**: Optional, valid time format

### 4.3 Business Logic Rules

- **No Past Event Modification**: Events with `event_date < CURRENT_DATE` cannot be edited or deleted
- **Profile Ownership**: Users can only modify their own profiles and events
- **Music Style Requirement**: Every user must have at least one music style
- **Unique Artist Names**: Artist names must be globally unique (case-sensitive)
- **Future Events Only**: New events can only be created for today or future dates

### 4.4 Error Handling

- All validation errors return detailed error messages in standardized format
- Comprehensive error logging to `error_logs` table for monitoring
- Graceful handling of database constraints and foreign key violations
