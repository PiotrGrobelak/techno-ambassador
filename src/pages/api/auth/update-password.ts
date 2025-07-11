import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '@/db/supabase.client.ts';
import {
  UpdatePasswordRequestSchema,
  type SuccessMessageResponse,
  type ErrorResponse,
} from '@/schemas/auth.schemas.ts';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body with Zod
    const body = await request.json().catch(() => null);

    const validationResult = UpdatePasswordRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return new Response(
        JSON.stringify({ error: firstError.message } satisfies ErrorResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { password } = validationResult.data;

    // Create Supabase server instance
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Verify user session (should be available from password reset flow)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: 'Invalid or expired password reset session',
        } satisfies ErrorResponse),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error('Password update error:', error.message);

      let errorMessage = 'Password update failed';
      if (error.message.includes('Password should be')) {
        errorMessage = 'Password does not meet requirements';
      } else if (error.message.includes('session_not_found')) {
        errorMessage = 'Invalid or expired password reset session';
      }

      return new Response(
        JSON.stringify({ error: errorMessage } satisfies ErrorResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return success response
    const response: SuccessMessageResponse = {
      message:
        'Password updated successfully. You can now sign in with your new password.',
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected password update error:', error);
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred. Please try again.',
      } satisfies ErrorResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
