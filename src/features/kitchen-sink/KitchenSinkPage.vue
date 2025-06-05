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
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </template>
              </BaseButton>
              <BaseButton label="Send" variant="secondary">
                <template #icon-trailing>
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
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
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
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
        Modals & Dialogs
      </h2>
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <div class="space-y-6">
          <!-- Modal Triggers -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Modal Variants
            </h3>
            <div class="flex flex-wrap gap-4">
              <BaseButton
                label="Sheet Modal"
                variant="secondary"
                @click="openModal('sheet')"
              />
              <BaseButton
                label="Alert Modal"
                variant="secondary"
                @click="openModal('alert')"
              />
              <BaseButton
                label="Fullscreen Modal"
                variant="secondary"
                @click="openModal('fullscreen')"
              />
              <BaseButton
                label="Drawer Modal"
                variant="secondary"
                @click="openModal('drawer')"
              />
            </div>
          </div>

          <!-- Friction Levels -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Friction Levels
            </h3>
            <div class="flex flex-wrap gap-4">
              <BaseButton
                label="High Friction"
                variant="destructive"
                @click="openFrictionModal('high')"
              />
              <BaseButton
                label="Low Friction"
                variant="secondary"
                @click="openFrictionModal('low')"
              />
              <BaseButton
                label="No Friction"
                variant="ghost"
                @click="openFrictionModal('none')"
              />
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
              <form @submit.prevent="handleLogin" class="space-y-4">
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

    <!-- All Modals -->
    <BaseModal
      v-model="modals.sheet"
      variant="sheet"
      header="Sheet Modal"
      @confirm="handleModalAction('Sheet confirmed')"
      @cancel="modals.sheet = false"
    >
      <BaseTypography variant="body">
        This is a sheet modal that slides down from the top. It's great for
        contextual actions and forms.
      </BaseTypography>
    </BaseModal>

    <BaseModal
      v-model="modals.alert"
      variant="alert"
      friction="high"
      header="Alert Dialog"
      confirm-text="Delete"
      confirm-variant="destructive"
      :persistent="true"
      @confirm="handleModalAction('Alert confirmed')"
      @cancel="modals.alert = false"
    >
      <BaseTypography variant="body" color="secondary">
        Are you sure you want to delete this item? This action cannot be undone.
      </BaseTypography>
    </BaseModal>

    <BaseModal
      v-model="modals.fullscreen"
      variant="fullscreen"
      header="Fullscreen Modal"
      @confirm="handleModalAction('Fullscreen confirmed')"
      @cancel="modals.fullscreen = false"
    >
      <div class="space-y-4">
        <BaseTypography variant="body">
          This is a fullscreen modal that takes up the entire viewport. Perfect
          for complex forms or detailed content.
        </BaseTypography>

        <BaseCard title="Content Card" variant="outlined">
          <BaseTypography variant="body" color="secondary">
            You can include any content in fullscreen modals, including other
            components like cards.
          </BaseTypography>
        </BaseCard>
      </div>
    </BaseModal>

    <BaseModal
      v-model="modals.drawer"
      variant="drawer"
      header="Drawer Modal"
      @confirm="handleModalAction('Drawer confirmed')"
      @cancel="modals.drawer = false"
    >
      <BaseTypography variant="body">
        This is a drawer modal that slides in from the side. Great for
        navigation or secondary actions.
      </BaseTypography>
    </BaseModal>

    <!-- Friction Modals -->
    <BaseModal
      v-model="modals.highFriction"
      variant="alert"
      friction="high"
      header="High Friction Modal"
      :persistent="true"
      confirm-text="I Understand"
      confirm-variant="destructive"
      @confirm="handleModalAction('High friction confirmed')"
      @cancel="modals.highFriction = false"
    >
      <BaseTypography variant="body" color="secondary">
        This modal requires explicit user decision. It can't be dismissed by
        clicking outside.
      </BaseTypography>
    </BaseModal>

    <BaseModal
      v-model="modals.lowFriction"
      variant="sheet"
      friction="low"
      header="Low Friction Modal"
      @confirm="handleModalAction('Low friction confirmed')"
      @cancel="modals.lowFriction = false"
    >
      <BaseTypography variant="body">
        This modal can be easily dismissed and doesn't require as much
        attention.
      </BaseTypography>
    </BaseModal>

    <BaseModal
      v-model="modals.noFriction"
      variant="sheet"
      friction="none"
      header="No Friction Modal"
      :show-footer="false"
      @hide="handleModalAction('No friction dismissed')"
    >
      <BaseTypography variant="body">
        This modal has minimal friction and can be dismissed very easily.
      </BaseTypography>
    </BaseModal>

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
import BaseButton from '@/shared/components/BaseButton.vue';
import BaseInput from '@/shared/components/BaseInput.vue';
import BaseTypography from '@/shared/components/BaseTypography.vue';
import BaseModal from '@/shared/components/BaseModal.vue';
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

// Modals
const modals = reactive({
  sheet: false,
  alert: false,
  fullscreen: false,
  drawer: false,
  highFriction: false,
  lowFriction: false,
  noFriction: false,
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

function viewCard(item: any): void {
  showToast(`Viewing: ${item.title}`);
}

function openModal(variant: string): void {
  modals[variant as keyof typeof modals] = true;
}

function openFrictionModal(friction: string): void {
  const modalKey = `${friction}Friction` as keyof typeof modals;
  modals[modalKey] = true;
}

function handleModalAction(message: string): void {
  showToast(message);
  // Close all modals
  Object.keys(modals).forEach((key) => {
    modals[key as keyof typeof modals] = false;
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
</script>
