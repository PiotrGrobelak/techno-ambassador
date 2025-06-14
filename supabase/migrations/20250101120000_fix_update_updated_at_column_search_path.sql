-- =====================================================================================
-- Fix update_updated_at_column function search_path security vulnerability
-- =====================================================================================
-- This migration addresses the mutable search_path security issue (CVE-2018-1058)
-- by securing the update_updated_at_column function with an empty search_path

-- =====================================================================================
-- 1. Secure the update_updated_at_column function
-- =====================================================================================
-- Replace the existing function with a security-hardened version
-- Setting search_path = '' prevents malicious function hijacking
create or replace function update_updated_at_column()
returns trigger as $$
begin
    -- Use pg_catalog.now() to be extra secure, though search_path = '' already protects us
    new.updated_at = pg_catalog.now();
    return new;
end;
$$ language 'plpgsql'
-- This is the critical security fix: empty search_path prevents search path injection
set search_path = '';

-- =====================================================================================
-- 2. Additional security recommendation: Revoke public schema creation (if not done)
-- =====================================================================================
-- This prevents users from creating malicious functions in the public schema
-- Comment: This may already be done in your Supabase setup, but it's good practice
-- REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- =====================================================================================
-- Migration Complete
-- =====================================================================================
-- The update_updated_at_column function is now secured against search_path vulnerabilities
-- - Function uses secure search_path = '' setting
-- - Uses fully qualified pg_catalog.now() for extra security
-- - Prevents CVE-2018-1058 search path injection attacks 