<template>
  <div>
    <MultiSelect
      v-model="selectedStyles"
      :options="musicStyles"
      optionLabel="style_name"
      filter
      :placeholder="buttonDisplayText"
      :maxSelectedLabels="2"
      filterPlaceholder="Search music styles..."
      emptyFilterMessage="No music styles found"
      class="w-full"
      :disabled="disabled"
      :pt="passThrough"
      display="chip"
      :showToggleAll="false"
      :loading="disabled"
      :aria-label="ariaLabel"
      :aria-describedby="ariaDescribedBy"
      data-testid="music-style-multiselect"
    >
      <!-- Custom option template -->
      <template #option="{ option }">
        <div class="flex flex-col py-1 w-full bg-transparent">
          <span
            class="font-semibold text-gray-900 leading-tight text-[15px] tracking-tight group-hover:text-gray-400"
            >{{ option.style_name }}</span
          >
          <span
            class="text-[13px] text-gray-600 leading-tight font-medium mt-0.5 group-hover:text-gray-400"
            >{{ option.user_count }} DJs</span
          >
        </div>
      </template>

      <!-- Custom value display -->
      <template #value="slotProps">
        <div
          v-if="!slotProps.value?.length"
          class="flex items-center text-gray-700 bg-transparent"
        >
          <i
            class="pi pi-filter text-gray-500 text-sm mr-3 flex-shrink-0"
            aria-hidden="true"
          ></i>
          <span
            class="truncate font-medium text-[15px] leading-5 tracking-tight"
            >Music Styles</span
          >
        </div>
        <div v-else class="flex items-center text-gray-900 bg-transparent">
          <i
            class="pi pi-filter text-blue-600 text-sm mr-3 flex-shrink-0"
            aria-hidden="true"
          ></i>
          <span
            class="truncate font-semibold text-[15px] leading-5 tracking-tight text-blue-600"
            >{{ getSelectedText(slotProps.value) }}</span
          >
        </div>
      </template>

      <!-- Custom chip display -->
      <template #chip="{ value }">
        <div
          class="inline-flex items-center px-3 py-1.5 rounded-full font-semibold bg-blue-600 text-white border border-blue-700 mr-2 mb-1 max-w-32 shadow-sm text-[13px] leading-4 tracking-tight"
        >
          <span class="truncate">{{ getStyleName(value) }}</span>
        </div>
      </template>

      <!-- Custom empty state -->
      <template #empty>
        <div class="text-center py-12 px-6 bg-white">
          <i
            class="pi pi-search text-gray-400 text-5xl mx-auto block mb-4"
            aria-hidden="true"
          ></i>
          <p
            class="text-gray-700 font-semibold text-[15px] leading-6 tracking-tight"
          >
            No music styles found
          </p>
          <p class="text-gray-500 text-[13px] leading-5 mt-1">
            Try adjusting your search terms
          </p>
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

// PassThrough configuration
const passThrough = computed(() => ({
  labelContainer: {
    class: [
      'flex-1 overflow-hidden flex items-center px-4 py-3',
      'bg-transparent',
    ],
  },
  header: {
    class: ['p-5 border-b border-gray-100', 'bg-gray-50/50 rounded-t-2xl'],
  },
  filterIcon: {
    class: [
      'absolute left-9 top-1/2 transform -translate-y-1/2',
      'w-5 h-5 text-gray-500',
      'transition-colors duration-200',
    ],
  },
  list: {
    class: 'p-0! m-0 list-none bg-white',
  },
  option: {
    class: 'group',
  },
  emptyMessage: {
    class: [
      'px-6 py-12 text-center text-gray-700 bg-white',
      'font-medium text-[15px] leading-6',
    ],
  },
}));
</script>
