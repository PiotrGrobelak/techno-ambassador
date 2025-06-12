<template>
  <AuthFormContainer title="Reset Password">
    <form @submit="onSubmit" class="space-y-6">
      <!-- Email field -->
      <div class="animate-fade-in">
        <label
          for="reset-email"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
          <span class="text-red-500">*</span>
        </label>
        <InputText
          id="reset-email"
          v-model="email"
          placeholder="Enter your email"
          :class="{ 'p-invalid': emailError }"
          :disabled="isLoading"
          class="w-full"
          data-testid="auth-email-input"
        />
        <p v-if="emailError" class="p-error text-red-600">{{ emailError }}</p>
        <p class="block text-gray-600 mt-1">
          We'll send you a link to reset your password
        </p>
      </div>

      <!-- Submit button -->
      <Button
        type="submit"
        label="Send Reset Link"
        :loading="isLoading"
        :disabled="!meta.valid || isLoading"
        class="w-full animate-fade-in"
        data-testid="auth-submit-button"
      />

      <!-- Messages -->
      <AuthFormMessages :error="error" :success="success" />
    </form>

    <!-- Additional links -->
    <div class="mt-6 text-center space-y-2">
      <p class="text-sm text-gray-600">
        Remember your password?
        <a
          href="/auth/login"
          class="text-blue-600 hover:text-blue-500 font-medium"
        >
          Sign in
        </a>
      </p>
      <p class="text-sm text-gray-600">
        Don't have an account?
        <a
          href="/auth/register"
          class="text-blue-600 hover:text-blue-500 font-medium"
        >
          Sign up
        </a>
      </p>
    </div>
  </AuthFormContainer>
</template>

<script setup lang="ts">
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { resetPasswordSchema } from '../schemas/authSchemas';
import { useResetPasswordForm } from '../composables/useResetPasswordForm';
import AuthFormMessages from './shared/AuthFormMessages.vue';
import AuthFormContainer from './shared/AuthFormContainer.vue';

const { handleSubmit, meta } = useForm({
  validationSchema: toTypedSchema(resetPasswordSchema),
});

const { value: email, errorMessage: emailError } = useField<string>('email');

const { submitResetPassword, isLoading, error, success, clearMessages } =
  useResetPasswordForm();

const onSubmit = handleSubmit(async (values) => {
  await submitResetPassword(values);
});

// Clear messages when user starts typing
const handleInput = () => {
  if (error.value || success.value) {
    clearMessages();
  }
};

// Watch for input changes to clear messages
import { watch } from 'vue';
watch(email, handleInput);
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
