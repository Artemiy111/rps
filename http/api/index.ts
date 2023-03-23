import type { FetchOptions, FetchError } from 'ofetch'
import { ofetch } from 'ofetch'
import type { NitroFetchRequest } from 'nitropack'

import { authApi } from './authApi'

const fetcher = ofetch.create({
  async onRequest({ options }) {
    const accessToken = localStorage.getItem('access-token')

    if (accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      }
    }
  },
  async onResponse({ request, response }) {
    if (response.status === 401 && request !== '/api/auth/refresh') {
      try {
        const { accessToken } = await authApi.refresh()
        localStorage.setItem('access-token', accessToken)
      } catch (e) {
        const localePath = useLocalePath()
        console.log('Redirect to login')
        navigateTo(localePath('/login'))
      }
    }
  },
})

export const api = async <T>(request: NitroFetchRequest, options?: FetchOptions) => {
  try {
    const response = await fetcher(request, options)
    return response as T
  } catch (_error) {
    const error = _error as FetchError
    if (error.statusCode === 401) {
      const response = await fetcher(request, options)
      return response as T
    }
    throw error
  }
}
