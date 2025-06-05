<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 class="font-semibold text-gray-900 mb-4">Your Profile</h3>

    <!-- Loading state -->
    <div v-if="profileStore.loading" class="text-center py-4">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"
      ></div>
      <BaseTypography variant="body-small" color="muted">
        Loading profile...
      </BaseTypography>
    </div>

    <!-- Profile content -->
    <div v-else class="text-center">
      <div
        class="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3"
      >
        <span class="text-xl font-bold text-white">DJ</span>
      </div>

      <!-- Profile completion status -->
      <div
        v-if="profileStore.initialized && profileStore.needsCompletion"
        class="mb-4"
      >
        <div class="flex items-center justify-center mb-2">
          <BaseTypography variant="body-small" color="secondary" class="mr-2">
            Profile Progress:
          </BaseTypography>
          <BaseTypography
            variant="body-small"
            weight="bold"
            :class="progressColor"
          >
            {{ profileStore.getCompletionProgress }}%
          </BaseTypography>
        </div>

        <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div
            class="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${profileStore.getCompletionProgress}%` }"
          ></div>
        </div>

        <BaseTypography variant="body-small" color="secondary" class="mb-4">
          {{ completionMessage }}
        </BaseTypography>
      </div>

      <!-- Complete profile message -->
      <div
        v-else-if="profileStore.initialized && profileStore.isProfileComplete"
        class="mb-4"
      >
        <div class="flex items-center justify-center mb-2">
          <svg
            class="w-5 h-5 text-green-500 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <BaseTypography
            variant="body-small"
            weight="bold"
            class="text-green-600"
          >
            Profile Complete
          </BaseTypography>
        </div>
        <BaseTypography variant="body-small" color="secondary" class="mb-4">
          Your profile is complete and ready to attract event organizers!
        </BaseTypography>
      </div>

      <!-- Default message for unauthenticated or uninitialized -->
      <div v-else class="mb-4">
        <BaseTypography variant="body-small" color="secondary">
          Complete your profile to attract more event organizers
        </BaseTypography>
      </div>

      <!-- Action button -->
      <BaseButton
        :label="buttonLabel"
        variant="primary"
        size="medium"
        class="w-full"
        @click="handleProfileAction"
        :disabled="profileStore.loading"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useProfileStore } from '../stores/useProfileStore';
import { useAuthStore } from '../stores/useAuthStore';
import BaseButton from './BaseButton.vue';
import BaseTypography from './BaseTypography.vue';

// Stores
const profileStore = useProfileStore();
const authStore = useAuthStore();

// Initialize profile store when component mounts
onMounted(async () => {
  if (authStore.isAuthenticated && !profileStore.initialized) {
    await profileStore.initializeProfile();
  }
});

// Computed properties
const progressColor = computed(() => {
  const progress = profileStore.getCompletionProgress;
  if (progress >= 80) return 'text-green-600';
  if (progress >= 50) return 'text-yellow-600';
  return 'text-orange-600';
});

const completionMessage = computed(() => {
  const missingCount = profileStore.missingFields.length;
  if (missingCount === 1) {
    return `${missingCount} field remaining to complete your profile`;
  }
  return `${missingCount} fields remaining to complete your profile`;
});

const buttonLabel = computed(() => {
  if (profileStore.loading) return 'Loading...';
  if (profileStore.initialized && profileStore.isProfileComplete) {
    return 'Edit Profile';
  }
  return 'Complete Profile';
});

// Actions
const handleProfileAction = () => {
  if (profileStore.initialized && profileStore.isProfileComplete) {
    // Navigate to profile edit page
    window.location.href = '/dj/profile';
  } else {
    // Navigate to profile completion page
    window.location.href = '/dj/profile?mode=complete';
  }
};
</script>
