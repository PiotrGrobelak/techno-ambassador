import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';

interface ProfileStatus {
  isComplete: boolean;
  missingFields: string[];
  userId: string;
}

export const useProfileStore = defineStore('profile', () => {
  // State
  const profileStatus = ref<ProfileStatus | null>(null);
  const loading = ref(false);
  const error = ref<string>('');
  const initialized = ref(false);

  // Getters
  const isProfileComplete = computed(() => profileStatus.value?.isComplete ?? false);
  const missingFields = computed(() => profileStatus.value?.missingFields ?? []);
  const needsCompletion = computed(() => {
    return profileStatus.value !== null && !profileStatus.value.isComplete;
  });

  // Actions
  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading;
  };

  const setError = (errorMessage: string) => {
    error.value = errorMessage;
  };

  const clearError = () => {
    error.value = '';
  };

  const setProfileStatus = (status: ProfileStatus) => {
    profileStatus.value = status;
  };

  /**
   * Check profile completion status from API
   */
  const checkProfileStatus = async (): Promise<void> => {
    try {
      setLoading(true);
      clearError();

      const response = await fetch('/api/auth/profile-status', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProfileStatus(data.data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to check profile status');
      }
    } catch (error) {
      console.error('Profile status check failed:', error);
      setError('Network error occurred while checking profile status');
    } finally {
      setLoading(false);
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
    loading.value = false;
    error.value = '';
    initialized.value = false;
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
    loading: readonly(loading),
    error: readonly(error),
    initialized: readonly(initialized),

    // Computed getters
    isProfileComplete,
    missingFields,
    needsCompletion,
    getCompletionProgress,
    getMissingFieldLabels,

    // Actions
    setLoading,
    setError,
    clearError,
    setProfileStatus,
    checkProfileStatus,
    initializeProfile,
    resetState,
    markProfileComplete,
    shouldRedirectToCompletion,
  };
}); 