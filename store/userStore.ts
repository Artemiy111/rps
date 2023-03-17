import type { UserDTO } from '~/types'

import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserDTO | null>(null)

  return {
    user,
  }
})
