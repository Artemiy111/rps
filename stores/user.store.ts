import type { UserDTO } from '~/types'

import { defineStore } from 'pinia'

import { userApi } from '~/http/api/userApi'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserDTO | null>(null)

  const loadUser = async () => {
    user.value = await userApi.getUser()
  }

  return {
    user,
    loadUser,
  }
})
