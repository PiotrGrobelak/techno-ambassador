<template>
  <div
    v-if="shouldShowBanner"
    :class="bannerClasses"
    role="banner"
    aria-live="polite"
  >
    <div class="flex items-start gap-4">
      <!-- Icon -->
      <div class="flex-shrink-0">
        <svg
          :class="iconClasses"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            v-if="bannerVariant === 'success'"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            v-else-if="bannerVariant === 'warning'"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h3 :class="titleClasses">
          {{ bannerTitle }}
        </h3>
        <p :class="descriptionClasses">
          {{ bannerDescription }}
        </p>

        <!-- Progress bar for completion mode -->
        <div
          v-if="mode === 'complete' && completionPercentage < 100"
          class="mt-3"
        >
          <div
            class="flex items-center justify-between text-sm text-gray-600 mb-1"
          >
            <span>Profile completion</span>
            <span>{{ completionPercentage }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
              :style="{ width: `${completionPercentage}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Close button for edit mode -->
      <button
        v-if="mode === 'edit' && dismissible"
        @click="$emit('dismiss')"
        class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss banner"
      >
        <svg
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ProfileFormMode } from '../types/profile.types';

interface Props {
  mode: ProfileFormMode;
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  dismissible?: boolean;
}

interface Emits {
  (e: 'dismiss'): void;
}

const props = withDefaults(defineProps<Props>(), {
  dismissible: true,
});

const emit = defineEmits<Emits>();

/** Determine if banner should be shown */
const shouldShowBanner = computed(() => {
  if (props.mode === 'complete') return true;
  if (props.mode === 'edit' && !props.isComplete) return true;
  return false;
});

/** Banner variant based on completion status */
const bannerVariant = computed(() => {
  if (props.isComplete) return 'success';
  if (props.mode === 'complete') return 'warning';
  return 'info';
});

/** Banner title text */
const bannerTitle = computed(() => {
  if (props.isComplete && props.mode === 'edit') {
    return 'Profile Complete';
  }

  if (props.mode === 'complete') {
    return 'Complete Your DJ Profile';
  }

  return 'Profile Incomplete';
});

/** Banner description text */
const bannerDescription = computed(() => {
  if (props.isComplete && props.mode === 'edit') {
    return 'Your profile is complete and visible to other users.';
  }

  if (props.mode === 'complete') {
    return 'Fill out your profile information to start connecting with events and other DJs in the techno community.';
  }

  const fieldNames = props.missingFields
    .map((field) => {
      switch (field) {
        case 'artist_name':
          return 'artist name';
        case 'biography':
          return 'biography';
        case 'instagram_url':
          return 'Instagram URL';
        case 'facebook_url':
          return 'Facebook URL';
        case 'music_style_ids':
          return 'music styles';
        default:
          return field;
      }
    })
    .join(', ');

  return `Please complete the following fields: ${fieldNames}`;
});

/** Dynamic banner CSS classes */
const bannerClasses = computed(() => {
  const baseClasses = 'rounded-lg p-4 mb-6 border';

  switch (bannerVariant.value) {
    case 'success':
      return `${baseClasses} bg-green-50 border-green-200`;
    case 'warning':
      return `${baseClasses} bg-yellow-50 border-yellow-200`;
    default:
      return `${baseClasses} bg-blue-50 border-blue-200`;
  }
});

/** Icon CSS classes */
const iconClasses = computed(() => {
  const baseClasses = 'h-6 w-6';

  switch (bannerVariant.value) {
    case 'success':
      return `${baseClasses} text-green-600`;
    case 'warning':
      return `${baseClasses} text-yellow-600`;
    default:
      return `${baseClasses} text-blue-600`;
  }
});

/** Title CSS classes */
const titleClasses = computed(() => {
  const baseClasses = 'text-sm font-medium';

  switch (bannerVariant.value) {
    case 'success':
      return `${baseClasses} text-green-800`;
    case 'warning':
      return `${baseClasses} text-yellow-800`;
    default:
      return `${baseClasses} text-blue-800`;
  }
});

/** Description CSS classes */
const descriptionClasses = computed(() => {
  const baseClasses = 'mt-1 text-sm';

  switch (bannerVariant.value) {
    case 'success':
      return `${baseClasses} text-green-700`;
    case 'warning':
      return `${baseClasses} text-yellow-700`;
    default:
      return `${baseClasses} text-blue-700`;
  }
});
</script>
