import {
  GameCard,
  GameMessageFromClient,
  GameMessageFromApi,
  GameMessageFromApiBase,
  GameMessageFromApiContinues,
  GameMessageFromApiEnded,
  GameRoundData,
  isGameMessageFromApiContinues,
  isGameMessageFromApiEnded,
  GameEmoji,
} from '~/types'

import { v4 as uuid } from 'uuid'
import { RawData, WebSocket } from 'ws'

import { getPlayerRoundResult } from '~/server/helpers/getPlayerRoundResult'
import { gameService } from './game.service'

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

  async loadGames() {
    const gamesResponce = await gameService.getAllGames()
    for (const game of gamesResponce) {
      const newGame = new GameWs(game.id)
      if (game.startedAt) newGame.setStartedStatus(game.startedAt)
      if (game.endedAt) newGame.setEndedStatus(game.endedAt)

      if (game.players.length === 2)
        // newGame.addPlayer(new PlayerWs(game.players[0].id, game.players[0].name))
        this.games.set(game.id, newGame)
    }
  }

  hasGame(gameId: string): boolean {
    return this._games.has(gameId)
  }

  getGame(gameId: string): GameWs | null {
    return this._games.get(gameId) || null
  }

  addGame(gameId: string): GameWs {
    if (this.hasGame(gameId)) throw new Error(`Game with id: ${gameId} is already exicts`)
    const newGame = new GameWs(gameId)
    this._games.set(gameId, newGame)
    return newGame
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
}

export const gameWsService = new GameWsService()

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

export class GameWs {
  public readonly createdAt: Date = new Date()
  private _started: boolean = false
  private _startedAt: Date | null = null
  private _ended: boolean = false
  private _endedAt: Date | null = null
  private _players: PlayerWs[] = []
  public rounds: GameRoundData[] = []

  constructor(public id: GameId) {}

  get started(): boolean {
    return this._started
  }
  get startedAt(): Date | null {
    return this._startedAt
  }
  get ended(): boolean {
    return this._ended
  }
  get endedAt(): Date | null {
    return this._endedAt
  }
  get players(): PlayerWs[] {
    return this._players
  }
  get isFilled() {
    return this.players.length === 2
  }
  get isBreakBetweenRounds() {
    return this.rounds.length !== 0 && this.rounds.at(-1)!.breakBetweenRoundsEndsIn - Date.now() > 0
  }

  addRound(breakBetweenRoundsEndsIn: number = Date.now() + 1500): number {
    if (!this.isFilled) {
      throw new Error('Could not add round to not filled game')
    }
    const player1 = this.players[0]
    const player2 = this.players[1]
    const player1RoundResult = getPlayerRoundResult(player1.currentCard, player2.currentCard)
    const newRound: GameRoundData = {
      order: this.rounds.length + 1,
      players: [
        { id: player1.id, card: player1.currentCard },
        { id: player2.id, card: player2.currentCard },
      ],
      winnerId: null,
      winnerCard: null,
      breakBetweenRoundsEndsIn: breakBetweenRoundsEndsIn,
    }
    switch (player1RoundResult) {
      case 'win':
        newRound.winnerId = player1.id
        newRound.winnerCard = player1.currentCard
        break
      case 'lose':
        newRound.winnerId = player2.id
        newRound.winnerCard = player2.currentCard
        break
    }
    this.rounds.push(newRound)
    return breakBetweenRoundsEndsIn
  }

  getPlayer(playerId: string): PlayerWs | null {
    return this.players.find(player => player.id === playerId) || null
  }

  getEnemy(playerId: string): PlayerWs | null {
    return this.players.find(player => player.id !== playerId) || null
  }

  addPlayer(player: PlayerWs): PlayerWs {
    if (this.isFilled) {
      throw new Error('Could not add player to filled game')
    }
    this.players.push(player)
    return player
  }

  setStartedStatus(startedAt: Date = new Date()) {
    this._started = true
    this._startedAt = startedAt
  }

  setEndedStatus(endedAt: Date = new Date()) {
    this._ended = true
    this._endedAt = endedAt
  }
}

export class PlayerWs {
  public sockets: Map<SocketId, WebSocket> = new Map()
  public currentCard: GameCard = null
  private _isConnected: boolean = false

  constructor(public id: string, public name: string) {}

  get isConnected(): boolean {
    return this._isConnected
  }

  get hasCard() {
    return this.currentCard !== null
  }

  hasSocket(socketId: string): boolean {
    return this.sockets.has(socketId)
  }

  getSocket(socketId: string): WebSocket | null {
    return this.sockets.get(socketId) || null
  }

  addSocket(socketId: string, ws: WebSocket) {
    if (this.sockets.has(socketId)) throw new Error(`Socket with id ${socketId} is already exists`)
    this.sockets.set(socketId, ws)
    if (!this._isConnected) this._isConnected = true
  }

  removeSocket(socketId: string) {
    if (!this.sockets.has(socketId)) throw new Error(`Socket with id ${socketId} is not exists`)
    this.sockets.delete(socketId)
    if (this.sockets.size === 0) this._isConnected = false
  }

  removeAllSockets() {
    this.sockets.clear()
    this._isConnected = false
  }
}
