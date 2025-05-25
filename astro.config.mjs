// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [vue({ appEntrypoint: '/src/pages/_app' })],
  vite: {
    plugins: [tailwindcss()],
    // ssr: {
    //   noExternal: ['primevue']
    // }
  }
});