import type { GameRound } from '~/types'
import type { GameDBWithPlayersAndRounds } from '~/types/server'

import { GameWs } from '../models/GameWs'
import { UserDTO } from './user.dto'

export class GameDTO {
  public readonly id: string
  public readonly createdAt: string
  public readonly started: boolean = false
  public readonly startedAt: string | null = null
  public readonly ended: boolean = false
  public readonly endedAt: string | null = null
  public readonly players: UserDTO[] = []
  public readonly rounds: GameRound[] = []

  constructor(game: GameWs | GameDBWithPlayersAndRounds) {
    this.id = game.id
    this.createdAt = game.createdAt.toISOString()
    this.started = game.startedAt === null ? false : true
    this.startedAt = game.startedAt?.toISOString() || null
    this.ended = game.endedAt === null ? false : true
    this.endedAt = game.endedAt?.toISOString() || null
    this.players = game.players.map(p => ({ id: p.id, name: p.name }))

    if (game instanceof GameWs) {
      this.rounds = game.rounds
    } else {
      this.rounds = game.rounds.map(r => ({
        order: r.order,
        winnerId: r.winnerId,
        winnerCard: r.winnerCard,
        breakBetweenRoundsEndsIn: Date.now(),
        players: r.players.map(p => ({ id: p.userId, card: p.card })),
      }))
    }
  }
}
