<template>
  <nav class="flex items-center space-x-4">
    <!-- Unauthenticated state -->
    <template v-if="!isAuthenticated">
      <BaseButton
        label="Sign In"
        variant="ghost"
        size="medium"
        @click="$emit('navigate', '/auth/login')"
        class="hidden sm:inline-flex"
      />
      <BaseButton
        label="I'm a DJ"
        variant="primary"
        size="medium"
        @click="$emit('navigate', '/auth/register')"
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
              {{ userData?.name || userData?.email }}
            </BaseTypography>
          </div>
        </div>

        <!-- Dashboard link -->
        <BaseButton
          label="Dashboard"
          variant="ghost"
          size="medium"
          @click="$emit('navigate', '/dj/dashboard')"
        />

        <!-- Logout button -->
        <BaseButton
          label="Sign Out"
          variant="ghost"
          size="medium"
          @click="handleLogout"
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
      v-if="isAuthenticated && isMobileMenuOpen"
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
              {{ userData?.name || userData?.email }}
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
        >
          <BaseTypography variant="body" color="danger"
            >Sign Out</BaseTypography
          >
        </button>
      </div>
    </div>
  </nav>

  <!-- Mobile menu overlay -->
  <div
    v-if="isAuthenticated && isMobileMenuOpen"
    class="fixed inset-0 bg-black bg-opacity-25 z-40 sm:hidden"
    @click="isMobileMenuOpen = false"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import BaseButton from './BaseButton.vue';
import BaseTypography from './BaseTypography.vue';

interface UserData {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface Props {
  isAuthenticated: boolean;
  userData?: UserData | null;
  loading?: boolean;
}

interface Emits {
  (e: 'navigate', path: string): void;
  (e: 'logout'): void;
}

const props = withDefaults(defineProps<Props>(), {
  isAuthenticated: false,
  userData: null,
  loading: false,
});

const emit = defineEmits<Emits>();

// Mobile menu state
const isMobileMenuOpen = ref(false);

// Computed properties
const userInitials = computed(() => {
  if (!props.userData) return '?';

  if (props.userData.name) {
    return props.userData.name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return props.userData.email.charAt(0).toUpperCase();
});

// Event handlers
function handleLogout(): void {
  isMobileMenuOpen.value = false;
  emit('logout');
}

function handleMobileNavigation(path: string): void {
  isMobileMenuOpen.value = false;
  emit('navigate', path);
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
