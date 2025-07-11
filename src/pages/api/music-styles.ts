import type { APIContext } from 'astro';
import { handleApiError } from '../../middleware/error-handler';

export const prerender = false;

/**
 * GET /api/music-styles - Get all available music styles
 *
 * Returns all music styles with their UUIDs, names, and user counts.
 * No authentication required as this is public reference data.
 *
 * @param context - Astro API context with request and locals
 * @returns Response with music styles data or error
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    const { data: musicStyles, error } = await context.locals.supabase
      .from('music_styles')
      .select(
        `
        id,
        style_name,
        created_at,
        user_music_styles(count)
      `
      )
      .order('style_name');

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to fetch music styles: ${error.message}`);
    }

    // Transform the data to include user_count
    const transformedData = (musicStyles || []).map((style) => ({
      id: style.id,
      style_name: style.style_name,
      created_at: style.created_at,
      user_count: style.user_music_styles?.[0]?.count || 0,
    }));

    const response = {
      data: transformedData,
      total: transformedData.length,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('API error:', error);
    return await handleApiError(error, context);
  }
}
