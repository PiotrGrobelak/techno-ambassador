<template>
  <div>
    <!-- Loading state -->
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <i class="pi pi-spinner pi-spin text-4xl text-purple-600"></i>
    </div>

    <!-- Content for authenticated users -->
    <slot v-else-if="isAuthenticated" />

    <!-- Unauthorized state -->
    <div
      v-else
      class="min-h-screen bg-gray-50 flex items-center justify-center"
    >
      <div
        class="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center"
      >
        <div
          class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <i class="pi pi-lock text-2xl text-red-600"></i>
        </div>

        <BaseTypography variant="h4" weight="semibold" class="mb-2">
          Authentication Required
        </BaseTypography>

        <BaseTypography variant="body" color="secondary" class="mb-6">
          {{
            unauthorizedMessage || 'You need to sign in to access this page.'
          }}
        </BaseTypography>

        <div class="space-y-3">
          <BaseButton
            label="Sign In"
            variant="primary"
            size="large"
            full-width
            :pulse="true"
            @click="redirectToLogin"
          />

          <BaseButton
            label="Create Account"
            variant="ghost"
            size="large"
            full-width
            @click="redirectToRegister"
          />
        </div>

        <div class="mt-6 pt-6 border-t border-gray-200">
          <BaseButton
            label="← Back to Home"
            variant="link"
            @click="redirectToHome"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import BaseTypography from '@/shared/components/BaseTypography.vue';
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
interface Props {
  requiredRole?: string;
  redirectUrl?: string;
  unauthorizedMessage?: string;
  checkAuth?: boolean;
}

interface Emits {
  (e: 'unauthorized'): void;
  (e: 'authorized'): void;
}

const props = withDefaults(defineProps<Props>(), {
  redirectUrl: '/auth/login',
  checkAuth: true,
});

const emit = defineEmits<Emits>();

// Authentication state
const isLoading = ref(true);
const isAuthenticated = ref(false);
const userRole = ref<string>();

// Check authentication status
async function checkAuthenticationStatus(): Promise<void> {
  if (!props.checkAuth) {
    isLoading.value = false;
    isAuthenticated.value = true;
    return;
  }

  try {
    // This will be implemented when auth service is ready
    // For now, simulate loading and check
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock authentication check - will be replaced with real auth service
    const mockAuth = false; // Change to true to test authenticated state
    isAuthenticated.value = mockAuth;

    if (mockAuth) {
      userRole.value = 'dj'; // Mock role
      emit('authorized');
    } else {
      emit('unauthorized');
    }
  } catch (error) {
    console.error('Authentication check failed:', error);
    isAuthenticated.value = false;
    emit('unauthorized');
  } finally {
    isLoading.value = false;
  }
}

// Check if user has required role
const hasRequiredRole = computed(() => {
  if (!props.requiredRole) return true;
  return userRole.value === props.requiredRole;
});

// Final authentication state
const finalAuthState = computed(() => {
  return isAuthenticated.value && hasRequiredRole.value;
});

// Navigation functions
function redirectToLogin(): void {
  const currentPath = encodeURIComponent(window.location.pathname);
  window.location.href = `/auth/login?redirectTo=${currentPath}`;
}

function redirectToRegister(): void {
  window.location.href = '/auth/register';
}

function redirectToHome(): void {
  window.location.href = '/';
}

// Initialize authentication check
onMounted(() => {
  checkAuthenticationStatus();
});
</script>
