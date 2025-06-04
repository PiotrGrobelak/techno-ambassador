import type { CreateUserCommand, UpdateUserCommand, UserDetailDto } from '../../../types'

/** Profile form data structure */
export interface ProfileFormData {
  artist_name: string
  biography: string
  instagram_url: string
  facebook_url: string
  music_style_ids: string[]
}

/** Profile form validation errors */
export interface ProfileFormErrors {
  artist_name?: string
  biography?: string
  instagram_url?: string
  facebook_url?: string
  music_style_ids?: string
  general?: string
}

/** Profile form state for the composable */
export interface ProfileFormState {
  formData: ProfileFormData
  errors: ProfileFormErrors
  isLoading: boolean
  isSubmitting: boolean
  isNewProfile: boolean
  isDirty: boolean
}

/** Profile completion status */
export interface ProfileCompletionStatus {
  isComplete: boolean
  missingFields: string[]
  completionPercentage: number
}

/** Profile form mode */
export type ProfileFormMode = 'create' | 'edit' | 'complete'

/** Save profile response */
export interface SaveProfileResponse {
  success: boolean
  data?: UserDetailDto
  errors?: ProfileFormErrors
} 