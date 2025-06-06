<template>
  <Dialog
    :visible="true"
    modal
    :style="dialogStyle"
    :closable="closable"
    :draggable="false"
    class="base-dialog-v2 rounded-xl shadow-2xl sm:mx-4 mx-2"
    @update:visible="handleClose"
    :pt="passThrough"
  >
    <!-- Header slot -->
    <template #header>
      <slot name="header">
        <div class="text-lg font-semibold text-gray-900">
          {{ props.header || 'Dialog' }}
        </div>
      </slot>
    </template>

    <!-- Main content -->
    <div class="py-4">
      <slot name="default" :close="handleClose">
        <div class="text-center text-gray-500">No content provided</div>
      </slot>
    </div>

    <!-- Footer -->
    <template #footer>
      <slot name="footer" :close="handleClose">
        <div class="flex justify-end space-x-3">
          <BaseButton
            v-if="showCancel"
            @click="handleClose"
            variant="secondary"
            :label="cancelText"
          />
          <BaseButton
            v-if="showConfirm"
            @click="handleConfirm"
            variant="primary"
            :label="confirmText"
          />
        </div>
      </slot>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import Dialog from 'primevue/dialog';

interface Props {
  // Basic dialog props
  header?: string;
  closable?: boolean;
  persistent?: boolean;

  // Footer configuration
  cancelText?: string;
  confirmText?: string;
  showCancel?: boolean;
  showConfirm?: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'confirm'): void;
}

const props = withDefaults(defineProps<Props>(), {
  header: '',
  closable: true,
  persistent: false,
  cancelText: 'Cancel',
  confirmText: 'OK',
  showCancel: true,
  showConfirm: true,
});

const emit = defineEmits<Emits>();

// Computed properties
const cancelText = computed(() => props.cancelText);
const confirmText = computed(() => props.confirmText);
const showCancel = computed(() => props.showCancel);
const showConfirm = computed(() => props.showConfirm);

// Simple dialog styling - fixed medium size
const dialogStyle = computed(() => ({
  width: '90vw',
  maxWidth: '500px',
}));

// Closable logic - only persistent can override
const closable = computed(() => {
  if (props.persistent) return false;
  return props.closable;
});

// PassThrough configuration for basic styling
const passThrough = computed(() => ({
  mask: {
    class: '',
  },
  root: {
    class: 'p-0',
  },
  content: {
    class: 'p-0',
  },
  header: {
    class: 'border-b-0 pt-6 px-6 pb-0',
  },
  footer: {
    class: 'border-t border-gray-200 py-5 px-6',
  },
  closeButton: {
    class: 'w-8 h-8',
  },
}));

// Methods
function handleClose(): void {
  emit('close');
}

function handleConfirm(): void {
  emit('confirm');
}
</script>
