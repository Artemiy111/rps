import type { GameRoundData } from '~/types'

import { GameWs } from '~/server/services/gameWs.service'
import { UserDTO } from '~/server/dtos/user.dto'

export class GameDTO {
  public id: string = ''
  public createdAt: string = ''
  public started: boolean = false
  public startedAt: string | null = null
  public ended: boolean = false
  public endedAt: string | null = null
  public players: UserDTO[] = []
  public rounds: GameRoundData[] = []

  constructor(gameWs: GameWs) {
    this.id = gameWs.id
    this.createdAt = gameWs.createdAt.toISOString()
    this.started = gameWs.started
    this.startedAt = gameWs.startedAt?.toISOString() || null
    this.ended = gameWs.ended
    this.endedAt = gameWs.endedAt?.toISOString() || null
    this.players = gameWs.players.map(p => ({ id: p.id, name: p.name }))
    this.rounds = gameWs.rounds
  }
}
