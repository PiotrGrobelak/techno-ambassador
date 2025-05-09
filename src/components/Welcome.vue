<template>
  <div class="welcome-container">
    <h1 class="text-4xl font-bold">Welcome to Astro with Vue 3!</h1>
    <p>
      This is a simple example to check that Vue 3 integration is working
      correctly.
    </p>
    <div class="counter-section">
      <p>Counter: {{ count }}</p>
      <button @click="increment">Increment</button>
      <button @click="reset">Reset</button>
    </div>
    <div class="info-section">
      <h2>Project Information</h2>
      <p>
        This project demonstrates the integration of Vue 3 components in an
        Astro project.
      </p>

      <p>Current time: {{ currentTime }}</p>
      <Button label="Click me" @click="increment" />
      <MultiSelect
        v-model="selectedCities"
        :options="cities"
        optionLabel="name"
        filter
        placeholder="Select Cities"
        :maxSelectedLabels="3"
        class="w-full md:w-80"
      />
    </div>
    <Password v-model="password" :toggleMask="true" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Button from "primevue/button";
import MultiSelect from "primevue/multiselect";

import Password from "primevue/password";

// State
const count = ref(0);
const currentTime = ref("");
const password = ref("");
// Methods
const increment = () => {
  count.value++;
};

const reset = () => {
  count.value = 0;
};

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString();
};

// Lifecycle hooks
onMounted(() => {
  updateTime();
  // Update time every second
  setInterval(updateTime, 1000);
});

const selectedCities = ref();
const cities = ref([
  { name: "New York", code: "NY" },
  { name: "Rome", code: "RM" },
  { name: "London", code: "LDN" },
  { name: "Istanbul", code: "IST" },
  { name: "Paris", code: "PRS" },
]);
</script>

<style scoped>
.welcome-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
  text-align: center;
}

h1 {
  color: #4f46e5;
  margin-bottom: 1rem;
}

.counter-section {
  margin: 2rem 0;
  padding: 1rem;
  background-color: #f3f4f6;
  border-radius: 8px;
}

button {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #4338ca;
}

.info-section {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f3f4f6;
  border-radius: 8px;
}

h2 {
  color: #4f46e5;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
</style>
