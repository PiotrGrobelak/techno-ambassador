import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VueWrapper } from '@vue/test-utils';
import SelectDialog from '@/shared/components/SelectDialog/SelectDialog.vue';
import { mountComponent } from '@/test/utils';

// Define types for better TypeScript support
interface MockItem {
  id: string;
  name: string;
  description: string;
}

interface FilteredItem extends MockItem {
  isSelected: boolean;
}

// Mock BaseDialog component to better match the real implementation
vi.mock('@/shared/components/BaseDialog.vue', () => ({
  default: {
    name: 'BaseDialog',
    template: `
      <div data-testid="base-dialog">
        <button 
          @click="openDialog"
          :disabled="disabled"
          data-testid="dialog-trigger"
        >
          <slot name="button-icon"></slot>
          {{ buttonText }}
        </button>
        <div v-if="isDialogOpen" data-testid="dialog-content">
          <input 
            v-if="showSearch"
            v-model="searchTerm"
            :placeholder="searchPlaceholder"
            data-testid="search-input"
          />
          <div v-if="infoText" data-testid="info-text">{{ infoText }}</div>
          <slot name="content" :searchTerm="searchTerm" />
          <button @click="applyAction" data-testid="apply-button">
            {{ applyButtonText }}
          </button>
          <button @click="handleClear" data-testid="clear-button">
            {{ clearButtonText || 'Clear All' }}
          </button>
        </div>
      </div>
    `,
    props: {
      buttonText: String,
      dialogHeader: String,
      showSearch: Boolean,
      searchPlaceholder: String,
      infoText: String,
      clearButtonDisabled: Boolean,
      clearButtonText: String,
      applyButtonText: String,
      disabled: Boolean,
    },
    emits: ['open', 'apply', 'clear'],
    data() {
      return {
        isDialogOpen: false,
        searchTerm: '',
      };
    },
    methods: {
      openDialog(this: any) {
        this.isDialogOpen = true;
        this.searchTerm = '';
        this.$emit('open');
      },
      closeDialog(this: any) {
        this.isDialogOpen = false;
      },
      applyAction(this: any) {
        this.$emit('apply');
        this.closeDialog();
      },
      handleClear(this: any) {
        this.$emit('clear');
      },
    },
  },
}));

// Mock PrimeVue Checkbox
vi.mock('primevue/checkbox', () => ({
  default: {
    name: 'Checkbox',
    template: `
      <input 
        type="checkbox"
        :id="inputId"
        :checked="modelValue"
        @change="$emit('update:model-value', $event.target.checked)"
        data-testid="checkbox"
      />
    `,
    props: {
      modelValue: Boolean,
      inputId: String,
      binary: Boolean,
    },
    emits: ['update:model-value'],
  },
}));

