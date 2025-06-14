<template>
  <!-- Error display -->
  <div v-if="error" class="animate-fade-in" data-testid="auth-error-message">
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <i class="pi pi-times-circle w-5 h-5 text-red-400 mt-0.5"></i>
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
        <i class="pi pi-check-circle w-5 h-5 text-green-400 mt-0.5"></i>
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
