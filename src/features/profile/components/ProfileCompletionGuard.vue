<template>
  <div v-if="shouldShowGuard" class="profile-completion-guard">
    <!-- Loading state -->
    <div v-if="authStore.loading || profileStore.loading" class="loading-state">
      <div class="max-w-4xl mx-auto px-4 py-12 text-center">
        <div class="inline-flex items-center space-x-3">
          <div
            class="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"
          ></div>
          <BaseTypography variant="body" color="muted">
            Checking your profile...
          </BaseTypography>
        </div>
      </div>
    </div>

    <!-- Profile incomplete state -->
    <div v-else-if="showCompletionPrompt" class="completion-prompt">
      <div
        class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4"
      >
        <div
          class="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8"
        >
          <!-- Header -->
          <div class="text-center mb-8">
            <div
              class="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <i class="pi pi-user w-8 h-8 text-white"></i>
            </div>
            <BaseTypography
              variant="h2"
              weight="bold"
              class="text-gray-900 mb-2"
            >
              Complete Your DJ Profile
            </BaseTypography>
            <BaseTypography
              variant="body"
              color="secondary"
              class="text-center"
            >
              You need to complete your profile to access the DJ dashboard and
              features.
            </BaseTypography>
          </div>

          <!-- Progress -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-2">
              <BaseTypography
                variant="caption"
                weight="medium"
                color="secondary"
              >
                Profile Progress
              </BaseTypography>
              <BaseTypography
                variant="caption"
                weight="bold"
                class="text-purple-600"
              >
                {{ profileStore.getCompletionProgress }}%
              </BaseTypography>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${profileStore.getCompletionProgress}%` }"
              ></div>
            </div>
          </div>

          <!-- Missing fields -->
          <div class="mb-8">
            <BaseTypography
              variant="caption"
              weight="medium"
              color="secondary"
              class="mb-3 block"
            >
              Missing Information:
            </BaseTypography>
            <div class="space-y-2">
              <div
                v-for="field in profileStore.getMissingFieldLabels"
                :key="field"
                class="flex items-center space-x-2 text-orange-600"
              >
                <i class="pi pi-exclamation-triangle w-4 h-4"></i>
                <BaseTypography variant="body-small">{{
                  field
                }}</BaseTypography>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-3">
            <BaseButton
              label="Complete Profile Now"
              variant="primary"
              size="large"
              class="w-full"
              :loading="redirecting"
              @click="redirectToProfileSetup"
            />
            <BaseButton
              label="Continue to Dashboard"
              variant="ghost"
              size="medium"
              class="w-full"
              @click="continueAnyway"
            >
              <template #icon-trailing>
                <i class="pi pi-arrow-right w-4 h-4"></i>
              </template>
            </BaseButton>
          </div>

          <!-- Footer note -->
          <div class="mt-6 pt-6 border-t border-gray-100 text-center">
            <BaseTypography variant="caption" color="muted">
              You can complete your profile anytime from the dashboard settings.
            </BaseTypography>
          </div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="profileStore.error" class="error-state">
      <div class="max-w-4xl mx-auto px-4 py-12 text-center">
        <div
          class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto"
        >
          <i
            class="pi pi-exclamation-circle w-12 h-12 text-red-400 mx-auto mb-4"
          ></i>
          <BaseTypography variant="h3" weight="bold" class="text-red-800 mb-2">
            Profile Check Failed
          </BaseTypography>
          <BaseTypography variant="body" color="danger" class="mb-4">
            {{ profileStore.error }}
          </BaseTypography>
          <BaseButton
            label="Try Again"
            variant="primary"
            size="medium"
            @click="retryProfileCheck"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Success state - render slot content -->
  <slot v-else />
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { useProfileStore } from '@/shared/stores/useProfileStore';
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import BaseTypography from '@/shared/components/BaseTypography.vue';

interface Props {
  /** Whether to enforce profile completion (true) or just show prompt (false) */
  strict?: boolean;
  /** Override redirect URL for profile setup */
  profileSetupUrl?: string;
}

const props = withDefaults(defineProps<Props>(), {
  strict: false,
  profileSetupUrl: '/dj/profile-setup',
});

// Stores
const authStore = useAuthStore();
const profileStore = useProfileStore();

// Local state
const redirecting = ref(false);

// Initialize stores when component mounts
onMounted(async () => {
  // Wait for auth to be initialized first
  if (!authStore.initialized) {
    await authStore.initializeAuth();
  }

  // Then initialize profile if user is authenticated
  if (authStore.isAuthenticated && !profileStore.initialized) {
    await profileStore.initializeProfile();
  }
});

// Watch for auth state changes
watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated) => {
    if (isAuthenticated && !profileStore.initialized) {
      await profileStore.initializeProfile();
    } else if (!isAuthenticated) {
      profileStore.resetState();
    }
  },
  { immediate: true }
);

// Computed properties
const shouldShowGuard = computed(() => {
  // Only show guard if user is authenticated
  return authStore.isAuthenticated;
});

const showCompletionPrompt = computed(() => {
  return (
    profileStore.initialized &&
    profileStore.needsCompletion &&
    !profileStore.error
  );
});

// Actions
const redirectToProfileSetup = async () => {
  redirecting.value = true;
  try {
    window.location.href = props.profileSetupUrl;
  } catch (error) {
    console.error('Redirect failed:', error);
    redirecting.value = false;
  }
};

const continueAnyway = () => {
  // In non-strict mode, allow users to continue to dashboard
  // In strict mode, this button should not be available, but if called, still allow access
  window.location.href = '/dj/dashboard';
};

const retryProfileCheck = async () => {
  profileStore.clearError();
  await profileStore.checkProfileStatus();
};
</script>
