import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import { useStoreErrorHandling } from '../composables/useStoreErrorHandling';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

export const useAuthStore = defineStore('auth', () => {
  const errorHandling = useStoreErrorHandling('Authentication')

  // State - reactive references
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const initialized = ref(false);

  // Getters - computed properties
  const isAuthenticated = computed(() => !!user.value);
  const userEmail = computed(() => user.value?.email);
  const userId = computed(() => user.value?.id);

  // Re-export error handling state but keep original loading for compatibility
  const loading = errorHandling.isLoading
  const error = errorHandling.error
  const hasError = errorHandling.hasError
  const isNetworkError = errorHandling.isNetworkError

  // Actions - functions for state management
  const setUser = (newUser: User | null) => {
    user.value = newUser;
  };

  const setSession = (newSession: Session | null) => {
    session.value = newSession;
    user.value = newSession?.user || null;
  };

  const setLoading = (isLoading: boolean) => {
    errorHandling.setLoading(isLoading);
  };

  // Initialize store with server-side auth data
  const initializeAuth = async () => {
    if (initialized.value) return;
    
    const result = await errorHandling.executeWithErrorHandling(
      async () => {
        // Check if we have auth data from server-side middleware
        // This will be available if user is logged in
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            // Create a user object that matches Supabase User type
            const authUser = {
              id: data.user.id,
              email: data.user.email,
              aud: 'authenticated',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              app_metadata: {},
              user_metadata: {},
              role: 'authenticated',
            };
            setUser(authUser as User);
          }
        }
        
        return { success: true };
      },
      'Initialize authentication',
      { showToast: false } // Don't show toast for initialization
    );

    initialized.value = true;
  };

  const logout = async (): Promise<void> => {
    const result = await errorHandling.executeWithErrorHandling(
      async () => {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Logout failed: ${errorText}`);
        }

        // Clear auth state after successful logout
        user.value = null;
        session.value = null;
        
        // Reset profile store state if it exists
        try {
          const { useProfileStore } = await import('./useProfileStore');
          const profileStore = useProfileStore();
          profileStore.resetState();
        } catch (error) {
          // Profile store might not be initialized, which is fine
          console.debug('Profile store not initialized during logout');
        }
        
        // Redirect to home page
        window.location.href = '/';
        
        return { success: true };
      },
      'Logout',
      { showToast: false } // Don't show toast as we're redirecting
    );

    if (!result) {
      throw new Error('Logout failed');
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await errorHandling.executeWithErrorHandling(
        async () => {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const responseData = await response.json();

          if (!response.ok) {
            throw new Error(responseData.error || 'Login failed');
          }

          // Session will be set by middleware on next page load
          return responseData;
        },
        'Login',
        { showToast: false } // Handle success/error messages manually
      );

      if (result) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: errorHandling.getDisplayError() || 'Login failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error occurred' 
      };
    }
  };

  const register = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await errorHandling.executeWithErrorHandling(
        async () => {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const responseData = await response.json();

          if (!response.ok) {
            throw new Error(responseData.error || 'Registration failed');
          }

          return responseData;
        },
        'Registration',
        { showToast: false } // Handle success/error messages manually
      );

      if (result) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: errorHandling.getDisplayError() || 'Registration failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error occurred' 
      };
    }
  };

  // Return reactive state and actions
  return {
    // Readonly state to prevent direct mutation outside store
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    initialized: readonly(initialized),
    
    // Error handling state (re-exported)
    error,
    hasError,
    isNetworkError,
    
    // Computed getters
    isAuthenticated,
    userEmail,
    userId,
    
    // Actions
    setUser,
    setSession,
    setLoading,
    initializeAuth,
    logout,
    login,
    register,

    // Error handling actions
    clearError: errorHandling.clearError,
    isRecoverableError: errorHandling.isRecoverableError,
    getDisplayError: errorHandling.getDisplayError
  };
}); 