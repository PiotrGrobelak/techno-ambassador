<template>
  <BaseDialog
    :button-text="buttonText"
    :dialog-header="dialogHeader"
    :show-search="true"
    :search-placeholder="searchPlaceholder"
    :info-text="
      selectedCount > 0
        ? `${selectedCount} item${selectedCount !== 1 ? 's' : ''} selected`
        : ''
    "
    :clear-button-disabled="selectedCount === 0"
    :apply-button-text="`Apply (${selectedCount})`"
    @open="handleOpen"
    @close="handleClose"
    @apply="handleApply"
    @clear="handleClear"
  >
    <!-- Pass through button icon slot -->
    <template v-if="$slots['button-icon']" #button-icon>
      <slot name="button-icon" />
    </template>

    <!-- Custom content slot -->
    <template #content="{ searchTerm }">
      <div
        v-if="filteredItems.length === 0"
        class="p-4 text-center text-gray-500"
      >
        {{ emptyMessage }}
      </div>

      <div v-else class="divide-y divide-gray-200">
        <label
          v-for="item in filteredItems"
          :key="item.id"
          :class="[
            'flex items-center p-3 cursor-pointer transition-colors duration-200',
            item.isSelected
              ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
              : 'hover:bg-gray-50',
          ]"
        >
          <Checkbox
            :v-model="item.isSelected"
            @update:model-value="toggleItem(item.id)"
            :input-id="item.id"
            class="mr-3"
            :binary="true"
          />
          <div class="flex-1">
            <div
              :class="[
                'font-medium',
                item.isSelected ? 'text-blue-900' : 'text-gray-800',
              ]"
            >
              {{ item.name }}
            </div>
            <div
              :class="[
                'text-sm',
                item.isSelected ? 'text-blue-700' : 'text-gray-600',
              ]"
            >
              {{ item.description }}
            </div>
          </div>

          <!-- Selected indicator -->
          <div v-if="item.isSelected" class="ml-2">
            <svg
              class="w-5 h-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </label>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Checkbox from 'primevue/checkbox';
import BaseDialog from './BaseDialog.vue';

interface Item {
  id: string;
  name: string;
  description: string;
}

interface Props {
  items: Item[];
  disabled?: boolean;
  dialogHeader?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  defaultButtonText?: string;
  singleItemLabel?: string;
  multipleItemsLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  dialogHeader: 'Select Items',
  searchPlaceholder: 'Search items...',
  emptyMessage: 'No items found',
  defaultButtonText: 'Select Items',
  singleItemLabel: 'item',
  multipleItemsLabel: 'items',
});

// Using defineModel for two-way data binding
const selectedItems = defineModel<string[]>({ default: () => [] });

// Local state
const tempSelection = ref<string[]>([]);
const searchTerm = ref('');

// Computed properties
const selectedCount = computed(() => {
  return selectedItems.value.length;
});

const tempSelectedCount = computed(() => {
  return tempSelection.value.length;
});

const buttonText = computed(() => {
  if (selectedCount.value === 0) {
    return props.defaultButtonText;
  } else if (selectedCount.value === 1) {
    const selectedItem = props.items.find((item) =>
      selectedItems.value.includes(item.id)
    );
    return selectedItem
      ? selectedItem.name
      : `1 ${props.singleItemLabel} selected`;
  } else {
    return `${selectedCount.value} ${props.multipleItemsLabel} selected`;
  }
});

interface ItemWithIsSelected extends Item {
  isSelected: boolean;
}

const filteredItems = computed<ItemWithIsSelected[]>(() => {
  return props.items.map((item) => ({
    ...item,
    isSelected: isSelected(item.id),
  }));
});

// Methods
function isSelected(itemId: string): boolean {
  return tempSelection.value.includes(itemId);
}

function toggleItem(itemId: string): void {
  const index = tempSelection.value.indexOf(itemId);

  if (index === -1) {
    tempSelection.value.push(itemId);
  } else {
    tempSelection.value.splice(index, 1);
  }
}

function handleOpen(): void {
  // Initialize temp selection with current values
  tempSelection.value = [...selectedItems.value];
}

function handleClose(): void {
  // Reset search when closing
  searchTerm.value = '';
}

function handleApply(): void {
  // Validate that all selected items exist in available items
  const validSelection = tempSelection.value.filter((id) =>
    props.items.some((item) => item.id === id)
  );

  selectedItems.value = validSelection;
}

function handleClear(): void {
  tempSelection.value = [];
}

// Watch for external changes to selectedItems
watch(
  selectedItems,
  (newValue) => {
    tempSelection.value = [...newValue];
  },
  { immediate: true }
);
</script>

<style scoped>
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

/* Ensure proper background and text contrast for list items */
.divide-y > label {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
}

.divide-y > label:hover {
  background-color: #f9fafb !important;
}

.divide-y > label.bg-blue-50 {
  background-color: #eff6ff !important;
}

.divide-y > label.bg-blue-50:hover {
  background-color: #dbeafe !important;
}

/* Text color improvements */
.text-gray-800 {
  color: #1f2937 !important;
}

.text-gray-600 {
  color: #4b5563 !important;
}

.text-blue-900 {
  color: #1e3a8a !important;
}

.text-blue-700 {
  color: #1d4ed8 !important;
}
</style>
