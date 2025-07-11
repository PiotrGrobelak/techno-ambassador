/// <reference types="astro/client" />

// Vue SFC module declarations
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<typeof object, typeof object, unknown>;
  export default component;
}

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './db/database.types.ts';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
