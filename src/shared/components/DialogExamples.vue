<template>
  <div class="space-y-6 p-6">
    <h1 class="text-2xl font-bold text-gray-900">Dialog Examples</h1>

    <!-- Example 1: Simple confirmation dialog -->
    <div class="space-y-2">
      <h2 class="text-lg font-semibold text-gray-800">
        1. Simple Confirmation Dialog
      </h2>
      <BaseDialog
        button-text="Delete Item"
        button-severity="danger"
        dialog-header="Confirm Deletion"
        :show-clear-button="false"
        cancel-button-text="Cancel"
        apply-button-text="Delete"
        @apply="handleDelete"
      >
        <template #content>
          <div class="p-4">
            <div class="flex items-center space-x-3">
              <svg
                class="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 class="text-lg font-medium text-gray-900">Are you sure?</h3>
                <p class="text-gray-600">
                  This action cannot be undone. This will permanently delete the
                  item.
                </p>
              </div>
            </div>
          </div>
        </template>
      </BaseDialog>
    </div>

    <!-- Example 2: Form dialog -->
    <div class="space-y-2">
      <h2 class="text-lg font-semibold text-gray-800">2. Form Dialog</h2>
      <BaseDialog
        button-text="Add New User"
        dialog-header="Create User Account"
        :show-clear-button="false"
        apply-button-text="Create User"
        @apply="handleCreateUser"
        @open="resetForm"
      >
        <template #content>
          <div class="space-y-4 p-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Name</label
              >
              <InputText
                v-model="formData.name"
                placeholder="Enter full name"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Email</label
              >
              <InputText
                v-model="formData.email"
                placeholder="Enter email address"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Role</label
              >
              <Dropdown
                v-model="formData.role"
                :options="roleOptions"
                option-label="name"
                option-value="value"
                placeholder="Select role"
                class="w-full"
              />
            </div>
          </div>
        </template>
      </BaseDialog>
    </div>

    <!-- Example 3: List selection dialog (using the example component) -->
    <div class="space-y-2">
      <h2 class="text-lg font-semibold text-gray-800">3. Selection Dialog</h2>
      <ExampleSelectDialog :items="sampleItems" v-model="selectedItems" />
      <p class="text-sm text-gray-600">
        Selected: {{ selectedItems.join(', ') || 'None' }}
      </p>
    </div>

    <!-- Example 4: Custom header and footer -->
    <div class="space-y-2">
      <h2 class="text-lg font-semibold text-gray-800">
        4. Custom Header & Footer
      </h2>
      <BaseDialog button-text="View Details" @open="loadDetails">
        <template #header>
          <div class="flex items-center space-x-2">
            <svg
              class="w-5 h-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="font-semibold text-gray-900">Item Details</span>
            <Tag value="Premium" severity="success" />
          </div>
        </template>

        <template #content>
          <div class="p-4">
            <div
              v-if="isLoadingDetails"
              class="flex items-center justify-center py-8"
            >
              <ProgressSpinner style="width: 50px; height: 50px" />
            </div>
            <div v-else class="space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <dt class="text-sm font-medium text-gray-500">ID</dt>
                  <dd class="text-sm text-gray-900">#12345</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Status</dt>
                  <dd class="text-sm text-gray-900">Active</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Created</dt>
                  <dd class="text-sm text-gray-900">2024-01-15</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Updated</dt>
                  <dd class="text-sm text-gray-900">2024-01-20</dd>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #footer-left>
          <Button severity="secondary" text @click="exportDetails">
            <svg
              class="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            Export
          </Button>
        </template>

        <template #footer-right="{ closeDialog }">
          <Button @click="closeDialog" severity="secondary" outlined>
            Close
          </Button>
        </template>
      </BaseDialog>
    </div>

    <!-- Example 5: No button trigger (controlled externally) -->
    <div class="space-y-2">
      <h2 class="text-lg font-semibold text-gray-800">5. Controlled Dialog</h2>
      <div class="flex space-x-2">
        <Button @click="showControlledDialog = true" severity="info">
          Open Controlled Dialog
        </Button>
        <Button
          @click="showControlledDialog = false"
          severity="secondary"
          outlined
        >
          Close from Outside
        </Button>
      </div>

      <BaseDialog
        v-model="showControlledDialog"
        dialog-header="Externally Controlled"
        :show-clear-button="false"
      >
        <template #trigger>
          <!-- Empty trigger slot - dialog controlled by v-model -->
        </template>

        <template #content>
          <div class="p-4 text-center">
            <p class="text-gray-600">
              This dialog is controlled by external state!
            </p>
            <p class="text-sm text-gray-500 mt-2">
              Current state: {{ showControlledDialog ? 'Open' : 'Closed' }}
            </p>
          </div>
        </template>
      </BaseDialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import BaseDialog from './BaseDialog.vue';
import ExampleSelectDialog from './SelectDialog.vue';

// Form data
const formData = ref({
  name: '',
  email: '',
  role: null,
});

const roleOptions = ref([
  { name: 'Administrator', value: 'admin' },
  { name: 'Editor', value: 'editor' },
  { name: 'Viewer', value: 'viewer' },
]);

// Selection example data
const sampleItems = ref([
  { id: '1', name: 'JavaScript', description: 'Programming language' },
  { id: '2', name: 'Vue.js', description: 'Frontend framework' },
  { id: '3', name: 'TypeScript', description: 'Typed JavaScript' },
  { id: '4', name: 'Node.js', description: 'Server-side JavaScript' },
  { id: '5', name: 'PrimeVue', description: 'Vue component library' },
]);

const selectedItems = ref<string[]>([]);

// Controlled dialog
const showControlledDialog = ref(false);

// Details loading
const isLoadingDetails = ref(false);

// Event handlers
function handleDelete(): void {
  console.log('Deleting item...');
  // Simulate API call
  setTimeout(() => {
    alert('Item deleted successfully!');
  }, 500);
}

function resetForm(): void {
  formData.value = {
    name: '',
    email: '',
    role: null,
  };
}

function handleCreateUser(): void {
  console.log('Creating user:', formData.value);
  // Validate form
  if (!formData.value.name || !formData.value.email || !formData.value.role) {
    alert('Please fill in all fields');
    return;
  }

  // Simulate API call
  setTimeout(() => {
    alert(`User ${formData.value.name} created successfully!`);
    resetForm();
  }, 500);
}

function loadDetails(): void {
  isLoadingDetails.value = true;
  // Simulate API call
  setTimeout(() => {
    isLoadingDetails.value = false;
  }, 1500);
}

function exportDetails(): void {
  console.log('Exporting details...');
  alert('Details exported!');
}
</script>

<style scoped>
dt {
  @apply font-medium text-gray-500;
}

dd {
  @apply text-gray-900;
}
</style>
