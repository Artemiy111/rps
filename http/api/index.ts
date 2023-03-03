import { ofetch } from 'ofetch'

export const api = ofetch.create({
  onRequest({ options }) {
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
      const userData = await api('/api/auth/refresh')
      localStorage.setItem('access-token', userData.accessToken)
    }
  },
})
//TODO сделать рабочий интерсептор
