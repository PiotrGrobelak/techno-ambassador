-- =====================================================================================
-- Migration: Create Techno Ambassador Schema
-- Description: Initial schema creation for the Techno Ambassador platform
-- Purpose: Sets up core tables for DJ profiles, events, music styles, and error logging
-- Affected Tables: users, music_styles, user_music_styles, events, error_logs
-- Special Considerations: 
--   - Uses Supabase Auth for user management
--   - Implements full-text search capabilities
--   - Sets up comprehensive RLS policies
--   - Includes performance optimizations with indexes
-- =====================================================================================

-- =====================================================================================
-- 1. Create Extension for UUID Generation
-- =====================================================================================

-- ensure uuid extension is available for generating uuids
create extension if not exists "uuid-ossp";

-- =====================================================================================
-- 2. Create Tables
-- =====================================================================================

-- =====================================================================================
-- 2.1 Users Table
-- =====================================================================================
-- note: this extends the supabase auth.users table with dj profile information
-- the id references auth.users.id directly
create table users (
    id uuid primary key references auth.users(id) on delete cascade,
    artist_name varchar(255) unique not null,
    biography text not null check (length(biography) <= 10000),
    instagram_url varchar(500),
    facebook_url varchar(500),
    user_type varchar(50) not null default 'artist' check (user_type in ('artist')),
    search_vector tsvector generated always as (
        to_tsvector('english', artist_name || ' ' || biography)
    ) stored,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- enable row level security for users table
alter table users enable row level security;

-- =====================================================================================
-- 2.2 Music Styles Table
-- =====================================================================================
-- lookup table for music styles with full-text search capabilities
create table music_styles (
    id uuid primary key default gen_random_uuid(),
    style_name varchar(100) unique not null,
    search_vector tsvector generated always as (
        to_tsvector('english', style_name)
    ) stored,
    created_at timestamptz not null default now()
);

-- enable row level security for music styles table
alter table music_styles enable row level security;

-- =====================================================================================
-- 2.3 User Music Styles Junction Table
-- =====================================================================================
-- many-to-many relationship between users and music styles
create table user_music_styles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    music_style_id uuid not null references music_styles(id) on delete cascade,
    created_at timestamptz not null default now(),
    unique(user_id, music_style_id)
);

-- enable row level security for user music styles table
alter table user_music_styles enable row level security;

