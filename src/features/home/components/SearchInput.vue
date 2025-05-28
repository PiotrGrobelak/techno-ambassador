<template>
  <div class="relative">
    <InputText
      :model-value="modelValue"
      @update:model-value="handleInput"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      :class="{ 'border-red-500': hasError }"
    />

    <!-- Search icon -->
    <div
      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
    >
      <svg
        class="h-5 w-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>

    <!-- Clear button -->
    <button
      v-if="modelValue && !disabled"
      @click="clearInput"
      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
      type="button"
    >
      <svg
        class="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <!-- Error message -->
    <div v-if="hasError" class="mt-1 text-sm text-red-600">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import InputText from 'primevue/inputtext';

interface Props {
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search DJs by artist name...',
  disabled: false,
});

const emit = defineEmits<Emits>();

// Validation
const hasError = computed(() => {
  const trimmed = props.modelValue.trim();
  return trimmed.length > 100;
});

const errorMessage = computed(() => {
  if (hasError.value) {
    return 'Search term must be 100 characters or less';
  }
  return '';
});

// Event handlers
function handleInput(value: string): void {
  // Prevent input if it would exceed 100 characters
  if (value.length <= 100) {
    emit('update:modelValue', value);
  }
}

function clearInput(): void {
  emit('update:modelValue', '');
}
</script>
