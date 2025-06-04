import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../../../shared/stores/authStore'
import type { 
  ProfileFormData, 
  ProfileFormErrors, 
  ProfileFormState, 
  ProfileFormMode,
  SaveProfileResponse 
} from '../types/profile.types'
import type { UserDetailDto } from '../../../types'

/** Composable for handling profile form logic */
export const useProfileForm = () => {
  // Auth store integration
  const authStore = useAuthStore()

  // Form state
  const formData = ref<ProfileFormData>({
    artist_name: '',
    biography: '',
    instagram_url: '',
    facebook_url: '',
    music_style_ids: []
  })

  const errors = ref<ProfileFormErrors>({})
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const isNewProfile = ref(true)
  const isDirty = ref(false)

  // Form mode detection
  const formMode = computed<ProfileFormMode>(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      // Default to 'create' mode during SSR
      return isNewProfile.value ? 'create' : 'edit'
    }
    
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('mode') === 'complete') return 'complete'
    return isNewProfile.value ? 'create' : 'edit'
  })

  // Track form changes
  watch(formData, () => {
    isDirty.value = true
  }, { deep: true })

  /** Validate individual field */
  const validateField = (field: keyof ProfileFormData, value: any): string | undefined => {
    switch (field) {
      case 'artist_name':
        if (!value || value.trim().length < 2) {
          return 'Artist name must be at least 2 characters long'
        }
        if (value.length > 255) {
          return 'Artist name must be less than 255 characters'
        }
        break
      
      case 'biography':
        if (!value || value.trim().length === 0) {
          return 'Biography is required'
        }
        if (value.length > 10000) {
          return 'Biography must be less than 10,000 characters'
        }
        break
      
      case 'instagram_url':
      case 'facebook_url':
        if (value && value.trim().length > 0) {
          const urlPattern = /^https?:\/\/.+\..+/
          if (!urlPattern.test(value)) {
            return 'Please enter a valid URL'
          }
        }
        break
      
      case 'music_style_ids':
        if (!value || value.length === 0) {
          return 'Please select at least one music style'
        }
        break
    }
    return undefined
  }

  /** Validate entire form */
  const validateForm = (): boolean => {
    const newErrors: ProfileFormErrors = {}
    let isValid = true

    // Validate all fields
    Object.keys(formData.value).forEach(key => {
      const field = key as keyof ProfileFormData
      const error = validateField(field, formData.value[field])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    errors.value = newErrors
    return isValid
  }

  /** Load existing profile data */
  const loadProfile = async (userId?: string): Promise<void> => {
    // Use provided userId or get from auth store
    const targetUserId = userId || getCurrentUserId()
    
    if (!targetUserId) {
      console.warn('No user ID available for loading profile')
      return
    }

    isLoading.value = true
    try {
      const response = await fetch(`/api/users/${targetUserId}`)
      
      if (response.status === 404) {
        // Profile doesn't exist - this is a new profile
        isNewProfile.value = true
        return
      }

      if (!response.ok) {
        throw new Error('Failed to load profile')
      }

      const result = await response.json()
      const profile: UserDetailDto = result.data

      // Populate form with existing data
      formData.value = {
        artist_name: profile.artist_name,
        biography: profile.biography,
        instagram_url: profile.instagram_url || '',
        facebook_url: profile.facebook_url || '',
        music_style_ids: profile.music_styles.map(style => style.id)
      }

      isNewProfile.value = false
      isDirty.value = false
    } catch (error) {
      console.error('Error loading profile:', error)
      // Assume new profile if loading fails
      isNewProfile.value = true
    } finally {
      isLoading.value = false
    }
  }

  /** Save profile data */
  const saveProfile = async (): Promise<SaveProfileResponse> => {
    // Check authentication first
    if (!authStore.isAuthenticated) {
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
        errors: errors.value
      }
    }

    isSubmitting.value = true
    
    try {
      const endpoint = isNewProfile.value ? '/api/users' : `/api/users/${getCurrentUserId()}`
      const method = isNewProfile.value ? 'POST' : 'PUT'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData.value),
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle specific error codes
        if (response.status === 401) {
          return {
            success: false,
            errors: {
              general: 'You must be logged in to save your profile'
            }
          }
        }

        if (response.status === 403) {
          return {
            success: false,
            errors: {
              general: 'You can only edit your own profile'
            }
          }
        }

        if (response.status === 409) {
          return {
            success: false,
            errors: {
              general: 'A profile already exists for this account'
            }
          }
        }
        
        // Handle validation errors
        if (response.status === 422 && errorData.error?.details) {
          const fieldErrors: ProfileFormErrors = {}
          errorData.error.details.forEach((detail: any) => {
            fieldErrors[detail.field as keyof ProfileFormErrors] = detail.message
          })
          errors.value = fieldErrors
          return {
            success: false,
            errors: fieldErrors
          }
        }

        throw new Error(errorData.error?.message || 'Failed to save profile')
      }

      const result = await response.json()
      
      // Update state after successful save
      isNewProfile.value = false
      isDirty.value = false
      
      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      return {
        success: false,
        errors: {
          general: error instanceof Error ? error.message : 'An unexpected error occurred'
        }
      }
    } finally {
      isSubmitting.value = false
    }
  }

  /** Get current user ID from auth store */
  const getCurrentUserId = (): string => {
    return authStore.userId || ''
  }

  /** Check if user is authenticated */
  const isAuthenticated = computed(() => {
    return authStore.isAuthenticated
  })

  /** Reset form to initial state */
  const resetForm = (): void => {
    formData.value = {
      artist_name: '',
      biography: '',
      instagram_url: '',
      facebook_url: '',
      music_style_ids: []
    }
    errors.value = {}
    isDirty.value = false
  }

  /** Initialize auth store if needed */
  const initializeAuth = async (): Promise<void> => {
    if (!authStore.initialized) {
      await authStore.initializeAuth()
    }
  }

  return {
    // State
    formData,
    errors,
    isLoading,
    isSubmitting,
    isNewProfile,
    isDirty,
    formMode,
    isAuthenticated,
    
    // Methods
    validateField,
    validateForm,
    loadProfile,
    saveProfile,
    resetForm,
    getCurrentUserId,
    initializeAuth
  }
} 