import { ref, computed } from 'vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import type { ResetPasswordFormData } from '../schemas/authSchemas';

export function useResetPasswordForm() {
  const authStore = useAuthStore();
  const error = ref<string>('');
  const success = ref<string>('');

  const isLoading = computed(() => authStore.loading);

  const submitResetPassword = async (data: ResetPasswordFormData) => {
    error.value = '';
    success.value = '';

    try {
      const result = await authStore.resetPassword(data.email);

      if (result.success) {
        success.value =
          result.message || 'Password reset link sent to your email.';
      } else {
        error.value = result.error || 'Failed to send reset link';
      }
    } catch (err) {
      console.error('Reset password error:', err);
      error.value = 'An unexpected error occurred. Please try again.';
    }
  };

  const clearMessages = () => {
    error.value = '';
    success.value = '';
  };

  return {
    submitResetPassword,
    isLoading,
    error,
    success,
    clearMessages,
  };
}
