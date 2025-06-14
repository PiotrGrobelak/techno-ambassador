<template>
  <Button
    :class="buttonClasses"
    :severity="computedSeverity"
    :outlined="computedOutlined"
    :text="computedText"
    :disabled="disabled"
    :loading="loading"
    :size="size"
    :aria-label="ariaLabel || label"
    v-bind="$attrs"
    @click="handleClick"
  >
    <span class="flex items-center justify-center">
      <!-- Leading icon -->
      <slot name="icon-leading" v-if="$slots['icon-leading']" />
      <i
        v-else-if="iconLeading && typeof iconLeading === 'string'"
        :class="`pi ${iconLeading} ${iconLeadingClasses}`"
      />
      <component
        v-else-if="iconLeading"
        :is="iconLeading"
        :class="iconLeadingClasses"
      />

      <!-- Label -->
      <span v-if="label" :class="labelClasses">
        {{ label }}
      </span>
      <slot v-else />

      <!-- Trailing icon -->
      <slot name="icon-trailing" v-if="$slots['icon-trailing']" />
      <i
        v-else-if="iconTrailing && typeof iconTrailing === 'string'"
        :class="`pi ${iconTrailing} ${iconTrailingClasses}`"
      />
      <component
        v-else-if="iconTrailing"
        :is="iconTrailing"
        :class="iconTrailingClasses"
      />
    </span>
  </Button>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import Button from 'primevue/button';
import type { PrimeIcon } from '@/shared/components/types';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'link';
type ButtonSize = 'small' | 'medium' | 'large';

interface Props {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  iconLeading?: PrimeIcon | any; // PrimeIcons class name (e.g., 'pi-check') or Vue component
  iconTrailing?: PrimeIcon | any; // PrimeIcons class name (e.g., 'pi-arrow-right') or Vue component
  fullWidth?: boolean;
  ariaLabel?: string;
  pulse?: boolean; // Apple HIG: pulsing buttons for most likely choice
}

interface Emits {
  (e: 'click', event: Event): void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'secondary',
  size: 'medium',
  disabled: false,
  loading: false,
  fullWidth: false,
  pulse: false,
});

const emit = defineEmits<Emits>();
const slots = useSlots();

// Computed properties following Apple HIG principles
const computedSeverity = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'primary';
    case 'destructive':
      return 'danger';
    case 'secondary':
      return 'secondary';
    case 'ghost':
      return 'secondary';
    case 'link':
      return 'info';
    default:
      return 'secondary';
  }
});

const computedOutlined = computed(() => {
  return ['secondary', 'ghost'].includes(props.variant);
});

const computedText = computed(() => {
  return ['ghost', 'link'].includes(props.variant);
});

const buttonClasses = computed(() => {
  const classes = [];

  // Apple HIG: consistent button appearance with clear hierarchy
  if (props.fullWidth) {
    classes.push('w-full');
  }

  // Apple HIG: predictable button behavior with consistent sizing
  switch (props.size) {
    case 'small':
      classes.push('px-3 py-1.5 text-sm');
      break;
    case 'large':
      classes.push('px-6 py-3 text-lg');
      break;
    default:
      classes.push('px-4 py-2');
  }

  // Apple HIG: pulsing for most likely choice
  if (props.pulse && !props.disabled) {
    classes.push('animate-pulse');
  }

  // Apple HIG: clear visual hierarchy
  switch (props.variant) {
    case 'primary':
      classes.push('font-semibold shadow-sm hover:shadow-md transition-shadow');
      break;
    case 'destructive':
      classes.push('font-medium');
      break;
    case 'link':
      classes.push('underline-offset-4 hover:underline');
      break;
    default:
      classes.push('font-medium');
  }

  return classes.join(' ');
});

const labelClasses = computed(() => {
  const classes = [];

  // Spacing for icons
  if (props.iconLeading || slots['icon-leading']) {
    classes.push('ml-2');
  }
  if (props.iconTrailing || slots['icon-trailing']) {
    classes.push('mr-2');
  }

  return classes.join(' ');
});

const iconLeadingClasses = computed(() => {
  const size =
    props.size === 'small'
      ? 'w-4 h-4'
      : props.size === 'large'
        ? 'w-6 h-6'
        : 'w-5 h-5';
  return `${size} ${props.label ? 'mr-2' : ''}`;
});

const iconTrailingClasses = computed(() => {
  const size =
    props.size === 'small'
      ? 'w-4 h-4'
      : props.size === 'large'
        ? 'w-6 h-6'
        : 'w-5 h-5';
  return `${size} ${props.label ? 'ml-2' : ''}`;
});

// Apple HIG: provide feedback for user actions
function handleClick(event: Event): void {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
}
</script>
