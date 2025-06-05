import { UserService } from '../../services/user.service'
import { supabaseClient } from '../../db/supabase.client'

/**
 * User service composable for client-side operations
 * Provides access to UserService with Supabase client integration
 */
export function useUserService() {
  const userService = new UserService(supabaseClient)
  
  return {
    userService
  }
} 