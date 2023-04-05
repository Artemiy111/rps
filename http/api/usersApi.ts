import type { UserDTO } from '~/types'

import { api } from '.'

class UsersApi {
  async getActiveUsers(): Promise<UserDTO[]> {
    return await api('/api/users/online')
  }
}

export const usersApi = new UsersApi()
