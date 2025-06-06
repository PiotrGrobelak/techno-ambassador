<template>
  <div>
    <MultiSelect
      v-model="selectedStyles"
      :options="musicStyles"
      optionLabel="style_name"
      optionValue="id"
      filter
      :placeholder="buttonDisplayText"
      :maxSelectedLabels="2"
      filterPlaceholder="Search music styles..."
      emptyFilterMessage="No music styles found"
      class="w-full"
      :disabled="disabled"
      :pt="passThrough"
      :panelClass="responsivePanelClass"
      display="chip"
      :showToggleAll="false"
      :loading="disabled"
      :aria-label="ariaLabel"
      :aria-describedby="ariaDescribedBy"
    >
      <!-- Custom option template -->
      <template #option="{ option }">
        <div class="flex flex-col py-2 w-full bg-white">
          <span class="font-bold text-gray-900 leading-tight">{{
            option.style_name
          }}</span>
          <span class="text-sm text-gray-800 leading-tight font-semibold"
            >{{ option.user_count }} DJs</span
          >
        </div>
      </template>

      <!-- Custom value display -->
      <template #value="slotProps">
        <div
          v-if="!slotProps.value?.length"
          class="flex items-center text-gray-700 bg-white"
        >
          <svg
            class="w-4 h-4 mr-2 flex-shrink-0 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span class="truncate font-semibold">Music Styles</span>
        </div>
        <div v-else class="flex items-center text-gray-900 bg-white">
          <svg
            class="w-4 h-4 mr-2 flex-shrink-0 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span class="truncate font-bold">{{
            getSelectedText(slotProps.value)
          }}</span>
        </div>
      </template>

      <!-- Custom chip display -->
      <template #chip="{ value }">
        <div
          class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-blue-600 text-white border-2 border-blue-700 mr-1 mb-1 max-w-32"
        >
          <span class="truncate">{{ getStyleName(value) }}</span>
        </div>
      </template>

      <!-- Custom empty state -->
      <template #empty>
        <div class="text-center py-8 px-6 bg-white">
          <svg
            class="w-10 h-10 mx-auto text-gray-500 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 0a4 4 0 01-4-4V7a4 4 0 118 0v1M9 12v4a4 4 0 01-4 4H5"
            />
          </svg>
          <p class="text-gray-900 text-base font-bold">No music styles found</p>
        </div>
      </template>
    </MultiSelect>

    <!-- Screen reader status -->
    <div
      v-if="selectedCount > 0"
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ selectedCount }} music
      {{ selectedCount === 1 ? 'style' : 'styles' }} selected
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MultiSelect from 'primevue/multiselect';
import type { MusicStyleDto } from '@/types';