-- =====================================================================================
-- 2.4 Events Table
-- =====================================================================================
-- stores dj events with location information and full-text search
create table events (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    event_name varchar(500) not null check (length(event_name) <= 10000),
    country varchar(100) not null,
    city varchar(100) not null,
    venue_name varchar(200) not null,
    event_date date not null check (event_date >= current_date),
    event_time time,
    location_search_vector tsvector generated always as (
        to_tsvector('english', country || ' ' || city || ' ' || venue_name)
    ) stored,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- enable row level security for events table
alter table events enable row level security;

-- =====================================================================================
-- 2.5 Error Logs Table
-- =====================================================================================
-- comprehensive error logging and monitoring
create table error_logs (
    id uuid primary key default gen_random_uuid(),
    error_type varchar(100) not null,
    error_message text not null,
    stack_trace text,
    user_id uuid references users(id) on delete set null,
    request_url varchar(1000),
    user_agent text,
    created_at timestamptz not null default now()
);

-- enable row level security for error logs table
alter table error_logs enable row level security;

-- =====================================================================================
-- 3. Create Indexes for Performance Optimization
-- =====================================================================================

-- =====================================================================================
-- 3.1 Full-Text Search Indexes (GIN)
-- =====================================================================================

-- enable full-text search for dj profile searches
create index idx_users_search on users using gin(search_vector);

-- enable full-text search for music style searches
create index idx_music_styles_search on music_styles using gin(search_vector);

-- enable full-text search for location searches in events
create index idx_events_location_search on events using gin(location_search_vector);

-- =====================================================================================
-- 3.2 B-Tree Indexes
-- =====================================================================================

-- optimize event date filtering and sorting
create index idx_events_date on events(event_date);

-- optimize lookup of events by dj
create index idx_events_user_id on events(user_id);

-- optimize recent dj profiles lookup (default sorting)
create index idx_users_created_at on users(created_at desc);

-- optimize error log analysis and monitoring
create index idx_error_logs_created_at on error_logs(created_at desc);
create index idx_error_logs_type on error_logs(error_type);
create index idx_error_logs_user_id on error_logs(user_id) where user_id is not null;

-- =====================================================================================
-- 3.3 Composite Indexes
-- =====================================================================================

-- optimize dj calendar queries (upcoming events)
create index idx_events_user_date on events(user_id, event_date);

-- optimize availability filtering
create index idx_events_date_user on events(event_date, user_id);

-- optimize error log filtering by type and date
create index idx_error_logs_type_date on error_logs(error_type, created_at desc);

-- =====================================================================================
-- 4. Create Functions
-- =====================================================================================

-- =====================================================================================
-- 4.1 Auto-Update Timestamp Function
-- =====================================================================================
-- function to automatically update the updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- =====================================================================================
-- 5. Create Triggers
-- =====================================================================================

-- =====================================================================================
-- 5.1 Auto-Update Triggers
-- =====================================================================================

-- automatically update updated_at for users table
create trigger update_users_updated_at
    before update on users
    for each row execute function update_updated_at_column();

-- automatically update updated_at for events table
create trigger update_events_updated_at
    before update on events
    for each row execute function update_updated_at_column();

-- =====================================================================================
-- 6. Row Level Security Policies
-- =====================================================================================

-- =====================================================================================
-- 6.1 Users Table RLS Policies
-- =====================================================================================

-- allow anonymous users to read all user profiles (public profiles)
create policy "users_select_anon" on users
    for select
    to anon
    using (true);

-- allow authenticated users to read all user profiles
create policy "users_select_authenticated" on users
    for select
    to authenticated
    using (true);

-- allow authenticated users to insert their own profile
create policy "users_insert_authenticated" on users
    for insert
    to authenticated
    with check (auth.uid() = id);

-- allow authenticated users to update their own profile
create policy "users_update_authenticated" on users
    for update
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- allow authenticated users to delete their own profile
create policy "users_delete_authenticated" on users
    for delete
    to authenticated
    using (auth.uid() = id);

-- =====================================================================================
-- 6.2 Music Styles Table RLS Policies
-- =====================================================================================

-- allow anonymous users to read all music styles (public data)
create policy "music_styles_select_anon" on music_styles
    for select
    to anon
    using (true);

-- allow authenticated users to read all music styles
create policy "music_styles_select_authenticated" on music_styles
    for select
    to authenticated
    using (true);

-- note: music styles are managed by administrators, no insert/update/delete policies for regular users

-- =====================================================================================
-- 6.3 User Music Styles Table RLS Policies
-- =====================================================================================

-- allow anonymous users to read all user music style associations (public data)
create policy "user_music_styles_select_anon" on user_music_styles
    for select
    to anon
    using (true);

-- allow authenticated users to read all user music style associations
create policy "user_music_styles_select_authenticated" on user_music_styles
    for select
    to authenticated
    using (true);

-- allow authenticated users to insert their own music style associations
create policy "user_music_styles_insert_authenticated" on user_music_styles
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- allow authenticated users to update their own music style associations
create policy "user_music_styles_update_authenticated" on user_music_styles
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- allow authenticated users to delete their own music style associations
create policy "user_music_styles_delete_authenticated" on user_music_styles
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- =====================================================================================
-- 6.4 Events Table RLS Policies
-- =====================================================================================

-- allow anonymous users to read all events (public data)
create policy "events_select_anon" on events
    for select
    to anon
    using (true);

-- allow authenticated users to read all events
create policy "events_select_authenticated" on events
    for select
    to authenticated
    using (true);

-- allow authenticated users to insert their own events
create policy "events_insert_authenticated" on events
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- allow authenticated users to update their own events
create policy "events_update_authenticated" on events
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- allow authenticated users to delete their own events
create policy "events_delete_authenticated" on events
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- =====================================================================================
-- 6.5 Error Logs Table RLS Policies
-- =====================================================================================

-- allow authenticated users to insert error logs (for application error reporting)
create policy "error_logs_insert_authenticated" on error_logs
    for insert
    to authenticated
    with check (true);

-- allow users to read only their own error logs (privacy protection)
create policy "error_logs_select_authenticated" on error_logs
    for select
    to authenticated
    using (auth.uid() = user_id or user_id is null);

-- note: no update or delete policies for error logs to maintain audit trail integrity

-- =====================================================================================
-- 7. Insert Initial Data
-- =====================================================================================

-- =====================================================================================
-- 7.1 Music Styles Seed Data
-- =====================================================================================
-- populate common techno music styles for the platform
insert into music_styles (style_name) values
    ('Techno'),
    ('House'),
    ('Trance'),
    ('Progressive House'),
    ('Deep House'),
    ('Tech House'),
    ('Minimal Techno'),
    ('Acid Techno'),
    ('Industrial Techno'),
    ('Ambient Techno');

-- =====================================================================================
-- Migration Complete
-- =====================================================================================
-- the techno ambassador database schema has been successfully created with:
-- - core tables for dj profiles, events, and music styles
-- - comprehensive indexing for performance optimization
-- - full-text search capabilities
-- - row level security policies for data protection
-- - automatic timestamp updates
-- - error logging infrastructure
-- - initial music styles data
-- ===================================================================================== 