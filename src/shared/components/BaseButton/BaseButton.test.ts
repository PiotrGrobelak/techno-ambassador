import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VueWrapper } from '@vue/test-utils';
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import { mountComponent } from '@/test/utils';

// Mock PrimeVue Button component with more realistic behavior
vi.mock('primevue/button', () => ({
  default: {
    name: 'Button',
    template: `
      <button 
        v-bind="$attrs" 
        :class="$attrs.class"
        :disabled="disabled" 
        :aria-label="$attrs['aria-label']"
        @click="$emit('click', $event)"
      >
        <slot />
      </button>
    `,
    props: {
      severity: String,
      outlined: Boolean,
      text: Boolean,
      disabled: Boolean,
      loading: Boolean,
      size: String,
    },
    emits: ['click'],
    inheritAttrs: false,
  },
}));

describe('BaseButton', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders with default props', () => {
      wrapper = mountComponent(BaseButton);

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('button').exists()).toBe(true);
    });

    it('renders label correctly', () => {
      wrapper = mountComponent(BaseButton, {
        props: { label: 'Test Button' },
      });

      expect(wrapper.text()).toContain('Test Button');
    });

    it('renders slot content when no label provided', () => {
      wrapper = mountComponent(BaseButton, {
        slots: { default: 'Slot Content' },
      });

      expect(wrapper.text()).toContain('Slot Content');
    });

    it('applies full width class when fullWidth is true', () => {
      wrapper = mountComponent(BaseButton, {
        props: { fullWidth: true },
      });

      const button = wrapper.find('button');
      expect(button.classes()).toContain('w-full');
    });
  });

  describe('Computed Properties - Severity Mapping', () => {
    it.each([
      ['primary', 'primary'],
      ['destructive', 'danger'],
      ['secondary', 'secondary'],
      ['ghost', 'secondary'],
      ['link', 'info'],
    ])('maps variant "%s" to severity "%s"', (variant, expectedSeverity) => {
      wrapper = mountComponent(BaseButton, {
        props: { variant: variant },
      });

      // Test the computed property directly through component instance
      expect(wrapper.vm.computedSeverity).toBe(expectedSeverity);
    });
  });

  describe('Computed Properties - Outlined and Text', () => {
    it.each([
      ['secondary', true, false],
      ['ghost', true, true],
      ['link', false, true],
      ['primary', false, false],
      ['destructive', false, false],
    ])(
      'variant "%s" sets outlined=%s and text=%s',
      (variant, expectedOutlined, expectedText) => {
        wrapper = mountComponent(BaseButton, {
          props: { variant: variant },
        });

        // Test computed properties directly
        expect(wrapper.vm.computedOutlined).toBe(expectedOutlined);
        expect(wrapper.vm.computedText).toBe(expectedText);
      }
    );
  });

  describe('Button Classes Generation', () => {
    it('applies correct size classes', () => {
      const sizeTests: Array<[string, string[]]> = [
        ['small', ['px-3', 'py-1.5', 'text-sm']],
        ['medium', ['px-4', 'py-2']],
        ['large', ['px-6', 'py-3', 'text-lg']],
      ];

      sizeTests.forEach(([size, expectedClasses]) => {
        wrapper = mountComponent(BaseButton, {
          props: { size: size },
        });

        const button = wrapper.find('button');
        expectedClasses.forEach((cls: string) => {
          expect(button.classes()).toContain(cls);
        });
      });
    });

    it('applies pulse animation when pulse is true and not disabled', () => {
      wrapper = mountComponent(BaseButton, {
        props: { pulse: true, disabled: false },
      });

      const button = wrapper.find('button');
      expect(button.classes()).toContain('animate-pulse');
    });

    it('does not apply pulse animation when disabled', () => {
      wrapper = mountComponent(BaseButton, {
        props: { pulse: true, disabled: true },
      });

      const button = wrapper.find('button');
      expect(button.classes()).not.toContain('animate-pulse');
    });

    it('applies variant-specific classes', () => {
      const variantTests: Array<[string, string[]]> = [
        ['primary', ['font-semibold', 'shadow-sm']],
        ['destructive', ['font-medium']],
        ['link', ['underline-offset-4']],
        ['secondary', ['font-medium']],
        ['ghost', ['font-medium']],
      ];

      variantTests.forEach(([variant, expectedClasses]) => {
        wrapper = mountComponent(BaseButton, {
          props: { variant: variant },
        });

        const button = wrapper.find('button');
        expectedClasses.forEach((cls: string) => {
          expect(button.classes()).toContain(cls);
        });
      });
    });
  });

  describe('Icon Handling', () => {
    it('renders leading icon slot', () => {
      wrapper = mountComponent(BaseButton, {
        props: { label: 'Button' },
        slots: {
          'icon-leading': '<svg data-testid="leading-icon">icon</svg>',
        },
      });

      expect(wrapper.find('[data-testid="leading-icon"]').exists()).toBe(true);
    });

    it('renders trailing icon slot', () => {
      wrapper = mountComponent(BaseButton, {
        props: { label: 'Button' },
        slots: {
          'icon-trailing': '<svg data-testid="trailing-icon">icon</svg>',
        },
      });

      expect(wrapper.find('[data-testid="trailing-icon"]').exists()).toBe(true);
    });

    it('applies correct label spacing with leading icon', () => {
      wrapper = mountComponent(BaseButton, {
        props: {
          label: 'Button',
          iconLeading: 'SomeIcon',
        },
      });

      const labelSpan = wrapper.find('span span');
      expect(labelSpan.classes()).toContain('ml-2');
    });

    it('applies correct label spacing with trailing icon', () => {
      wrapper = mountComponent(BaseButton, {
        props: {
          label: 'Button',
          iconTrailing: 'SomeIcon',
        },
      });

      const labelSpan = wrapper.find('span span');
      expect(labelSpan.classes()).toContain('mr-2');
    });

    it('generates correct icon classes for different sizes', () => {
      const sizeIconTests: Array<[string, string]> = [
        ['small', 'w-4 h-4'],
        ['medium', 'w-5 h-5'],
        ['large', 'w-6 h-6'],
      ];

      sizeIconTests.forEach(([size, expectedSize]) => {
        wrapper = mountComponent(BaseButton, {
          props: {
            size: size,
            iconLeading: 'TestIcon',
            label: 'Button',
          },
        });

        // Access component instance to check computed properties
        const vm = wrapper.vm;
        expect(vm.iconLeadingClasses).toContain(expectedSize);
        expect(vm.iconLeadingClasses).toContain('mr-2'); // spacing for label
      });
    });

    it('does not add icon spacing when no label provided', () => {
      wrapper = mountComponent(BaseButton, {
        props: {
          size: 'medium',
          iconLeading: 'TestIcon',
          // no label
        },
      });

      const vm = wrapper.vm;
      expect(vm.iconLeadingClasses).not.toContain('mr-2');
      expect(vm.iconLeadingClasses).toContain('w-5 h-5');
    });
  });

  describe('Event Handling', () => {
    it('emits click event when clicked', async () => {
      wrapper = mountComponent(BaseButton, {
        props: { label: 'Click me' },
      });

      await wrapper.find('button').trigger('click');

      expect(wrapper.emitted('click')).toBeTruthy();
      expect(wrapper.emitted('click')).toHaveLength(1);
    });

    it('does not emit click when disabled', async () => {
      wrapper = mountComponent(BaseButton, {
        props: {
          label: 'Click me',
          disabled: true,
        },
      });

      // Test the handleClick method directly
      const vm = wrapper.vm;
      const mockEvent = new Event('click');

      vm.handleClick(mockEvent);

      // Should not emit because disabled is true
      expect(wrapper.emitted('click')).toBeFalsy();
    });

    it('does not emit click when loading', async () => {
      wrapper = mountComponent(BaseButton, {
        props: {
          label: 'Click me',
          loading: true,
        },
      });

      const vm = wrapper.vm;
      const mockEvent = new Event('click');

      vm.handleClick(mockEvent);

      // Should not emit because loading is true
      expect(wrapper.emitted('click')).toBeFalsy();
    });

    it('emits click when neither disabled nor loading', async () => {
      wrapper = mountComponent(BaseButton, {
        props: {
          label: 'Click me',
          disabled: false,
          loading: false,
        },
      });

      // Instead of testing the internal method, test the actual click behavior
      await wrapper.find('button').trigger('click');

      // Should emit the click event
      expect(wrapper.emitted('click')).toBeTruthy();
      expect(wrapper.emitted('click')).toHaveLength(1);
    });
  });

  describe('Accessibility', () => {
    it('sets aria-label from label prop', () => {
      wrapper = mountComponent(BaseButton, {
        props: { label: 'Test Button' },
      });

      const button = wrapper.find('button');
      expect(button.attributes('aria-label')).toBe('Test Button');
    });

    it('prefers explicit ariaLabel over label', () => {
      wrapper = mountComponent(BaseButton, {
        props: {
          label: 'Test Button',
          ariaLabel: 'Custom Aria Label',
        },
      });

      const button = wrapper.find('button');
      expect(button.attributes('aria-label')).toBe('Custom Aria Label');
    });

    it('passes disabled state correctly', () => {
      wrapper = mountComponent(BaseButton, {
        props: { disabled: true },
      });

      const button = wrapper.find('button');
      expect(button.attributes('disabled')).toBeDefined();
    });

    it('does not have disabled attribute when not disabled', () => {
      wrapper = mountComponent(BaseButton, {
        props: { disabled: false },
      });

      const button = wrapper.find('button');
      expect(button.attributes('disabled')).toBeUndefined();
    });
  });

  describe('Props Integration', () => {
    it('integrates all props correctly', () => {
      wrapper = mountComponent(BaseButton, {
        props: {
          label: 'Test',
          variant: 'primary',
          size: 'large',
          disabled: false,
          loading: false,
          ariaLabel: 'Test Aria',
          fullWidth: true,
          pulse: true,
        },
      });

      // Test computed properties
      expect(wrapper.vm.computedSeverity).toBe('primary');
      expect(wrapper.vm.computedOutlined).toBe(false);
      expect(wrapper.vm.computedText).toBe(false);

      // Test button attributes and classes
      const button = wrapper.find('button');
      expect(button.attributes('aria-label')).toBe('Test Aria');
      expect(button.classes()).toContain('w-full');
      expect(button.classes()).toContain('px-6');
      expect(button.classes()).toContain('py-3');
      expect(button.classes()).toContain('animate-pulse');
      expect(button.classes()).toContain('font-semibold');
    });

    it('passes through additional attributes', () => {
      wrapper = mountComponent(BaseButton, {
        props: { label: 'Test' },
        attrs: {
          'data-testid': 'custom-button',
          type: 'submit',
        },
      });

      const button = wrapper.find('button');
      expect(button.attributes('data-testid')).toBe('custom-button');
      expect(button.attributes('type')).toBe('submit');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined variant gracefully', () => {
      wrapper = mountComponent(BaseButton, {
        props: { variant: undefined },
      });

      // Should fall back to default 'secondary'
      expect(wrapper.vm.computedSeverity).toBe('secondary');
    });

    it('handles both icon slots and icon props', () => {
      wrapper = mountComponent(BaseButton, {
        props: {
          label: 'Button',
          iconLeading: 'PropIcon',
        },
        slots: {
          'icon-leading': '<svg data-testid="slot-icon">slot</svg>',
        },
      });

      // Slot should take precedence over prop
      expect(wrapper.find('[data-testid="slot-icon"]').exists()).toBe(true);
    });

    it('handles empty label with slot content', () => {
      wrapper = mountComponent(BaseButton, {
        props: { label: '' },
        slots: { default: 'Slot replaces empty label' },
      });

      expect(wrapper.text()).toContain('Slot replaces empty label');
    });

    it('works without any props', () => {
      wrapper = mountComponent(BaseButton);

      expect(wrapper.exists()).toBe(true);
      expect(() => wrapper.vm).not.toThrow();

      // Should use default values
      expect(wrapper.vm.computedSeverity).toBe('secondary');
      expect(wrapper.vm.computedOutlined).toBe(true);
      expect(wrapper.vm.computedText).toBe(false);
    });
  });

  describe('Performance and Reactivity', () => {
    it('recomputes classes when props change', async () => {
      wrapper = mountComponent(BaseButton, {
        props: { variant: 'secondary' },
      });

      expect(wrapper.vm.computedSeverity).toBe('secondary');

      await wrapper.setProps({ variant: 'primary' });

      expect(wrapper.vm.computedSeverity).toBe('primary');
    });

    it('recomputes icon classes when size changes', async () => {
      wrapper = mountComponent(BaseButton, {
        props: {
          size: 'small',
          iconLeading: 'TestIcon',
          label: 'Button',
        },
      });

      expect(wrapper.vm.iconLeadingClasses).toContain('w-4 h-4');

      await wrapper.setProps({ size: 'large' });

      expect(wrapper.vm.iconLeadingClasses).toContain('w-6 h-6');
    });

    it('recomputes button classes based on props', async () => {
      wrapper = mountComponent(BaseButton, {
        props: { size: 'small' },
      });

      let button = wrapper.find('button');
      expect(button.classes()).toContain('px-3');
      expect(button.classes()).toContain('py-1.5');

      await wrapper.setProps({ size: 'large' });

      button = wrapper.find('button');
      expect(button.classes()).toContain('px-6');
      expect(button.classes()).toContain('py-3');
    });
  });

  describe('Component Integration', () => {
    it('properly integrates with Vue Test Utils', () => {
      wrapper = mountComponent(BaseButton, {
        props: { label: 'Integration Test' },
      });

      // Test component existence
      expect(wrapper.vm).toBeTruthy();
      expect(wrapper.element).toBeTruthy();

      // Test props reactivity
      expect(wrapper.props()).toEqual(
        expect.objectContaining({
          label: 'Integration Test',
          variant: 'secondary', // default value
          size: 'medium', // default value
          disabled: false, // default value
          loading: false, // default value
          fullWidth: false, // default value
          pulse: false, // default value
        })
      );
    });

    it('maintains component lifecycle', async () => {
      wrapper = mountComponent(BaseButton, {
        props: { label: 'Lifecycle Test' },
      });

      // Component should be mounted
      expect(wrapper.vm.$el).toBeTruthy();

      // Should handle prop updates
      await wrapper.setProps({ label: 'Updated Label' });
      expect(wrapper.text()).toContain('Updated Label');

      // Should handle unmount
      wrapper.unmount();
      expect(wrapper.vm).toBeTruthy(); // vm still exists after unmount
    });
  });
});
