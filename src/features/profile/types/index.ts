import type { CreateUserCommand, UpdateUserCommand, UserDetailDto } from '@/types'

// Re-export types from the store for backward compatibility
export type {
  ProfileFormData,
  ProfileFormErrors,
  ProfileFormMode,
  SaveProfileResponse
} from '@/features/profile/stores/useProfileFormStore'

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