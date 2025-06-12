-- Migration: Enable Row Level Security on all tables
-- Purpose: Add comprehensive RLS policies for all CRUD operations across all tables
-- Tables affected: error_logs, events, music_styles, user_music_styles, users
-- Security: Implements granular access control based on user roles and ownership

-- Enable Row Level Security on all tables
alter table error_logs enable row level security;
alter table events enable row level security;
alter table music_styles enable row level security;
alter table user_music_styles enable row level security;
alter table users enable row level security;

-- ============================================================================
-- ERROR_LOGS TABLE POLICIES
-- ============================================================================

-- error_logs: allow anonymous users to insert error logs (for client-side error reporting)
create policy "error_logs_insert_anon" on error_logs
  for insert to anon
  with check (true);

-- error_logs: allow authenticated users to insert their own error logs
create policy "error_logs_insert_authenticated" on error_logs
  for insert to authenticated
  with check (user_id = auth.uid() or user_id is null);

-- error_logs: allow authenticated users to select their own error logs
create policy "error_logs_select_authenticated" on error_logs
  for select to authenticated
  using (user_id = auth.uid() or user_id is null);

-- error_logs: allow authenticated users to update their own error logs
create policy "error_logs_update_authenticated" on error_logs
  for update to authenticated
  using (user_id = auth.uid() or user_id is null)
  with check (user_id = auth.uid() or user_id is null);

-- error_logs: allow authenticated users to delete their own error logs
create policy "error_logs_delete_authenticated" on error_logs
  for delete to authenticated
  using (user_id = auth.uid() or user_id is null);

-- ============================================================================
-- EVENTS TABLE POLICIES
-- ============================================================================

-- events: allow anonymous users to view all events (public event discovery)
create policy "events_select_anon" on events
  for select to anon
  using (true);

-- events: allow authenticated users to view all events
create policy "events_select_authenticated" on events
  for select to authenticated
  using (true);

-- events: allow authenticated users to create new events
create policy "events_insert_authenticated" on events
  for insert to authenticated
  with check (user_id = auth.uid());

-- events: allow users to update only their own events
create policy "events_update_authenticated" on events
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- events: allow users to delete only their own events
create policy "events_delete_authenticated" on events
  for delete to authenticated
  using (user_id = auth.uid());

-- ============================================================================
-- MUSIC_STYLES TABLE POLICIES
-- ============================================================================

-- music_styles: allow anonymous users to view all music styles (public reference data)
create policy "music_styles_select_anon" on music_styles
  for select to anon
  using (true);

-- music_styles: allow authenticated users to view all music styles
create policy "music_styles_select_authenticated" on music_styles
  for select to authenticated
  using (true);

-- music_styles: restrict insert to authenticated users only (admin-controlled in application layer)
create policy "music_styles_insert_authenticated" on music_styles
  for insert to authenticated
  with check (true);

-- music_styles: restrict update to authenticated users only (admin-controlled in application layer)
create policy "music_styles_update_authenticated" on music_styles
  for update to authenticated
  using (true)
  with check (true);

-- music_styles: restrict delete to authenticated users only (admin-controlled in application layer)
create policy "music_styles_delete_authenticated" on music_styles
  for delete to authenticated
  using (true);

-- ============================================================================
-- USER_MUSIC_STYLES TABLE POLICIES
-- ============================================================================

-- user_music_styles: allow authenticated users to view their own music style preferences
create policy "user_music_styles_select_authenticated" on user_music_styles
  for select to authenticated
  using (user_id = auth.uid());

-- user_music_styles: allow authenticated users to add their own music style preferences
create policy "user_music_styles_insert_authenticated" on user_music_styles
  for insert to authenticated
  with check (user_id = auth.uid());

-- user_music_styles: allow authenticated users to update their own music style preferences
create policy "user_music_styles_update_authenticated" on user_music_styles
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- user_music_styles: allow authenticated users to delete their own music style preferences
create policy "user_music_styles_delete_authenticated" on user_music_styles
  for delete to authenticated
  using (user_id = auth.uid());

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- users: allow anonymous users to view all user profiles (public artist discovery)
create policy "users_select_anon" on users
  for select to anon
  using (true);

-- users: allow authenticated users to view all user profiles
create policy "users_select_authenticated" on users
  for select to authenticated
  using (true);

-- users: allow authenticated users to create their own profile
create policy "users_insert_authenticated" on users
  for insert to authenticated
  with check (id = auth.uid());

-- users: allow users to update only their own profile
create policy "users_update_authenticated" on users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- users: allow users to delete only their own profile
create policy "users_delete_authenticated" on users
  for delete to authenticated
  using (id = auth.uid());

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

-- RLS Policy Summary:
-- 
-- 1. ERROR_LOGS: Open for error reporting, users manage their own logs
-- 2. EVENTS: Public read access, users manage their own events
-- 3. MUSIC_STYLES: Public read access, restricted write (admin-controlled in app)
-- 4. USER_MUSIC_STYLES: Private user preferences, full CRUD for own data
-- 5. USERS: Public read for artist discovery, users manage own profiles
--
-- Security Considerations:
-- - Anonymous users can discover public content (events, users, music styles)
-- - Authenticated users have full CRUD on their own data
-- - Cross-user data access is restricted to read-only where appropriate
-- - Admin controls are enforced at the application layer for music_styles
-- - Error reporting is open to facilitate debugging and monitoring 