import type { UserDTO } from '~/types'

import { api } from '.'

class UserApi {
  async getUser() {
    return await api<UserDTO>('/api/user')
  }
}

export const userApi = new UserApi()
