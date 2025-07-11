<template>
  <AuthFormContainer title="Set New Password">
    <form class="space-y-6" @submit="onSubmit">
      <!-- Password field -->
      <div class="animate-fade-in">
        <label
          for="update-password"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          New Password
          <span class="text-red-500">*</span>
        </label>
        <Password
          id="update-password"
          v-model="password"
          placeholder="Enter your new password"
          :class="{ 'p-invalid': passwordError }"
          :disabled="isLoading"
          toggle-mask
          class="w-full"
          data-testid="auth-password-input"
        />
        <p v-if="passwordError" class="p-error text-red-600">
          {{ passwordError }}
        </p>
        <p class="block text-gray-600 mt-1">
          Password must contain at least 8 characters with uppercase, lowercase,
          and number
        </p>
      </div>

      <!-- Password confirmation -->
      <div class="animate-fade-in">
        <label
          for="update-password-confirmation"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Confirm New Password
          <span class="text-red-500">*</span>
        </label>
        <Password
          id="update-password-confirmation"
          v-model="passwordConfirmation"
          placeholder="Confirm your new password"
          :class="{ 'p-invalid': passwordConfirmationError }"
          :disabled="isLoading"
          toggle-mask
          :feedback="false"
          class="w-full"
          data-testid="auth-password-confirmation-input"
        />
        <p v-if="passwordConfirmationError" class="p-error text-red-600">
          {{ passwordConfirmationError }}
        </p>
      </div>

      <!-- Submit button -->
      <Button
        type="submit"
        label="Update Password"
        :loading="isLoading"
        :disabled="!meta.valid || isLoading"
        class="w-full animate-fade-in"
        data-testid="auth-submit-button"
      />

      <!-- Messages -->
      <AuthFormMessages :error="error" :success="success" />
    </form>

    <!-- Additional links -->
    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600">
        Remember your password?
        <a
          href="/auth/login"
          class="text-blue-600 hover:text-blue-500 font-medium"
        >
          Sign in instead
        </a>
      </p>
    </div>
  </AuthFormContainer>
</template>

<script setup lang="ts">
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { updatePasswordSchema } from '../schemas/authSchemas';
import { useUpdatePasswordForm } from '../composables/useUpdatePasswordForm';
import AuthFormMessages from './shared/AuthFormMessages.vue';
import AuthFormContainer from './shared/AuthFormContainer.vue';

const { handleSubmit, meta } = useForm({
  validationSchema: toTypedSchema(updatePasswordSchema),
});

const { value: password, errorMessage: passwordError } =
  useField<string>('password');
const { value: passwordConfirmation, errorMessage: passwordConfirmationError } =
  useField<string>('passwordConfirmation');

const { submitUpdatePassword, isLoading, error, success, clearMessages } =
  useUpdatePasswordForm();

const onSubmit = handleSubmit(async (values) => {
  await submitUpdatePassword(values);
});

// Clear messages when user starts typing
const handleInput = () => {
  if (error.value || success.value) {
    clearMessages();
  }
};

// Watch for input changes to clear messages
import { watch } from 'vue';
watch([password, passwordConfirmation], handleInput);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
