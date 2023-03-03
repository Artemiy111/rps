import type { UserSafeInfo, UserApiData, Token } from '~/types'

import { defineStore } from 'pinia'

import { authApi } from '~/http/api/authApi'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserSafeInfo | null>(null)

  const setAccessToken = (token: string) => {
    localStorage.setItem('access-token', token)
  }

  const removeAccessToken = () => {
    localStorage.removeItem('access-token')
  }

  const login = async (username: string, password: string): Promise<UserApiData> => {
    const userData = await authApi.login({ username, password })
    user.value = userData.user
    setAccessToken(userData.accessToken)
    return userData
  }

  const signup = async (
    username: string,
    password: string,
    repeatPassword: string
  ): Promise<UserApiData> => {
    const userData = await authApi.signup({
      username,
      password,
      repeatPassword,
    })
    return userData
  }

  const refresh = async (): Promise<UserApiData> => {
    const userData = await authApi.refresh()
    user.value = userData.user
    setAccessToken(userData.accessToken)
    return userData
  }

  const logout = async (): Promise<Token> => {
    const token = authApi.logout()
    user.value = null
    removeAccessToken()
    return token
  }

  return {
    user,

    login,
    signup,
    refresh,
    logout,
  }
})
