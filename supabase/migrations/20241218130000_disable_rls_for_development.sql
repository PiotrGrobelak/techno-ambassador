-- =====================================================================================
-- Migration: Disable Row Level Security for Development
-- Description: Disables RLS and drops all policies for easier development and testing
-- Purpose: Allows unrestricted access to all tables without authentication
-- Affected Tables: users, music_styles, user_music_styles, events, error_logs
-- Warning: This removes all security restrictions - use only in development!
-- =====================================================================================

-- =====================================================================================
-- 1. Drop All Existing RLS Policies
-- =====================================================================================

-- =====================================================================================
-- 1.1 Users Table Policies
-- =====================================================================================
DROP POLICY IF EXISTS "users_select_anon" ON users;
DROP POLICY IF EXISTS "users_select_authenticated" ON users;
DROP POLICY IF EXISTS "users_insert_authenticated" ON users;
DROP POLICY IF EXISTS "users_update_authenticated" ON users;
DROP POLICY IF EXISTS "users_delete_authenticated" ON users;

-- =====================================================================================
-- 1.2 Music Styles Table Policies
-- =====================================================================================
DROP POLICY IF EXISTS "music_styles_select_anon" ON music_styles;
DROP POLICY IF EXISTS "music_styles_select_authenticated" ON music_styles;

-- =====================================================================================
-- 1.3 User Music Styles Table Policies
-- =====================================================================================
DROP POLICY IF EXISTS "user_music_styles_select_anon" ON user_music_styles;
DROP POLICY IF EXISTS "user_music_styles_select_authenticated" ON user_music_styles;
DROP POLICY IF EXISTS "user_music_styles_insert_authenticated" ON user_music_styles;
DROP POLICY IF EXISTS "user_music_styles_update_authenticated" ON user_music_styles;
DROP POLICY IF EXISTS "user_music_styles_delete_authenticated" ON user_music_styles;

-- =====================================================================================
-- 1.4 Events Table Policies
-- =====================================================================================
DROP POLICY IF EXISTS "events_select_anon" ON events;
DROP POLICY IF EXISTS "events_select_authenticated" ON events;
DROP POLICY IF EXISTS "events_insert_authenticated" ON events;
DROP POLICY IF EXISTS "events_update_authenticated" ON events;
DROP POLICY IF EXISTS "events_delete_authenticated" ON events;

-- =====================================================================================
-- 1.5 Error Logs Table Policies
-- =====================================================================================
DROP POLICY IF EXISTS "error_logs_insert_authenticated" ON error_logs;
DROP POLICY IF EXISTS "error_logs_select_authenticated" ON error_logs;

-- =====================================================================================
-- 2. Disable Row Level Security on All Tables
-- =====================================================================================

-- Disable RLS for users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS for music_styles table
ALTER TABLE music_styles DISABLE ROW LEVEL SECURITY;

-- Disable RLS for user_music_styles table
ALTER TABLE user_music_styles DISABLE ROW LEVEL SECURITY;

-- Disable RLS for events table
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- Disable RLS for error_logs table
ALTER TABLE error_logs DISABLE ROW LEVEL SECURITY;

-- =====================================================================================
-- Migration Complete
-- =====================================================================================
-- Row Level Security has been disabled for all tables:
-- - All RLS policies have been dropped
-- - RLS is disabled on users, music_styles, user_music_styles, events, error_logs
-- - Full unrestricted access is now available for development and testing
-- - Remember to re-enable RLS and policies before production deployment!
-- ===================================================================================== 