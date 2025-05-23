-- =====================================================================================
-- Migration: Disable All RLS Policies
-- Description: Drops all Row Level Security policies from the Techno Ambassador platform
-- Purpose: Removes all security policies for testing/development or alternative auth setup
-- Affected Tables: users, music_styles, user_music_styles, events, error_logs
-- Special Considerations: 
--   - This removes all data access restrictions
--   - Use with caution in production environments
--   - Tables will still have RLS enabled, only policies are removed
-- =====================================================================================

-- =====================================================================================
-- 1. Drop Users Table RLS Policies
-- =====================================================================================

-- drop all users table policies
drop policy if exists "users_select_anon" on users;
drop policy if exists "users_select_authenticated" on users;
drop policy if exists "users_insert_authenticated" on users;
drop policy if exists "users_update_authenticated" on users;
drop policy if exists "users_delete_authenticated" on users;

-- =====================================================================================
-- 2. Drop Music Styles Table RLS Policies
-- =====================================================================================

-- drop all music styles table policies
drop policy if exists "music_styles_select_anon" on music_styles;
drop policy if exists "music_styles_select_authenticated" on music_styles;

-- =====================================================================================
-- 3. Drop User Music Styles Table RLS Policies
-- =====================================================================================

-- drop all user music styles table policies
drop policy if exists "user_music_styles_select_anon" on user_music_styles;
drop policy if exists "user_music_styles_select_authenticated" on user_music_styles;
drop policy if exists "user_music_styles_insert_authenticated" on user_music_styles;
drop policy if exists "user_music_styles_update_authenticated" on user_music_styles;
drop policy if exists "user_music_styles_delete_authenticated" on user_music_styles;

-- =====================================================================================
-- 4. Drop Events Table RLS Policies
-- =====================================================================================

-- drop all events table policies
drop policy if exists "events_select_anon" on events;
drop policy if exists "events_select_authenticated" on events;
drop policy if exists "events_insert_authenticated" on events;
drop policy if exists "events_update_authenticated" on events;
drop policy if exists "events_delete_authenticated" on events;

-- =====================================================================================
-- 5. Drop Error Logs Table RLS Policies
-- =====================================================================================

-- drop all error logs table policies
drop policy if exists "error_logs_insert_authenticated" on error_logs;
drop policy if exists "error_logs_select_authenticated" on error_logs;

-- =====================================================================================
-- Optional: Disable RLS on Tables (Uncomment if you want to completely disable RLS)
-- =====================================================================================

-- uncomment the following lines if you want to completely disable rls on all tables
-- alter table users disable row level security;
-- alter table music_styles disable row level security;
-- alter table user_music_styles disable row level security;
-- alter table events disable row level security;
-- alter table error_logs disable row level security;

-- =====================================================================================
-- Migration Complete
-- =====================================================================================
-- all rls policies have been successfully removed from:
-- - users table (5 policies removed)
-- - music_styles table (2 policies removed)
-- - user_music_styles table (5 policies removed)
-- - events table (5 policies removed)
-- - error_logs table (2 policies removed)
-- 
-- note: tables still have rls enabled but no policies are active
-- this means no operations will be allowed unless rls is disabled on tables
-- or new policies are created
-- ===================================================================================== 