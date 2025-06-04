<template>
  <div
    v-if="shouldShowBanner"
    class="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6 mb-6"
  >
    <div class="flex items-start space-x-4">
      <!-- Icon -->
      <div class="flex-shrink-0">
        <div
          class="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl flex items-center justify-center"
        >
          <svg
            class="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-3">
          <BaseTypography variant="h3" weight="bold" class="text-orange-800">
            Complete Your DJ Profile
          </BaseTypography>
          <BaseTypography
            variant="caption"
            weight="bold"
            class="text-orange-600 bg-white px-2 py-1 rounded-full"
          >
            {{ profileStore.getCompletionProgress }}% Complete
          </BaseTypography>
        </div>

        <BaseTypography
          variant="body"
          color="secondary"
          class="text-orange-700 mb-4"
        >
          Complete your profile to attract more event organizers and increase
          your visibility in the techno music scene.
        </BaseTypography>

        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="w-full bg-orange-200 rounded-full h-2">
            <div
              class="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${profileStore.getCompletionProgress}%` }"
            ></div>
          </div>
        </div>

        <!-- Missing fields -->
        <div class="mb-4">
          <BaseTypography
            variant="caption"
            weight="medium"
            class="text-orange-700 mb-2 block"
          >
            Missing Information:
          </BaseTypography>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="field in profileStore.getMissingFieldLabels"
              :key="field"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
            >
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ field }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3">
          <BaseButton
            label="Complete Profile Now"
            variant="primary"
            size="medium"
            class="bg-orange-600 hover:bg-orange-700 border-orange-600"
            @click="navigateToProfile"
          >
            <template #icon-trailing>
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </template>
          </BaseButton>
          <BaseButton
            label="Remind Me Later"
            variant="ghost"
            size="medium"
            @click="dismissBanner"
            class="text-orange-700 hover:bg-orange-100"
          />
        </div>
      </div>

      <!-- Dismiss button -->
      <button
        @click="dismissBanner"
        class="flex-shrink-0 p-1 text-orange-400 hover:text-orange-600 transition-colors"
        aria-label="Dismiss banner"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useProfileStore } from '../stores/profileStore';
import { useAuthStore } from '../stores/authStore';
import BaseButton from './BaseButton.vue';
import BaseTypography from './BaseTypography.vue';

// Stores
const profileStore = useProfileStore();
const authStore = useAuthStore();

// Local state
const dismissed = ref(false);

// Initialize profile store when component mounts
onMounted(async () => {
  if (authStore.isAuthenticated && !profileStore.initialized) {
    await profileStore.initializeProfile();
  }
});

// Computed properties
const shouldShowBanner = computed(() => {
  return (
    authStore.isAuthenticated &&
    profileStore.initialized &&
    profileStore.needsCompletion &&
    !profileStore.error &&
    !dismissed.value
  );
});

// Actions
const navigateToProfile = () => {
  // For now, we'll navigate to a placeholder URL
  // In the future, this should navigate to the actual profile settings page
  console.log('Navigate to profile settings - to be implemented');
  // window.location.href = '/dj/profile';
};

const dismissBanner = () => {
  dismissed.value = true;
  // Optional: Store dismissal in localStorage to persist across sessions
  localStorage.setItem('profile-completion-banner-dismissed', 'true');
};

// Check if banner was previously dismissed
onMounted(() => {
  const wasDismissed = localStorage.getItem(
    'profile-completion-banner-dismissed'
  );
  if (wasDismissed === 'true') {
    dismissed.value = true;
  }
});
</script>
