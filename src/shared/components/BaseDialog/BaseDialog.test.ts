import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VueWrapper } from '@vue/test-utils';
import BaseDialog from './BaseDialog.vue';
import { mountComponent } from '@/test/utils';

// Mock PrimeVue Dialog component
vi.mock('primevue/dialog', () => ({
  default: {
    name: 'Dialog',
    template: `
      <div 
        data-testid="dialog"
        :class="$attrs.class"
        :style="$attrs.style"
      >
        <header data-testid="dialog-header">
          <slot name="header"></slot>
        </header>
        <main data-testid="dialog-content">
          <slot></slot>
        </main>
        <footer data-testid="dialog-footer">
          <slot name="footer"></slot>
        </footer>
      </div>
    `,
    props: {
      visible: Boolean,
      modal: Boolean,
      closable: Boolean,
      draggable: Boolean,
      pt: Object,
    },
    emits: ['update:visible'],
    inheritAttrs: false,
  },
}));

// Mock BaseButton component
vi.mock('@/shared/components/BaseButton/BaseButton.vue', () => ({
  default: {
    name: 'BaseButton',
    template: `
      <button 
        data-testid="base-button"
        :class="variant"
        @click="$emit('click')"
      >
        {{ label }}
      </button>
    `,
    props: {
      variant: String,
      label: String,
    },
    emits: ['click'],
  },
}));

describe('BaseDialog', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Basic Dialog Properties', () => {
    it('should render with default properties', () => {
      wrapper = mountComponent(BaseDialog);

      // Check default computed values
      expect(wrapper.vm.showCancel).toBe(true);
      expect(wrapper.vm.showConfirm).toBe(true);
      expect(wrapper.vm.cancelText).toBe('Cancel');
      expect(wrapper.vm.confirmText).toBe('OK');
      expect(wrapper.vm.closable).toBe(true);
    });

    it('should apply custom header text', () => {
      wrapper = mountComponent(BaseDialog, {
        props: { header: 'Custom Dialog Title' },
      });

      expect(wrapper.props('header')).toBe('Custom Dialog Title');
    });

    it('should apply custom button text', () => {
      wrapper = mountComponent(BaseDialog, {
        props: {
          cancelText: 'Custom Cancel',
          confirmText: 'Custom Confirm',
        },
      });

      expect(wrapper.vm.cancelText).toBe('Custom Cancel');
      expect(wrapper.vm.confirmText).toBe('Custom Confirm');

      const buttons = wrapper.findAllComponents({ name: 'BaseButton' });
      const buttonLabels = buttons.map((btn) => btn.props('label'));
      expect(buttonLabels).toContain('Custom Cancel');
      expect(buttonLabels).toContain('Custom Confirm');
    });
  });

  describe('2. Dialog Styling', () => {
    it('should apply correct default width styling', () => {
      wrapper = mountComponent(BaseDialog);

      const dialogStyle = wrapper.vm.dialogStyle;
      expect(dialogStyle.width).toBe('90vw');
      expect(dialogStyle.maxWidth).toBe('500px');
    });

    it('should have correct default classes', () => {
      wrapper = mountComponent(BaseDialog);

      // Check that the dialog has the correct base classes
      const dialog = wrapper.findComponent({ name: 'Dialog' });
      expect(dialog.classes()).toContain('base-dialog-v2');
      expect(dialog.classes()).toContain('rounded-xl');
      expect(dialog.classes()).toContain('shadow-2xl');
    });
  });

  describe('3. Event Handling', () => {
    it('should emit close event on handleClose', () => {
      wrapper = mountComponent(BaseDialog);

      // Trigger handleClose method
      wrapper.vm.handleClose();

      // Check that close event was emitted
      expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('should emit confirm event on handleConfirm', () => {
      wrapper = mountComponent(BaseDialog);

      // Trigger handleConfirm method
      wrapper.vm.handleConfirm();

      // Check that confirm event was emitted
      expect(wrapper.emitted('confirm')).toHaveLength(1);
    });

    it('should call handleClose when cancel button is clicked', async () => {
      wrapper = mountComponent(BaseDialog, {
        props: {
          showCancel: true,
        },
      });

      // Find and click the cancel button
      const buttons = wrapper.findAllComponents({ name: 'BaseButton' });
      const cancelButton = buttons.find(
        (btn) => btn.props('label') === 'Cancel'
      );

      expect(cancelButton).toBeDefined();
      await cancelButton!.trigger('click');

      expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('should call handleConfirm when confirm button is clicked', async () => {
      wrapper = mountComponent(BaseDialog, {
        props: {
          showConfirm: true,
        },
      });

      // Find and click the confirm button
      const buttons = wrapper.findAllComponents({ name: 'BaseButton' });
      const confirmButton = buttons.find((btn) => btn.props('label') === 'OK');

      expect(confirmButton).toBeDefined();
      await confirmButton!.trigger('click');

      expect(wrapper.emitted('confirm')).toHaveLength(1);
    });
  });

  describe('4. Button Visibility Logic', () => {
    it('should show both cancel and confirm buttons by default', () => {
      wrapper = mountComponent(BaseDialog);

      expect(wrapper.vm.showCancel).toBe(true);
      expect(wrapper.vm.showConfirm).toBe(true);

      const buttons = wrapper.findAllComponents({ name: 'BaseButton' });
      expect(buttons).toHaveLength(2);
    });

    it('should hide cancel button when showCancel is false', () => {
      wrapper = mountComponent(BaseDialog, {
        props: {
          showCancel: false,
        },
      });

      expect(wrapper.vm.showCancel).toBe(false);
      expect(wrapper.vm.showConfirm).toBe(true);

      const buttons = wrapper.findAllComponents({ name: 'BaseButton' });
      expect(buttons).toHaveLength(1);
      expect(buttons[0].props('label')).toBe('OK');
    });

    it('should hide confirm button when showConfirm is false', () => {
      wrapper = mountComponent(BaseDialog, {
        props: {
          showConfirm: false,
        },
      });

      expect(wrapper.vm.showCancel).toBe(true);
      expect(wrapper.vm.showConfirm).toBe(false);

      const buttons = wrapper.findAllComponents({ name: 'BaseButton' });
      expect(buttons).toHaveLength(1);
      expect(buttons[0].props('label')).toBe('Cancel');
    });

    it('should show no buttons when both are disabled', () => {
      wrapper = mountComponent(BaseDialog, {
        props: {
          showCancel: false,
          showConfirm: false,
        },
      });

      expect(wrapper.vm.showCancel).toBe(false);
      expect(wrapper.vm.showConfirm).toBe(false);

      const buttons = wrapper.findAllComponents({ name: 'BaseButton' });
      expect(buttons).toHaveLength(0);
    });
  });

  describe('5. Closable Logic', () => {
    it('should be closable by default', () => {
      wrapper = mountComponent(BaseDialog);

      expect(wrapper.vm.closable).toBe(true);
    });

    it('should not be closable when persistent is true', () => {
      wrapper = mountComponent(BaseDialog, {
        props: {
          persistent: true,
        },
      });

      expect(wrapper.vm.closable).toBe(false);
    });

    it('should respect closable prop when not persistent', () => {
      wrapper = mountComponent(BaseDialog, {
        props: {
          closable: false,
          persistent: false,
        },
      });

      expect(wrapper.vm.closable).toBe(false);
    });

    it('should override closable when persistent takes precedence', () => {
      wrapper = mountComponent(BaseDialog, {
        props: {
          closable: true,
          persistent: true, // Should override closable
        },
      });

      expect(wrapper.vm.closable).toBe(false);
    });
  });
});
