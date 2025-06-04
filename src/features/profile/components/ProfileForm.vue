<template>
  <div class="profile-form">
    <!-- Completion Banner -->
    <ProfileCompletionBanner
      :mode="formMode"
      :is-complete="isProfileComplete"
      :completion-percentage="completionPercentage"
      :missing-fields="missingFields"
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
                  v-model="formData.artist_name"
                  placeholder="Enter your artist/DJ name"
                  :class="inputClasses('artist_name')"
                  :invalid="Boolean(errors.artist_name)"
                  @blur="
                    () => validateField('artist_name', formData.artist_name)
                  "
                  @input="clearFieldError('artist_name')"
                />
                <small v-if="errors.artist_name" class="p-error block mt-1">
                  {{ errors.artist_name }}
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
                  v-model="formData.biography"
                  placeholder="Tell us about your music journey, style, and what makes you unique..."
                  :rows="6"
                  :class="inputClasses('biography')"
                  :invalid="Boolean(errors.biography)"
                  @blur="() => validateField('biography', formData.biography)"
                  @input="clearFieldError('biography')"
                />
                <div class="flex justify-between items-center mt-1">
                  <small v-if="errors.biography" class="p-error">
                    {{ errors.biography }}
                  </small>
                  <small v-else class="text-gray-600">
                    Share your musical background and style
                  </small>
                  <small class="text-gray-500">
                    {{ formData.biography.length }} / 10,000
                  </small>
                </div>
              </div>

              <!-- Music Styles -->
              <MusicStyleSelector
                v-model="formData.music_style_ids"
                :error-message="errors.music_style_ids"
                helper-text="Select the music styles you play or are passionate about"
                @change="clearFieldError('music_style_ids')"
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
                      Instagram URL
                    </label>
                    <InputText
                      id="instagram-url"
                      v-model="formData.instagram_url"
                      placeholder="https://instagram.com/yourusername"
                      :class="inputClasses('instagram_url')"
                      :invalid="Boolean(errors.instagram_url)"
                      @blur="
                        () =>
                          validateField('instagram_url', formData.instagram_url)
                      "
                      @input="clearFieldError('instagram_url')"
                    />
                    <small
                      v-if="errors.instagram_url"
                      class="p-error block mt-1"
                    >
                      {{ errors.instagram_url }}
                    </small>
                    <small v-else class="text-gray-600 block mt-1">
                      Optional - your Instagram profile
                    </small>
                  </div>

                  <!-- Facebook URL -->
                  <div>
                    <label
                      for="facebook-url"
                      class="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Facebook URL
                    </label>
                    <InputText
                      id="facebook-url"
                      v-model="formData.facebook_url"
                      placeholder="https://facebook.com/yourusername"
                      :class="inputClasses('facebook_url')"
                      :invalid="Boolean(errors.facebook_url)"
                      @blur="
                        () =>
                          validateField('facebook_url', formData.facebook_url)
                      "
                      @input="clearFieldError('facebook_url')"
                    />
                    <small
                      v-if="errors.facebook_url"
                      class="p-error block mt-1"
                    >
                      {{ errors.facebook_url }}
                    </small>
                    <small v-else class="text-gray-600 block mt-1">
                      Optional - your Facebook profile
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- General Error Message -->
          <div
            v-if="errors.general"
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
                  {{ errors.general }}
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
              <span v-if="isDirty && !isSubmitting">
                You have unsaved changes
              </span>
              <span v-else-if="!isDirty && !isNewProfile">
                All changes saved
              </span>
            </div>

            <!-- Right side - Actions -->
            <div class="flex gap-3">
              <Button
                v-if="isDirty"
                label="Reset"
                severity="secondary"
                outlined
                :disabled="isSubmitting"
                @click="handleReset"
              />

              <Button
                type="submit"
                :label="submitButtonLabel"
                :loading="isSubmitting"
                :disabled="!isFormValid || isSubmitting"
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
            :profile-data="formData"
            :completion-percentage="completionPercentage"
            :show-public-profile-button="!isNewProfile"
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
import { ref, computed, onMounted, nextTick } from 'vue';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';

