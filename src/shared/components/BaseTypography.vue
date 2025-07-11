<template>
  <component :is="tag" :class="typographyClasses" :style="customStyle">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body-large'
  | 'body'
  | 'body-small'
  | 'caption'
  | 'label'
  | 'overline';

type TypographyWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
type TypographyAlign = 'left' | 'center' | 'right' | 'justify';
type TypographyColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'muted';

interface Props {
  variant?: TypographyVariant;
  weight?: TypographyWeight;
  align?: TypographyAlign;
  color?: TypographyColor;
  tag?: string;
  truncate?: boolean;
  noWrap?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  mono?: boolean; // Apple HIG: SF Mono for code
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'body',
  weight: 'regular',
  align: 'left',
  color: 'primary',
  tag: undefined,
  truncate: false,
  noWrap: false,
  italic: false,
  underline: false,
  strikethrough: false,
  mono: false,
});

// Apple HIG: System fonts (SF Pro) with fallbacks
const systemFontStack = [
  '-apple-system',
  'BlinkMacSystemFont',
  '"SF Pro Display"',
  '"SF Pro Text"',
  'system-ui',
  'sans-serif',
].join(', ');

const monoFontStack = [
  '"SF Mono"',
  'ui-monospace',
  'Monaco',
  '"Cascadia Code"',
  '"Roboto Mono"',
  'Consolas',
  'monospace',
].join(', ');

// Determine semantic HTML tag based on variant
const tag = computed(() => {
  if (props.tag) return props.tag;

  switch (props.variant) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return props.variant;
    case 'body-large':
    case 'body':
    case 'body-small':
      return 'p';
    case 'caption':
    case 'label':
    case 'overline':
      return 'span';
    default:
      return 'p';
  }
});

// Apple HIG: Clear typography hierarchy
const typographyClasses = computed(() => {
  const classes = [];

  // Base font family
  if (props.mono) {
    classes.push('font-mono');
  } else {
    classes.push('font-system');
  }

  // Variant-specific styles following Apple HIG scale
  switch (props.variant) {
    case 'h1':
      classes.push('text-4xl lg:text-5xl leading-tight');
      break;
    case 'h2':
      classes.push('text-3xl lg:text-4xl leading-tight');
      break;
    case 'h3':
      classes.push('text-2xl lg:text-3xl leading-snug');
      break;
    case 'h4':
      classes.push('text-xl lg:text-2xl leading-snug');
      break;
    case 'h5':
      classes.push('text-lg lg:text-xl leading-normal');
      break;
    case 'h6':
      classes.push('text-base lg:text-lg leading-normal');
      break;
    case 'body-large':
      classes.push('text-lg leading-relaxed');
      break;
    case 'body':
      classes.push('text-base leading-normal');
      break;
    case 'body-small':
      classes.push('text-sm leading-normal');
      break;
    case 'caption':
      classes.push('text-xs leading-tight');
      break;
    case 'label':
      classes.push('text-sm leading-none');
      break;
    case 'overline':
      classes.push('text-xs leading-tight uppercase tracking-wider');
      break;
  }

  // Font weight (Apple HIG: appropriate weights for hierarchy)
  switch (props.weight) {
    case 'light':
      classes.push('font-light');
      break;
    case 'medium':
      classes.push('font-medium');
      break;
    case 'semibold':
      classes.push('font-semibold');
      break;
    case 'bold':
      classes.push('font-bold');
      break;
    default:
      classes.push('font-normal');
  }

  // Text alignment
  switch (props.align) {
    case 'center':
      classes.push('text-center');
      break;
    case 'right':
      classes.push('text-right');
      break;
    case 'justify':
      classes.push('text-justify');
      break;
    default:
      classes.push('text-left');
  }

  // Color variants following Apple HIG color principles
  switch (props.color) {
    case 'secondary':
      classes.push('text-gray-600');
      break;
    case 'success':
      classes.push('text-green-600');
      break;
    case 'warning':
      classes.push('text-yellow-600');
      break;
    case 'danger':
      classes.push('text-red-600');
      break;
    case 'muted':
      classes.push('text-gray-500');
      break;
    default:
      classes.push('text-gray-900');
  }

  // Text modifications
  if (props.italic) classes.push('italic');
  if (props.underline) classes.push('underline');
  if (props.strikethrough) classes.push('line-through');
  if (props.truncate) classes.push('truncate');
  if (props.noWrap) classes.push('whitespace-nowrap');

  return classes.join(' ');
});

// Custom styles for system fonts
const customStyle = computed(() => {
  return {
    fontFamily: props.mono ? monoFontStack : systemFontStack,
  };
});
</script>

<style scoped>
/* Apple HIG: System font integration with antialiasing */
.font-system {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.font-mono {
  font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
