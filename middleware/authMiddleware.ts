import { useAuthStore } from '~/store/authStore'
const localePath = useLocalePath()
const authStore = useAuthStore()

export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log(authStore.isAuth)
  if (!authStore.isAuth) {
    return navigateTo(localePath('/login'))
  }
  return
})