import ProfileCompletionBanner from './ProfileCompletionBanner.vue';
import ProfilePreview from './ProfilePreview.vue';
import MusicStyleSelector from './MusicStyleSelector.vue';
import { useProfileForm } from '../composables/useProfileForm';
import type { ProfileFormData } from '../types/profile.types';

// Use the profile form composable
const {
  formData,
  errors,
  isLoading,
  isSubmitting,
  isNewProfile,
  isDirty,
  formMode,
  isAuthenticated,
  validateField,
  validateForm,
  loadProfile,
  saveProfile,
  resetForm,
  getCurrentUserId,
  initializeAuth,
} = useProfileForm();

// Component state
const showSuccessMessage = ref(false);
const bannerDismissed = ref(false);

// Computed properties
const isFormValid = computed(() => {
  return (
    formData.value.artist_name.length >= 2 &&
    formData.value.biography.length > 0 &&
    formData.value.music_style_ids.length > 0
  );
});

const submitButtonLabel = computed(() => {
  if (isSubmitting.value) {
    return isNewProfile.value ? 'Creating Profile...' : 'Saving Changes...';
  }
  return isNewProfile.value ? 'Create Profile' : 'Save Changes';
});

const successMessage = computed(() => {
  return isNewProfile.value
    ? 'Profile created successfully!'
    : 'Profile updated successfully!';
});

const isProfileComplete = computed(() => {
  return (
    isFormValid.value &&
    formData.value.instagram_url.length > 0 &&
    formData.value.facebook_url.length > 0
  );
});

const completionPercentage = computed(() => {
  let completed = 0;
  const totalFields = 5;

  if (formData.value.artist_name.length >= 2) completed++;
  if (formData.value.biography.length > 0) completed++;
  if (formData.value.music_style_ids.length > 0) completed++;
  if (formData.value.instagram_url.length > 0) completed++;
  if (formData.value.facebook_url.length > 0) completed++;

  return Math.round((completed / totalFields) * 100);
});

const missingFields = computed(() => {
  const missing: string[] = [];

  if (formData.value.artist_name.length < 2) missing.push('artist_name');
  if (formData.value.biography.length === 0) missing.push('biography');
  if (formData.value.music_style_ids.length === 0)
    missing.push('music_style_ids');

  return missing;
});

// Methods
const inputClasses = (fieldName: keyof ProfileFormData) => {
  const baseClasses = 'w-full';
  const hasError = Boolean(errors.value[fieldName]);

  return hasError ? `${baseClasses} p-invalid` : baseClasses;
};

const clearFieldError = (fieldName: keyof ProfileFormData) => {
  if (errors.value[fieldName]) {
    errors.value[fieldName] = undefined;
  }
};

const handleSubmit = async () => {
  // Check authentication before submitting
  if (!isAuthenticated.value) {
    errors.value.general = 'You must be logged in to save your profile';
    return;
  }

  const result = await saveProfile();

  if (result.success) {
    showSuccessMessage.value = true;

    // Auto-hide success message
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 3000);

    // Redirect to dashboard if this was profile completion
    if (formMode.value === 'complete') {
      setTimeout(() => {
        window.location.href = '/dj/dashboard';
      }, 1500);
    }
  }
};

const handleReset = () => {
  resetForm();
  bannerDismissed.value = false;
};

const dismissBanner = () => {
  bannerDismissed.value = true;
};

// Lifecycle
onMounted(async () => {
  // Initialize authentication first
  await initializeAuth();

  // Only proceed if authenticated
  if (isAuthenticated.value) {
    const userId = getCurrentUserId();
    if (userId) {
      await loadProfile(userId);
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
