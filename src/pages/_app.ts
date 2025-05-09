import type { App } from "vue";
import PrimeVue from "primevue/config";
import Lara from "@primeuix/themes/lara";

export default function createApp(app: App) {
  app.use(PrimeVue, {
    ripple: true,
    theme: {
      preset: Lara,
    },
  });
}
