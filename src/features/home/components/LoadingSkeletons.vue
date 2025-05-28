<template>
  <div
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
  >
    <div
      v-for="index in count"
      :key="index"
      class="bg-white rounded-lg shadow-md p-6 border border-gray-200"
    >
      <!-- Artist name skeleton -->
      <Skeleton height="1.5rem" class="mb-3" />

      <!-- Biography skeleton -->
      <div class="mb-4">
        <Skeleton height="1rem" class="mb-2" />
        <Skeleton height="1rem" class="mb-2" />
        <Skeleton height="1rem" width="70%" />
      </div>

      <!-- Music styles skeleton -->
      <div class="mb-4">
        <div class="flex flex-wrap gap-2">
          <Skeleton
            v-for="styleIndex in 3"
            :key="styleIndex"
            height="1.5rem"
            width="4rem"
            class="rounded-full"
          />
        </div>
      </div>

      <!-- Events count and button skeleton -->
      <div class="flex items-center justify-between">
        <Skeleton height="1rem" width="6rem" />
        <Skeleton height="2.5rem" width="5rem" class="rounded-lg" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton';

interface Props {
  count?: number;
}

withDefaults(defineProps<Props>(), {
  count: 8,
});
</script>
