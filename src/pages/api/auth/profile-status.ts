import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client.ts';
import { type ErrorResponse } from '../../../schemas/auth.schemas.ts';

interface ProfileStatus {
  isComplete: boolean;
  missingFields: string[];
  userId: string;
}

interface ProfileStatusResponse {
  data: ProfileStatus;
}

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Create Supabase server instance
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Get current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth check error:', authError.message);
      return new Response(
        JSON.stringify({ error: 'Authentication check failed' } satisfies ErrorResponse),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' } satisfies ErrorResponse),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user profile exists in the users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, artist_name, biography')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for incomplete profiles
      console.error('Profile check error:', profileError.message);
      return new Response(
        JSON.stringify({ error: 'Profile check failed' } satisfies ErrorResponse),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const missingFields: string[] = [];
    let isComplete = true;

    if (!userProfile) {
      // User profile doesn't exist at all
      isComplete = false;
      missingFields.push('artist_name', 'biography');
    } else {
      // Check required fields for DJ profile completion
      if (!userProfile.artist_name || userProfile.artist_name.trim() === '') {
        isComplete = false;
        missingFields.push('artist_name');
      }

      if (!userProfile.biography || userProfile.biography.trim() === '') {
        isComplete = false;
        missingFields.push('biography');
      }

      // Check if user has at least one music style associated
      const { count: musicStyleCount, error: styleError } = await supabase
        .from('user_music_styles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (styleError) {
        console.error('Music style check error:', styleError.message);
        return new Response(
          JSON.stringify({ error: 'Profile check failed' } satisfies ErrorResponse),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (!musicStyleCount || musicStyleCount === 0) {
        isComplete = false;
        missingFields.push('music_styles');
      }
    }

    const profileStatus: ProfileStatus = {
      isComplete,
      missingFields,
      userId: user.id,
    };

    return new Response(
      JSON.stringify({ data: profileStatus } satisfies ProfileStatusResponse),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected profile status check error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' } satisfies ErrorResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 