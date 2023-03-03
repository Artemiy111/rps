import type { UserApiData, Token } from '~/types'

class AuthApi {
  async signup(data: {
    username: string
    password: string
    repeatPassword: string
  }): Promise<UserApiData> {
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

  async login(data: { username: string; password: string }): Promise<UserApiData> {
    return await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: data.username,
        password: data.password,
      },
    })
  }

  async logout(): Promise<Token> {
    return await $fetch('/api/auth/logout')
  }

  async refresh(): Promise<UserApiData> {
    return await $fetch('/api/auth/refresh')
  }
}

export const authApi = new AuthApi()
