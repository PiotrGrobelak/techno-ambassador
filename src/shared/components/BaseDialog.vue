<template>
  <div>
    <!-- Trigger button (optional, can be overridden with slot) -->
    <slot name="trigger" :open="openDialog">
      <Button
        @click="openDialog"
        :disabled="disabled"
        :severity="buttonSeverity"
        :outlined="buttonOutlined"
        :class="buttonClass"
      >
        <span class="flex items-center">
          <slot name="button-icon">
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </slot>
          {{ buttonText }}
        </span>
        <slot name="button-suffix">
          <svg
            v-if="showArrow"
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </slot>
      </Button>
    </slot>

    <!-- Dialog -->
    <Dialog
      v-model:visible="isDialogOpen"
      modal
      :header="dialogHeader"
      :style="dialogStyle"
      :closable="closable"
      :draggable="draggable"
      :class="dialogClass"
    >
      <!-- Header slot for custom header content -->
      <template v-if="$slots.header" #header>
        <slot name="header" />
      </template>

      <!-- Main content -->
      <div class="space-y-4">
        <!-- Search section (optional) -->
        <div v-if="showSearch" class="relative">
          <InputText
            v-model="searchTerm"
            :placeholder="searchPlaceholder"
            class="w-full pl-10"
          />
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <svg
              class="h-4 w-4 text-gray-400"
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
        </div>

        <!-- Info section (optional) -->
        <div v-if="infoText" class="text-sm text-gray-600">
          {{ infoText }}
        </div>

        <!-- Main content slot -->
        <div :class="contentClass">
          <slot
            name="content"
            :search-term="searchTerm"
            :close-dialog="closeDialog"
            :apply-action="applyAction"
          >
            <!-- Default content -->
            <div class="p-4 text-center text-gray-500">No content provided</div>
          </slot>
        </div>
      </div>

      <!-- Footer -->
      <template #footer>
        <div class="flex justify-between">
          <!-- Left side actions -->
          <div>
            <slot name="footer-left" :close-dialog="closeDialog">
              <Button
                v-if="showClearButton"
                @click="handleClear"
                severity="secondary"
                text
                :disabled="clearButtonDisabled"
              >
                {{ clearButtonText }}
              </Button>
            </slot>
          </div>

          <!-- Right side actions -->
          <div class="space-x-2">
            <slot
              name="footer-right"
              :close-dialog="closeDialog"
              :apply-action="applyAction"
            >
              <Button @click="closeDialog" severity="secondary" outlined>
                {{ cancelButtonText }}
              </Button>
              <Button
                @click="applyAction"
                severity="primary"
                :disabled="applyButtonDisabled"
              >
                {{ applyButtonText }}
              </Button>
            </slot>
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';

interface Props {
  // Button props
  buttonText?: string;
  buttonSeverity?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'help'
    | 'danger'
    | 'contrast';
  buttonOutlined?: boolean;
  buttonClass?: string;
  showArrow?: boolean;
  disabled?: boolean;

  // Dialog props
  dialogHeader?: string;
  dialogStyle?: Record<string, any>;
  dialogClass?: string;
  closable?: boolean;
  draggable?: boolean;

  // Content props
  showSearch?: boolean;
  searchPlaceholder?: string;
  contentClass?: string;
  infoText?: string;

  // Footer props
  showClearButton?: boolean;
  clearButtonText?: string;
  clearButtonDisabled?: boolean;
  cancelButtonText?: string;
  applyButtonText?: string;
  applyButtonDisabled?: boolean;
}

interface Emits {
  (e: 'open'): void;
  (e: 'close'): void;
  (e: 'apply'): void;
  (e: 'clear'): void;
}

const props = withDefaults(defineProps<Props>(), {
  // Button defaults
  buttonText: 'Open Dialog',
  buttonSeverity: 'secondary',
  buttonOutlined: true,
  buttonClass: 'w-full justify-between',
  showArrow: true,
  disabled: false,

  // Dialog defaults
  dialogHeader: 'Dialog',
  dialogStyle: () => ({ width: '90vw', maxWidth: '600px' }),
  dialogClass: '',
  closable: true,
  draggable: false,

  // Content defaults
  showSearch: false,
  searchPlaceholder: 'Search...',
  contentClass: 'max-h-80 overflow-y-auto border border-gray-200 rounded-lg',
  infoText: '',

  // Footer defaults
  showClearButton: true,
  clearButtonText: 'Clear All',
  clearButtonDisabled: false,
  cancelButtonText: 'Cancel',
  applyButtonText: 'Apply',
  applyButtonDisabled: false,
});

const emit = defineEmits<Emits>();

// Using defineModel for dialog visibility and search state
const isDialogOpen = defineModel<boolean>({ default: false });
const searchTerm = defineModel<string>('searchTerm', { default: '' });

// Methods
function openDialog(): void {
  if (props.disabled) return;

  searchTerm.value = '';
  isDialogOpen.value = true;
  emit('open');
}

function closeDialog(): void {
  isDialogOpen.value = false;
  emit('close');
}

function applyAction(): void {
  emit('apply');
  closeDialog();
}

function handleClear(): void {
  emit('clear');
}
</script>
