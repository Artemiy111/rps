import type {
  User as UserDb,
  UserToken as TokenDb,
  Game as GameDb,
  GameRound as GameRoundDb,
  GameRoundPlayer as GameRoundDbPlayer,
} from '@prisma/client'

export type { GameDb, UserDb, TokenDb }

type GameRoundDbWithPlayers = GameRoundDb & { players: GameRoundDbPlayer[] }

export type GameDBWithPlayersAndRounds = GameDb & {
  players: UserDb[]
  rounds: GameRoundDbWithPlayers[]
}
