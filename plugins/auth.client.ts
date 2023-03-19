import { useAuthStore } from '~~/stores/auth.store'

export default defineNuxtPlugin(async nuxtApp => {
  const authStore = useAuthStore()

  try {
    await authStore.refresh()
  } catch (e) {}
})
