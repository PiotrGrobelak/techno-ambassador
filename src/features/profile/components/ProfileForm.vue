<template>
  <div class="profile-form">
    <!-- Completion Banner -->
    <ProfileCompletionBanner
      :mode="profileFormStore.formMode"
      :is-complete="isProfileComplete"
      :completion-percentage="profileFormStore.completionPercentage"
      :missing-fields="profileFormStore.missingFields"
      @dismiss="dismissBanner"
    />

    <!-- Main Content - Two Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left Column - Form -->
      <div class="space-y-6">
        <!-- Main Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Form Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="space-y-6">
              <!-- Artist Name -->
              <div>
                <label
                  for="artist-name"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Artist Name
                  <span class="text-red-500">*</span>
                </label>
                <InputText
                  id="artist-name"
                  :model-value="profileFormStore.formData.artist_name"
                  placeholder="Enter your artist/DJ name"
                  :class="inputClasses('artist_name')"
                  :invalid="Boolean(profileFormStore.formErrors.artist_name)"
                  @update:model-value="
                    (value) =>
                      profileFormStore.updateField('artist_name', value || '')
                  "
                  @blur="() => validateField('artist_name')"
                />
                <small
                  v-if="profileFormStore.formErrors.artist_name"
                  class="p-error block mt-1"
                >
                  {{ profileFormStore.formErrors.artist_name }}
                </small>
                <small v-else class="text-gray-600 block mt-1">
                  This is how other users will find you
                </small>
              </div>

              <!-- Biography -->
              <div>
                <label
                  for="biography"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Biography
                  <span class="text-red-500">*</span>
                </label>
                <Textarea
                  id="biography"
                  :model-value="profileFormStore.formData.biography"
                  placeholder="Tell us about your music journey, style, and what makes you unique..."
                  :rows="6"
                  :class="inputClasses('biography')"
                  :invalid="Boolean(profileFormStore.formErrors.biography)"
                  @update:model-value="
                    (value) =>
                      profileFormStore.updateField('biography', value || '')
                  "
                  @blur="() => validateField('biography')"
                />
                <div class="flex justify-between items-center mt-1">
                  <small
                    v-if="profileFormStore.formErrors.biography"
                    class="p-error"
                  >
                    {{ profileFormStore.formErrors.biography }}
                  </small>
                  <small v-else class="text-gray-600">
                    Share your musical background and style
                  </small>
                  <small class="text-gray-500">
                    {{ profileFormStore.formData.biography.length }} / 10,000
                  </small>
                </div>
              </div>

              <!-- Music Styles -->
              <MusicStyleSelector
                :model-value="profileFormStore.formData.music_style_ids"
                :error-message="profileFormStore.formErrors.music_style_ids"
                helper-text="Select the music styles you play or are passionate about"
                @update:model-value="
                  (value) =>
                    profileFormStore.updateField('music_style_ids', value || [])
                "
                @change="
                  () => profileFormStore.clearFieldError('music_style_ids')
                "
              />

              <!-- Social Media URLs -->
              <div class="space-y-4">
                <h4 class="text-sm font-medium text-gray-700">Social Media</h4>
                <div class="grid grid-cols-1 gap-4">
                  <!-- Instagram URL -->
                  <div>
                    <label
                      for="instagram-url"
                      class="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Instagram
                    </label>
                    <InputText
                      id="instagram-url"
                      :model-value="profileFormStore.formData.instagram_url"
                      placeholder="@yourusername or https://instagram.com/yourusername"
                      :class="inputClasses('instagram_url')"
                      :invalid="
                        Boolean(profileFormStore.formErrors.instagram_url)
                      "
                      @update:model-value="
                        (value) =>
                          profileFormStore.updateField(
                            'instagram_url',
                            value || ''
                          )
                      "
                      @blur="() => validateField('instagram_url')"
                    />
                    <small
                      v-if="profileFormStore.formErrors.instagram_url"
                      class="p-error block mt-1"
                    >
                      {{ profileFormStore.formErrors.instagram_url }}
                    </small>
                    <small v-else class="text-gray-600 block mt-1">
                      Optional - your Instagram handle or profile URL
                    </small>
                  </div>

                  <!-- Facebook URL -->
                  <div>
                    <label
                      for="facebook-url"
                      class="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Facebook
                    </label>
                    <InputText
                      id="facebook-url"
                      :model-value="profileFormStore.formData.facebook_url"
                      placeholder="yourusername or https://facebook.com/yourusername"
                      :class="inputClasses('facebook_url')"
                      :invalid="
                        Boolean(profileFormStore.formErrors.facebook_url)
                      "
                      @update:model-value="
                        (value) =>
                          profileFormStore.updateField(
                            'facebook_url',
                            value || ''
                          )
                      "
                      @blur="() => validateField('facebook_url')"
                    />
                    <small
                      v-if="profileFormStore.formErrors.facebook_url"
                      class="p-error block mt-1"
                    >
                      {{ profileFormStore.formErrors.facebook_url }}
                    </small>
                    <small v-else class="text-gray-600 block mt-1">
                      Optional - your Facebook username or profile URL
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- General Error Message -->
          <div
            v-if="profileFormStore.formErrors.general"
            class="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div class="flex items-start">
              <svg
                class="h-5 w-5 text-red-400 mt-0.5 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <div>
                <h3 class="text-sm font-medium text-red-800">
                  Error saving profile
                </h3>
                <p class="text-sm text-red-700 mt-1">
                  {{ profileFormStore.formErrors.general }}
                </p>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div
            class="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center"
          >
            <!-- Left side - Info -->
            <div class="text-sm text-gray-600">
              <span
                v-if="
                  profileFormStore.isDirty && !profileFormStore.isSubmitting
                "
              >
                You have unsaved changes
              </span>
              <span
                v-else-if="
                  !profileFormStore.isDirty && !profileFormStore.isNewProfile
                "
              >
                All changes saved
              </span>
            </div>

            <!-- Right side - Actions -->
            <div class="flex gap-3">
              <Button
                v-if="profileFormStore.isDirty"
                label="Reset"
                severity="secondary"
                outlined
                :disabled="profileFormStore.isSubmitting"
                @click="handleReset"
              />

              <Button
                type="submit"
                :label="submitButtonLabel"
                :loading="profileFormStore.isSubmitting"
                :disabled="
                  !profileFormStore.isFormValid || profileFormStore.isSubmitting
                "
                class="min-w-32"
              />
            </div>
          </div>
        </form>
      </div>

      <!-- Right Column - Preview -->
      <div class="space-y-6">
        <!-- Sticky Preview -->
        <div class="lg:sticky lg:top-8">
          <ProfilePreview
            :profile-data="profileFormStore.formData"
            :completion-percentage="profileFormStore.completionPercentage"
            :show-public-profile-button="!profileFormStore.isNewProfile"
            :show-tips="true"
          />
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div
      v-if="showSuccessMessage"
      class="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg transition-all duration-300 z-50"
    >
      <div class="flex items-center">
        <svg
          class="h-5 w-5 text-green-400 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="text-sm font-medium text-green-800">
          {{ successMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';

import ProfileCompletionBanner from './ProfileCompletionBanner.vue';
import ProfilePreview from './ProfilePreview.vue';
import MusicStyleSelector from './MusicStyleSelector.vue';
import { useProfileFormStore } from '@/features/profile/stores/useProfileFormStore';
import type { ProfileFormData } from '@/features/profile/types';

// Use the profile form store
const profileFormStore = useProfileFormStore();

// Component state
const showSuccessMessage = ref(false);
const bannerDismissed = ref(false);

// Computed properties
const submitButtonLabel = computed(() => {
  if (profileFormStore.isSubmitting) {
    return profileFormStore.isNewProfile
      ? 'Creating Profile...'
      : 'Saving Changes...';
  }
  return profileFormStore.isNewProfile ? 'Create Profile' : 'Save Changes';
});

const successMessage = computed(() => {
  return profileFormStore.isNewProfile
    ? 'Profile created successfully!'
    : 'Profile updated successfully!';
});

const isProfileComplete = computed(() => {
  return (
    profileFormStore.isFormValid &&
    profileFormStore.formData.instagram_url.length > 0 &&
    profileFormStore.formData.facebook_url.length > 0
  );
});

// Methods
const inputClasses = (fieldName: keyof ProfileFormData) => {
  const baseClasses = 'w-full';
  const hasError = Boolean(profileFormStore.formErrors[fieldName]);

  return hasError ? `${baseClasses} p-invalid` : baseClasses;
};

const validateField = (fieldName: keyof ProfileFormData) => {
  const value = profileFormStore.formData[fieldName];
  const error = profileFormStore.validateField(fieldName, value);

  if (error) {
    profileFormStore.setErrors({
      ...profileFormStore.formErrors,
      [fieldName]: error,
    });
  } else {
    profileFormStore.clearFieldError(fieldName);
  }
};

const handleSubmit = async () => {
  // Check authentication before submitting
  if (!profileFormStore.isAuthenticated) {
    profileFormStore.setErrors({
      ...profileFormStore.formErrors,
      general: 'You must be logged in to save your profile',
    });
    return;
  }

  const result = await profileFormStore.saveProfile();

  if (result.success) {
    showSuccessMessage.value = true;

    // Auto-hide success message
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 3000);

    // Redirect to dashboard if this was profile completion
    if (profileFormStore.formMode === 'complete') {
      setTimeout(() => {
        window.location.href = '/dj/dashboard';
      }, 1500);
    }
  }
};

const handleReset = () => {
  profileFormStore.resetForm();
  bannerDismissed.value = false;
};

const dismissBanner = () => {
  bannerDismissed.value = true;
};

// Lifecycle
onMounted(async () => {
  // Initialize authentication first
  await profileFormStore.initializeAuth();

  // Only proceed if authenticated
  if (profileFormStore.isAuthenticated) {
    const userId = profileFormStore.getCurrentUserId();
    if (userId) {
      await profileFormStore.loadProfile(userId);
    }
  } else {
    // Redirect to login if not authenticated
    // This should normally be handled by middleware, but as a safety net
    console.warn('User not authenticated, redirecting to login');
    window.location.href =
      '/auth/login?redirectTo=' +
      encodeURIComponent(window.location.pathname + window.location.search);
  }
});
</script>
