import { ref, computed } from 'vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import type { UpdatePasswordFormData } from '../schemas/authSchemas';

export function useUpdatePasswordForm() {
  const authStore = useAuthStore();
  const error = ref<string>('');
  const success = ref<string>('');

  const isLoading = computed(() => authStore.loading);

  const submitUpdatePassword = async (data: UpdatePasswordFormData) => {
    error.value = '';
    success.value = '';

    try {
      const result = await authStore.updatePassword(data.password);
      
      if (result.success) {
        success.value = result.message || 'Password updated successfully! You can now sign in with your new password.';
        // Redirect to login after successful password update
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
      } else {
        error.value = result.error || 'Failed to update password';
      }
    } catch (err) {
      console.error('Update password error:', err);
      error.value = 'An unexpected error occurred. Please try again.';
    }
  };

  const clearMessages = () => {
    error.value = '';
    success.value = '';
  };

  return {
    submitUpdatePassword,
    isLoading,
    error,
    success,
    clearMessages,
  };
} 