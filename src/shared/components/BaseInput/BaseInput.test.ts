import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VueWrapper } from '@vue/test-utils';
import BaseInput from './BaseInput.vue';
import { mountComponent } from '../../../test/utils';

// Mock Vue's useId to return unique IDs in tests
let idCounter = 0;
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    useId: () => `test-id-${++idCounter}`,
  };
});

// Mock PrimeVue components with realistic behavior
vi.mock('primevue/inputtext', () => ({
  default: {
    name: 'InputText',
    template: `
      <input 
        v-bind="$attrs" 
        :class="$attrs.class"
        :disabled="disabled"
        :readonly="readonly"
        :type="type || 'text'"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
    `,
    props: {
      modelValue: [String, Number],
      disabled: Boolean,
      readonly: Boolean,
      type: String,
    },
    emits: ['update:modelValue', 'blur', 'focus'],
    inheritAttrs: false,
  },
}));

vi.mock('primevue/textarea', () => ({
  default: {
    name: 'Textarea',
    template: `
      <textarea 
        v-bind="$attrs" 
        :class="$attrs.class"
        :disabled="disabled"
        :readonly="readonly"
        :rows="rows"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
    `,
    props: {
      modelValue: [String, Number],
      disabled: Boolean,
      readonly: Boolean,
      rows: Number,
    },
    emits: ['update:modelValue', 'blur', 'focus'],
    inheritAttrs: false,
  },
}));

vi.mock('primevue/password', () => ({
  default: {
    name: 'Password',
    template: `
      <input 
        v-bind="$attrs" 
        :class="$attrs.class"
        :disabled="disabled"
        :readonly="readonly"
        type="password"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
    `,
    props: {
      modelValue: [String, Number],
      disabled: Boolean,
      readonly: Boolean,
    },
    emits: ['update:modelValue', 'blur', 'focus'],
    inheritAttrs: false,
  },
}));

