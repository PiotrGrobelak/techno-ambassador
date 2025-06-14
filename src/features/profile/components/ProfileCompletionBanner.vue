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
          <i class="pi pi-user w-6 h-6 text-white"></i>
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
              <i class="pi pi-exclamation-triangle w-3 h-3 mr-1"></i>
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
              <i class="pi pi-arrow-right w-4 h-4"></i>
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
        <i class="pi pi-times w-5 h-5"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useProfileStore } from '@/shared/stores/useProfileStore';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import BaseTypography from '@/shared/components/BaseTypography.vue';

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
  // Navigate to profile completion page
  window.location.href = '/dj/profile?mode=complete';
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
