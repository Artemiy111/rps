import { useAuthStore } from '~~/stores/auth.store'
const localePath = useLocalePath()
const authStore = useAuthStore()

export default defineNuxtRouteMiddleware((to, from) => {
  if (!authStore.isAuth) {
    return navigateTo(localePath('/login'))
  }
  return
})
