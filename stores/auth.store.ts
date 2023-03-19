import type { UserDTO, UserApiData, Token } from '~/types'

import { defineStore } from 'pinia'

import { authApi } from '~/http/api/authApi'

import { useUserStore } from './user.store'

export const useAuthStore = defineStore('auth', () => {
  const userStore = useUserStore()
  const isAuth = ref(false)
  const setAccessToken = (token: string) => {
    localStorage.setItem('access-token', token)
  }

  const removeAccessToken = () => {
    localStorage.removeItem('access-token')
  }

  const login = async (username: string, password: string): Promise<UserApiData> => {
    const userData = await authApi.login({ username, password })
    userStore.user = userData.user
    isAuth.value = true
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
    userStore.user = userData.user
    isAuth.value = true
    setAccessToken(userData.accessToken)
    return userData
  }

  const logout = async (): Promise<Token> => {
    const token = authApi.logout()
    userStore.user = null
    isAuth.value = false
    removeAccessToken()
    return token
  }

  return {
    isAuth,

    login,
    signup,
    refresh,
    logout,
  }
})
