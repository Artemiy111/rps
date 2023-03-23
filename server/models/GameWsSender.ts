import type {
  GameEmoji,
  GameMessageFromApi,
  GameMessageFromApiBase,
  GameMessageFromApiContinues,
  GameMessageFromApiEnded,
  GameMessageFromClient,
} from '~/types'
import { isGameMessageFromApiContinues, isGameMessageFromApiEnded } from '~/types'

import { RawData, WebSocket } from 'ws'

import { GameWs } from './GameWs'

export class GameWsSender {
  constructor(private game: GameWs) {}

  static parseMessage(event: RawData): GameMessageFromClient {
    return JSON.parse(event.toString('utf-8')) as GameMessageFromClient
  }

  static sendMessage(ws: WebSocket, message: GameMessageFromApi) {
    ws.send(JSON.stringify(message))
  }

  private generateMessageBase(): GameMessageFromApiBase {
    const messageBase: GameMessageFromApiBase = {
      game: {
        id: this.game.id,
        started: this.game.started,
        startedAt: this.game.startedAt?.getTime() || null,
        ended: this.game.ended,
        endedAt: this.game.endedAt?.getTime() || null,
        players: this.game.players.map(p => ({ id: p.id, name: p.name })),
        rounds: this.game.rounds,
      },
    }
    return messageBase
  }

  private generateMessageEnded(): GameMessageFromApiEnded | null {
    const messageBase = this.generateMessageBase()
    if (!isGameMessageFromApiEnded(messageBase)) return null

    const messageEnded: GameMessageFromApiEnded = messageBase
    return messageEnded
  }

  private generageMessageContinues(
    playerId: string,
    emoji?: GameEmoji
  ): GameMessageFromApiContinues | null {
    const player = this.game.getPlayer(playerId)!
    const messageBase = this.generateMessageBase()

    if (!isGameMessageFromApiContinues(messageBase)) return null

    const messageContinues: GameMessageFromApiContinues = {
      game: messageBase.game,
      sender: {
        user: {
          id: player.id,
          name: player.name,
        },
        connected: player.isConnected,
        card: player.currentCard,
        emoji: emoji,
      },
    }
    return messageContinues
  }

  private generateMessage(playerId: string, emoji?: GameEmoji): GameMessageFromApi {
    const messageBase = this.generateMessageBase()

    const messageEnded = this.generateMessageEnded()
    if (messageEnded) return messageEnded

    const messageContinues = this.generageMessageContinues(playerId, emoji)
    if (messageContinues) return messageContinues

    return messageBase
  }

  sendBaseMessageToCurrentSocket(socketId: string, ws: WebSocket) {
    const messageBase = this.generateMessageBase()
    GameWsSender.sendMessage(ws, messageBase)
  }

  sendPlayerMessageToCurrentSocket(socketId: string, ws: WebSocket, playerId: string) {
    const playerMessage = this.generateMessage(playerId)
    console.log(`[init ws] ${socketId}`)
    GameWsSender.sendMessage(ws, playerMessage)
    console.log(this.game.players.map(p => p.name))
  }

  sendEnemyMessageToCurrentSocket(socketId: string, ws: WebSocket, enemyId: string) {
    const enemyMessage = this.generateMessage(enemyId)
    // console.log(`[from en]`)
    GameWsSender.sendMessage(ws, enemyMessage)
  }

  sendPlayerMessageToEnemy(playerId: string, enemyId: string) {
    const enemy = this.game.getPlayer(enemyId)!
    const playerMessage = this.generateMessage(playerId)
    for (const [_, enemySocket] of enemy.sockets) {
      // console.log(`[to enm from] ${enemySocketId}`)
      GameWsSender.sendMessage(enemySocket, playerMessage)
    }
  }

  sendPlayerMessageToAllGameSockets(playerId: string, emoji?: GameEmoji) {
    const player = this.game.getPlayer(playerId)!
    const playerMessage = this.generateMessage(playerId, emoji)
    for (const gamePlayer of this.game.players) {
      for (const [gamePlayerSocketId, gamePlayerSocket] of gamePlayer.sockets) {
        console.log(`[to all from] ${player.name} [to ws] ${gamePlayerSocketId}`)
        GameWsSender.sendMessage(gamePlayerSocket, playerMessage)
      }
    }
  }
}