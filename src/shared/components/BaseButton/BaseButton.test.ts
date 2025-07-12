import { describe, it, expect, vi, beforeEach } from 'vitest';
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import { mountComponent } from '@/test/utils';

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
  const DEFAULT_LABEL = 'Test Button';
  const DEFAULT_ARIA_LABEL = 'Test Aria Label';
  const SLOT_CONTENT = 'Slot Content';
  const LEADING_ICON_TESTID = 'leading-icon';
  const TRAILING_ICON_TESTID = 'trailing-icon';
  const SLOT_ICON_TESTID = 'slot-icon';

  const SIZE_CLASSES_MAPPING = [
    ['small', ['px-3', 'py-1.5', 'text-sm']],
    ['medium', ['px-4', 'py-2']],
    ['large', ['px-6', 'py-3', 'text-lg']],
  ] as const;

  const VARIANT_CLASSES_MAPPING = [
    ['primary', ['font-semibold', 'shadow-sm']],
    ['destructive', ['font-medium']],
    ['link', ['underline-offset-4']],
    ['secondary', ['font-medium']],
    ['ghost', ['font-medium']],
  ] as const;

  const createBaseButtonFixture = (
    overrides: {
      props?: Partial<InstanceType<typeof BaseButton>['$props']>;
      slots?: Record<string, string>;
      attrs?: Record<string, unknown>;
    } = {}
  ) => {
    const defaultProps = {
      label: DEFAULT_LABEL,
      variant: 'secondary' as const,
      size: 'medium' as const,
      disabled: false,
      loading: false,
      fullWidth: false,
      pulse: false,
    };

    return mountComponent(BaseButton, {
      props: { ...defaultProps, ...overrides.props },
      slots: overrides.slots,
      attrs: overrides.attrs,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders with default props', () => {
      const wrapper = createBaseButtonFixture();

      const button = wrapper.find('button');
      expect(button.text()).toContain(DEFAULT_LABEL);
    });

    it('renders custom label', () => {
      const customLabel = 'Custom Button';
      const wrapper = createBaseButtonFixture({
        props: { label: customLabel },
      });

      const button = wrapper.find('button');
      expect(button.text()).toContain(customLabel);
    });

    it('renders slot content when no label provided', () => {
      const wrapper = createBaseButtonFixture({
        props: { label: undefined },
        slots: { default: SLOT_CONTENT },
      });

      const button = wrapper.find('button');
      expect(button.text()).toContain(SLOT_CONTENT);
    });

    it('applies full width class when fullWidth is true', () => {
      const wrapper = createBaseButtonFixture({
        props: { fullWidth: true },
      });

      const button = wrapper.find('button');
      expect(button.classes()).toContain('w-full');
    });
  });

  describe('Button Classes Generation', () => {
    it.each(SIZE_CLASSES_MAPPING)(
      'applies correct size classes for "%s"',
      (size, expectedClasses) => {
        const wrapper = createBaseButtonFixture({
          props: { size },
        });

        const button = wrapper.find('button');
        expectedClasses.forEach((cls: string) => {
          expect(button.classes()).toContain(cls);
        });
      }
    );

    it('applies pulse animation when pulse is true and not disabled', () => {
      const wrapper = createBaseButtonFixture({
        props: { pulse: true, disabled: false },
      });

      const button = wrapper.find('button');
      expect(button.classes()).toContain('animate-pulse');
    });

    it('does not apply pulse animation when disabled', () => {
      const wrapper = createBaseButtonFixture({
        props: { pulse: true, disabled: true },
      });

      const button = wrapper.find('button');
      expect(button.classes()).not.toContain('animate-pulse');
    });

    it.each(VARIANT_CLASSES_MAPPING)(
      'applies variant-specific classes for "%s"',
      (variant, expectedClasses) => {
        const wrapper = createBaseButtonFixture({
          props: { variant },
        });

        const button = wrapper.find('button');
        expectedClasses.forEach((cls: string) => {
          expect(button.classes()).toContain(cls);
        });
      }
    );
  });

  describe('Icon Handling', () => {
    it('renders leading icon slot', () => {
      const wrapper = createBaseButtonFixture({
        slots: {
          'icon-leading': `<svg data-testid="${LEADING_ICON_TESTID}">icon</svg>`,
        },
      });

      const icon = wrapper.find(`[data-testid="${LEADING_ICON_TESTID}"]`);
      expect(icon.exists()).toBe(true);
    });

    it('renders trailing icon slot', () => {
      const wrapper = createBaseButtonFixture({
        slots: {
          'icon-trailing': `<svg data-testid="${TRAILING_ICON_TESTID}">icon</svg>`,
        },
      });

      const icon = wrapper.find(`[data-testid="${TRAILING_ICON_TESTID}"]`);
      expect(icon.exists()).toBe(true);
    });

    it('applies correct label spacing with leading icon', () => {
      const wrapper = createBaseButtonFixture({
        props: { iconLeading: 'SomeIcon' },
      });

      const labelSpan = wrapper.find('span span');
      expect(labelSpan.classes()).toContain('ml-2');
    });

    it('applies correct label spacing with trailing icon', () => {
      const wrapper = createBaseButtonFixture({
        props: { iconTrailing: 'SomeIcon' },
      });

      const labelSpan = wrapper.find('span span');
      expect(labelSpan.classes()).toContain('mr-2');
    });
  });

  describe('Event Handling', () => {
    it('emits click event when clicked', async () => {
      const wrapper = createBaseButtonFixture();
      const button = wrapper.find('button');

      await button.trigger('click');

      expect(wrapper.emitted('click')).toBeTruthy();
      expect(wrapper.emitted('click')).toHaveLength(1);
    });

    it('does not emit click when disabled', async () => {
      const wrapper = createBaseButtonFixture({
        props: { disabled: true },
      });

      await wrapper.find('button').trigger('click');
      expect(wrapper.emitted('click')).toBeFalsy();
    });

    it('does not emit click when loading', async () => {
      const wrapper = createBaseButtonFixture({
        props: { loading: true },
      });

      await wrapper.find('button').trigger('click');
      expect(wrapper.emitted('click')).toBeFalsy();
    });

    it('emits click when neither disabled nor loading', async () => {
      const wrapper = createBaseButtonFixture({
        props: {
          disabled: false,
          loading: false,
        },
      });

      await wrapper.find('button').trigger('click');

      expect(wrapper.emitted('click')).toBeTruthy();
      expect(wrapper.emitted('click')).toHaveLength(1);
    });
  });

  describe('Accessibility', () => {
    it('sets aria-label from label prop', () => {
      const wrapper = createBaseButtonFixture();

      const button = wrapper.find('button');
      expect(button.attributes('aria-label')).toBe(DEFAULT_LABEL);
    });

    it('prefers explicit ariaLabel over label', () => {
      const wrapper = createBaseButtonFixture({
        props: { ariaLabel: DEFAULT_ARIA_LABEL },
      });

      const button = wrapper.find('button');
      expect(button.attributes('aria-label')).toBe(DEFAULT_ARIA_LABEL);
    });

    it('passes disabled state correctly', () => {
      const wrapper = createBaseButtonFixture({
        props: { disabled: true },
      });

      const button = wrapper.find('button');
      expect(button.attributes('disabled')).toBeDefined();
    });

    it('does not have disabled attribute when not disabled', () => {
      const wrapper = createBaseButtonFixture({
        props: { disabled: false },
      });

      const button = wrapper.find('button');
      expect(button.attributes('disabled')).toBeUndefined();
    });
  });

  describe('Props Integration', () => {
    it('integrates all props correctly', () => {
      const wrapper = createBaseButtonFixture({
        props: {
          label: 'Test',
          variant: 'primary',
          size: 'large',
          disabled: false,
          loading: false,
          ariaLabel: DEFAULT_ARIA_LABEL,
          fullWidth: true,
          pulse: true,
        },
      });

      const button = wrapper.find('button');
      expect(button.attributes('aria-label')).toBe(DEFAULT_ARIA_LABEL);
      expect(button.classes()).toContain('w-full');
      expect(button.classes()).toContain('px-6');
      expect(button.classes()).toContain('py-3');
      expect(button.classes()).toContain('animate-pulse');
      expect(button.classes()).toContain('font-semibold');
    });

    it('passes through additional attributes', () => {
      const customTestId = 'custom-button';
      const wrapper = createBaseButtonFixture({
        attrs: {
          'data-testid': customTestId,
          type: 'submit',
        },
      });

      const button = wrapper.find('button');
      expect(button.attributes('data-testid')).toBe(customTestId);
      expect(button.attributes('type')).toBe('submit');
    });
  });

  describe('Edge Cases', () => {
    it('handles both icon slots and icon props', () => {
      const wrapper = createBaseButtonFixture({
        props: { iconLeading: 'PropIcon' },
        slots: {
          'icon-leading': `<svg data-testid="${SLOT_ICON_TESTID}">slot</svg>`,
        },
      });

      expect(wrapper.find(`[data-testid="${SLOT_ICON_TESTID}"]`).exists()).toBe(
        true
      );
    });

    it('handles empty label with slot content', () => {
      const slotContent = 'Slot replaces empty label';
      const wrapper = createBaseButtonFixture({
        props: { label: '' },
        slots: { default: slotContent },
      });

      expect(wrapper.text()).toContain(slotContent);
    });
  });

  describe('Performance and Reactivity', () => {
    it('recomputes button classes based on props', async () => {
      const wrapper = createBaseButtonFixture({
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
      const testLabel = 'Integration Test';
      const wrapper = createBaseButtonFixture({
        props: { label: testLabel },
      });

      expect(wrapper.vm).toBeTruthy();
      expect(wrapper.element).toBeTruthy();

      expect(wrapper.props()).toEqual(
        expect.objectContaining({
          label: testLabel,
          variant: 'secondary',
          size: 'medium',
          disabled: false,
          loading: false,
          fullWidth: false,
          pulse: false,
        })
      );
    });

    it('maintains component lifecycle', async () => {
      const initialLabel = 'Lifecycle Test';
      const updatedLabel = 'Updated Label';
      const wrapper = createBaseButtonFixture({
        props: { label: initialLabel },
      });

      expect(wrapper.vm.$el).toBeTruthy();

      await wrapper.setProps({ label: updatedLabel });
      expect(wrapper.text()).toContain(updatedLabel);

      wrapper.unmount();
      expect(wrapper.vm).toBeTruthy();
    });
  });
});
