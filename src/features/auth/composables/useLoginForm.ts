import { ref, computed } from 'vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import type { LoginFormData } from '../schemas/authSchemas';

export function useLoginForm() {
  const authStore = useAuthStore();
  const error = ref<string>('');
  const success = ref<string>('');

  const isLoading = computed(() => authStore.loading);

  const submitLogin = async (data: LoginFormData) => {
    error.value = '';
    success.value = '';

    try {
      const result = await authStore.login(data.email, data.password);
      
      if (result.success) {
        success.value = 'Login successful! Redirecting...';
        // Redirect will be handled by middleware after successful login
        setTimeout(() => {
          window.location.href = '/dj/dashboard';
        }, 1000);
      } else {
        error.value = result.error || 'Login failed';
      }
    } catch (err) {
      console.error('Login error:', err);
      error.value = 'An unexpected error occurred. Please try again.';
    }
  };

  const clearMessages = () => {
    error.value = '';
    success.value = '';
  };

  return {
    submitLogin,
    isLoading,
    error,
    success,
    clearMessages,
  };
} 