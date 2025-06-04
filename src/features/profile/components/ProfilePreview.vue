<template>
  <div class="profile-preview">
    <!-- Preview Header -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Profile Preview</h3>
      <p class="text-sm text-gray-600">
        This is how your profile appears to other users
      </p>
    </div>

    <!-- Preview Card -->
    <div
      class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <!-- Profile Header -->
      <div class="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8">
        <div class="flex items-center space-x-4">
          <!-- Avatar Placeholder -->
          <div
            class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"
              />
            </svg>
          </div>

          <!-- Profile Info -->
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold text-white truncate">
              {{ profileData.artist_name || 'Your Artist Name' }}
            </h2>
            <div class="flex items-center mt-2 space-x-4">
              <!-- Music Styles -->
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="style in displayedMusicStyles"
                  :key="style.id"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white"
                >
                  {{ style.style_name }}
                </span>
                <span
                  v-if="remainingStylesCount > 0"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white"
                >
                  +{{ remainingStylesCount }} more
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Content -->
      <div class="p-6">
        <!-- Biography -->
        <div class="mb-6">
          <h4 class="text-sm font-medium text-gray-900 mb-3">About</h4>
          <p class="text-gray-700 leading-relaxed">
            {{
              profileData.biography ||
              'Your biography will appear here. Share your musical journey, style, and what makes you unique...'
            }}
          </p>
        </div>

        <!-- Social Media Links -->
        <div class="mb-6" v-if="hasSocialMedia">
          <h4 class="text-sm font-medium text-gray-900 mb-3">Social Media</h4>
          <div class="flex space-x-4">
            <!-- Instagram -->
            <a
              v-if="profileData.instagram_url"
              :href="profileData.instagram_url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-pink-600 bg-pink-50 hover:bg-pink-100 transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348zm7.718 0c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348z"
                />
              </svg>
              Instagram
            </a>

            <!-- Facebook -->
            <a
              v-if="profileData.facebook_url"
              :href="profileData.facebook_url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
              Facebook
            </a>
          </div>
        </div>

        <!-- Music Styles Grid -->
        <div v-if="allMusicStyles.length > 0">
          <h4 class="text-sm font-medium text-gray-900 mb-3">Music Styles</h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <span
              v-for="style in allMusicStyles"
              :key="style.id"
              class="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 text-center justify-center"
            >
              {{ style.style_name }}
            </span>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <div
            class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <h3 class="text-sm font-medium text-gray-900 mb-1">
            Complete your profile
          </h3>
          <p class="text-sm text-gray-500">
            Fill out your information to see how your profile will look
          </p>
        </div>
      </div>

      <!-- Profile Actions -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div class="flex justify-between items-center">
          <!-- Profile Stats -->
          <div class="flex space-x-6 text-sm">
            <div class="text-center">
              <div class="font-medium text-gray-900">
                {{ completionPercentage }}%
              </div>
              <div class="text-gray-500">Complete</div>
            </div>
            <div class="text-center">
              <div class="font-medium text-gray-900">
                {{ allMusicStyles.length }}
              </div>
              <div class="text-gray-500">Styles</div>
            </div>
          </div>

          <!-- View Public Profile Button -->
          <Button
            v-if="showPublicProfileButton && profileData.artist_name"
            label="View Public Profile"
            severity="secondary"
            outlined
            size="small"
            @click="viewPublicProfile"
          />
        </div>
      </div>
    </div>

    <!-- Profile Tips -->
    <div
      v-if="showTips"
      class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
    >
      <div class="flex items-start">
        <svg
          class="h-5 w-5 text-blue-400 mt-0.5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189 6.01 6.01 0 011.041-.297 5.84 5.84 0 00.446-.297M12 12.75V8.25m0 4.5c-.518.518-1.143.75-1.875.75a3.181 3.181 0 01-1.875-.75M12 12.75V8.25M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
        <div>
          <h4 class="text-sm font-medium text-blue-800 mb-1">Profile Tips</h4>
          <ul class="text-sm text-blue-700 space-y-1">
            <li v-if="!profileData.artist_name">
              • Add your artist name to make your profile discoverable
            </li>
            <li v-if="!profileData.biography">
              • Write a compelling biography to attract event organizers
            </li>
            <li v-if="allMusicStyles.length === 0">
              • Select music styles to help others find your sound
            </li>
            <li v-if="!hasSocialMedia">
              • Add social media links to boost your credibility
            </li>
            <li v-if="isProfileComplete">
              • Your profile is complete! You're ready to connect with events
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import Button from 'primevue/button';
import type { ProfileFormData } from '../types/profile.types';
import type { MusicStyleDto, UserMusicStyleDto } from '../../../types';

interface Props {
  profileData: ProfileFormData;
  completionPercentage: number;
  showPublicProfileButton?: boolean;
  showTips?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showPublicProfileButton: true,
  showTips: true,
});

// Component state
const musicStyles = ref<MusicStyleDto[]>([]);
const maxDisplayedStyles = 3;

// Computed properties
const allMusicStyles = computed(() => {
  return props.profileData.music_style_ids
    .map((id) => musicStyles.value.find((style) => style.id === id))
    .filter(Boolean) as MusicStyleDto[];
});

const displayedMusicStyles = computed(() => {
  return allMusicStyles.value.slice(0, maxDisplayedStyles);
});

const remainingStylesCount = computed(() => {
  return Math.max(0, allMusicStyles.value.length - maxDisplayedStyles);
});

const hasSocialMedia = computed(() => {
  return Boolean(
    props.profileData.instagram_url || props.profileData.facebook_url
  );
});

const isProfileComplete = computed(() => {
  return (
    props.profileData.artist_name.length >= 2 &&
    props.profileData.biography.length > 0 &&
    props.profileData.music_style_ids.length > 0 &&
    props.profileData.instagram_url.length > 0 &&
    props.profileData.facebook_url.length > 0
  );
});

// Methods
const viewPublicProfile = () => {
  // This would navigate to the public profile page
  // For now, we'll just show an alert
  const artistName = props.profileData.artist_name
    .toLowerCase()
    .replace(/\s+/g, '-');
  const publicUrl = `/dj/${artistName}`; // Placeholder URL structure

  // In a real implementation, this would navigate to the public profile
  window.open(publicUrl, '_blank');
};

const loadMusicStyles = async (): Promise<void> => {
  try {
    const response = await fetch('/api/music-styles?limit=100');

    if (!response.ok) {
      throw new Error('Failed to load music styles');
    }

    const result = await response.json();
    musicStyles.value = result.data || [];
  } catch (error) {
    console.error('Error loading music styles for preview:', error);
  }
};

// Lifecycle
onMounted(() => {
  loadMusicStyles();
});
</script>
