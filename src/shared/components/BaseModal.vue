<template>
  <!-- Trigger slot (optional) -->
  <slot name="trigger" :open="openModal" v-if="!autoOpen" />

  <!-- Modal/Dialog implementation -->
  <Dialog
    v-model:visible="isVisible"
    :modal="modal"
    :header="header"
    :closable="closable"
    :draggable="draggable"
    :resizable="resizable"
    :class="dialogClasses"
    :style="dialogStyle"
    :position="position"
    :blockScroll="blockScroll"
    @show="handleShow"
    @hide="handleHide"
  >
    <!-- Custom header slot -->
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>

    <!-- Main content -->
    <div :class="contentClasses">
      <slot :close="closeModal" :confirm="handleConfirm" />
    </div>

    <!-- Footer with Apple HIG button arrangement -->
    <template v-if="showFooter" #footer>
      <div :class="footerClasses">
        <!-- Left side actions (typically destructive) -->
        <div v-if="$slots['footer-left']">
          <slot name="footer-left" :close="closeModal" />
        </div>

        <!-- Right side actions (Cancel + Primary) -->
        <div :class="footerActionsClasses">
          <slot
            name="footer-actions"
            :close="closeModal"
            :confirm="handleConfirm"
          >
            <!-- Apple HIG: Cancel button never destroys data directly -->
            <BaseButton
              v-if="showCancel"
              :label="cancelText"
              variant="secondary"
              @click="handleCancel"
              :disabled="loading"
            />

            <!-- Primary action (Apple HIG: most likely choice) -->
            <BaseButton
              v-if="showConfirm"
              :label="confirmText"
              :variant="confirmVariant"
              :loading="loading"
              :disabled="confirmDisabled"
              :pulse="highlightPrimary"
              @click="handleConfirm"
            />
          </slot>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import BaseButton from './BaseButton.vue';

type ModalVariant = 'sheet' | 'alert' | 'fullscreen' | 'drawer';
type ModalFriction = 'high' | 'low' | 'none';
type ModalSize = 'small' | 'medium' | 'large' | 'xlarge';

interface Props {
  // Visibility
  modelValue?: boolean;
  autoOpen?: boolean;

  // Modal configuration
  variant?: ModalVariant;
  friction?: ModalFriction;
  size?: ModalSize;

  // Dialog props
  header?: string;
  modal?: boolean;
  closable?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  position?: string;
  blockScroll?: boolean;

  // Content
  showFooter?: boolean;

  // Actions (Apple HIG: clear action hierarchy)
  showCancel?: boolean;
  showConfirm?: boolean;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: 'primary' | 'destructive';
  confirmDisabled?: boolean;
  highlightPrimary?: boolean; // Apple HIG: pulse for most likely choice
  loading?: boolean;

  // Behavior
  persistent?: boolean; // High friction - requires explicit decision
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'show'): void;
  (e: 'hide'): void;
  (e: 'cancel'): void;
  (e: 'confirm'): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  autoOpen: false,
  variant: 'sheet',
  friction: 'low',
  size: 'medium',
  modal: true,
  closable: true,
  draggable: false,
  resizable: false,
  position: 'center',
  blockScroll: true,
  showFooter: true,
  showCancel: true,
  showConfirm: true,
  cancelText: 'Cancel',
  confirmText: 'Confirm',
  confirmVariant: 'primary',
  confirmDisabled: false,
  highlightPrimary: true,
  loading: false,
  persistent: false,
});

const emit = defineEmits<Emits>();

// Internal state
const isVisible = ref(props.modelValue);

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
  }
);

watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

// Apple HIG: Different modal presentations
const dialogClasses = computed(() => {
  const classes = [];

  // Base modal styling
  classes.push('base-modal');

  // Variant-specific styling following Apple HIG
  switch (props.variant) {
    case 'sheet':
      classes.push('modal-sheet');
      break;
    case 'alert':
      classes.push('modal-alert');
      break;
    case 'fullscreen':
      classes.push('modal-fullscreen');
      break;
    case 'drawer':
      classes.push('modal-drawer');
      break;
  }

  // Friction level styling
  switch (props.friction) {
    case 'high':
      classes.push('modal-high-friction');
      break;
    case 'none':
      classes.push('modal-no-friction');
      break;
    default:
      classes.push('modal-low-friction');
  }

  return classes.join(' ');
});

const dialogStyle = computed(() => {
  const style: Record<string, any> = {};

  // Size variants following Apple HIG spacing
  switch (props.size) {
    case 'small':
      style.width = '90vw';
      style.maxWidth = '400px';
      break;
    case 'large':
      style.width = '90vw';
      style.maxWidth = '800px';
      break;
    case 'xlarge':
      style.width = '95vw';
      style.maxWidth = '1200px';
      break;
    default: // medium
      style.width = '90vw';
      style.maxWidth = '600px';
  }

  // Variant-specific adjustments
  if (props.variant === 'fullscreen') {
    style.width = '100vw';
    style.height = '100vh';
    style.maxWidth = 'none';
    style.maxHeight = 'none';
  }

  return style;
});

const contentClasses = computed(() => {
  const classes = ['modal-content'];

  // Apple HIG: Appropriate spacing for content
  switch (props.size) {
    case 'small':
      classes.push('space-y-3');
      break;
    case 'large':
    case 'xlarge':
      classes.push('space-y-6');
      break;
    default:
      classes.push('space-y-4');
  }

  return classes.join(' ');
});

const footerClasses = computed(() => {
  return [
    'flex justify-between items-center',
    'pt-4 border-t border-gray-200',
    'space-x-3',
  ].join(' ');
});

const footerActionsClasses = computed(() => {
  return 'flex space-x-3';
});

// Methods following Apple HIG principles
function openModal(): void {
  isVisible.value = true;
}

function closeModal(): void {
  // Apple HIG: Respect persistent mode for high-friction modals
  if (props.persistent && props.friction === 'high') {
    return;
  }

  isVisible.value = false;
}

function handleShow(): void {
  emit('show');
}

function handleHide(): void {
  emit('hide');
}

function handleCancel(): void {
  // Apple HIG: Cancel never destroys data directly
  if (props.friction === 'high') {
    // Could show confirmation dialog here
    emit('cancel');
  } else {
    emit('cancel');
    closeModal();
  }
}

function handleConfirm(): void {
  emit('confirm');
  // Don't auto-close on confirm - let parent handle it
}

// Auto-open functionality
if (props.autoOpen) {
  isVisible.value = true;
}
</script>

<style scoped>
/* Apple HIG: Modal presentation styles */
:deep(.base-modal) {
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

:deep(.modal-sheet) {
  /* Sheet slides down from top, unfurls from title bar */
  animation: sheet-slide-down 0.3s ease-out;
}

:deep(.modal-alert) {
  /* Alert appears with gentle scale */
  animation: alert-appear 0.2s ease-out;
  border-radius: 16px;
}

:deep(.modal-fullscreen) {
  border-radius: 0;
  box-shadow: none;
}

:deep(.modal-drawer) {
  /* Drawer slides from side */
  animation: drawer-slide-in 0.3s ease-out;
}

/* Apple HIG: Smooth animations for modal presentation */
@keyframes sheet-slide-down {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes alert-appear {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes drawer-slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* High friction modals have stronger backdrop */
:deep(.modal-high-friction .p-dialog-mask) {
  background-color: rgba(0, 0, 0, 0.6);
}

:deep(.modal-low-friction .p-dialog-mask) {
  background-color: rgba(0, 0, 0, 0.4);
}

:deep(.modal-no-friction .p-dialog-mask) {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
