<template>
  <div>
    <ExampleSelectDialog
      :items="mappedMusicStyles"
      :model-value="modelValue"
      @update:model-value="handleSelectionChange"
      :disabled="disabled"
      dialog-header="Select Music Styles"
      search-placeholder="Search music styles..."
      empty-message="No music styles found"
      default-button-text="Music Styles"
      single-item-label="style"
      multiple-items-label="styles"
    >
      <!-- Custom filter icon -->
      <template #button-icon>
        <svg
          class="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
      </template>
    </ExampleSelectDialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ExampleSelectDialog from '../../../shared/components/SelectDialog.vue';
import type { MusicStyleDto } from '../../../types';

interface Props {
  musicStyles: MusicStyleDto[];
  modelValue: string[];
  disabled?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<Emits>();

// Transform MusicStyleDto to match ExampleSelectDialog's Item interface
const mappedMusicStyles = computed(() => {
  return props.musicStyles.map((style) => ({
    id: style.id,
    name: style.style_name,
    description: `${style.user_count} DJs`,
  }));
});

// Event handlers
function handleSelectionChange(value: string[]): void {
  emit('update:modelValue', value);
}
</script>

<style scoped>
/* Ensure proper contrast for dialog content */
:deep(.p-dialog-content) {
  background-color: white;
  color: #1f2937;
}

/* Enhance checkbox visibility */
:deep(.p-checkbox) {
  width: 1.25rem;
  height: 1.25rem;
}

:deep(.p-checkbox .p-checkbox-box) {
  border: 2px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  transition: all 0.2s ease-in-out;
}

:deep(.p-checkbox .p-checkbox-box.p-highlight) {
  border-color: #3b82f6;
  background-color: #3b82f6;
}

:deep(.p-checkbox .p-checkbox-box .p-checkbox-icon) {
  color: white;
  font-weight: bold;
}

/* Improve dialog header */
:deep(.p-dialog-header) {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
}

:deep(.p-dialog-title) {
  font-weight: 600;
  color: #1f2937;
}

/* Ensure input text has proper styling */
:deep(.p-inputtext) {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: white;
  color: #1f2937;
}

:deep(.p-inputtext:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
