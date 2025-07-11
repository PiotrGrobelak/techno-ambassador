<template>
  <div class="space-y-12">
    <!-- Typography Section -->
    <section>
      <h2 class="text-2xl font-semibold text-gray-900 mb-6">Typography</h2>
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <div class="space-y-6">
          <!-- Headings -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Headings</h3>
            <div class="space-y-2">
              <BaseTypography variant="h1" weight="bold">
                Heading 1 - Bold
              </BaseTypography>
              <BaseTypography variant="h2" weight="semibold">
                Heading 2 - Semibold
              </BaseTypography>
              <BaseTypography variant="h3" weight="medium">
                Heading 3 - Medium
              </BaseTypography>
              <BaseTypography variant="h4">Heading 4 - Regular</BaseTypography>
              <BaseTypography variant="h5">Heading 5</BaseTypography>
              <BaseTypography variant="h6">Heading 6</BaseTypography>
            </div>
          </div>

          <!-- Body Text -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Body Text</h3>
            <div class="space-y-2">
              <BaseTypography variant="body-large">
                Large body text for emphasis and better readability
              </BaseTypography>
              <BaseTypography variant="body">
                Regular body text for most content and descriptions
              </BaseTypography>
              <BaseTypography variant="body-small">
                Small body text for secondary information
              </BaseTypography>
            </div>
          </div>

          <!-- Special Text -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Special Text</h3>
            <div class="space-y-2">
              <BaseTypography variant="caption" color="secondary">
                Caption text for image descriptions
              </BaseTypography>
              <BaseTypography variant="label" weight="medium">
                Label text for form fields
              </BaseTypography>
              <BaseTypography variant="overline" color="muted">
                Overline text for categories
              </BaseTypography>
              <BaseTypography variant="body" :mono="true">
                Monospace text for code: console.log('Hello World')
              </BaseTypography>
            </div>
          </div>

          <!-- Color Variants -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Color Variants
            </h3>
            <div class="space-y-2">
              <BaseTypography variant="body" color="primary">
                Primary text color
              </BaseTypography>
              <BaseTypography variant="body" color="secondary">
                Secondary text color
              </BaseTypography>
              <BaseTypography variant="body" color="success">
                Success text color
              </BaseTypography>
              <BaseTypography variant="body" color="warning">
                Warning text color
              </BaseTypography>
              <BaseTypography variant="body" color="danger">
                Danger text color
              </BaseTypography>
              <BaseTypography variant="body" color="muted">
                Muted text color
              </BaseTypography>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Buttons Section -->
    <section>
      <h2 class="text-2xl font-semibold text-gray-900 mb-6">Buttons</h2>
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <div class="space-y-8">
          <!-- Button Variants -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Button Variants
            </h3>
            <div class="flex flex-wrap gap-4">
              <BaseButton
                label="Primary"
                variant="primary"
                :pulse="true"
                @click="showToast('Primary button clicked')"
              />
              <BaseButton
                label="Secondary"
                variant="secondary"
                @click="showToast('Secondary button clicked')"
              />
              <BaseButton
                label="Destructive"
                variant="destructive"
                @click="showToast('Destructive action')"
              />
              <BaseButton
                label="Ghost"
                variant="ghost"
                @click="showToast('Ghost button clicked')"
              />
              <BaseButton
                label="Link"
                variant="link"
                @click="showToast('Link clicked')"
              />
            </div>
          </div>

          <!-- Button Sizes -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Button Sizes</h3>
            <div class="flex flex-wrap items-center gap-4">
              <BaseButton label="Small" size="small" />
              <BaseButton label="Medium" size="medium" />
              <BaseButton label="Large" size="large" />
            </div>
          </div>

          <!-- Button States -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Button States
            </h3>
            <div class="flex flex-wrap gap-4">
              <BaseButton label="Normal" variant="primary" />
              <BaseButton label="Loading" variant="primary" :loading="true" />
              <BaseButton label="Disabled" variant="primary" :disabled="true" />
              <BaseButton
                label="Pulse (Most Likely)"
                variant="primary"
                :pulse="true"
              />
            </div>
          </div>

          <!-- Button with Icons -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Buttons with Icons
            </h3>
            <div class="flex flex-wrap gap-4">
              <BaseButton label="Download" variant="primary">
                <template #icon-leading>
                  <i class="pi pi-download"></i>
                </template>
              </BaseButton>
              <BaseButton label="Send" variant="secondary">
                <template #icon-trailing>
                  <i class="pi pi-send"></i>
                </template>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Inputs Section -->
    <section>
      <h2 class="text-2xl font-semibold text-gray-900 mb-6">Input Fields</h2>
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <div class="space-y-8">
          <!-- Basic Inputs -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Input Variants
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseInput
                v-model="form.text"
                label="Text Input"
                placeholder="Enter some text"
                helper-text="This is helper text"
                :clearable="true"
              />
              <BaseInput
                v-model="form.email"
                label="Email"
                variant="email"
                placeholder="user@example.com"
                :clearable="true"
              />
              <BaseInput
                v-model="form.search"
                label="Search"
                variant="search"
                placeholder="Search for something..."
                :clearable="true"
              >
                <template #icon-leading>
                  <i class="pi pi-search"></i>
                </template>
              </BaseInput>
              <BaseInput
                v-model="form.password"
                label="Password"
                variant="password"
                placeholder="Enter password"
              />
              <BaseInput
                v-model="form.number"
                label="Number"
                variant="number"
                placeholder="Enter a number"
              />
              <BaseInput
                v-model="form.phone"
                label="Phone"
                variant="tel"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <!-- Input Sizes -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Input Sizes</h3>
            <div class="space-y-4">
              <BaseInput
                v-model="form.small"
                label="Small Input"
                size="small"
                placeholder="Small size"
              />
              <BaseInput
                v-model="form.medium"
                label="Medium Input"
                size="medium"
                placeholder="Medium size (default)"
              />
              <BaseInput
                v-model="form.large"
                label="Large Input"
                size="large"
                placeholder="Large size"
              />
            </div>
          </div>

          <!-- Input States -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Input States</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseInput
                v-model="form.normal"
                label="Normal State"
                placeholder="Normal input"
              />
              <BaseInput
                v-model="form.error"
                label="Error State"
                placeholder="Input with error"
                error-message="This field is required"
              />
              <BaseInput
                v-model="form.disabled"
                label="Disabled State"
                placeholder="Disabled input"
                :disabled="true"
              />
              <BaseInput
                v-model="form.readonly"
                label="Readonly State"
                placeholder="Readonly input"
                :readonly="true"
              />
            </div>
          </div>

          <!-- Multiline -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Multiline Input
            </h3>
            <BaseInput
              v-model="form.description"
              label="Description"
              :multiline="true"
              :rows="4"
              placeholder="Enter a detailed description..."
              helper-text="You can use multiple lines for longer text"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Cards Section -->
    <section>
      <h2 class="text-2xl font-semibold text-gray-900 mb-6">Cards</h2>
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <div class="space-y-8">
          <!-- Card Variants -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Card Variants
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <BaseCard
                title="Elevated Card"
                subtitle="With shadow"
                variant="elevated"
              >
                <BaseTypography variant="body" color="secondary">
                  This card has elevation with shadow for depth.
                </BaseTypography>
              </BaseCard>

              <BaseCard
                title="Outlined Card"
                subtitle="With border"
                variant="outlined"
              >
                <BaseTypography variant="body" color="secondary">
                  This card has a border instead of shadow.
                </BaseTypography>
              </BaseCard>

              <BaseCard
                title="Filled Card"
                subtitle="With background"
                variant="filled"
              >
                <BaseTypography variant="body" color="secondary">
                  This card has a filled background color.
                </BaseTypography>
              </BaseCard>

              <BaseCard
                title="Ghost Card"
                subtitle="Minimal style"
                variant="ghost"
              >
                <BaseTypography variant="body" color="secondary">
                  This card has minimal styling.
                </BaseTypography>
              </BaseCard>
            </div>
          </div>

          <!-- Interactive Cards -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Interactive Cards
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <BaseCard
                v-for="item in sampleCards"
                :key="item.id"
                :title="item.title"
                :subtitle="item.subtitle"
                variant="elevated"
                :interactive="true"
                :selected="selectedCard === item.id"
                @click="selectCard(item.id)"
              >
                <BaseTypography variant="body" color="secondary">
                  {{ item.description }}
                </BaseTypography>

                <template #footer>
                  <div class="flex justify-between items-center">
                    <BaseTypography variant="caption" color="muted">
                      {{ item.date }}
                    </BaseTypography>
                    <BaseButton
                      label="View"
                      variant="ghost"
                      size="small"
                      @click.stop="viewCard(item)"
                    />
                  </div>
                </template>
              </BaseCard>
            </div>
          </div>

          <!-- Card Sizes -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Card Sizes</h3>
            <div class="space-y-4">
              <BaseCard
                title="Small Card"
                subtitle="Compact size"
                size="small"
                variant="outlined"
              >
                <BaseTypography variant="body-small" color="secondary">
                  This is a small card with less padding.
                </BaseTypography>
              </BaseCard>

              <BaseCard
                title="Medium Card"
                subtitle="Default size"
                size="medium"
                variant="outlined"
              >
                <BaseTypography variant="body" color="secondary">
                  This is a medium card with standard padding.
                </BaseTypography>
              </BaseCard>

              <BaseCard
                title="Large Card"
                subtitle="Spacious size"
                size="large"
                variant="outlined"
              >
                <BaseTypography variant="body" color="secondary">
                  This is a large card with generous padding for more content.
                </BaseTypography>
              </BaseCard>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modals Section -->
    <section>
      <h2 class="text-2xl font-semibold text-gray-900 mb-6">
        Dialogs & Modals
      </h2>
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <div class="space-y-6">
          <!-- Basic Dialog Examples -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Basic Dialog Examples
            </h3>
            <div class="flex flex-wrap gap-4">
              <BaseButton
                label="Default Dialog"
                variant="primary"
                @click="openDialog('default')"
              />
              <BaseButton
                label="Confirmation Dialog"
                variant="destructive"
                @click="openDialog('confirmation')"
              />
              <BaseButton
                label="Alert Dialog"
                variant="secondary"
                @click="openDialog('alert')"
              />
              <BaseButton
                label="Form Dialog"
                variant="primary"
                @click="openDialog('form')"
              />
            </div>
          </div>

          <!-- Dialog Button Configurations -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Button Configurations
            </h3>
            <div class="flex flex-wrap gap-4">
              <BaseButton
                label="Only Confirm Button"
                variant="primary"
                @click="openDialog('confirmOnly')"
              />
              <BaseButton
                label="Only Cancel Button"
                variant="secondary"
                @click="openDialog('cancelOnly')"
              />
              <BaseButton
                label="No Buttons"
                variant="ghost"
                @click="openDialog('noButtons')"
              />
              <BaseButton
                label="Custom Button Text"
                variant="primary"
                @click="openDialog('customText')"
              />
            </div>
          </div>

          <!-- Dialog Closable Options -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Closable Options
            </h3>
            <div class="flex flex-wrap gap-4">
              <BaseButton
                label="Persistent Dialog"
                variant="destructive"
                @click="openDialog('persistent')"
              />
              <BaseButton
                label="Not Closable"
                variant="secondary"
                @click="openDialog('notClosable')"
              />
              <BaseButton
                label="Custom Header Dialog"
                variant="primary"
                @click="openDialog('customHeader')"
              />
            </div>
          </div>

          <!-- Dialog Features -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Dialog Features
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="p-4 border rounded-lg">
                <h4 class="font-medium mb-2">Simple & Clean</h4>
                <p class="text-sm text-gray-600">
                  Simplified API with only essential props for basic dialog
                  functionality
                </p>
              </div>
              <div class="p-4 border rounded-lg">
                <h4 class="font-medium mb-2">Focus Management</h4>
                <p class="text-sm text-gray-600">
                  Automatic focus trap and keyboard navigation with VueUse
                </p>
              </div>
              <div class="p-4 border rounded-lg">
                <h4 class="font-medium mb-2">Flexible Slots</h4>
                <p class="text-sm text-gray-600">
                  Custom header, content, and footer with slot-based
                  architecture
                </p>
              </div>
              <div class="p-4 border rounded-lg">
                <h4 class="font-medium mb-2">Button Control</h4>
                <p class="text-sm text-gray-600">
                  Show/hide cancel and confirm buttons with custom text
                </p>
              </div>
              <div class="p-4 border rounded-lg">
                <h4 class="font-medium mb-2">Persistent Mode</h4>
                <p class="text-sm text-gray-600">
                  Prevent dismissal for critical actions requiring explicit
                  choice
                </p>
              </div>
              <div class="p-4 border rounded-lg">
                <h4 class="font-medium mb-2">Accessibility</h4>
                <p class="text-sm text-gray-600">
                  Built-in ARIA attributes and keyboard support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive Examples -->
    <section>
      <h2 class="text-2xl font-semibold text-gray-900 mb-6">
        Interactive Examples
      </h2>
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <div class="space-y-8">
          <!-- Login Form Example -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Login Form</h3>
            <div class="max-w-md">
              <form class="space-y-4" @submit.prevent="handleLogin">
                <BaseInput
                  v-model="loginForm.email"
                  label="Email"
                  variant="email"
                  placeholder="Enter your email"
                  :error-message="loginErrors.email"
                  :clearable="true"
                  required
                />

                <BaseInput
                  v-model="loginForm.password"
                  label="Password"
                  variant="password"
                  placeholder="Enter your password"
                  :error-message="loginErrors.password"
                  required
                />

                <BaseButton
                  type="submit"
                  label="Sign In"
                  variant="primary"
                  :loading="isLoggingIn"
                  :pulse="true"
                  full-width
                />
              </form>
            </div>
          </div>

          <!-- Settings Card -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Settings Panel
            </h3>
            <BaseCard
              title="Account Settings"
              subtitle="Manage your account preferences"
              variant="outlined"
            >
              <div class="space-y-4">
                <BaseInput
                  v-model="settings.displayName"
                  label="Display Name"
                  placeholder="Your display name"
                />

                <BaseInput
                  v-model="settings.bio"
                  label="Bio"
                  :multiline="true"
                  :rows="3"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <template #footer>
                <div class="flex justify-end space-x-3">
                  <BaseButton
                    label="Cancel"
                    variant="ghost"
                    @click="resetSettings"
                  />
                  <BaseButton
                    label="Save Changes"
                    variant="primary"
                    @click="saveSettings"
                  />
                </div>
              </template>
            </BaseCard>
          </div>
        </div>
      </div>
    </section>

    <!-- All Dialogs -->
    <!-- Default Dialog -->
    <BaseDialog
      v-if="dialogs.default"
      header="Information"
      @close="dialogs.default = false"
      @confirm="dialogs.default = false"
    >
      <template #header>
        <div class="flex items-center space-x-2">
          <i class="pi pi-info-circle text-blue-500"></i>
          <span>Information</span>
        </div>
      </template>

      <BaseTypography variant="body">
        This is a default dialog with both Cancel and OK buttons. Perfect for
        general information or simple confirmations.
      </BaseTypography>
    </BaseDialog>

    <!-- Confirmation Dialog -->
    <BaseDialog
      v-if="dialogs.confirmation"
      header="Delete Item"
      cancel-text="Cancel"
      confirm-text="Delete"
      @close="dialogs.confirmation = false"
      @confirm="handleDialogAction('Item deleted successfully')"
    >
      <template #header>
        <div class="flex items-center space-x-2">
          <i class="pi pi-exclamation-triangle text-red-500"></i>
          <span>Delete Item</span>
        </div>
      </template>

      <BaseTypography variant="body" color="secondary">
        Are you sure you want to delete this item? This action cannot be undone.
        All associated data will be permanently removed.
      </BaseTypography>
    </BaseDialog>

    <!-- Alert Dialog -->
    <BaseDialog
      v-if="dialogs.alert"
      header="Success"
      confirm-text="OK"
      :show-cancel="false"
      @close="dialogs.alert = false"
      @confirm="dialogs.alert = false"
    >
      <template #header>
        <div class="flex items-center space-x-2">
          <i class="pi pi-check-circle text-green-500"></i>
          <span>Success</span>
        </div>
      </template>

      <BaseTypography variant="body">
        Your changes have been saved successfully! The system has been updated
        and all users will see the new configuration.
      </BaseTypography>
    </BaseDialog>

    <!-- Form Dialog -->
    <BaseDialog
      v-if="dialogs.form"
      header="Edit User Profile"
      cancel-text="Cancel"
      confirm-text="Save"
      @close="dialogs.form = false"
      @confirm="handleFormDialogSubmit"
    >
      <template #default>
        <form class="space-y-4" @submit.prevent="handleFormDialogSubmit">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <BaseInput
              v-model="dialogForm.displayName"
              placeholder="Enter display name"
              :clearable="true"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <BaseInput
              v-model="dialogForm.email"
              variant="email"
              placeholder="user@example.com"
              :clearable="true"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <BaseInput
              v-model="dialogForm.bio"
              :multiline="true"
              :rows="3"
              placeholder="Tell us about yourself..."
            />
          </div>
        </form>
      </template>
    </BaseDialog>

    <!-- Confirm Only Dialog -->
    <BaseDialog
      v-if="dialogs.confirmOnly"
      header="Information"
      :show-cancel="false"
      confirm-text="Got it"
      @close="dialogs.confirmOnly = false"
      @confirm="dialogs.confirmOnly = false"
    >
      <BaseTypography variant="body">
        This dialog only has a confirm button. The cancel button is hidden using
        the showCancel prop.
      </BaseTypography>
    </BaseDialog>

    <!-- Cancel Only Dialog -->
    <BaseDialog
      v-if="dialogs.cancelOnly"
      header="Read Only Information"
      :show-confirm="false"
      cancel-text="Close"
      @close="dialogs.cancelOnly = false"
    >
      <BaseTypography variant="body">
        This dialog only has a close button. The confirm button is hidden using
        the showConfirm prop.
      </BaseTypography>
    </BaseDialog>

    <!-- No Buttons Dialog -->
    <BaseDialog
      v-if="dialogs.noButtons"
      header="Auto-Dismissing Dialog"
      :show-cancel="false"
      :show-confirm="false"
      @close="dialogs.noButtons = false"
    >
      <BaseTypography variant="body">
        This dialog has no footer buttons. You can close it using the X button
        or by pressing ESC. It will also auto-close in 3 seconds.
      </BaseTypography>
    </BaseDialog>

    <!-- Custom Text Dialog -->
    <BaseDialog
      v-if="dialogs.customText"
      header="Custom Button Text"
      cancel-text="Not Now"
      confirm-text="Let's Go!"
      @close="dialogs.customText = false"
      @confirm="handleDialogAction('Custom action executed!')"
    >
      <BaseTypography variant="body">
        This dialog demonstrates custom button text using the cancelText and
        confirmText props.
      </BaseTypography>
    </BaseDialog>

    <!-- Persistent Dialog -->
    <BaseDialog
      v-if="dialogs.persistent"
      header="Important Decision"
      :persistent="true"
      cancel-text="Cancel"
      confirm-text="Proceed"
      @close="dialogs.persistent = false"
      @confirm="handleDialogAction('Persistent action confirmed')"
    >
      <BaseTypography variant="body" color="secondary">
        This is a persistent dialog. You cannot close it by clicking outside or
        pressing ESC. You must make an explicit choice using one of the buttons.
      </BaseTypography>
    </BaseDialog>

    <!-- Not Closable Dialog -->
    <BaseDialog
      v-if="dialogs.notClosable"
      header="Force Decision"
      :closable="false"
      cancel-text="Decline"
      confirm-text="Accept"
      @close="dialogs.notClosable = false"
      @confirm="handleDialogAction('Decision accepted')"
    >
      <BaseTypography variant="body" color="secondary">
        This dialog has the close button (X) hidden using the closable prop. You
        must use one of the action buttons to continue.
      </BaseTypography>
    </BaseDialog>

    <!-- Custom Header Dialog -->
    <BaseDialog
      v-if="dialogs.customHeader"
      :closable="false"
      @close="dialogs.customHeader = false"
      @confirm="dialogs.customHeader = false"
    >
      <template #header>
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center space-x-2">
            <i class="pi pi-cog text-purple-500 text-xl"></i>
            <span class="text-lg font-semibold">Custom Header Layout</span>
          </div>
          <BaseButton
            variant="ghost"
            label="✕"
            size="small"
            @click="dialogs.customHeader = false"
          />
        </div>
      </template>

      <template #default>
        <div class="space-y-4">
          <BaseTypography variant="body">
            This demonstrates a completely custom header with manual close
            button and custom icon. The dialog's closable prop is disabled.
          </BaseTypography>

          <BaseCard title="Features" variant="outlined">
            <ul class="space-y-2 text-sm">
              <li>• Custom header slot with icon and styling</li>
              <li>• Manual close button in header</li>
              <li>• Disabled default close button</li>
              <li>• Focus trap still works perfectly</li>
            </ul>
          </BaseCard>
        </div>
      </template>

      <template #footer="{ close }">
        <div class="flex justify-between w-full">
          <BaseButton
            variant="secondary"
            label="Custom Action"
            @click="handleDialogAction('Custom action executed')"
          />
          <div class="space-x-2">
            <BaseButton variant="ghost" label="Cancel" @click="close" />
            <BaseButton variant="primary" label="Done" @click="close" />
          </div>
        </div>
      </template>
    </BaseDialog>

    <!-- Toast Notification -->
    <div
      v-if="toast.show"
      class="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import BaseInput from '@/shared/components/BaseInput/BaseInput.vue';
