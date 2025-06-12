<template>
  <!-- Error display -->
  <div v-if="error" class="animate-fade-in" data-testid="auth-error-message">
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
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Success message -->
  <div
    v-if="success"
    class="animate-fade-in"
    data-testid="auth-success-message"
  >
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
          <p class="text-sm text-green-700">{{ success }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  error?: string;
  success?: string;
}

defineProps<Props>();
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
