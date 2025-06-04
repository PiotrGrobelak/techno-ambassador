import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

export const useAuthStore = defineStore('auth', () => {
  // State - reactive references
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const loading = ref(false);
  const initialized = ref(false);

  // Getters - computed properties
  const isAuthenticated = computed(() => !!user.value);
  const userEmail = computed(() => user.value?.email);
  const userId = computed(() => user.value?.id);

  // Actions - functions for state management
  const setUser = (newUser: User | null) => {
    user.value = newUser;
  };

  const setSession = (newSession: Session | null) => {
    session.value = newSession;
    user.value = newSession?.user || null;
  };

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading;
  };

  // Initialize store with server-side auth data
  const initializeAuth = async () => {
    if (initialized.value) return;
    
    try {
      setLoading(true);
      
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
    } catch (error) {
      console.error('Failed to initialize auth state:', error);
      // Continue without auth
    } finally {
      setLoading(false);
      initialized.value = true;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Clear auth state after successful logout
        user.value = null;
        session.value = null;
        
        // Reset profile store state if it exists
        try {
          const { useProfileStore } = await import('./profileStore');
          const profileStore = useProfileStore();
          profileStore.resetState();
        } catch (error) {
          // Profile store might not be initialized, which is fine
          console.debug('Profile store not initialized during logout');
        }
        
        // Redirect to home page
        window.location.href = '/';
      } else {
        console.error('Logout failed:', await response.text());
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        // Session will be set by middleware on next page load
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Return reactive state and actions
  return {
    // Readonly state to prevent direct mutation outside store
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    initialized: readonly(initialized),
    
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
  };
}); 