interface Props {
  musicStyles: MusicStyleDto[];
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

// Using defineModel for two-way data binding
const selectedStyles = defineModel<string[]>({ default: () => [] });

// Computed properties
const selectedCount = computed(() => selectedStyles.value.length);

const buttonDisplayText = computed(() => {
  if (selectedCount.value === 0) {
    return 'Music Styles';
  } else if (selectedCount.value === 1) {
    const selectedStyle = props.musicStyles.find(
      (style) => style.id === selectedStyles.value[0]
    );
    return selectedStyle?.style_name ?? '1 style selected';
  } else {
    return `${selectedCount.value} styles selected`;
  }
});

// Helper functions
const getSelectedText = (selectedIds: string[]): string => {
  const count = selectedIds.length;
  if (count === 0) return 'Music Styles';
  if (count === 1) {
    const style = props.musicStyles.find((s) => s.id === selectedIds[0]);
    return style?.style_name ?? '1 style selected';
  }
  return `${count} styles selected`;
};

const getStyleName = (styleId: string): string => {
  return props.musicStyles.find((s) => s.id === styleId)?.style_name ?? styleId;
};

// ARIA attributes
const ariaLabel = computed(() => {
  const baseLabel = 'Music Styles MultiSelect';
  const count = selectedCount.value;
  if (count === 0) return `${baseLabel}, no styles selected`;
  if (count === 1) {
    const style = props.musicStyles.find(
      (s) => s.id === selectedStyles.value[0]
    );
    return `${baseLabel}, ${style?.style_name ?? '1 style'} selected`;
  }
  return `${baseLabel}, ${count} styles selected`;
});

const ariaDescribedBy = computed(() => {
  const count = selectedCount.value;
  const baseInstruction = 'Use arrow keys to navigate, Space to select';
  if (count === 0) return `${baseInstruction}, Enter to confirm`;
  const plural = count === 1 ? '' : 's';
  return `${count} music style${plural} selected. ${baseInstruction} or deselect`;
});

// Responsive panel class
const responsivePanelClass = computed(
  () => 'w-full sm:max-w-md md:max-w-lg lg:max-w-xl'
);

// PassThrough configuration
const passThrough = computed(() => ({
  root: {
    class: [
      'w-full min-h-[2.75rem]',
      'border-2 border-gray-400 rounded-lg',
      'bg-white hover:border-gray-500',
      'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/40',
      'transition-all duration-200',
      props.disabled
        ? 'opacity-60 cursor-not-allowed bg-gray-100'
        : 'cursor-pointer',
    ],
  },
  input: {
    class: [
      'w-full outline-none px-3 py-2',
      'text-gray-900 placeholder-gray-600 bg-white',
    ],
  },
  labelContainer: {
    class: ['flex-1 overflow-hidden flex items-center px-3 py-2 bg-white'],
  },
  label: {
    class: ['block truncate text-left text-gray-900 font-medium bg-white'],
  },
  trigger: {
    class: [
      'flex items-center justify-center px-3 py-2 bg-white',
      'text-gray-700 hover:text-gray-900 transition-colors duration-200',
    ],
  },
  panel: {
    class: [
      'mt-2 border-2 border-gray-300 rounded-lg shadow-2xl bg-white',
      'max-w-full min-w-[16rem] z-50',
    ],
  },
  header: {
    class: ['p-4 border-b-2 border-gray-200 bg-white'],
  },
  headerCheckboxContainer: { class: 'mr-3' },
  headerCheckbox: {
    class: [
      'w-5 h-5 rounded border-2 border-gray-600 bg-white',
      'checked:bg-blue-600 checked:border-blue-600',
      'hover:border-blue-500 focus:ring-3 focus:ring-blue-500/40',
    ],
  },
  filterContainer: {
    class: 'relative p-4 border-b-2 border-gray-200 bg-white',
  },
  filterInput: {
    class: [
      'w-full pl-10 pr-4 py-3 border-2 border-gray-400 rounded-lg',
      'bg-white text-gray-900 placeholder-gray-600',
      'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40',
      'transition-all duration-200',
    ],
  },
  filterIcon: {
    class: [
      'absolute left-7 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600',
    ],
  },
  wrapper: {
    class: [
      'max-h-64 overflow-auto bg-white',
      'scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100',
    ],
  },
  list: { class: 'p-0 m-0 list-none bg-white' },
  item: {
    class: [
      'flex items-center px-4 py-3 cursor-pointer select-none bg-white',
      'border-b border-gray-200 last:border-b-0',
      'hover:bg-blue-50 focus:bg-blue-50 focus:outline-none',
      'data-[p-highlight="true"]:bg-blue-100 data-[p-highlight="true"]:text-blue-900',
      'transition-all duration-200',
    ],
  },
  itemGroup: {
    class: [
      'font-semibold text-gray-900 px-4 py-3 bg-gray-100 border-b-2 border-gray-300',
    ],
  },
  checkboxContainer: { class: 'mr-3 flex items-center' },
  checkbox: {
    class: [
      'w-5 h-5 rounded border-2 border-gray-700 bg-white',
      'checked:bg-blue-600 checked:border-blue-600 hover:border-blue-500',
      'focus:ring-3 focus:ring-blue-500/40 transition-all duration-200',
      '!bg-white !border-gray-700',
    ],
  },
  checkboxIcon: { class: 'w-4 h-4 text-white font-bold' },
  closeButton: {
    class: [
      'w-8 h-8 rounded-full flex items-center justify-center bg-white',
      'text-gray-700 hover:text-gray-900 hover:bg-gray-100',
      'transition-all duration-200',
    ],
  },
  emptyMessage: { class: ['px-6 py-8 text-center text-gray-900 bg-white'] },
}));
</script>
