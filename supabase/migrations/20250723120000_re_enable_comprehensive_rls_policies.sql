-- =====================================================================================
-- Migration: Re-enable Comprehensive RLS Policies
-- Description: Re-implements Row Level Security policies for all tables after previous disable
-- Purpose: Restores security while maintaining functionality for both dev and prod environments
-- Affected Tables: users, music_styles, user_music_styles, events, error_logs
-- Special Considerations: 
--   - First drops all existing policies to avoid conflicts
--   - Enables RLS on all tables that were previously disabled
--   - Creates secure but functional policies for development and production
--   - Balances security with usability for the Techno Ambassador platform
--   - Allows public discovery of events and profiles while protecting personal data
-- =====================================================================================

-- =====================================================================================
-- 0. Drop All Existing Policies First (to avoid conflicts)
-- =====================================================================================

-- drop all existing users table policies
drop policy if exists "users_select_anon" on users;
drop policy if exists "users_select_authenticated" on users;
drop policy if exists "users_insert_authenticated" on users;
drop policy if exists "users_update_authenticated" on users;
drop policy if exists "users_delete_authenticated" on users;

-- drop all existing music styles table policies
drop policy if exists "music_styles_select_anon" on music_styles;
drop policy if exists "music_styles_select_authenticated" on music_styles;

-- drop all existing user music styles table policies
drop policy if exists "user_music_styles_select_anon" on user_music_styles;
drop policy if exists "user_music_styles_select_authenticated" on user_music_styles;
drop policy if exists "user_music_styles_insert_authenticated" on user_music_styles;
drop policy if exists "user_music_styles_update_authenticated" on user_music_styles;
drop policy if exists "user_music_styles_delete_authenticated" on user_music_styles;

-- drop all existing events table policies
drop policy if exists "events_select_anon" on events;
drop policy if exists "events_select_authenticated" on events;
drop policy if exists "events_insert_authenticated" on events;
drop policy if exists "events_update_authenticated" on events;
drop policy if exists "events_delete_authenticated" on events;

-- drop all existing error logs table policies
drop policy if exists "error_logs_insert_authenticated" on error_logs;
drop policy if exists "error_logs_select_authenticated" on error_logs;

-- =====================================================================================
-- 1. Enable Row Level Security on All Tables
-- =====================================================================================

-- re-enable rls on all tables that were previously disabled
alter table users enable row level security;
alter table music_styles enable row level security;
alter table user_music_styles enable row level security;
alter table events enable row level security;
alter table error_logs enable row level security;

-- =====================================================================================
-- 2. Users Table RLS Policies
-- =====================================================================================

-- allow anonymous users to read user profiles (for public DJ discovery)
create policy "users_select_anon" on users
    for select
    to anon
    using (true);

-- allow authenticated users to read all user profiles
create policy "users_select_authenticated" on users
    for select
    to authenticated
    using (true);

-- allow authenticated users to create their own profile only
create policy "users_insert_authenticated" on users
    for insert
    to authenticated
    with check (auth.uid() = id);

-- allow authenticated users to update only their own profile
create policy "users_update_authenticated" on users
    for update
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- allow authenticated users to delete only their own profile
create policy "users_delete_authenticated" on users
    for delete
    to authenticated
    using (auth.uid() = id);

-- =====================================================================================
-- 3. Music Styles Table RLS Policies
-- =====================================================================================

-- allow anonymous users to read all music styles (public reference data)
create policy "music_styles_select_anon" on music_styles
    for select
    to anon
    using (true);

-- allow authenticated users to read all music styles
create policy "music_styles_select_authenticated" on music_styles
    for select
    to authenticated
    using (true);

-- music styles are admin-managed, no insert/update/delete for regular users

-- =====================================================================================
-- 4. User Music Styles Junction Table RLS Policies
-- =====================================================================================

-- allow anonymous users to read user music style associations (for DJ discovery)
create policy "user_music_styles_select_anon" on user_music_styles
    for select
    to anon
    using (true);

-- allow authenticated users to read all user music style associations
create policy "user_music_styles_select_authenticated" on user_music_styles
    for select
    to authenticated
    using (true);

-- allow authenticated users to manage their own music style associations
create policy "user_music_styles_insert_authenticated" on user_music_styles
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "user_music_styles_update_authenticated" on user_music_styles
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "user_music_styles_delete_authenticated" on user_music_styles
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- =====================================================================================
-- 5. Events Table RLS Policies
-- =====================================================================================

-- allow anonymous users to read all events (public event discovery)
create policy "events_select_anon" on events
    for select
    to anon
    using (true);

-- allow authenticated users to read all events
create policy "events_select_authenticated" on events
    for select
    to authenticated
    using (true);

-- allow authenticated users to create events
create policy "events_insert_authenticated" on events
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- allow authenticated users to update only their own events
create policy "events_update_authenticated" on events
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- allow authenticated users to delete only their own events
create policy "events_delete_authenticated" on events
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- =====================================================================================
-- 6. Error Logs Table RLS Policies
-- =====================================================================================

-- allow authenticated users to read their own error logs or system errors
create policy "error_logs_select_authenticated" on error_logs
    for select
    to authenticated
    using (auth.uid() = user_id or user_id is null);

-- allow authenticated users to create error logs (for application error reporting)
create policy "error_logs_insert_authenticated" on error_logs
    for insert
    to authenticated
    with check (true);

-- no update/delete policies for error logs to maintain audit trail integrity

-- =====================================================================================
-- Migration Complete
-- =====================================================================================
-- comprehensive rls policies have been successfully re-enabled for:
-- - users table: public read access, own data management
-- - music_styles table: public read access (admin-managed)
-- - user_music_styles table: public read access, own associations management
-- - events table: public read access, own events management
-- - error_logs table: restricted access with audit trail protection
-- 
-- security features restored:
-- - all existing policies dropped first to avoid conflicts
-- - row level security enabled on all tables
-- - granular policies for each crud operation
-- - ownership-based access control using auth.uid()
-- - public discovery functionality maintained
-- - data privacy and audit trail protection
-- ===================================================================================== 