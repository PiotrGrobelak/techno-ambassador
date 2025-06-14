import { ref, computed } from 'vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import type { RegisterFormData } from '../schemas/authSchemas';

export function useRegisterForm() {
  const authStore = useAuthStore();
  const error = ref<string>('');
  const success = ref<string>('');

  const isLoading = computed(() => authStore.loading);

  const submitRegistration = async (data: RegisterFormData) => {
    error.value = '';
    success.value = '';

    try {
      const result = await authStore.register(data.email, data.password);
      
      if (result.success) {
        success.value = 'Account created successfully! Redirecting...';
        setTimeout(() => {
          window.location.href = '/dj/dashboard';
        }, 1000);
      } else {
        error.value = result.error || 'Registration failed';
      }
    } catch (err) {
      console.error('Registration error:', err);
      error.value = 'An unexpected error occurred. Please try again.';
    }
  };

  const clearMessages = () => {
    error.value = '';
    success.value = '';
  };

  return {
    submitRegistration,
    isLoading,
    error,
    success,
    clearMessages,
  };
} 