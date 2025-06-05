import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '@/db/supabase.client.ts';
import { ResetPasswordRequestSchema, type SuccessMessageResponse, type ErrorResponse } from '@/schemas/auth.schemas.ts';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body with Zod
    const body = await request.json().catch(() => null);
    
    const validationResult = ResetPasswordRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return new Response(
        JSON.stringify({ error: firstError.message } satisfies ErrorResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { email } = validationResult.data;

    // Create Supabase server instance
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${new URL(request.url).origin}/auth/update-password`,
      }
    );

    if (error) {
      console.error('Password reset error:', error.message);
      
      // For security reasons, don't reveal whether email exists or not
      // Always return success message
    }

    // Always return success response for security
    // (Don't reveal whether email exists in system)
    const response: SuccessMessageResponse = {
      message: 'If an account with this email exists, you will receive a password reset link.',
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected password reset error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' } satisfies ErrorResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 