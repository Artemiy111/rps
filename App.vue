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
  const accessToken = localStorage.getItem('access-token')
  if (typeof accessToken === 'string') userStore.setAccessToken(accessToken)
  api('/api/data').then(r => console.log(r))
})
</script>
