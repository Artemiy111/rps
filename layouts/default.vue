<template>
  <div class="container mx-auto px-4 text-base">
    <div class="min-h-screen">
      <TheHeader />
      <main class="mb-32"><slot></slot></main>
    </div>
    <TheFooter class="mb-8" />
  </div>
</template>

<script setup lang="ts">
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'
</script>
