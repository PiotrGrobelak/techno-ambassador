<template>
  <div class="relative">
    <InputText
      v-model="searchValue"
      :placeholder="placeholder"
      data-testid="dj-search-input"
      class="w-full"
      :invalid="hasError"
      :aria-describedby="`${id}-error`"
      :aria-label="label"
      :id="id"
      size="large"
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
      v-if="searchValue && !disabled"
      @click="clearInput"
      data-testid="clear-search-button"
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
  placeholder?: string;
  disabled?: boolean;
  id: string;
  label: string;
}

const props = withDefaults(defineProps<Props>(), {
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
