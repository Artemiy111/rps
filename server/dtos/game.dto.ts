import type { GameFromDBWithPlayersAndRounds, GameRoundData } from '~/types'

import { GameWs } from '../models/GameWs'
import { UserDTO } from './user.dto'

export class GameDTO {
  public id: string = ''
  public createdAt: string = ''
  public started: boolean = false
  public startedAt: string | null = null
  public ended: boolean = false
  public endedAt: string | null = null
  public players: UserDTO[] = []
  public rounds: GameRoundData[] = []

  constructor(game: GameWs | GameFromDBWithPlayersAndRounds) {
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
