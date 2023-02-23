<template>
  <div class="relative">
    <img src="~/assets/banner.png" alt="banner" class="h-auto min-h-[300px] w-full object-cover" />
    <div class="absolute bottom-16 left-8 flex gap-5">
      <VButton type="primary" size="md">Быстрый матч</VButton>
      <VButton size="md">Создать матч</VButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import VButton from './ui/VButton.vue'
</script>

<style scoped></style>
