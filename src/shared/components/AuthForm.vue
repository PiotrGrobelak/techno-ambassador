<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Email field (all modes) -->
    <BaseInput
      v-model="formData.email"
      label="Email Address"
      variant="email"
      placeholder="Enter your email"
      :error-message="errors.email"
      :disabled="isLoading"
      :clearable="true"
      required
      @blur="validateField('email')"
      class="animate-fade-in"
    />

    <!-- Password field (login, register, update-password) -->
    <BaseInput
      v-if="mode !== 'reset-password'"
      v-model="formData.password"
      label="Password"
      variant="password"
      :placeholder="
        mode === 'update-password'
          ? 'Enter new password'
          : 'Enter your password'
      "
      :error-message="errors.password"
      :disabled="isLoading"
      required
      @blur="validateField('password')"
      class="animate-fade-in"
    />

    <!-- Password confirmation (register, update-password) -->
    <BaseInput
      v-if="['register', 'update-password'].includes(mode)"
      v-model="formData.passwordConfirmation"
      label="Confirm Password"
      variant="password"
      placeholder="Confirm your password"
      :error-message="errors.passwordConfirmation"
      :disabled="isLoading"
      required
      @blur="validateField('passwordConfirmation')"
      class="animate-fade-in"
    />

    <!-- Submit button -->
    <BaseButton
      type="submit"
      :label="submitButtonText"
      variant="primary"
      size="large"
      :loading="isLoading"
      :disabled="!isFormValid || isLoading"
      :pulse="isFormValid && !isLoading"
      full-width
      class="animate-fade-in"
    />

    <!-- Error display -->
    <div v-if="generalError" class="animate-fade-in">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <svg
            class="w-5 h-5 text-red-400 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="ml-3">
            <BaseTypography variant="body-small" color="danger">
              {{ generalError }}
            </BaseTypography>
          </div>
        </div>
      </div>
    </div>

    <!-- Success message -->
    <div v-if="successMessage" class="animate-fade-in">
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex">
          <svg
            class="w-5 h-5 text-green-400 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="ml-3">
            <BaseTypography variant="body-small" color="success">
              {{ successMessage }}
            </BaseTypography>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import BaseInput from './BaseInput.vue';
import BaseButton from './BaseButton.vue';
import BaseTypography from './BaseTypography.vue';

type AuthMode = 'login' | 'register' | 'reset-password' | 'update-password';

interface FormData {
  email: string;
  password: string;
  passwordConfirmation: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  passwordConfirmation?: string;
}

interface Props {
  mode: AuthMode;
  initialData?: Partial<FormData>;
  loading?: boolean;
  generalError?: string;
  successMessage?: string;
}

interface Emits {
  (e: 'submit', data: FormData): void;
  (e: 'clear-error'): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();

// Form state
const formData = reactive<FormData>({
  email: props.initialData?.email || '',
  password: props.initialData?.password || '',
  passwordConfirmation: props.initialData?.passwordConfirmation || '',
});

const errors = reactive<FormErrors>({});
const isLoading = computed(() => props.loading);

// Validation with 300ms delay (Apple HIG: responsive feedback)
let validationTimeout: NodeJS.Timeout;

function validateField(field: keyof FormData): void {
  clearTimeout(validationTimeout);
  validationTimeout = setTimeout(() => {
    switch (field) {
      case 'email':
        validateEmail();
        break;
      case 'password':
        validatePassword();
        break;
      case 'passwordConfirmation':
        validatePasswordConfirmation();
        break;
    }
    // Clear general error when user starts typing
    if (props.generalError) {
      emit('clear-error');
    }
  }, 300);
}

function validateEmail(): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email) {
    errors.email = 'Email address is required';
  } else if (!emailRegex.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  } else {
    errors.email = undefined;
  }
}

function validatePassword(): void {
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    errors.password = 'Password must contain uppercase, lowercase, and number';
  } else {
    errors.password = undefined;
  }
}

function validatePasswordConfirmation(): void {
  if (!formData.passwordConfirmation) {
    errors.passwordConfirmation = 'Please confirm your password';
  } else if (formData.password !== formData.passwordConfirmation) {
    errors.passwordConfirmation = 'Passwords do not match';
  } else {
    errors.passwordConfirmation = undefined;
  }
}

// Form validation state
const isFormValid = computed(() => {
  const requiredFields = getRequiredFields();
  const hasAllRequiredFields = requiredFields.every((field) => formData[field]);
  const hasNoErrors = Object.values(errors).every((error) => !error);

  return hasAllRequiredFields && hasNoErrors;
});

function getRequiredFields(): (keyof FormData)[] {
  switch (props.mode) {
    case 'login':
      return ['email', 'password'];
    case 'register':
      return ['email', 'password', 'passwordConfirmation'];
    case 'reset-password':
      return ['email'];
    case 'update-password':
      return ['password', 'passwordConfirmation'];
    default:
      return [];
  }
}

// Computed properties for UI text
const submitButtonText = computed(() => {
  switch (props.mode) {
    case 'login':
      return 'Sign In';
    case 'register':
      return 'Create Account';
    case 'reset-password':
      return 'Send Reset Link';
    case 'update-password':
      return 'Update Password';
    default:
      return 'Submit';
  }
});

// Form submission
function handleSubmit(): void {
  // Validate all required fields
  const requiredFields = getRequiredFields();
  requiredFields.forEach((field) => {
    if (field === 'email') validateEmail();
    if (field === 'password') validatePassword();
    if (field === 'passwordConfirmation') validatePasswordConfirmation();
  });

  if (isFormValid.value) {
    emit('submit', { ...formData });
  }
}

// Watch for prop changes to update form
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      Object.assign(formData, newData);
    }
  },
  { deep: true }
);
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
