import type { App } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import Lara from "@primeuix/themes/lara";
import ConfirmationService from 'primevue/confirmationservice';


export default function createApp(app: App) {
  // Create and install Pinia store
  const pinia = createPinia();
  app.use(pinia);


  // Configure PrimeVue
  app.use(PrimeVue, {
    ripple: true,
    theme: {
      preset: Lara,
    },
  });

  // Add ConfirmationService for dialogs
  app.use(ConfirmationService);

  // Add ToastService for notifications
  app.use(ToastService);
}
