<template>
  <nav class="flex items-center space-x-4">
    <!-- Loading state -->
    <template v-if="authStore.loading">
      <div class="animate-pulse flex items-center space-x-2">
        <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
        <div class="w-16 h-4 bg-gray-300 rounded"></div>
      </div>
    </template>

    <!-- Unauthenticated state -->
    <template v-else-if="!authStore.isAuthenticated">
      <BaseButton
        label="Sign In"
        variant="ghost"
        size="medium"
        @click="navigateToPath('/auth/login')"
        class="hidden sm:inline-flex"
      />
      <BaseButton
        label="I'm a DJ"
        variant="primary"
        size="medium"
        @click="navigateToPath('/auth/register')"
        :pulse="true"
      />
    </template>

    <!-- Authenticated state -->
    <template v-else>
      <!-- User menu for larger screens -->
      <div class="hidden sm:flex items-center space-x-4">
        <!-- User info -->
        <div class="flex items-center space-x-3">
          <div
            class="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center"
          >
            <BaseTypography
              variant="caption"
              weight="semibold"
              class="text-white"
            >
              {{ userInitials }}
            </BaseTypography>
          </div>
          <div class="hidden md:block">
            <BaseTypography variant="body-small" weight="medium">
              {{ displayName }}
            </BaseTypography>
          </div>
        </div>

        <!-- Dashboard link -->
        <BaseButton
          label="Dashboard"
          variant="ghost"
          size="medium"
          @click="navigateToPath('/dj/dashboard')"
        />

        <!-- Logout button -->
        <BaseButton
          label="Sign Out"
          variant="ghost"
          size="medium"
          @click="handleLogout"
          :loading="logoutLoading"
          :disabled="logoutLoading"
        />
      </div>

      <!-- Mobile menu button -->
      <div class="sm:hidden">
        <BaseButton
          variant="ghost"
          size="medium"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
        >
          <template #icon-leading>
            <svg
              v-if="!isMobileMenuOpen"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </template>
        </BaseButton>
      </div>
    </template>

    <!-- Mobile menu dropdown (authenticated users only) -->
    <div
      v-if="authStore.isAuthenticated && isMobileMenuOpen"
      class="absolute top-16 right-4 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 sm:hidden animate-fade-in"
    >
      <!-- User info -->
      <div class="px-4 py-3 border-b border-gray-100">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center"
          >
            <BaseTypography variant="body" weight="semibold" class="text-white">
              {{ userInitials }}
            </BaseTypography>
          </div>
          <div>
            <BaseTypography variant="body" weight="medium">
              {{ displayName }}
            </BaseTypography>
            <BaseTypography variant="caption" color="secondary">
              DJ Profile
            </BaseTypography>
          </div>
        </div>
      </div>

      <!-- Menu items -->
      <div class="py-2">
        <button
          @click="handleMobileNavigation('/dj/dashboard')"
          class="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
        >
          <BaseTypography variant="body">Dashboard</BaseTypography>
        </button>
        <button
          @click="handleMobileNavigation('/dj/profile')"
          class="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
        >
          <BaseTypography variant="body">Profile Settings</BaseTypography>
        </button>
        <hr class="my-2 border-gray-100" />
        <button
          @click="handleLogout"
          class="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
          :disabled="logoutLoading"
        >
          <BaseTypography
            variant="body"
            :color="logoutLoading ? 'muted' : 'danger'"
          >
            {{ logoutLoading ? 'Signing Out...' : 'Sign Out' }}
          </BaseTypography>
        </button>
      </div>
    </div>

    <!-- Error toast for logout failures -->
    <div
      v-if="logoutError"
      class="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 z-[60] animate-fade-in"
    >
      <div class="flex items-center">
        <svg
          class="w-5 h-5 text-red-400 mr-3"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <BaseTypography variant="body-small" color="danger">
          {{ logoutError }}
        </BaseTypography>
        <button
          @click="logoutError = ''"
          class="ml-4 text-red-400 hover:text-red-600"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  </nav>

  <!-- Mobile menu overlay -->
  <div
    v-if="authStore.isAuthenticated && isMobileMenuOpen"
    class="fixed inset-0 bg-black bg-opacity-25 z-40 sm:hidden"
    @click="isMobileMenuOpen = false"
  />
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import BaseButton from '@/shared/components/BaseButton.vue';
import BaseTypography from '@/shared/components/BaseTypography.vue';

// Pinia store integration
const authStore = useAuthStore();

// Local state
const isMobileMenuOpen = ref(false);
const logoutLoading = ref(false);
const logoutError = ref('');

// Initialize auth state when component mounts
onMounted(async () => {
  await authStore.initializeAuth();
});

// Computed properties
const userInitials = computed(() => {
  const user = authStore.user;
  if (!user) return '?';

  // Try to get initials from email
  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }

  return '?';
});

const displayName = computed(() => {
  const user = authStore.user;
  if (!user) return 'Unknown User';

  // For now, use email as display name
  // This will be enhanced when user profiles are integrated
  return user.email || 'DJ';
});

// Navigation helper
function navigateToPath(path: string): void {
  window.location.href = path;
}

// Event handlers
async function handleLogout(): Promise<void> {
  try {
    logoutLoading.value = true;
    logoutError.value = '';
    isMobileMenuOpen.value = false;

    await authStore.logout();

    // Logout success - redirect will be handled by authStore
  } catch (error) {
    console.error('Logout failed:', error);
    logoutError.value = 'Failed to sign out. Please try again.';

    // Auto-hide error after 5 seconds
    setTimeout(() => {
      logoutError.value = '';
    }, 5000);
  } finally {
    logoutLoading.value = false;
  }
}

function handleMobileNavigation(path: string): void {
  isMobileMenuOpen.value = false;
  navigateToPath(path);
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Ensure proper positioning context */
nav {
  position: relative;
}
</style>
