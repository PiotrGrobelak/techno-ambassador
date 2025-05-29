<template>
  <div :class="containerClasses">
    <!-- Label -->
    <label v-if="label" :for="inputId" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1" aria-label="Required"
        >*</span
      >
    </label>

    <!-- Input container with icon support -->
    <div class="relative">
      <!-- Leading icon -->
      <div
        v-if="iconLeading || $slots['icon-leading']"
        :class="iconLeadingContainerClasses"
      >
        <slot name="icon-leading">
          <component
            v-if="iconLeading"
            :is="iconLeading"
            :class="iconClasses"
          />
        </slot>
      </div>

      <!-- Main input -->
      <component
        :is="inputComponent"
        :id="inputId"
        v-model="stringValue"
        :class="inputClasses"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :type="inputType"
        :aria-label="ariaLabel || label"
        :aria-describedby="
          hasError
            ? `${inputId}-error`
            : hasHelper
              ? `${inputId}-helper`
              : undefined
        "
        :aria-invalid="hasError"
        v-bind="$attrs"
        @blur="handleBlur"
        @focus="handleFocus"
        @input="handleInput"
      />

      <!-- Trailing icon or clear button -->
      <div
        v-if="
          iconTrailing || $slots['icon-trailing'] || (clearable && modelValue)
        "
        :class="iconTrailingContainerClasses"
      >
        <slot name="icon-trailing">
          <!-- Clear button (Apple HIG: forgiveness principle) -->
          <button
            v-if="clearable && modelValue && !disabled"
            type="button"
            @click="clearInput"
            :class="clearButtonClasses"
            :aria-label="clearAriaLabel"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <component
            v-else-if="iconTrailing"
            :is="iconTrailing"
            :class="iconClasses"
          />
        </slot>
      </div>
    </div>

    <!-- Helper text or error message (Apple HIG: clear feedback) -->
    <div v-if="hasHelper || hasError" class="mt-1">
      <p v-if="hasError" :id="`${inputId}-error`" :class="errorClasses">
        {{ errorMessage }}
      </p>
      <p v-else-if="hasHelper" :id="`${inputId}-helper`" :class="helperClasses">
        {{ helperText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Password from 'primevue/password';

type InputVariant =
  | 'default'
  | 'search'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url';
type InputSize = 'small' | 'medium' | 'large';

interface Props {
  modelValue?: string | number;
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  variant?: InputVariant;
  size?: InputSize;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  clearable?: boolean;
  multiline?: boolean;
  rows?: number;
  iconLeading?: any;
  iconTrailing?: any;
  ariaLabel?: string;
  clearAriaLabel?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string | number): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'input', event: Event): void;
  (e: 'clear'): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  variant: 'default',
  size: 'medium',
  disabled: false,
  readonly: false,
  required: false,
  clearable: false,
  multiline: false,
  rows: 3,
  clearAriaLabel: 'Clear input',
});

const emit = defineEmits<Emits>();

// Generate unique ID for accessibility (Apple HIG: accessibility)
const inputId = useId();
const isFocused = ref(false);

// Convert modelValue to string for inputs (PrimeVue expects string)
const stringValue = computed({
  get: () => String(props.modelValue || ''),
  set: (value: string) => {
    if (props.variant === 'number') {
      const numValue = parseFloat(value);
      emit('update:modelValue', isNaN(numValue) ? value : numValue);
    } else {
      emit('update:modelValue', value);
    }
  },
});

// Computed properties following Apple HIG principles
const inputComponent = computed(() => {
  if (props.variant === 'password') return Password;
  if (props.multiline) return Textarea;
  return InputText;
});

const inputType = computed(() => {
  if (props.multiline || props.variant === 'password') return undefined;

  switch (props.variant) {
    case 'search':
      return 'search';
    case 'email':
      return 'email';
    case 'number':
      return 'number';
    case 'tel':
      return 'tel';
    case 'url':
      return 'url';
    default:
      return 'text';
  }
});

const hasError = computed(() => Boolean(props.errorMessage));
const hasHelper = computed(() => Boolean(props.helperText));

