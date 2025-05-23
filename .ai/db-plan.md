# Database Schema - Techno Ambassador

## 1. Tables

### 1.1 users

This table is managed by Supabase Auth.
Main table storing user profile information.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_name VARCHAR(255) UNIQUE NOT NULL,
    biography TEXT NOT NULL CHECK (length(biography) <= 10000),
    instagram_url VARCHAR(500),
    facebook_url VARCHAR(500),
    user_type VARCHAR(50) NOT NULL DEFAULT 'artist' CHECK (user_type IN ('artist')),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', artist_name || ' ' || biography)
    ) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 1.2 music_styles

Lookup table for music styles with full-text search capabilities.

```sql
CREATE TABLE music_styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    style_name VARCHAR(100) UNIQUE NOT NULL,
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', style_name)
    ) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 1.3 user_music_styles

Junction table for many-to-many relationship between users and music styles.

```sql
CREATE TABLE user_music_styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    music_style_id UUID NOT NULL REFERENCES music_styles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, music_style_id)
);
```

### 1.4 events

Table storing DJ events with location information and full-text search.

```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_name VARCHAR(500) NOT NULL CHECK (length(event_name) <= 10000),
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    venue_name VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL CHECK (event_date >= CURRENT_DATE),
    event_time TIME,
    location_search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', country || ' ' || city || ' ' || venue_name)
    ) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 1.5 error_logs

Table for comprehensive error logging and monitoring.

```sql
CREATE TABLE error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    request_url VARCHAR(1000),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 2. Relationships

### 2.1 One-to-Many Relationships

- **users → events**: One DJ can have many events
- **users → error_logs**: One DJ can generate many error logs (optional relationship)

### 2.2 Many-to-Many Relationships

- **users ↔ music_styles**: Through `user_music_styles` junction table
  - One DJ can have multiple music styles
  - One music style can be associated with multiple DJs

## 3. Indexes

### 3.1 Full-Text Search Indexes (GIN)

```sql
-- For DJ profile search
CREATE INDEX idx_users_search ON users USING GIN(search_vector);

-- For music style search
CREATE INDEX idx_music_styles_search ON music_styles USING GIN(search_vector);

-- For location search in events
CREATE INDEX idx_events_location_search ON events USING GIN(location_search_vector);
```

### 3.2 B-Tree Indexes

```sql
-- For event date filtering and sorting
CREATE INDEX idx_events_date ON events(event_date);

-- For DJ's events lookup
CREATE INDEX idx_events_user_id ON events(user_id);

-- For recent DJ profiles (default sorting)
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- For error log analysis
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id) WHERE user_id IS NOT NULL;
```

### 3.3 Composite Indexes

```sql
-- For DJ calendar queries (upcoming events)
CREATE INDEX idx_events_user_date ON events(user_id, event_date);

-- For availability filtering
CREATE INDEX idx_events_date_user ON events(event_date, user_id);

-- For error log filtering by type and date
CREATE INDEX idx_error_logs_type_date ON error_logs(error_type, created_at DESC);
```

## 4. Constraints and Business Rules

### 4.1 Check Constraints

```sql
-- Prevent adding past events
ALTER TABLE events ADD CONSTRAINT chk_no_past_events
CHECK (event_date >= CURRENT_DATE);

-- Limit text field lengths
ALTER TABLE users ADD CONSTRAINT chk_biography_length
CHECK (length(biography) <= 10000);

ALTER TABLE events ADD CONSTRAINT chk_event_name_length
CHECK (length(event_name) <= 10000);
```

### 4.2 Required Business Rules (Application Level)

- Each DJ must have at least one music style
- Artist names must be globally unique (case-sensitive)
- Past events cannot be edited or deleted
- All location fields (country, city, venue_name) are required

## 5. Row Level Security (RLS) Policies

### 5.1 Enable RLS

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_music_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
```

### 5.2 Public Read Access

```sql
-- Public read access for all profile data
CREATE POLICY "Public profiles read" ON users FOR SELECT USING (true);

-- Public read access for all events
CREATE POLICY "Public events read" ON events FOR SELECT USING (true);

-- Public read access for user music styles
CREATE POLICY "Public user music styles read" ON user_music_styles FOR SELECT USING (true);

-- Public read access for music styles
CREATE POLICY "Public music styles read" ON music_styles FOR SELECT USING (true);
```

### 5.3 DJ Write Access

```sql
-- DJs can insert/update/delete their own profiles
CREATE POLICY "User profile management" ON users
FOR ALL USING (auth.uid() = id);

-- DJs can manage their own events
CREATE POLICY "User events management" ON events
FOR ALL USING (auth.uid() = user_id);

-- DJs can manage their own music styles
CREATE POLICY "User music styles management" ON user_music_styles
FOR ALL USING (auth.uid() = user_id);
```

### 5.4 Error Logs Security

```sql
-- Only authenticated users can create error logs
CREATE POLICY "Error logs insert" ON error_logs
FOR INSERT WITH CHECK (true);

-- Users can only read their own error logs
CREATE POLICY "Error logs read" ON error_logs
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
```

## 6. Triggers and Functions

### 6.1 Updated At Trigger Function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### 6.2 Apply Triggers

```sql
-- Auto-update updated_at for users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for events
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 7. Initial Data Requirements

### 7.1 Music Styles Seed Data

Common music styles should be pre-populated:

- Techno
- House
- Trance
- Progressive House
- Deep House
- Tech House
- Minimal Techno
- Acid Techno
- Industrial Techno
- Ambient Techno

## 8. Performance Considerations

### 8.1 Query Optimization

- Full-text search using PostgreSQL's built-in capabilities with GIN indexes
- Composite indexes for common query patterns
- Partitioning consideration for error_logs table if volume becomes high

### 8.2 Pagination Strategy

- Default pagination limit: 100 records per page
- Use OFFSET/LIMIT with proper indexes on sorting columns
- Consider cursor-based pagination for large datasets

## 9. Data Integrity Notes

### 9.1 Referential Integrity

- Cascade deletions for user-related data when user profile is deleted
- Set NULL for optional foreign keys (user_id in error_logs)

### 9.2 Data Validation

- URL validation handled at application level
- Date/time validation with check constraints
- Text length limits enforced at database level

### 9.3 Error Handling

- Comprehensive error logging without retention policy
- Full error context preservation for debugging
- No data anonymization in MVP for complete error analysis

## 10. Security Considerations

### 10.1 Data Access

- Public read access to all DJ and event data
- Authenticated write access only to own data
- Error logs with appropriate privacy controls

### 10.2 Authentication Integration

- Designed for Supabase Auth integration
- UUID-based user identification
- Row Level Security policies aligned with auth system
