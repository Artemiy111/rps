import type { User, UserData, Token } from '~/types'

import { defineStore } from 'pinia'

import { authApi } from '~/http/api/authApi'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)

  const setAccessToken = (token: string) => {
    localStorage.setItem('access-token', token)
    accessToken.value = token
  }

  const removeAccessToken = () => {
    localStorage.removeItem('access-token')
    accessToken.value = null
  }

  const login = async (username: string, password: string): Promise<UserData> => {
    const userData = await authApi.login({ username, password })
    setAccessToken(userData.accessToken)
    return userData
  }

  const signup = async (
    username: string,
    password: string,
    repeatPassword: string
  ): Promise<UserData> => {
    const userData = await authApi.signup({
      username,
      password,
      repeatPassword,
    })

    return userData
  }

  const refresh = async (): Promise<UserData> => {
    const userData = await authApi.refresh()
    setAccessToken(userData.accessToken)
    return userData
  }

  const logout = async (): Promise<Token> => {
    const token = authApi.logout()
    removeAccessToken()
    return token
  }

  return {
    user,

    login,
    signup,
    refresh,
    logout,

    setAccessToken,
  }
})
