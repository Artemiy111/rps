import { UserDTO } from '../dtos/user.dto'
import { v4 as uuid } from 'uuid'

import { GameWs } from '~/server/models/GameWs'
import { PlayerWs } from '~/server/models/PlayerWs'

type SocketId = string
type GameId = string

class GameWsService {
  private _games = new Map<GameId, GameWs>()

  generateSocketId() {
    return uuid()
  }

  get games(): Map<GameId, GameWs> {
    return this._games
  }

  hasGame(gameId: string): boolean {
    return this._games.has(gameId)
  }

  getGame(gameId: string): GameWs | null {
    return this._games.get(gameId) || null
  }

  addGame(gameWs: GameWs) {
    if (this.hasGame(gameWs.id)) throw new Error(`Game with id: ${gameWs.id} is already exicts`)
    this._games.set(gameWs.id, gameWs)
  }

  removeGame(gameId: string) {
    this._games.delete(gameId)
  }

  getGameInfoFromSocketId(socketId: SocketId): {
    game: GameWs | null
    player: PlayerWs | null
    enemy: PlayerWs | null
  } {
    let game: GameWs | null = null
    let player: PlayerWs | null = null
    let enemy: PlayerWs | null = null

    for (const [_, gameData] of this.games) {
      for (const gamePlayer of gameData.players) {
        if (gamePlayer.hasSocket(socketId)) {
          game = gameData
          player = gamePlayer
          enemy = gameData.getEnemy(gamePlayer.id)
        }
      }
    }
    return { game, player, enemy }
  }

  getCurrentActiveUsers(): UserDTO[] {
    const players = new Map<string, UserDTO>()

    for (const [_, game] of this._games) {
      game.players.forEach(player => {
        if (player.isConnected && !players.has(player.id))
          players.set(player.id, new UserDTO(player))
      })
    }

    return Array.from(players.values())
  }
}

export const gameWsService = new GameWsService()