const containerClasses = computed(() => {
  const classes = ['space-y-1'];

  // Apple HIG: consistent spacing and organization
  switch (props.size) {
    case 'small':
      classes.push('text-sm');
      break;
    case 'large':
      classes.push('text-lg');
      break;
  }

  return classes.join(' ');
});

const labelClasses = computed(() => {
  const classes = ['block font-medium text-gray-900'];

  // Apple HIG: clear visual hierarchy
  switch (props.size) {
    case 'small':
      classes.push('text-sm');
      break;
    case 'large':
      classes.push('text-base');
      break;
    default:
      classes.push('text-sm');
  }

  if (props.disabled) {
    classes.push('text-gray-400');
  }

  return classes.join(' ');
});

const inputClasses = computed(() => {
  const classes = [
    'block w-full rounded-md border-0 shadow-sm ring-1 ring-inset transition-colors',
    'focus:ring-2 focus:ring-inset focus:ring-blue-600',
    'placeholder:text-gray-400',
  ];

  // Apple HIG: clear state indication
  if (hasError.value) {
    classes.push(
      'ring-red-300 text-red-900 placeholder:text-red-300 focus:ring-red-500'
    );
  } else if (props.disabled) {
    classes.push('ring-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed');
  } else if (props.readonly) {
    classes.push('ring-gray-200 bg-gray-50 text-gray-700');
  } else {
    classes.push('ring-gray-300 text-gray-900 focus:ring-blue-600');
  }

  // Size variants following Apple HIG spacing principles
  switch (props.size) {
    case 'small':
      classes.push('px-2.5 py-1.5 text-sm');
      break;
    case 'large':
      classes.push('px-4 py-3 text-lg');
      break;
    default:
      classes.push('px-3 py-2 text-sm');
  }

  // Icon padding adjustments
  if (props.iconLeading) {
    classes.push(
      props.size === 'small'
        ? 'pl-8'
        : props.size === 'large'
          ? 'pl-12'
          : 'pl-10'
    );
  }
  if (props.iconTrailing || (props.clearable && props.modelValue)) {
    classes.push(
      props.size === 'small'
        ? 'pr-8'
        : props.size === 'large'
          ? 'pr-12'
          : 'pr-10'
    );
  }

  return classes.join(' ');
});

const iconClasses = computed(() => {
  const size =
    props.size === 'small'
      ? 'w-4 h-4'
      : props.size === 'large'
        ? 'w-6 h-6'
        : 'w-5 h-5';
  const color = hasError.value
    ? 'text-red-400'
    : props.disabled
      ? 'text-gray-300'
      : 'text-gray-400';
  return `${size} ${color}`;
});

const iconLeadingContainerClasses = computed(() => {
  const position =
    props.size === 'small'
      ? 'left-2.5'
      : props.size === 'large'
        ? 'left-3'
        : 'left-3';
  return `absolute inset-y-0 ${position} flex items-center pointer-events-none`;
});

const iconTrailingContainerClasses = computed(() => {
  const position =
    props.size === 'small'
      ? 'right-2.5'
      : props.size === 'large'
        ? 'right-3'
        : 'right-3';
  return `absolute inset-y-0 ${position} flex items-center`;
});

const clearButtonClasses = computed(() => {
  return [
    'rounded-full p-0.5 text-gray-400 hover:text-gray-600 focus:outline-none',
    'focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
    'transition-colors',
  ].join(' ');
});

const errorClasses = computed(() => {
  const classes = ['text-red-600'];
  if (props.size === 'small') classes.push('text-xs');
  else classes.push('text-sm');
  return classes.join(' ');
});

const helperClasses = computed(() => {
  const classes = ['text-gray-600'];
  if (props.size === 'small') classes.push('text-xs');
  else classes.push('text-sm');
  return classes.join(' ');
});

// Event handlers following Apple HIG feedback principles
function handleBlur(event: FocusEvent): void {
  isFocused.value = false;
  emit('blur', event);
}

function handleFocus(event: FocusEvent): void {
  isFocused.value = true;
  emit('focus', event);
}

function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
  emit('input', event);
}

// Apple HIG: forgiveness - easy way to clear input
function clearInput(): void {
  emit('update:modelValue', '');
  emit('clear');
}
</script>
