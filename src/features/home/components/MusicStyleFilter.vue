<template>
  <div>
    <SelectDialog
      :items="mappedMusicStyles"
      v-model="selectedStyles"
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
    </SelectDialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SelectDialog from '../../../shared/components/SelectDialog.vue';
import type { MusicStyleDto } from '../../../types';

interface Props {
  musicStyles: MusicStyleDto[];
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

// Using defineModel for two-way data binding
const selectedStyles = defineModel<string[]>({ default: () => [] });

// Transform MusicStyleDto to match SelectDialog's Item interface
const mappedMusicStyles = computed(() => {
  return props.musicStyles.map((style) => ({
    id: style.id,
    name: style.style_name,
    description: `${style.user_count} DJs`,
  }));
});
</script>
