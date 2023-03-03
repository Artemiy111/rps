import type { User, Token } from '@prisma/client'
export type { User, Token }

export type UserSafeInfo = Omit<User, 'password'>

export type UserData = {
  user: {
    id: string
    name: string
  }
  accessToken: string
  refreshToken: string
}
