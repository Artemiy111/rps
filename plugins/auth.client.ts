import { useAuthStore } from '~/store/authStore'

export default defineNuxtPlugin(async nuxtApp => {
  const authStore = useAuthStore()

  try {
    await authStore.refresh()
  } catch (e) {}
})
