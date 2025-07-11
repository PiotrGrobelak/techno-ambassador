import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '@/db/supabase.client.ts';
import { type AuthUser, type ErrorResponse } from '@/schemas/auth.schemas.ts';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Create Supabase server instance
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Get current user session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Auth check error:', error.message);
      return new Response(
        JSON.stringify({
          error: 'Authentication check failed',
        } satisfies ErrorResponse),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' } satisfies ErrorResponse),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return user data
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
    };

    return new Response(JSON.stringify({ user: authUser }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected auth check error:', error);
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred',
      } satisfies ErrorResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
