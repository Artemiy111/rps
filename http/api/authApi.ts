import type { UserWithTokensFromApi } from '~/types'
import type { TokenDb } from '~/types/server'

class AuthApi {
  async signup(data: {
    username: string
    password: string
    repeatPassword: string
  }): Promise<UserWithTokensFromApi> {
    const userData = await $fetch('/api/auth/signup', {
      method: 'POST',
      body: {
        username: data.username,
        password: data.password,
        repeatPassword: data.repeatPassword,
      },
    })
    localStorage.setItem('access-token', userData.accessToken)
    return userData
  }

  async login(data: { username: string; password: string }): Promise<UserWithTokensFromApi> {
    return await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: data.username,
        password: data.password,
      },
    })
  }

  async logout(): Promise<TokenDb> {
    return await $fetch('/api/auth/logout')
  }

  async refresh(): Promise<UserWithTokensFromApi> {
    return await $fetch('/api/auth/refresh')
  }
}

export const authApi = new AuthApi()