import BaseTypography from '@/shared/components/BaseTypography.vue';
import BaseDialog from '@/shared/components/BaseDialog/BaseDialog.vue';
import BaseCard from '@/shared/components/BaseCard.vue';

// Form data
const form = reactive({
  text: '',
  email: '',
  search: '',
  password: '',
  number: '',
  phone: '',
  small: '',
  medium: '',
  large: '',
  normal: '',
  error: '',
  disabled: 'Cannot edit this',
  readonly: 'Read only value',
  description: '',
});

// Login form
const loginForm = reactive({
  email: '',
  password: '',
});

const loginErrors = reactive({
  email: '',
  password: '',
});

const isLoggingIn = ref(false);

// Settings
const settings = reactive({
  displayName: 'John Doe',
  bio: 'Frontend developer passionate about great user experiences.',
});

// Dialog form
const dialogForm = reactive({
  displayName: 'Jane Smith',
  email: 'jane@example.com',
  bio: 'UX Designer with passion for accessibility and user-centered design.',
});

// Cards
const selectedCard = ref<number | null>(null);
const sampleCards = [
  {
    id: 1,
    title: 'Product Launch',
    subtitle: 'Marketing Campaign',
    description:
      'Coordinate the launch of our new product with marketing team.',
    date: '2024-01-15',
  },
  {
    id: 2,
    title: 'User Research',
    subtitle: 'UX Study',
    description: 'Conduct interviews with users to understand pain points.',
    date: '2024-01-20',
  },
  {
    id: 3,
    title: 'Design System',
    subtitle: 'Component Library',
    description: 'Build and maintain the company design system components.',
    date: '2024-01-25',
  },
];

