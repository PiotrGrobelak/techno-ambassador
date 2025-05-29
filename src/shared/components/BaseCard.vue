<template>
  <component
    :is="tag"
    :class="cardClasses"
    :style="customStyle"
    @click="handleClick"
  >
    <!-- Card Header -->
    <div v-if="title || subtitle || $slots.header" :class="headerClasses">
      <slot name="header">
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <BaseTypography
              v-if="title"
              :variant="titleVariant"
              :weight="titleWeight"
              class="truncate"
            >
              {{ title }}
            </BaseTypography>
            <BaseTypography
              v-if="subtitle"
              variant="body-small"
              color="secondary"
              class="mt-1 truncate"
            >
              {{ subtitle }}
            </BaseTypography>
          </div>

          <!-- Header actions -->
          <div v-if="$slots['header-actions']" class="ml-3 flex-shrink-0">
            <slot name="header-actions" />
          </div>
        </div>
      </slot>
    </div>

    <!-- Card Content -->
    <div v-if="$slots.default" :class="contentClasses">
      <slot />
    </div>

    <!-- Card Footer -->
    <div v-if="$slots.footer" :class="footerClasses">
      <slot name="footer" />
    </div>

    <!-- Interactive overlay for clickable cards -->
    <div
      v-if="interactive"
      class="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-transparent transition-all"
      :class="overlayClasses"
    />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseTypography from './BaseTypography.vue';

type CardVariant = 'elevated' | 'outlined' | 'filled' | 'ghost';
type CardSize = 'small' | 'medium' | 'large';

interface Props {
  title?: string;
  subtitle?: string;
  variant?: CardVariant;
  size?: CardSize;
  interactive?: boolean;
  disabled?: boolean;
  selected?: boolean;
  loading?: boolean;
  tag?: string;

  // Styling
  shadow?: boolean;
  rounded?: boolean;
  fullHeight?: boolean;

  // Typography
  titleVariant?: 'h3' | 'h4' | 'h5' | 'h6' | 'body-large';
  titleWeight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

interface Emits {
  (e: 'click', event: Event): void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'elevated',
  size: 'medium',
  interactive: false,
  disabled: false,
  selected: false,
  loading: false,
  tag: 'div',
  shadow: true,
  rounded: true,
  fullHeight: false,
  titleVariant: 'h4',
  titleWeight: 'semibold',
});

const emit = defineEmits<Emits>();

// Apple HIG: Clear visual hierarchy and organization
const cardClasses = computed(() => {
  const classes = ['base-card relative'];

  // Variant styling following Apple HIG principles
  switch (props.variant) {
    case 'elevated':
      classes.push('bg-white');
      if (props.shadow) {
        classes.push('shadow-sm hover:shadow-md transition-shadow');
      }
      break;
    case 'outlined':
      classes.push('bg-white border border-gray-200');
      break;
    case 'filled':
      classes.push('bg-gray-50 border border-gray-100');
      break;
    case 'ghost':
      classes.push('bg-transparent');
      break;
  }

  // Size variants with Apple HIG spacing
  switch (props.size) {
    case 'small':
      classes.push('p-3');
      break;
    case 'large':
      classes.push('p-6');
      break;
    default: // medium
      classes.push('p-4');
  }

  // Rounded corners (Apple HIG: consistent border radius)
  if (props.rounded) {
    classes.push('rounded-lg');
  }

  // Interactive states
  if (props.interactive && !props.disabled) {
    classes.push('cursor-pointer transition-all duration-200');
    if (props.selected) {
      classes.push('ring-2 ring-blue-500 ring-offset-2');
    }
  }

  // Disabled state
  if (props.disabled) {
    classes.push('opacity-60 cursor-not-allowed');
  }

  // Loading state
  if (props.loading) {
    classes.push('animate-pulse');
  }

  // Full height option
  if (props.fullHeight) {
    classes.push('h-full flex flex-col');
  }

  return classes.join(' ');
});

const headerClasses = computed(() => {
  const classes = [];

  // Apple HIG: Consistent spacing
  switch (props.size) {
    case 'small':
      classes.push('mb-2');
      break;
    case 'large':
      classes.push('mb-4');
      break;
    default:
      classes.push('mb-3');
  }

  return classes.join(' ');
});

const contentClasses = computed(() => {
  const classes = [];

  // Full height cards need flex-1 content
  if (props.fullHeight) {
    classes.push('flex-1');
  }

  return classes.join(' ');
});

const footerClasses = computed(() => {
  const classes = [];

  // Apple HIG: Consistent spacing
  switch (props.size) {
    case 'small':
      classes.push('mt-2 pt-2');
      break;
    case 'large':
      classes.push('mt-4 pt-4');
      break;
    default:
      classes.push('mt-3 pt-3');
  }

  // Optional border separator
  if (props.variant !== 'ghost') {
    classes.push('border-t border-gray-100');
  }

  return classes.join(' ');
});

const overlayClasses = computed(() => {
  if (!props.interactive || props.disabled) return '';

  const classes = [];

  if (props.selected) {
    classes.push('ring-blue-500');
  } else {
    classes.push(
      'hover:ring-gray-200 focus-within:ring-blue-500 focus-within:ring-2'
    );
  }

  return classes.join(' ');
});

// Custom styles for advanced layouts
const customStyle = computed(() => {
  return {};
});

// Apple HIG: Provide feedback for interactive elements
function handleClick(event: Event): void {
  if (props.interactive && !props.disabled && !props.loading) {
    emit('click', event);
  }
}
</script>

<style scoped>
/* Apple HIG: Smooth transitions and visual feedback */
.base-card {
  /* Ensure consistent antialiasing */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Interactive hover effects following Apple HIG */
.base-card:hover:not(.opacity-60) {
  transform: translateY(-1px);
}

.base-card:active:not(.opacity-60) {
  transform: translateY(0);
}

/* Loading state shimmer effect */
.base-card.animate-pulse {
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
