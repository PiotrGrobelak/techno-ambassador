<template>
  <div class="max-w-md mx-auto">
    <div class="bg-white shadow-lg rounded-lg p-8">
      <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">
        {{ title }}
      </h2>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
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
