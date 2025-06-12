<template>
  <AuthFormContainer title="Sign In">
    <form @submit="onSubmit" class="space-y-6">
      <!-- Email field -->
      <div class="animate-fade-in">
        <label
          for="login-email"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
          <span class="text-red-500">*</span>
        </label>
        <InputText
          id="login-email"
          v-model="email"
          placeholder="Enter your email"
          :class="{ 'p-invalid': emailError }"
          :disabled="isLoading"
          class="w-full"
          data-testid="auth-email-input"
        />
        <p v-if="emailError" class="p-error text-red-500">{{ emailError }}</p>
      </div>

      <!-- Password field -->
      <div class="animate-fade-in">
        <label
          for="login-password"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
          <span class="text-red-500">*</span>
        </label>
        <Password
          id="login-password"
          v-model="password"
          placeholder="Enter your password"
          :class="{ 'p-invalid': passwordError }"
          :disabled="isLoading"
          toggle-mask
          :feedback="false"
          class="w-full"
          data-testid="auth-password-input"
        />
        <p v-if="passwordError" class="p-error text-red-600">
          {{ passwordError }}
        </p>
      </div>

      <!-- Submit button -->
      <Button
        type="submit"
        label="Sign In"
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
        Don't have an account?
        <a
          href="/auth/register"
          class="text-blue-600 hover:text-blue-500 font-medium"
        >
          Sign up
        </a>
      </p>
      <p class="text-sm">
        <a
          href="/auth/reset-password"
          class="text-gray-500 hover:text-gray-400"
        >
          Forgot your password?
        </a>
      </p>
    </div>
  </AuthFormContainer>
</template>

<script setup lang="ts">
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { loginSchema } from '../schemas/authSchemas';
import { useLoginForm } from '../composables/useLoginForm';
import AuthFormMessages from './shared/AuthFormMessages.vue';
import AuthFormContainer from './shared/AuthFormContainer.vue';

const { handleSubmit, meta } = useForm({
  validationSchema: toTypedSchema(loginSchema),
});

const { value: email, errorMessage: emailError } = useField<string>('email');
const { value: password, errorMessage: passwordError } =
  useField<string>('password');

const { submitLogin, isLoading, error, success, clearMessages } =
  useLoginForm();

const onSubmit = handleSubmit(async (values) => {
  await submitLogin(values);
});

// Clear messages when user starts typing
const handleInput = () => {
  if (error.value || success.value) {
    clearMessages();
  }
};

// Watch for input changes to clear messages
import { watch } from 'vue';
watch([email, password], handleInput);
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
