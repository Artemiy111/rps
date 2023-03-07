import type { UserSafeInfo } from '~/types'

import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserSafeInfo | null>(null)

  return {
    user,
  }
})