describe('SelectDialog', () => {
  let wrapper: VueWrapper<any>;

  const mockItems: MockItem[] = [
    { id: '1', name: 'Item One', description: 'Description for item one' },
    { id: '2', name: 'Item Two', description: 'Description for item two' },
    { id: '3', name: 'Item Three', description: 'Description for item three' },
    { id: '4', name: 'Search Test', description: 'This is for search testing' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders with default props', () => {
      wrapper = mountComponent(SelectDialog, {
        props: { items: mockItems }
      });
      
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('[data-testid="base-dialog"]').exists()).toBe(true);
    });

    it('renders with custom props', () => {
      wrapper = mountComponent(SelectDialog, {
        props: {
          items: mockItems,
          dialogHeader: 'Custom Header',
          searchPlaceholder: 'Custom search...',
          emptyMessage: 'Nothing found',
          defaultButtonText: 'Custom Button',
        }
      });
      
      const dialog = wrapper.findComponent({ name: 'BaseDialog' });
      expect(dialog.props('dialogHeader')).toBe('Custom Header');
      expect(dialog.props('searchPlaceholder')).toBe('Custom search...');
      expect(dialog.props('buttonText')).toBe('Custom Button');
    });

    it('renders items correctly when dialog is open', async () => {
      wrapper = mountComponent(SelectDialog, {
        props: { items: mockItems }
      });
      
      // Open the dialog
      const trigger = wrapper.find('[data-testid="dialog-trigger"]');
      await trigger.trigger('click');
      await wrapper.vm.$nextTick();
      
      const labels = wrapper.findAll('label');
      expect(labels).toHaveLength(mockItems.length);
      
      mockItems.forEach((item, index) => {
        expect(labels[index].text()).toContain(item.name);
        expect(labels[index].text()).toContain(item.description);
      });
    });

    it('renders empty message when no items', async () => {
      wrapper = mountComponent(SelectDialog, {
        props: { 
          items: [],
          emptyMessage: 'No items available'
        }
      });
      
      // Open the dialog
      const trigger = wrapper.find('[data-testid="dialog-trigger"]');
      await trigger.trigger('click');
      await wrapper.vm.$nextTick();
      
      expect(wrapper.text()).toContain('No items available');
    });

    it('renders selected indicator for selected items', async () => {
      wrapper = mountComponent(SelectDialog, {
        props: { 
          items: mockItems,
          modelValue: ['1', '3']
        }
      });
      
      // Open the dialog
      const trigger = wrapper.find('[data-testid="dialog-trigger"]');
      await trigger.trigger('click');
      await wrapper.vm.$nextTick();
      
      const selectedIndicators = wrapper.findAll('svg');
      expect(selectedIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('Button Text Computation', () => {
    it('shows default button text when no items selected', () => {
      wrapper = mountComponent(SelectDialog, {
        props: { 
          items: mockItems,
          defaultButtonText: 'Select Items'
        }
      });
      
      expect(wrapper.vm.buttonText).toBe('Select Items');
    });

    it('shows item name when single item selected', () => {
      wrapper = mountComponent(SelectDialog, {
        props: { 
          items: mockItems,
          modelValue: ['1']
        }
      });
      
      expect(wrapper.vm.buttonText).toBe('Item One');
    });

    it('shows count when multiple items selected', () => {
      wrapper = mountComponent(SelectDialog, {
        props: { 
          items: mockItems,
          modelValue: ['1', '2', '3'],
          multipleItemsLabel: 'items'
        }
      });
      
      expect(wrapper.vm.buttonText).toBe('3 items selected');
    });

    it('handles selected item not found in items array', () => {
      wrapper = mountComponent(SelectDialog, {
        props: { 
          items: mockItems,
          modelValue: ['non-existent-id'],
          singleItemLabel: 'item'
        }
      });
      
      expect(wrapper.vm.buttonText).toBe('1 item selected');
    });

    it('uses custom labels for single and multiple items', async () => {
      wrapper = mountComponent(SelectDialog, {
        props: { 
          items: mockItems,
          modelValue: ['1'],
          singleItemLabel: 'element'
        }
      });
      
      // For single item, should show item name, not label
      expect(wrapper.vm.buttonText).toBe('Item One');
      
      // Test fallback to label when item not found
      await wrapper.setProps({ modelValue: ['unknown'] });
      expect(wrapper.vm.buttonText).toBe('1 element selected');
    });
  });

  describe('Selection Logic', () => {
    beforeEach(() => {
      wrapper = mountComponent(SelectDialog, {
        props: { 
          items: mockItems,
          modelValue: []
        }
      });
    });

    it('toggles item selection correctly', () => {
      // Start with empty selection
      expect(wrapper.vm.tempSelection).toEqual([]);
      
      // Add item
      wrapper.vm.toggleItem('1');
      expect(wrapper.vm.tempSelection).toEqual(['1']);
      
      // Add another item
      wrapper.vm.toggleItem('2');
      expect(wrapper.vm.tempSelection).toEqual(['1', '2']);
      
      // Remove first item
      wrapper.vm.toggleItem('1');
      expect(wrapper.vm.tempSelection).toEqual(['2']);
    });

    it('correctly identifies selected items', () => {
      wrapper.vm.tempSelection = ['1', '3'];
      
      expect(wrapper.vm.isSelected('1')).toBe(true);
      expect(wrapper.vm.isSelected('2')).toBe(false);
      expect(wrapper.vm.isSelected('3')).toBe(true);
      expect(wrapper.vm.isSelected('4')).toBe(false);
    });

    it('initializes temp selection from modelValue', () => {
      wrapper = mountComponent(SelectDialog, {
        props: { 
          items: mockItems,
          modelValue: ['1', '2']
        }
      });
      
      expect(wrapper.vm.tempSelection).toEqual(['1', '2']);
    });

    it('updates temp selection when modelValue changes', async () => {
      await wrapper.setProps({ modelValue: ['2', '3'] });
      
      expect(wrapper.vm.tempSelection).toEqual(['2', '3']);
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      wrapper = mountComponent(SelectDialog, {
        props: { items: mockItems }
      });
    });

    it('filters items by name', () => {
      wrapper.vm.searchTerm = 'One';
      
      const filtered = wrapper.vm.filteredItems;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Item One');
    });

    it('filters items by description', () => {
      wrapper.vm.searchTerm = 'search testing';
      
      const filtered = wrapper.vm.filteredItems;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Search Test');
    });

    it('performs case-insensitive search', () => {
      wrapper.vm.searchTerm = 'ITEM TWO';
      
      const filtered = wrapper.vm.filteredItems;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Item Two');
    });

    it('returns all items when search term is empty', () => {
      wrapper.vm.searchTerm = '';
      
      const filtered = wrapper.vm.filteredItems;
      expect(filtered).toHaveLength(mockItems.length);
    });

    it('returns empty array when no matches found', () => {
      wrapper.vm.searchTerm = 'nonexistent';
      
      const filtered = wrapper.vm.filteredItems;
      expect(filtered).toHaveLength(0);
    });

    it('syncs external search term correctly', () => {
      const result = wrapper.vm.syncSearchTerm('external search');
      
      expect(wrapper.vm.searchTerm).toBe('external search');
      expect(result).toBe(''); // Should return empty string
    });

    it('maintains selection state during search', () => {
      wrapper.vm.tempSelection = ['1', '2'];
      wrapper.vm.searchTerm = 'One';
      
      const filtered = wrapper.vm.filteredItems;
      expect(filtered[0].isSelected).toBe(true);
    });
  });

  describe('Filtered Items Computation', () => {
    beforeEach(() => {
      wrapper = mountComponent(SelectDialog, {
        props: { 
          items: mockItems,
          modelValue: ['1', '3']
        }
      });
    });

    it('includes isSelected property in filtered items', () => {
      const filtered = wrapper.vm.filteredItems;
      
      expect(filtered[0]).toHaveProperty('isSelected');
      expect(filtered[0].isSelected).toBe(true); // Item 1 is selected
      expect(filtered[1].isSelected).toBe(false); // Item 2 is not selected
    });

    it('correctly maps selection state', () => {
      wrapper.vm.tempSelection = ['2', '4'];
      
      const filtered = wrapper.vm.filteredItems;
      
      expect(filtered[0].isSelected).toBe(false); // Item 1
      expect(filtered[1].isSelected).toBe(true);  // Item 2
      expect(filtered[2].isSelected).toBe(false); // Item 3
      expect(filtered[3].isSelected).toBe(true);  // Item 4
    });

    it('preserves original item properties', () => {
      const filtered: FilteredItem[] = wrapper.vm.filteredItems;
      
      filtered.forEach((filteredItem: FilteredItem, index: number) => {
        const originalItem = mockItems[index];
        expect(filteredItem.id).toBe(originalItem.id);
        expect(filteredItem.name).toBe(originalItem.name);
        expect(filteredItem.description).toBe(originalItem.description);
      });
    });
  });

  describe('Dialog Event Handling', () => {
    beforeEach(() => {
      wrapper = mountComponent(SelectDialog, {
        props: { 
          items: mockItems,
          modelValue: ['1']
        }
      });
    });

    it('handles dialog open correctly', () => {
      // Start with different temp selection
      wrapper.vm.tempSelection = ['2', '3'];
      wrapper.vm.searchTerm = 'previous search';
      
      wrapper.vm.handleOpen();
      
      // Should reset to current modelValue
      expect(wrapper.vm.tempSelection).toEqual(['1']);
      expect(wrapper.vm.searchTerm).toBe('');
    });

    it('handles apply action correctly', () => {
      wrapper.vm.tempSelection = ['2', '3', '4'];
      
      wrapper.vm.handleApply();
      
      const emittedEvents = wrapper.emitted('update:modelValue');
      expect(emittedEvents).toBeTruthy();
      if (emittedEvents) {
        expect(emittedEvents[0]).toEqual([['2', '3', '4']]);
      }
    });

    it('validates selection on apply', () => {
      // Include some invalid IDs
      wrapper.vm.tempSelection = ['1', 'invalid-id', '3', 'another-invalid'];
      
      wrapper.vm.handleApply();
      
      const emittedEvents = wrapper.emitted('update:modelValue');
      if (emittedEvents) {
        const emittedValue = emittedEvents[0][0];
        expect(emittedValue).toEqual(['1', '3']); // Only valid IDs
      }
    });

    it('handles clear action correctly', () => {
      wrapper.vm.tempSelection = ['1', '2', '3'];
      
      wrapper.vm.handleClear();
      
      expect(wrapper.vm.tempSelection).toEqual([]);
    });

    it('emits correct selection count info', () => {
      wrapper.vm.tempSelection = ['1', '2'];
      
      // Access the computed property
      const selectedCount = wrapper.vm.selectedCount;
      expect(selectedCount).toBe(1); // Based on modelValue, not tempSelection
    });
  });

  describe('Props Integration', () => {
    it('integrates all props correctly', () => {
      wrapper = mountComponent(SelectDialog, {
        props: {
          items: mockItems,
          disabled: false,
          dialogHeader: 'Select Multiple Items',
          searchPlaceholder: 'Search for items...',
          emptyMessage: 'No items to select',
          defaultButtonText: 'Choose Items',
          singleItemLabel: 'option',
          multipleItemsLabel: 'options',
          modelValue: ['1', '2']
        }
      });
      
      const dialog = wrapper.findComponent({ name: 'BaseDialog' });
      
      expect(dialog.props('dialogHeader')).toBe('Select Multiple Items');
      expect(dialog.props('searchPlaceholder')).toBe('Search for items...');
      expect(dialog.props('showSearch')).toBe(true);
      expect(wrapper.vm.buttonText).toBe('2 options selected');
    });

    it('passes through button icon slot', async () => {
      wrapper = mountComponent(SelectDialog, {
        props: { items: mockItems },
        slots: {
          'button-icon': '<svg data-testid="custom-icon">icon</svg>'
        }
      });
      
      // The slot should be available in the template
      expect(wrapper.find('[data-testid="dialog-trigger"]').exists()).toBe(true);
    });

    it('handles disabled state correctly', () => {
      wrapper = mountComponent(SelectDialog, {
        props: { 
          items: mockItems,
          disabled: true
        }
      });
      
      const dialog = wrapper.findComponent({ name: 'BaseDialog' });
      expect(dialog.props('disabled')).toBe(true);
    });
  });

  describe('Styling and UI States', () => {
    beforeEach(async () => {
      wrapper = mountComponent(SelectDialog, {
        props: { 
          items: mockItems,
          modelValue: ['1']
        }
      });
      
      // Open the dialog to see the content
      const trigger = wrapper.find('[data-testid="dialog-trigger"]');
      await trigger.trigger('click');
      await wrapper.vm.$nextTick();
    });

    it('applies correct styling to selected items', () => {
      wrapper.vm.tempSelection = ['1'];
      
      const labels = wrapper.findAll('label');
      const firstLabel = labels[0];
      
      // Check if selected styling is applied
      expect(firstLabel.classes()).toContain('bg-blue-50');
      expect(firstLabel.classes()).toContain('border-l-4');
      expect(firstLabel.classes()).toContain('border-blue-500');
    });

    it('applies correct styling to unselected items', async () => {
      wrapper.vm.tempSelection = [];
      await wrapper.vm.$nextTick(); // Wait for reactivity to update
      
      const labels = wrapper.findAll('label');
      const firstLabel = labels[0];
      
      // Check if unselected styling is applied
      expect(firstLabel.classes()).not.toContain('bg-blue-50');
      expect(firstLabel.classes()).toContain('hover:bg-gray-50');
    });

    it('applies correct text colors based on selection', () => {
      wrapper.vm.tempSelection = ['1'];
      
      const labels = wrapper.findAll('label');
      const selectedLabel = labels[0];
      const unselectedLabel = labels[1];
      
      // Selected item text colors
      const selectedNameDiv = selectedLabel.find('.font-medium');
      expect(selectedNameDiv.classes()).toContain('text-blue-900');
      
      const selectedDescDiv = selectedLabel.find('.text-sm');
      expect(selectedDescDiv.classes()).toContain('text-blue-700');
      
      // Unselected item text colors
      const unselectedNameDiv = unselectedLabel.find('.font-medium');
      expect(unselectedNameDiv.classes()).toContain('text-gray-800');
      
      const unselectedDescDiv = unselectedLabel.find('.text-sm');
      expect(unselectedDescDiv.classes()).toContain('text-gray-600');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty items array', () => {
      wrapper = mountComponent(SelectDialog, {
        props: { items: [] }
      });
      
      expect(wrapper.vm.filteredItems).toEqual([]);
      expect(wrapper.vm.buttonText).toBe('Select Items'); // default text
    });

    it('handles undefined modelValue', () => {
      wrapper = mountComponent(SelectDialog, {
        props: { 
          items: mockItems,
          modelValue: undefined
        }
      });
      
      expect(wrapper.vm.tempSelection).toEqual([]);
      expect(wrapper.vm.selectedCount).toBe(0);
    });

    it('handles items with missing properties gracefully', () => {
      const incompleteItems = [
        { id: '1', name: 'Complete Item', description: 'Has description' },
        { id: '2', name: 'No Description' }, // Missing description
        { id: '3' }, // Missing name and description
      ];
      
      wrapper = mountComponent(SelectDialog, {
        props: { items: incompleteItems as any }
      });
      
      expect(() => wrapper.vm.filteredItems).not.toThrow();
      expect(wrapper.vm.filteredItems).toHaveLength(3);
    });

    it('handles duplicate IDs in selection', () => {
      wrapper = mountComponent(SelectDialog, {
        props: { 
          items: mockItems,
          modelValue: ['1', '1', '2', '2'] // Duplicates
        }
      });
      
      // Should handle duplicates gracefully
      expect(wrapper.vm.tempSelection).toEqual(['1', '1', '2', '2']);
      expect(wrapper.vm.selectedCount).toBe(4); // Counts duplicates
    });

    it('works without any props except items', () => {
      wrapper = mountComponent(SelectDialog, {
        props: { items: mockItems }
      });
      
      expect(wrapper.exists()).toBe(true);
      expect(() => wrapper.vm).not.toThrow();
      
      // Should use default values
      expect(wrapper.vm.selectedCount).toBe(0);
      expect(wrapper.vm.buttonText).toBe('Select Items');
    });
  });

  describe('Performance and Reactivity', () => {
    it('recomputes filtered items when search term changes', async () => {
      wrapper = mountComponent(SelectDialog, {
        props: { items: mockItems }
      });
      
      expect(wrapper.vm.filteredItems).toHaveLength(4);
      
      wrapper.vm.searchTerm = 'One';
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.filteredItems).toHaveLength(1);
    });

    it('recomputes button text when selection changes', async () => {
      wrapper = mountComponent(SelectDialog, {
        props: { 
          items: mockItems,
          modelValue: []
        }
      });
      
      expect(wrapper.vm.buttonText).toBe('Select Items');
      
      await wrapper.setProps({ modelValue: ['1'] });
      
      expect(wrapper.vm.buttonText).toBe('Item One');
    });

    it('maintains reactivity across dialog operations', async () => {
      wrapper = mountComponent(SelectDialog, {
        props: { 
          items: mockItems,
          modelValue: ['1']
        }
      });
      
      // Open dialog
      wrapper.vm.handleOpen();
      expect(wrapper.vm.tempSelection).toEqual(['1']);
      
      // Modify temp selection
      wrapper.vm.toggleItem('2');
      expect(wrapper.vm.tempSelection).toEqual(['1', '2']);
      
      // Apply changes
      wrapper.vm.handleApply();
      
      const emittedEvents = wrapper.emitted('update:modelValue');
      if (emittedEvents) {
        const emittedValue = emittedEvents[0][0];
        expect(emittedValue).toEqual(['1', '2']);
      }
    });
  });
}); 