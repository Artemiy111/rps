<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/authStore'
const authStore = useAuthStore()

try {
  await authStore.refresh()
} catch (e) {}
</script>
