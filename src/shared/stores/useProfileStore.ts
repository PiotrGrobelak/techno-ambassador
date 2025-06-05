import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import { useStoreErrorHandling } from '@/shared/composables/useStoreErrorHandling';

interface ProfileStatus {
  isComplete: boolean;
  missingFields: string[];
  userId: string;
}

export const useProfileStore = defineStore('profile', () => {
  const errorHandling = useStoreErrorHandling('Profile Status')

  // State
  const profileStatus = ref<ProfileStatus | null>(null);
  const initialized = ref(false);

  // Getters
  const isProfileComplete = computed(() => profileStatus.value?.isComplete ?? false);
  const missingFields = computed(() => profileStatus.value?.missingFields ?? []);
  const needsCompletion = computed(() => {
    return profileStatus.value !== null && !profileStatus.value.isComplete;
  });

  // Re-export error handling state
  const loading = errorHandling.isLoading
  const error = errorHandling.error
  const hasError = errorHandling.hasError
  const isNetworkError = errorHandling.isNetworkError

  // Actions
  const setProfileStatus = (status: ProfileStatus) => {
    profileStatus.value = status;
  };

  /**
   * Check profile completion status from API
   */
  const checkProfileStatus = async (): Promise<void> => {
    const result = await errorHandling.executeWithErrorHandling(
      async () => {
        const response = await fetch('/api/auth/profile-status', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to check profile status');
        }

        const data = await response.json();
        setProfileStatus(data.data);
        return data;
      },
      'Check profile status'
    );

    if (result) {
      initialized.value = true;
    }
  };

  /**
   * Initialize profile store - should be called when user is authenticated
   */
  const initializeProfile = async (): Promise<void> => {
    if (initialized.value) return;
    await checkProfileStatus();
  };

  /**
   * Reset store state (useful for logout)
   */
  const resetState = () => {
    profileStatus.value = null;
    initialized.value = false;
    errorHandling.resetErrorState();
  };

  /**
   * Mark profile as complete (after successful profile creation/update)
   */
  const markProfileComplete = (userId: string) => {
    profileStatus.value = {
      isComplete: true,
      missingFields: [],
      userId,
    };
  };

  /**
   * Check if user should be redirected to profile completion
   */
  const shouldRedirectToCompletion = (): boolean => {
    return initialized.value && needsCompletion.value;
  };

  /**
   * Get profile completion progress percentage
   */
  const getCompletionProgress = computed(() => {
    if (!profileStatus.value) return 0;
    
    const totalRequiredFields = 3; // artist_name, biography, music_styles
    const missingCount = profileStatus.value.missingFields.length;
    const completedCount = totalRequiredFields - missingCount;
    
    return Math.round((completedCount / totalRequiredFields) * 100);
  });

  /**
   * Get user-friendly field names for missing fields
   */
  const getMissingFieldLabels = computed(() => {
    const fieldLabels: Record<string, string> = {
      artist_name: 'Artist Name',
      biography: 'Biography',
      music_styles: 'Music Styles',
    };

    return missingFields.value.map(field => fieldLabels[field] || field);
  });


  return {
    // Readonly state
    profileStatus: readonly(profileStatus),
    initialized: readonly(initialized),

    // Error handling state (re-exported)
    loading,
    error,
    hasError,
    isNetworkError,

    // Computed getters
    isProfileComplete,
    missingFields,
    needsCompletion,
    getCompletionProgress,
    getMissingFieldLabels,

    // Actions
    setProfileStatus,
    checkProfileStatus,
    initializeProfile,
    resetState,
    markProfileComplete,
    shouldRedirectToCompletion,

    // Error handling actions
    clearError: errorHandling.clearError,
    isRecoverableError: errorHandling.isRecoverableError,
    getDisplayError: errorHandling.getDisplayError
  };
}); 