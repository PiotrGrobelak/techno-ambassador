<template>
  <div class="music-style-selector">
    <!-- Label -->
    <label
      :for="inputId"
      class="block text-sm font-medium text-gray-700 mb-2"
      :class="{ 'text-red-600': hasError }"
    >
      Music Styles
      <span class="text-red-500">*</span>
    </label>

    <!-- MultiSelect Component -->
    <MultiSelect
      :id="inputId"
      v-model="selectedStyles"
      :options="musicStyles"
      option-label="style_name"
      option-value="id"
      :filter="true"
      filter-placeholder="Search music styles..."
      :max-selected-labels="3"
      :selected-items-label="`{0} styles selected`"
      placeholder="Select your music styles"
      :class="multiSelectClasses"
      :loading="isLoading"
      :disabled="disabled"
      @change="handleChange"
      @filter="handleFilter"
    >
      <!-- Custom option template -->
      <template #option="{ option }">
        <div class="flex items-center justify-between py-2">
          <span class="font-medium">{{ option.style_name }}</span>
          <span class="text-sm text-gray-500">{{ option.user_count }} DJs</span>
        </div>
      </template>

      <!-- Custom selected value template -->
      <template #value="{ value, placeholder }">
        <div v-if="value && value.length > 0" class="flex flex-wrap gap-1">
          <span
            v-for="(styleId, index) in value.slice(0, maxVisibleTags)"
            :key="styleId"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {{ getStyleName(styleId) }}
          </span>
          <span
            v-if="value.length > maxVisibleTags"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
          >
            +{{ value.length - maxVisibleTags }} more
          </span>
        </div>
        <span v-else class="text-gray-500">{{ placeholder }}</span>
      </template>

      <!-- Empty filter message -->
      <template #emptyfilter>
        <div class="text-center py-4 text-gray-500">
          <p>No music styles found</p>
          <p class="text-sm">Try a different search term</p>
        </div>
      </template>

      <!-- Empty message -->
      <template #empty>
        <div class="text-center py-4 text-gray-500">
          <p>No music styles available</p>
        </div>
      </template>
    </MultiSelect>

    <!-- Error message -->
    <div v-if="hasError" class="mt-1">
      <p class="text-sm text-red-600">{{ errorMessage }}</p>
    </div>

    <!-- Helper text -->
    <div v-else-if="helperText" class="mt-1">
      <p class="text-sm text-gray-600">{{ helperText }}</p>
    </div>

    <!-- Selected count -->
    <div v-if="selectedStyles.length > 0" class="mt-2">
      <p class="text-sm text-gray-600">
        {{ selectedStyles.length }} style{{
          selectedStyles.length !== 1 ? 's' : ''
        }}
        selected
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import MultiSelect from 'primevue/multiselect';
import type { MusicStyleDto } from '../../../types';

interface Props {
  modelValue: string[];
  errorMessage?: string;
  helperText?: string;
  disabled?: boolean;
  maxVisibleTags?: number;
  inputId?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void;
  (e: 'change', value: string[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  maxVisibleTags: 3,
  inputId: 'music-styles-selector',
});

const emit = defineEmits<Emits>();

// Component state
const musicStyles = ref<MusicStyleDto[]>([]);
const isLoading = ref(false);
const filterValue = ref('');

// Computed properties
const selectedStyles = computed({
  get: () => props.modelValue,
  set: (value: string[]) => {
    emit('update:modelValue', value);
    emit('change', value);
  },
});

const hasError = computed(() => {
  return Boolean(props.errorMessage);
});

const multiSelectClasses = computed(() => {
  const baseClasses = 'w-full';

  if (hasError.value) {
    return `${baseClasses} p-invalid border-red-300 focus:border-red-500 focus:ring-red-500`;
  }

  return baseClasses;
});

// Methods
const getStyleName = (styleId: string): string => {
  const style = musicStyles.value.find((s) => s.id === styleId);
  return style?.style_name || 'Unknown';
};

const handleChange = (event: any) => {
  // The selectedStyles computed property will handle the emit
  // This is for any additional logic if needed
};

const handleFilter = (event: any) => {
  filterValue.value = event.value;
  // Could implement server-side filtering here if needed
};

const loadMusicStyles = async (): Promise<void> => {
  isLoading.value = true;

  try {
    const response = await fetch('/api/music-styles?limit=100');

    if (!response.ok) {
      throw new Error('Failed to load music styles');
    }

    const result = await response.json();
    musicStyles.value = result.data || [];
  } catch (error) {
    console.error('Error loading music styles:', error);
    // Could emit an error event here if needed
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadMusicStyles();
});

// Watch for external changes to reload data if needed
watch(
  () => props.modelValue,
  (newValue) => {
    // Validate that all selected IDs exist in our options
    const validIds = musicStyles.value.map((style) => style.id);
    const invalidIds = newValue.filter((id) => !validIds.includes(id));

    if (invalidIds.length > 0) {
      console.warn('Invalid music style IDs detected:', invalidIds);
    }
  }
);
</script>
