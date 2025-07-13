// @ts-check
import { defineConfig, envField } from 'astro/config';
import { fileURLToPath } from 'node:url';

import vue from '@astrojs/vue';
import node from '@astrojs/node';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  env: {
    schema: {
      PUBLIC_ENV_NAME: envField.string({ context: 'server', access: 'secret' }),
      SUPABASE_URL: envField.string({ context: 'server', access: 'secret' }),
      SUPABASE_KEY: envField.string({ context: 'server', access: 'secret' }),
    }
  },
  adapter: import.meta.env.CF_PAGES ? cloudflare() : node({
    mode: 'standalone',
  }),
  integrations: [vue({ appEntrypoint: '/src/pages/_app' })],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
});