// Dialogs
const dialogs = reactive({
  // Basic dialog examples
  default: false,
  confirmation: false,
  alert: false,
  form: false,

  // Button configuration examples
  confirmOnly: false,
  cancelOnly: false,
  noButtons: false,
  customText: false,

  // Closable options
  persistent: false,
  notClosable: false,
  customHeader: false,
});

// Toast
const toast = reactive({
  show: false,
  message: '',
});

// Methods
function showToast(message: string): void {
  toast.message = message;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 3000);
}

function selectCard(id: number): void {
  selectedCard.value = selectedCard.value === id ? null : id;
  showToast(
    `Card ${id} ${selectedCard.value === id ? 'selected' : 'deselected'}`
  );
}

function viewCard(item: { title: string }): void {
  showToast(`Viewing: ${item.title}`);
}

function openDialog(variant: string): void {
  dialogs[variant as keyof typeof dialogs] = true;

  // Auto-close the noButtons dialog after 3 seconds
  if (variant === 'noButtons') {
    setTimeout(() => {
      dialogs.noButtons = false;
      showToast('Dialog auto-closed after 3 seconds');
    }, 3000);
  }
}

function handleDialogAction(message: string): void {
  showToast(message);
  // Close all dialogs
  Object.keys(dialogs).forEach((key) => {
    dialogs[key as keyof typeof dialogs] = false;
  });
}

function handleLogin(): void {
  // Reset errors
  loginErrors.email = '';
  loginErrors.password = '';

  // Simple validation
  if (!loginForm.email) {
    loginErrors.email = 'Email is required';
    return;
  }
  if (!loginForm.password) {
    loginErrors.password = 'Password is required';
    return;
  }

  isLoggingIn.value = true;

  // Simulate API call
  setTimeout(() => {
    isLoggingIn.value = false;
    showToast('Login successful!');
    loginForm.email = '';
    loginForm.password = '';
  }, 2000);
}

function resetSettings(): void {
  settings.displayName = 'John Doe';
  settings.bio = 'Frontend developer passionate about great user experiences.';
  showToast('Settings reset');
}

function saveSettings(): void {
  showToast('Settings saved successfully!');
}

function handleFormDialogSubmit(): void {
  showToast('Form submitted successfully!');
  dialogs.form = false;
}
</script>
