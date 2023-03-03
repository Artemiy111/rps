<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useUserStore } from '~/store/userStore'
import { api } from '~/http/api'

const userStore = useUserStore()

onMounted(async () => {
  await userStore.refresh()
})
</script>
