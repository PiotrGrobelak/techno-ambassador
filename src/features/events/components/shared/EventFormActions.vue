<template>
  <div class="flex flex-col sm:flex-row gap-3 pt-4">
    <Button
      type="submit"
      :label="submitLabel"
      :loading="isLoading"
      :disabled="!isValid || isLoading"
      class="flex-1"
      :data-testid="`${testIdPrefix}-submit-button`"
    />
    <Button
      type="button"
      label="Cancel"
      severity="secondary"
      outlined
      :disabled="isLoading"
      class="flex-1"
      :data-testid="`${testIdPrefix}-cancel-button`"
      @click="$emit('cancel')"
    />
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';

// Props interface
interface Props {
  submitLabel: string;
  isLoading: boolean;
  isValid: boolean;
  testIdPrefix?: string;
}

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
  testIdPrefix: 'event',
});

// Emits
defineEmits<{
  cancel: [];
}>();
</script>
