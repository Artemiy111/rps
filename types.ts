import type { User, UserToken as Token, Game, GameRound, GameRoundPlayer } from '@prisma/client'
export type { User, Token, Game, GameRound }

import { GameDTO as GameFromApi } from '~/server/dtos/game.dto'
import { UserDTO as UserFromApi } from '~/server/dtos/user.dto'

export type UserDTO = UserFromApi
export type GameDTO = GameFromApi

export type UserWithTokensFromApi = {
  user: UserDTO
  accessToken: string
  refreshToken: string
}

export type GameCard = 'rock' | 'paper' | 'scissors'
export type GameEmoji = '😎' | '👺' | '🤓'

export type GameMessageFromClient = {
  initial: boolean
  game: {
    id: string
  }
  sender: { user: UserDTO; card: GameCard | null; emoji?: GameEmoji }
}

export interface GameMessageFromApiBase {
  game: {
    id: string
    started: boolean
    startedAt: number | null
    ended: boolean
    endedAt: number | null
    players: UserDTO[]
    rounds: GameRoundData[]
  }
}

export interface GameMessageFromApiEnded extends GameMessageFromApiBase {
  game: {
    id: string
    started: boolean
    startedAt: number | null
    ended: true
    endedAt: number
    players: UserDTO[]
    rounds: GameRoundData[]
  }
}

export interface GameMessageFromApiContinues extends GameMessageFromApiBase {
  game: {
    id: string
    started: boolean
    startedAt: number | null
    ended: false
    endedAt: null
    players: UserDTO[]
    rounds: GameRoundData[]
  }
  sender: { user: UserDTO; connected: boolean; card: GameCard | null; emoji?: GameEmoji }
}

export type GameMessageFromApi =
  | GameMessageFromApiBase
  | GameMessageFromApiEnded
  | GameMessageFromApiContinues

export const isGameMessageFromApiEnded = (
  message: GameMessageFromApiBase
): message is GameMessageFromApiEnded => {
  if (message.game.ended) return true
  return false
}

export const isGameMessageFromApiContinues = (
  message: GameMessageFromApiBase
): message is GameMessageFromApiContinues => {
  if (!message.game.ended) return true
  return false
}

export type GameRoundData = {
  order: number
  winnerId: string | null
  winnerCard: GameCard | null
  players: {
    id: string
    card: GameCard | null
  }[]
  breakBetweenRoundsEndsIn: number
}

type GameRoundWithPlayers = GameRound & { players: GameRoundPlayer[] }

export type GameFromDBWithPlayersAndRounds = Game & {
  players: User[]
  rounds: GameRoundWithPlayers[]
}

export type GameStatus = GameStatusWaiting | GameRoundStatus | 'timer' | 'end' | 'disconnection'

export type GameStatusWaiting =
  | 'waitingEnemyJoin'
  | 'waitingEnemyMove'
  | 'waitingPlayerMove'
  | 'waitingMoves'

export type GameRoundStatus = 'lose' | 'draw' | 'win'
