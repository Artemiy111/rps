import type { User, UserToken as Token, Game, GameRound } from '@prisma/client'
export type { User, Token, Game, GameRound }

export type UserSafeInfo = Omit<User, 'password'>

export type UserApiData = {
  user: UserSafeInfo
  accessToken: string
  refreshToken: string
}

export type GameCard = 'rock' | 'paper' | 'scissors' | 'hand'

export type GameMessageFromClient = {
  game: {
    id: string
  }
  sender: UserSafeInfo
  message: {
    card: GameCard
  }
}

export type GameMessageFromApi = {
  game: {
    id: string
  }
  sender: UserSafeInfo
  connected: boolean
  message: {
    card: GameCard
    rounds: GameRoundData[]
  }
}

export type GameRoundData = {
  order: number
  winnerId?: string
  winnerCard?: GameCard
  players: {
    id: string
    card: GameCard
  }[]
}

export type GameStatus = 'waiting' | 'timer' | 'lose' | 'draw' | 'win'
export type GameRoundStatus = 'lose' | 'draw' | 'win'
