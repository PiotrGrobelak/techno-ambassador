import type { APIContext } from 'astro';
import { handleApiError } from '../../middleware/error-handler';

export const prerender = false

/**
 * GET /api/music-styles - Get all available music styles
 * 
 * Returns all music styles with their UUIDs and names for testing purposes.
 * No authentication required as this is public reference data.
 * 
 * @param context - Astro API context with request and locals
 * @returns Response with music styles data or error
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    console.log('Fetching music styles from database...');
    
    const { data: musicStyles, error } = await context.locals.supabase
      .from('music_styles')
      .select('id, style_name, created_at')
      .order('style_name');

    console.log('Database response:', { data: musicStyles, error });

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to fetch music styles: ${error.message}`);
    }

    const response = {
      data: musicStyles || [],
      total: musicStyles?.length || 0
    };

    console.log('Returning response:', response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('API error:', error);
    return await handleApiError(error, context);
  }
} 