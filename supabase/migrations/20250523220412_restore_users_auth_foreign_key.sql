-- =====================================================================================
-- Migration: Restore Users Auth Foreign Key
-- Description: Restores the foreign key constraint between users and auth.users tables
-- Purpose: Re-establishes referential integrity and makes relationship visible in Supabase Studio
-- Affected Tables: users
-- =====================================================================================

-- =====================================================================================
-- 1. Restore Foreign Key Constraint
-- =====================================================================================

-- Add back the foreign key constraint to auth.users
ALTER TABLE users ADD CONSTRAINT users_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- =====================================================================================
-- 2. Remove Default UUID Generation
-- =====================================================================================

-- Remove the default UUID generation since IDs should come from auth.users
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;

-- =====================================================================================
-- Migration Complete
-- =====================================================================================
-- The foreign key relationship between users and auth.users has been restored:
-- - users.id now properly references auth.users.id
-- - Relationship will be visible in Supabase Studio
-- - Data integrity is ensured through foreign key constraint
-- - Default UUID generation removed since IDs come from auth.users
-- ===================================================================================== 