import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_KEY } from 'astro:env/server';
import type { Database } from '../db/database.types.ts';
import type { AstroCookies } from 'astro';

export const supabaseClient = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_KEY
);

export const cookieOptions: CookieOptionsWithName = {
  path: '/',
  secure: true,
  httpOnly: true,
  sameSite: 'lax',
};

function parseCookieHeader(
  cookieHeader: string
): { name: string; value: string }[] {
  return cookieHeader.split(';').map((cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    return { name, value: rest.join('=') };
  });
}

export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
}) => {
  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get('Cookie') ?? '');
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options?: CookieOptionsWithName;
        }>
      ) {
        cookiesToSet.forEach(({ name, value, options }) =>
          context.cookies.set(name, value, options)
        );
      },
    },
  });

  return supabase;
};
