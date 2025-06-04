import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client.ts';
import { RegisterRequestSchema, type RegisterResponse, type ErrorResponse } from '../../../schemas/auth.schemas.ts';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body with Zod
    const body = await request.json().catch(() => null);
    
    const validationResult = RegisterRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return new Response(
        JSON.stringify({ error: firstError.message } satisfies ErrorResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { email, password } = validationResult.data;

    // Create Supabase server instance
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Attempt registration with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/login`,
      },
    });

    if (authError) {
      console.error('Registration error:', authError.message);
      
      // Return user-friendly error messages
      let errorMessage = 'Registration failed';
      if (authError.message.includes('User already registered')) {
        errorMessage = 'An account with this email already exists';
      } else if (authError.message.includes('Password should be')) {
        errorMessage = 'Password does not meet requirements';
      } else if (authError.message.includes('rate limit')) {
        errorMessage = 'Too many registration attempts. Please try again later';
      }

      return new Response(
        JSON.stringify({ error: errorMessage } satisfies ErrorResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'Registration failed' } satisfies ErrorResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create user profile in database with optional fields
    try {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          artist_name: '', // Will be filled when user completes profile
          biography: '', // Will be filled when user completes profile
          user_type: 'dj', // Default user type
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue with registration even if profile creation fails
        // User can complete profile later
      }
    } catch (profileError) {
      console.error('Profile creation unexpected error:', profileError);
      // Continue with registration
    }

    // Return success response
    const response: RegisterResponse = {
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      message: 'Registration successful. Please check your email for verification.',
      needsEmailVerification: !authData.user.email_confirmed_at,
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected registration error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' } satisfies ErrorResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 