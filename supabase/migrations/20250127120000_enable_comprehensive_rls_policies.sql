-- =====================================================================================
-- Migration: Enable Comprehensive RLS Policies
-- Description: Implements comprehensive Row Level Security policies for all CRUD operations
-- Purpose: Secures all tables with granular access control for anon and authenticated users
-- Affected Tables: users, music_styles, user_music_styles, events, error_logs
-- Special Considerations: 
--   - Enables RLS on all tables if previously disabled
--   - Creates separate policies for each operation (select, insert, update, delete)
--   - Implements different access levels for anonymous and authenticated users
--   - Maintains data privacy while allowing public access to appropriate data
--   - Error logs have restricted access for privacy and audit trail integrity
-- =====================================================================================

-- =====================================================================================
-- 1. Enable Row Level Security on All Tables
-- =====================================================================================

-- ensure rls is enabled on all tables (in case it was previously disabled)
alter table users enable row level security;
alter table music_styles enable row level security;
alter table user_music_styles enable row level security;
alter table events enable row level security;
alter table error_logs enable row level security;

-- =====================================================================================
-- 2. Users Table RLS Policies
-- =====================================================================================

-- allow anonymous users to read all user profiles (public profiles for discovery)
create policy "users_select_anon" on users
    for select
    to anon
    using (true);

-- allow authenticated users to read all user profiles
create policy "users_select_authenticated" on users
    for select
    to authenticated
    using (true);

-- allow authenticated users to insert their own profile only
-- this ensures users can only create a profile for their own auth.uid()
create policy "users_insert_authenticated" on users
    for insert
    to authenticated
    with check (auth.uid() = id);

-- allow authenticated users to update only their own profile
-- both using and with check clauses ensure complete ownership validation
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

-- note: music styles are managed by administrators only
-- no insert/update/delete policies for regular users to maintain data integrity
-- administrators can manage this data directly through database access

-- =====================================================================================
-- 4. User Music Styles Junction Table RLS Policies
-- =====================================================================================

-- allow anonymous users to read all user music style associations (public data for discovery)
create policy "user_music_styles_select_anon" on user_music_styles
    for select
    to anon
    using (true);

-- allow authenticated users to read all user music style associations
create policy "user_music_styles_select_authenticated" on user_music_styles
    for select
    to authenticated
    using (true);

-- allow authenticated users to insert their own music style associations only
create policy "user_music_styles_insert_authenticated" on user_music_styles
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- allow authenticated users to update their own music style associations only
create policy "user_music_styles_update_authenticated" on user_music_styles
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- allow authenticated users to delete their own music style associations only
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

-- allow authenticated users to insert their own events only
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

-- no select policy for anonymous users (error logs are sensitive data)

-- allow authenticated users to read only their own error logs or system errors (user_id is null)
-- this protects user privacy while allowing access to their own error information
create policy "error_logs_select_authenticated" on error_logs
    for select
    to authenticated
    using (auth.uid() = user_id or user_id is null);

-- allow authenticated users to insert error logs (for application error reporting)
-- this enables client-side error reporting while maintaining security
create policy "error_logs_insert_authenticated" on error_logs
    for insert
    to authenticated
    with check (true);

-- no update policy for error logs to maintain audit trail integrity
-- error logs should be immutable once created for proper audit trails

-- no delete policy for error logs to maintain audit trail integrity
-- error logs should be permanent for debugging and monitoring purposes

-- =====================================================================================
-- Migration Complete
-- =====================================================================================
-- comprehensive rls policies have been successfully implemented for:
-- - users table: full crud access for own data, public read access
-- - music_styles table: public read access only (admin-managed data)
-- - user_music_styles table: full crud access for own associations, public read access
-- - events table: full crud access for own events, public read access
-- - error_logs table: restricted access for privacy and audit trail integrity
-- 
-- security features implemented:
-- - granular policies for each crud operation
-- - separate policies for anonymous and authenticated users
-- - ownership-based access control using auth.uid()
-- - public discovery while maintaining data privacy
-- - audit trail protection for error logs
-- ===================================================================================== 