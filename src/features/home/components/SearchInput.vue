<template>
  <div class="relative">
    <InputText
      :id="id"
      v-model="searchValue"
      :placeholder="placeholder"
      data-testid="dj-search-input"
      class="w-full"
      :invalid="hasError"
      :aria-describedby="`${id}-error`"
      :aria-label="label"
      size="large"
    />

    <!-- Search icon -->
    <div
      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
    >
      <i class="pi pi-search text-gray-400 text-lg" aria-hidden="true"></i>
    </div>

    <!-- Clear button -->
    <button
      v-if="searchValue && !disabled"
      data-testid="clear-search-button"
      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
      type="button"
      @click="clearInput"
    >
      <i class="pi pi-times text-lg" aria-hidden="true"></i>
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
  placeholder?: string;
  disabled?: boolean;
  id: string;
  label: string;
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Search DJs by artist name...',
  disabled: false,
});

// Using defineModel for two-way data binding
const searchValue = defineModel<string>({ default: '' });

// Validation
const hasError = computed(() => {
  const trimmed = searchValue.value.trim();
  return trimmed.length > 100;
});

const errorMessage = computed(() => {
  if (hasError.value) {
    return 'Search term must be 100 characters or less';
  }
  return '';
});

function clearInput(): void {
  searchValue.value = '';
}
</script>

<style scoped>
.p-inputtext {
  padding-left: 40px;
}
</style>