describe('BaseInput', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset ID counter for consistent test results
    idCounter = 0;
  });

  describe('Component Rendering', () => {
    it('renders with default props', () => {
      wrapper = mountComponent(BaseInput);

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('input').exists()).toBe(true);
    });

    it('renders label when provided', () => {
      wrapper = mountComponent(BaseInput, {
        props: { label: 'Email Address' },
      });

      const label = wrapper.find('label');
      expect(label.exists()).toBe(true);
      expect(label.text()).toContain('Email Address');
    });

    it('renders required asterisk when required is true', () => {
      wrapper = mountComponent(BaseInput, {
        props: {
          label: 'Required Field',
          required: true,
        },
      });

      const asterisk = wrapper.find('span[aria-label="Required"]');
      expect(asterisk.exists()).toBe(true);
      expect(asterisk.text()).toBe('*');
    });

    it('renders placeholder correctly', () => {
      wrapper = mountComponent(BaseInput, {
        props: { placeholder: 'Enter your email' },
      });

      const input = wrapper.find('input');
      expect(input.attributes('placeholder')).toBe('Enter your email');
    });

    it('renders helper text when provided', () => {
      wrapper = mountComponent(BaseInput, {
        props: { helperText: 'This is helpful information' },
      });

      const helperText = wrapper.find('p');
      expect(helperText.text()).toBe('This is helpful information');
      expect(helperText.classes()).toContain('text-gray-600');
    });

    it('renders error message when provided', () => {
      wrapper = mountComponent(BaseInput, {
        props: { errorMessage: 'This field is required' },
      });

      const errorText = wrapper.find('p');
      expect(errorText.text()).toBe('This field is required');
      expect(errorText.classes()).toContain('text-red-600');
    });

    it('prioritizes error message over helper text', () => {
      wrapper = mountComponent(BaseInput, {
        props: {
          helperText: 'Helper text',
          errorMessage: 'Error message',
        },
      });

      const paragraphs = wrapper.findAll('p');
      expect(paragraphs).toHaveLength(1);
      expect(paragraphs[0].text()).toBe('Error message');
    });
  });

  describe('Input Component Selection', () => {
    it('uses InputText by default', () => {
      wrapper = mountComponent(BaseInput);
      expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    });

    it('uses Password component for password variant', () => {
      wrapper = mountComponent(BaseInput, {
        props: { variant: 'password' },
      });
      expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    });

    it('uses Textarea component when multiline is true', () => {
      wrapper = mountComponent(BaseInput, {
        props: { multiline: true },
      });
      expect(wrapper.find('textarea').exists()).toBe(true);
    });

    it('uses Textarea with correct rows when multiline', () => {
      wrapper = mountComponent(BaseInput, {
        props: {
          multiline: true,
          rows: 5,
        },
      });
      const textarea = wrapper.find('textarea');
      expect(textarea.attributes('rows')).toBe('5');
    });
  });

  describe('Input Type Mapping', () => {
    it.each([
      ['search', 'search'],
      ['email', 'email'],
      ['number', 'number'],
      ['tel', 'tel'],
      ['url', 'url'],
      ['default', 'text'],
    ])('maps variant "%s" to input type "%s"', (variant, expectedType) => {
      wrapper = mountComponent(BaseInput, {
        props: { variant: variant as any },
      });

      const input = wrapper.find('input');
      expect(input.attributes('type')).toBe(expectedType);
    });

    it('does not set type for password variant (handled by Password component)', () => {
      wrapper = mountComponent(BaseInput, {
        props: { variant: 'password' },
      });

      // Password component handles its own type
      expect(wrapper.vm.inputType).toBeUndefined();
    });

    it('does not set type for multiline variant (textarea)', () => {
      wrapper = mountComponent(BaseInput, {
        props: { multiline: true },
      });

      expect(wrapper.vm.inputType).toBeUndefined();
    });
  });

  describe('Value Handling and Two-Way Binding', () => {
    it('displays initial value correctly', () => {
      wrapper = mountComponent(BaseInput, {
        props: { modelValue: 'Initial Value' },
      });

      const input = wrapper.find('input');
      expect(input.element.value).toBe('Initial Value');
    });

    it('emits update:modelValue when input changes', async () => {
      wrapper = mountComponent(BaseInput);

      const input = wrapper.find('input');
      await input.setValue('New Value');

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeTruthy();
      expect(emitted?.[0]).toEqual(['New Value']);
    });

    it('handles number variant correctly', async () => {
      wrapper = mountComponent(BaseInput, {
        props: { variant: 'number' },
      });

      const input = wrapper.find('input');
      await input.setValue('123.45');

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeTruthy();
      expect(emitted?.[0]).toEqual([123.45]);
    });

    it('handles invalid number input', async () => {
      wrapper = mountComponent(BaseInput, {
        props: { variant: 'number' },
      });

      const input = wrapper.find('input');
      await input.setValue('abc');

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeTruthy();
      expect(emitted?.[0]).toEqual(['']); // Browser filters out invalid characters in number inputs
    });

    it('converts non-string values to string for display', () => {
      wrapper = mountComponent(BaseInput, {
        props: { modelValue: 42 },
      });

      expect(wrapper.vm.stringValue).toBe('42');
    });

    it('handles empty/null values', () => {
      wrapper = mountComponent(BaseInput, {
        props: { modelValue: null },
      });

      expect(wrapper.vm.stringValue).toBe('');
    });
  });

  describe('Size Variants and Styling', () => {
    it.each([
      ['small', 'px-2.5', 'py-1.5', 'text-sm'],
      ['medium', 'px-3', 'py-2', 'text-sm'],
      ['large', 'px-4', 'py-3', 'text-lg'],
    ])('applies correct classes for %s size', (size, paddingX, paddingY, textSize) => {
      wrapper = mountComponent(BaseInput, {
        props: { size: size as any },
      });

      const input = wrapper.find('input');
      expect(input.classes()).toContain(paddingX);
      expect(input.classes()).toContain(paddingY);
      expect(input.classes()).toContain(textSize);
    });
  });

  describe('State Handling', () => {
    it('applies disabled styling when disabled', () => {
      wrapper = mountComponent(BaseInput, {
        props: { disabled: true },
      });

      const input = wrapper.find('input');
      expect(input.attributes('disabled')).toBeDefined();
      expect(input.classes()).toContain('ring-gray-200');
      expect(input.classes()).toContain('bg-gray-50');
      expect(input.classes()).toContain('cursor-not-allowed');
    });

    it('applies readonly styling when readonly', () => {
      wrapper = mountComponent(BaseInput, {
        props: { readonly: true },
      });

      const input = wrapper.find('input');
      expect(input.attributes('readonly')).toBeDefined();
      expect(input.classes()).toContain('ring-gray-200');
      expect(input.classes()).toContain('bg-gray-50');
    });

    it('applies error styling when error message is provided', () => {
      wrapper = mountComponent(BaseInput, {
        props: { errorMessage: 'Error occurred' },
      });

      const input = wrapper.find('input');
      expect(input.classes()).toContain('ring-red-300');
      expect(input.classes()).toContain('text-red-900');
      expect(input.classes()).toContain('focus:ring-red-500');
    });

    it('applies normal styling when no error', () => {
      wrapper = mountComponent(BaseInput);

      const input = wrapper.find('input');
      expect(input.classes()).toContain('ring-gray-300');
      expect(input.classes()).toContain('text-gray-900');
      expect(input.classes()).toContain('focus:ring-blue-600');
    });
  });

  describe('Icon Handling', () => {
    it('renders leading icon slot', () => {
      wrapper = mountComponent(BaseInput, {
        slots: {
          'icon-leading': '<svg data-testid="leading-icon">icon</svg>',
        },
      });

      expect(wrapper.find('[data-testid="leading-icon"]').exists()).toBe(true);
    });

    it('renders trailing icon slot', () => {
      wrapper = mountComponent(BaseInput, {
        slots: {
          'icon-trailing': '<svg data-testid="trailing-icon">icon</svg>',
        },
      });

      expect(wrapper.find('[data-testid="trailing-icon"]').exists()).toBe(true);
    });

    it.each([
      ['iconLeading', 'pl-10'],
      ['iconTrailing', 'pr-10'],
    ])('adjusts padding for %s', (iconProp, expectedClass) => {
      wrapper = mountComponent(BaseInput, {
        props: { [iconProp]: 'TestIcon' },
      });

      const input = wrapper.find('input');
      expect(input.classes()).toContain(expectedClass);
    });
  });

  describe('Clear Button Functionality', () => {
    it('shows clear button when clearable and has value', () => {
      wrapper = mountComponent(BaseInput, {
        props: {
          clearable: true,
          modelValue: 'Some value',
        },
      });

      const clearButton = wrapper.find('button[aria-label="Clear input"]');
      expect(clearButton.exists()).toBe(true);
    });

    it('does not show clear button when no value', () => {
      wrapper = mountComponent(BaseInput, {
        props: {
          clearable: true,
          modelValue: '',
        },
      });

      const clearButton = wrapper.find('button');
      expect(clearButton.exists()).toBe(false);
    });

    it('does not show clear button when disabled', () => {
      wrapper = mountComponent(BaseInput, {
        props: {
          clearable: true,
          modelValue: 'Some value',
          disabled: true,
        },
      });

      const clearButton = wrapper.find('button');
      expect(clearButton.exists()).toBe(false);
    });

    it('emits clear event when clear button clicked', async () => {
      wrapper = mountComponent(BaseInput, {
        props: {
          clearable: true,
          modelValue: 'Some value',
        },
      });

      const clearButton = wrapper.find('button');
      await clearButton.trigger('click');

      expect(wrapper.emitted('clear')).toBeTruthy();
      const updateEmitted = wrapper.emitted('update:modelValue');
      expect(updateEmitted).toBeTruthy();
      expect(updateEmitted?.[0]).toEqual(['']);
    });

    it('uses custom clear aria label', () => {
      wrapper = mountComponent(BaseInput, {
        props: {
          clearable: true,
          modelValue: 'Some value',
          clearAriaLabel: 'Custom clear label',
        },
      });

      const clearButton = wrapper.find('button');
      expect(clearButton.attributes('aria-label')).toBe('Custom clear label');
    });

    it('adjusts input padding when clearable and has value', () => {
      wrapper = mountComponent(BaseInput, {
        props: {
          clearable: true,
          modelValue: 'Some value',
        },
      });

      const input = wrapper.find('input');
      expect(input.classes()).toContain('pr-10');
    });
  });

  describe('Event Handling', () => {
    it('emits blur event when input loses focus', async () => {
      wrapper = mountComponent(BaseInput);

      const input = wrapper.find('input');
      await input.trigger('blur');

      expect(wrapper.emitted('blur')).toBeTruthy();
      expect(wrapper.emitted('blur')).toHaveLength(1);
    });

    it('emits focus event when input gains focus', async () => {
      wrapper = mountComponent(BaseInput);

      const input = wrapper.find('input');
      await input.trigger('focus');

      expect(wrapper.emitted('focus')).toBeTruthy();
      expect(wrapper.emitted('focus')).toHaveLength(1);
    });

    it('emits input event on input change', async () => {
      wrapper = mountComponent(BaseInput);

      const input = wrapper.find('input');
      await input.setValue('test input');

      expect(wrapper.emitted('input')).toBeTruthy();
    });

    it('updates internal focus state on blur/focus', async () => {
      wrapper = mountComponent(BaseInput);

      const input = wrapper.find('input');

      await input.trigger('focus');
      expect(wrapper.vm.isFocused).toBe(true);

      await input.trigger('blur');
      expect(wrapper.vm.isFocused).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('generates unique input ID and associates with label', () => {
      wrapper = mountComponent(BaseInput, {
        props: { label: 'Email Address' },
      });

      const input = wrapper.find('input');
      const label = wrapper.find('label');

      expect(input.attributes('id')).toBeTruthy();
      expect(label.attributes('for')).toBe(input.attributes('id'));
      expect(input.attributes('aria-label')).toBe('Email Address');
    });

    it('handles aria-describedby for helper text and errors', () => {
      // Test helper text
      wrapper = mountComponent(BaseInput, {
        props: { helperText: 'Helpful information' },
      });

      let input = wrapper.find('input');
      let inputId = input.attributes('id');
      expect(input.attributes('aria-describedby')).toBe(`${inputId}-helper`);
      expect(wrapper.find(`#${inputId}-helper`).exists()).toBe(true);

      // Test error message (should override helper)
      wrapper = mountComponent(BaseInput, {
        props: { 
          helperText: 'Helpful information',
          errorMessage: 'Error message' 
        },
      });

      input = wrapper.find('input');
      inputId = input.attributes('id');
      expect(input.attributes('aria-describedby')).toBe(`${inputId}-error`);
      expect(wrapper.find(`#${inputId}-error`).exists()).toBe(true);
    });

    it.each([
      [{ errorMessage: 'Error' }, 'true'],
      [{}, 'false'],
    ])('sets aria-invalid correctly', (props, expectedValue) => {
      wrapper = mountComponent(BaseInput, { props });
      
      const input = wrapper.find('input');
      expect(input.attributes('aria-invalid')).toBe(expectedValue);
    });

    it('sets required attribute when required is true', () => {
      wrapper = mountComponent(BaseInput, {
        props: { required: true },
      });

      const input = wrapper.find('input');
      expect(input.attributes('required')).toBeDefined();
    });
  });

  describe('Props Integration', () => {
    it('integrates all props correctly', () => {
      wrapper = mountComponent(BaseInput, {
        props: {
          label: 'Email Address',
          placeholder: 'Enter email',
          helperText: 'We will never share your email',
          variant: 'email',
          size: 'large',
          disabled: false,
          readonly: false,
          required: true,
          clearable: true,
          ariaLabel: 'Email input field',
          modelValue: 'test@example.com',
        },
      });

      const input = wrapper.find('input');
      const label = wrapper.find('label');

      // Check input attributes
      expect(input.attributes('type')).toBe('email');
      expect(input.attributes('placeholder')).toBe('Enter email');
      expect(input.attributes('aria-label')).toBe('Email input field');
      expect(input.attributes('required')).toBeDefined();
      expect(input.element.value).toBe('test@example.com');

      // Check styling
      expect(input.classes()).toContain('px-4'); // large size
      expect(input.classes()).toContain('py-3'); // large size
      expect(input.classes()).toContain('pr-12'); // clearable spacing

      // Check label
      expect(label.text()).toContain('Email Address');
      expect(label.text()).toContain('*'); // required asterisk

      // Check helper text
      expect(wrapper.text()).toContain('We will never share your email');
    });
  });
});
