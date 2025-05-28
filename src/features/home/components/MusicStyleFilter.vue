<template>
  <div>
    <!-- Filter button -->
    <Button
      @click="openModal"
      :disabled="disabled"
      severity="secondary"
      outlined
      class="w-full justify-between"
    >
      <span class="flex items-center">
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
        {{ buttonText }}
      </span>
      <svg
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
    </Button>

    <!-- Modal -->
    <Dialog
      v-model:visible="isModalOpen"
      modal
      header="Select Music Styles"
      :style="{ width: '90vw', maxWidth: '600px' }"
      :closable="true"
      :draggable="false"
    >
      <div class="space-y-4">
        <!-- Search within styles -->
        <div class="relative">
          <InputText
            v-model="searchTerm"
            placeholder="Search music styles..."
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

        <!-- Selected count -->
        <div v-if="selectedCount > 0" class="text-sm text-gray-600">
          {{ selectedCount }} style{{ selectedCount !== 1 ? 's' : '' }} selected
        </div>

        <!-- Styles list -->
        <div class="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
          <div
            v-if="filteredStyles.length === 0"
            class="p-4 text-center text-gray-500"
          >
            No music styles found
          </div>

          <div v-else class="divide-y divide-gray-200">
            <label
              v-for="style in filteredStyles"
              :key="style.id"
              class="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
            >
              <Checkbox
                :model-value="isSelected(style.id)"
                @update:model-value="toggleStyle(style.id)"
                :input-id="style.id"
                class="mr-3"
              />
              <div class="flex-1">
                <div class="font-medium text-gray-900">
                  {{ style.style_name }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ style.user_count }} DJs
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <Button
            @click="clearSelection"
            severity="secondary"
            text
            :disabled="selectedCount === 0"
          >
            Clear All
          </Button>

          <div class="space-x-2">
            <Button @click="closeModal" severity="secondary" outlined>
              Cancel
            </Button>
            <Button @click="applySelection" severity="primary">
              Apply ({{ selectedCount }})
            </Button>
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
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

// Local state
const isModalOpen = ref(false);
const searchTerm = ref('');
const tempSelection = ref<string[]>([]);

// Computed properties
const selectedCount = computed(() => {
  return props.modelValue.length;
});

const buttonText = computed(() => {
  if (selectedCount.value === 0) {
    return 'Music Styles';
  } else if (selectedCount.value === 1) {
    const selectedStyle = props.musicStyles.find((style) =>
      props.modelValue.includes(style.id)
    );
    return selectedStyle ? selectedStyle.style_name : '1 style selected';
  } else {
    return `${selectedCount.value} styles selected`;
  }
});

const filteredStyles = computed(() => {
  if (!searchTerm.value.trim()) {
    return props.musicStyles.filter((style) => style.user_count > 0);
  }

  const search = searchTerm.value.toLowerCase().trim();
  return props.musicStyles.filter(
    (style) =>
      style.user_count > 0 && style.style_name.toLowerCase().includes(search)
  );
});

// Methods
function isSelected(styleId: string): boolean {
  return tempSelection.value.includes(styleId);
}

function toggleStyle(styleId: string): void {
  const index = tempSelection.value.indexOf(styleId);

  if (index === -1) {
    tempSelection.value.push(styleId);
  } else {
    tempSelection.value.splice(index, 1);
  }
}

function openModal(): void {
  if (props.disabled) return;

  // Initialize temp selection with current values
  tempSelection.value = [...props.modelValue];
  searchTerm.value = '';
  isModalOpen.value = true;
}

function closeModal(): void {
  isModalOpen.value = false;
}

function applySelection(): void {
  // Validate that all selected styles exist in available styles
  const validSelection = tempSelection.value.filter((id) =>
    props.musicStyles.some((style) => style.id === id)
  );

  emit('update:modelValue', validSelection);
  closeModal();
}

function clearSelection(): void {
  tempSelection.value = [];
}

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (!isModalOpen.value) {
      tempSelection.value = [...newValue];
    }
  },
  { immediate: true }
);
</script>
