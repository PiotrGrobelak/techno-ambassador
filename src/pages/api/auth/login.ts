import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client.ts';
import { LoginRequestSchema, type LoginResponse, type ErrorResponse } from '../../../schemas/auth.schemas.ts';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body with Zod
    const body = await request.json().catch(() => null);
    
    const validationResult = LoginRequestSchema.safeParse(body);
    
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

    // Attempt login with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error.message);
      
      // Return user-friendly error messages
      let errorMessage = 'Login failed';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please try again later';
      }

      return new Response(
        JSON.stringify({ error: errorMessage } satisfies ErrorResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data.user) {
      return new Response(
        JSON.stringify({ error: 'Login failed' } satisfies ErrorResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return success response with user data
    const response: LoginResponse = {
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      message: 'Login successful',
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected login error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' } satisfies ErrorResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 