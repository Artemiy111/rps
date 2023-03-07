import type { User, Token } from '@prisma/client'
export type { User, Token }

export type UserSafeInfo = Omit<User, 'password'>

export type UserApiData = {
  user: UserSafeInfo
  accessToken: string
  refreshToken: string
}

export type GameCard = 'rock' | 'paper' | 'scissors' | 'hand'

export type GameMessage = {
  gameId: string
  userId: string
  message: {
    card: GameCard
  }
}
