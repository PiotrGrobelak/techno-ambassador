import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerInstance } from '@/db/supabase.client.ts';

// Guest-only paths - redirect authenticated users away
const GUEST_ONLY_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
];

// Protected paths - require authentication
const PROTECTED_PATHS = [
  '/dashboard', // Dashboard pages including events management
  '/dj/dashboard',
  '/dj/profile',
  '/auth/update-password',
  '/api/auth/update-password',
];

function isGuestOnlyPath(pathname: string): boolean {
  return GUEST_ONLY_PATHS.includes(pathname);
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export const onRequest = defineMiddleware(
  async ({ locals, cookies, url, request, redirect }, next) => {
    // Set Supabase client for legacy compatibility
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });
    locals.supabase = supabase;

    // Get user session for authentication
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Auth middleware error:', error.message);
      // Continue without authentication if there's an error
    }

    // Set user in locals for use in pages
    if (user) {
      locals.user = {
        id: user.id,
        email: user.email,
      };
    }

    const pathname = url.pathname;

    // Handle guest-only paths (redirect authenticated users)
    if (user && isGuestOnlyPath(pathname)) {
      return redirect('/dj/dashboard');
    }

    // Handle protected paths (redirect unauthenticated users)
    if (!user && isProtectedPath(pathname)) {
      // Preserve the original path for redirect after login
      const redirectUrl = new URL('/auth/login', url.origin);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return redirect(redirectUrl.toString());
    }

    // For public paths or authenticated users on protected paths, continue
    return next();
  }
);
