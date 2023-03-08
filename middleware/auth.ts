import { useAuthStore } from '~/store/authStore'
const localePath = useLocalePath()
const authStore = useAuthStore()

export default defineNuxtRouteMiddleware((to, from) => {
  if (!authStore.isAuth) {
    return navigateTo(localePath('/login'))
  }
  return
})
