import type { CreateUserCommand, UpdateUserCommand, UserDetailDto } from '../../../types'

// Re-export types from the store for backward compatibility
export type {
  ProfileFormData,
  ProfileFormErrors,
  ProfileFormMode,
  SaveProfileResponse
} from '../stores/useProfileFormStore'

// Import types for use in this file
import type { ProfileFormData, ProfileFormErrors } from '../stores/useProfileFormStore'

/** Profile form state for the composable */
export interface ProfileFormState {
  formData: ProfileFormData
  errors: ProfileFormErrors
  isLoading: boolean
  isSubmitting: boolean
  isNewProfile: boolean
  isDirty: boolean
  formMode: 'create' | 'edit' | 'complete'
  isAuthenticated: boolean
  completionPercentage: number
}

/** Profile completion calculation */
export interface ProfileCompletion {
  percentage: number
  missingFields: string[]
  isComplete: boolean
}

/** Profile completion status */
export interface ProfileCompletionStatus {
  isComplete: boolean
  missingFields: string[]
  completionPercentage: number
} 