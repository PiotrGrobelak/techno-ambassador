import { defineStore } from 'pinia'
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { z } from 'zod'
import { useAuthStore } from '@/shared/stores/useAuthStore'
import { useApiClient } from '@/shared/composables/useApiClient'
import { useStoreErrorHandling } from '@/shared/composables/useStoreErrorHandling'
import type { UserDetailResponseDto } from '@/types'

// Zod validation schemas
const profileFormSchema = z.object({
  artist_name: z
    .string()
    .min(2, 'Artist name must be at least 2 characters long')
    .max(255, 'Artist name must be less than 255 characters')
    .trim(),
  
  biography: z
    .string()
    .min(1, 'Biography is required')
    .max(10000, 'Biography must be less than 10,000 characters')
    .trim(),
  
  instagram_url: z
    .string()
    .max(500, 'URL must be less than 500 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  
  facebook_url: z
    .string()
    .max(500, 'URL must be less than 500 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  
  music_style_ids: z
    .array(z.string().uuid('Invalid music style ID format'))
    .min(1, 'Please select at least one music style')
    .max(50, 'Maximum 50 music styles allowed'),
})

// Types
export interface ProfileFormData {
  artist_name: string
  biography: string
  instagram_url: string
  facebook_url: string
  music_style_ids: string[]
}

export interface ProfileFormErrors {
  artist_name?: string
  biography?: string
  instagram_url?: string
  facebook_url?: string
  music_style_ids?: string
  general?: string
}

export type ProfileFormMode =  'edit' | 'complete'

export interface SaveProfileResponse {
  success: boolean
  errors?: ProfileFormErrors
  data?: any
}

/**
 * Profile form management store with validation and state management
 * Manages form data, validation, submission, and API interactions
 */
export const useProfileFormStore = defineStore('profileForm', () => {
  // Get auth store, API client, and error handling
  const authStore = useAuthStore()
  const apiClient = useApiClient()
  const errorHandling = useStoreErrorHandling('Profile Form')

  // State
  const formData: Ref<ProfileFormData> = ref({
    artist_name: '',
    biography: '',
    instagram_url: '',
    facebook_url: '',
    music_style_ids: []
  })

  const formErrors: Ref<ProfileFormErrors> = ref({})
  const isSubmitting: Ref<boolean> = ref(false)
  const isNewProfile: Ref<boolean> = ref(true)
  const isDirty: Ref<boolean> = ref(false)

  // Re-export error handling state
  const isLoading = errorHandling.isLoading
  const error = errorHandling.error
  const hasError = errorHandling.hasError
  const isNetworkError = errorHandling.isNetworkError

  // Getters
  const isAuthenticated: ComputedRef<boolean> = computed(() => {
    return authStore.isAuthenticated
  })

  const formMode: ComputedRef<ProfileFormMode> = computed(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return 'edit'
    }
    
    return isNewProfile.value ? 'edit' : 'complete'
  })

  const isFormValid: ComputedRef<boolean> = computed(() => {
    return (
      formData.value.artist_name.length >= 2 &&
      formData.value.biography.length > 0 &&
      formData.value.music_style_ids.length > 0
    )
  })

  const completionPercentage: ComputedRef<number> = computed(() => {
    let completed = 0
    const totalFields = 5

    if (formData.value.artist_name.length >= 2) completed++
    if (formData.value.biography.length > 0) completed++
    if (formData.value.music_style_ids.length > 0) completed++
    if (formData.value.instagram_url.length > 0) completed++
    if (formData.value.facebook_url.length > 0) completed++

    return Math.round((completed / totalFields) * 100)
  })

  const missingFields: ComputedRef<string[]> = computed(() => {
    const missing: string[] = []

    if (formData.value.artist_name.length < 2) missing.push('artist_name')
    if (formData.value.biography.length === 0) missing.push('biography')
    if (formData.value.music_style_ids.length === 0) missing.push('music_style_ids')

    return missing
  })

  // Actions
  function setFormData(data: Partial<ProfileFormData>): void {
    formData.value = { ...formData.value, ...data }
    markAsDirty()
  }

  function updateField<K extends keyof ProfileFormData>(
    field: K, 
    value: ProfileFormData[K]
  ): void {
    formData.value[field] = value
    markAsDirty()
    
    // Clear field error when user starts typing
    if (formErrors.value[field]) {
      clearFieldError(field)
    }
  }

  function markAsDirty(): void {
    isDirty.value = true
  }

  function clearFieldError(field: keyof ProfileFormErrors): void {
    if (formErrors.value[field]) {
      formErrors.value[field] = undefined
    }
  }

  function clearAllErrors(): void {
    formErrors.value = {}
    errorHandling.clearError()
  }

  function setErrors(newErrors: ProfileFormErrors): void {
    formErrors.value = newErrors
  }

  function setSubmitting(submitting: boolean): void {
    isSubmitting.value = submitting
  }

  function setNewProfile(isNew: boolean): void {
    isNewProfile.value = isNew
  }

  /**
   * Validate individual field using Zod schema
   */
  function validateField(field: keyof ProfileFormData, value: any): string | undefined {
    try {
      // Create a partial schema for the specific field
      const fieldSchema = profileFormSchema.shape[field]
      if (!fieldSchema) return undefined

      fieldSchema.parse(value)
      return undefined
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message
      }
      return 'Validation error'
    }
  }

  /**
   * Validate entire form using Zod schema
   */
  function validateForm(): boolean {
    try {
      profileFormSchema.parse(formData.value)
      clearAllErrors()
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ProfileFormErrors = {}
        error.errors.forEach(err => {
          const field = err.path[0] as keyof ProfileFormErrors
          if (field) {
            newErrors[field] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  /**
   * Get current user ID from auth store
   */
  function getCurrentUserId(): string {
    return authStore.userId || ''
  }

  /**
   * Initialize auth store if needed
   */
  async function initializeAuth(): Promise<void> {
    if (!authStore.initialized) {
      await authStore.initializeAuth()
    }
  }

  /**
   * Load profile data from API
   */
  async function loadProfile(userId?: string): Promise<void> {
    const targetUserId = userId || getCurrentUserId()
    
    if (!targetUserId) {
      console.warn('No user ID available for loading profile')
      return
    }

    const result = await errorHandling.executeWithErrorHandling(
      async () => {
        // The get method returns the parsed data directly or throws an error
        const response = await apiClient.get<UserDetailResponseDto>(`/users/${targetUserId}`)
        const profile = response.data
        
        
        // Validate that we have the expected profile structure
        if (!profile) {
          throw new Error('No profile data received from API')
        }
        
        // Populate form with existing data
        setFormData({
          artist_name: profile.artist_name || '',
          biography: profile.biography || '',
          instagram_url: profile.instagram_url || '',
          facebook_url: profile.facebook_url || '',
          music_style_ids: profile.music_styles?.map(style => style.id) || []
        })

        setNewProfile(false)
        isDirty.value = false
        console.log('Profile loaded successfully')
        
        return profile
      },
      'Load profile',
      { showToast: false } // Don't show toast for loading
    )

    // Handle 404 specifically for profile loading
    if (!result && errorHandling.error.value?.includes('404')) {
      console.log('No existing profile found, assuming new user')
      setNewProfile(true)
      errorHandling.clearError()
    }
  }

  /**
   * Save profile data to API
   */
  async function saveProfile(): Promise<SaveProfileResponse> {
    // Check authentication first
    if (!isAuthenticated.value) {
      return {
        success: false,
        errors: {
          general: 'You must be logged in to save your profile'
        }
      }
    }

    if (!validateForm()) {
      return {
        success: false,
        errors: formErrors.value
      }
    }

    setSubmitting(true)
    
    try {
      const result = await errorHandling.executeWithErrorHandling(
        async () => {
          let response: any

          if (isNewProfile.value) {
            // Create new profile using POST
            response = await apiClient.post('/users', formData.value)
          } else {
            // Update existing profile using PUT
            response = await apiClient.put(`/users/${getCurrentUserId()}`, formData.value)
          }
          
          return response
        },
        'Save profile',
        { 
          showToast: false, // Handle success message manually
          setLoadingState: false // Use isSubmitting instead
        }
      )

      if (result) {
        // Update state after successful save
        setNewProfile(false)
        isDirty.value = false
        clearAllErrors()
        
        return {
          success: true,
          data: result
        }
      } else {
        // Handle specific error cases from the universal error handler
        const errorMessage = errorHandling.getDisplayError()
        
        // Check for specific error types and provide appropriate responses
        if (errorHandling.isAuthError.value) {
          return {
            success: false,
            errors: {
              general: 'You must be logged in to save your profile'
            }
          }
        }

        if (errorMessage.includes('conflict') || errorMessage.includes('already exists')) {
          // Try to reload the existing profile
          console.log('Profile already exists, attempting to reload...')
          await loadProfile()
          return {
            success: false,
            errors: {
              general: 'A profile already exists for your account. Please refresh the page to edit it.'
            }
          }
        }

        return {
          success: false,
          errors: {
            general: errorMessage || 'An unexpected error occurred'
          }
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * Reset form to initial state
   */
  function resetForm(): void {
    formData.value = {
      artist_name: '',
      biography: '',
      instagram_url: '',
      facebook_url: '',
      music_style_ids: []
    }
    clearAllErrors()
    isDirty.value = false
  }

  /**
   * Reset store to initial state
   */
  function $reset(): void {
    resetForm()
    isSubmitting.value = false
    isNewProfile.value = true
    errorHandling.resetErrorState()
  }

  /**
   * Retry save operation (useful for network errors)
   */
  async function retrySaveProfile(): Promise<SaveProfileResponse> {
    return await saveProfile()
  }

  /**
   * Retry load operation (useful for network errors)
   */
  async function retryLoadProfile(userId?: string): Promise<void> {
    return await loadProfile(userId)
  }

  return {
    // State
    formData,
    formErrors,
    isSubmitting,
    isNewProfile,
    isDirty,
    
    // Error handling state (re-exported)
    isLoading,
    error,
    hasError,
    isNetworkError,
    
    // Getters
    isAuthenticated,
    formMode,
    isFormValid,
    completionPercentage,
    missingFields,
    
    // Actions
    setFormData,
    updateField,
    markAsDirty,
    clearFieldError,
    clearAllErrors,
    setErrors,
    setSubmitting,
    setNewProfile,
    validateField,
    validateForm,
    getCurrentUserId,
    initializeAuth,
    loadProfile,
    saveProfile,
    resetForm,
    retrySaveProfile,
    retryLoadProfile,
    $reset,

    // Error handling actions
    clearError: errorHandling.clearError,
    isRecoverableError: errorHandling.isRecoverableError,
    getDisplayError: errorHandling.getDisplayError
  }
}) 