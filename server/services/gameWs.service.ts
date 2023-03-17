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
} from '~/types'

import { v4 as uuid } from 'uuid'
import { RawData, WebSocket } from 'ws'

import { getPlayerRoundResult } from '~/server/helpers/getPlayerRoundResult'

type SocketId = string
type GameId = string

export type PlayerWithWs = {
  id: string
  name: string
  sockets: Set<SocketId>
  currentCard: GameCard
}

export type GameWs = {
  id: GameId
  createdAt: Date
  started: boolean
  startedAt: Date | null
  ended: boolean
  endedAt: Date | null
  players: PlayerWithWs[]
  rounds: GameRoundData[]
}

class GameWsService {
  public games = new Map<GameId, GameWs>()
  public sockets = new Map<SocketId, WebSocket>()

  generateSocketId(): SocketId {
    return uuid()
  }

  addPlayer(socketId: string, game: GameWs, message: GameMessageFromClient) {
    const newPlayer = {
      id: message.sender.user.id,
      name: message.sender.user.name,
      currentCard: message.sender.card,
      sockets: new Set([socketId]),
    }
    game.players.push(newPlayer)
  }

  getGame(gameId: string): GameWs | null {
    return this.games.get(gameId) || null
  }

  getPlayer(game: GameWs, playerId: string): PlayerWithWs | null {
    return game.players.find(player => player.id === playerId) || null
  }

  getEnemy(game: GameWs, playerId: string): PlayerWithWs | null {
    return game.players.find(player => player.id !== playerId) || null
  }

  addGame(gameId: string) {
    const newGameData: GameWs = {
      id: gameId,
      createdAt: new Date(),
      started: false,
      startedAt: null,
      ended: false,
      endedAt: null,
      players: [],
      rounds: [],
    }
    this.games.set(gameId, newGameData)
  }

  addSocket(socketId: string, ws: WebSocket) {
    this.sockets.set(socketId, ws)
  }

  addRound(
    game: GameWs,
    player: PlayerWithWs,
    enemy: PlayerWithWs,
    breakBetweenRoundsEndsIn: number
  ) {
    const playerRoundResult = getPlayerRoundResult(player.currentCard, enemy.currentCard)
    const newRound: GameRoundData = {
      order: game.rounds.length + 1,
      players: [
        { id: player.id, card: player.currentCard },
        { id: enemy.id, card: enemy.currentCard },
      ],
      winnerId: null,
      winnerCard: null,
      breakBetweenRoundsEndsIn: breakBetweenRoundsEndsIn,
    }
    switch (playerRoundResult) {
      case 'win':
        newRound.winnerId = player.id
        newRound.winnerCard = player.currentCard
        break
      case 'lose':
        newRound.winnerId = enemy.id
        newRound.winnerCard = enemy.currentCard
        break
    }
    game.rounds.push(newRound)
  }

  sendPlayerMessageToCurrentSocket(
    ws: WebSocket,
    socketId: string,
    game: GameWs,
    player: PlayerWithWs
  ) {
    const playerMessage = this.generateMessage(game, player)
    console.log(`[init ws] ${socketId}`)
    this.sendMessage(ws, playerMessage)
    console.log(game.players.map(p => p.name))
  }

  sendEnemyMessageToCurrentSocket(ws: WebSocket, game: GameWs, enemy: PlayerWithWs) {
    const enemyMessage = this.generateMessage(game, enemy)
    // console.log(`[from en]`)
    this.sendMessage(ws, enemyMessage)
  }

  sendPlayerMessageToEnemy(game: GameWs, player: PlayerWithWs, enemy: PlayerWithWs) {
    const playerMessage = this.generateMessage(game, player)
    enemy.sockets.forEach(enemySocketId => {
      // console.log(`[to enm from] ${enemySocketId}`)
      this.sendMessage(this.sockets.get(enemySocketId)!, playerMessage)
    })
  }

  sendPlayerMessageToAllGameSockets(game: GameWs, player: PlayerWithWs) {
    const playerMessage = this.generateMessage(game, player)
    for (const gamePlayer of game.players) {
      for (const gamePlayerSocketId of gamePlayer.sockets) {
        console.log(`[to all from] ${player.name} [to ws] ${gamePlayerSocketId}`)
        this.sendMessage(this.sockets.get(gamePlayerSocketId)!, playerMessage)
      }
    }
  }

  generateMessage(game: GameWs, player: PlayerWithWs): GameMessageFromApi {
    const messageBase: GameMessageFromApiBase = {
      game: {
        id: game.id,
        started: game.started,
        startedAt: game.startedAt?.getTime() || null,
        ended: game.ended,
        endedAt: game.endedAt?.getTime() || null,
        players: game.players.map(p => ({ id: p.id, name: p.name })),
        rounds: game.rounds,
      },
    }
    if (isGameMessageFromApiEnded(messageBase)) {
      const messageEnded: GameMessageFromApiEnded = messageBase
      return messageEnded
    }

    const messageContinues = {
      game: messageBase.game,
      sender: {
        user: {
          id: player.id,
          name: player.name,
        },
        connected: true,
        card: player.currentCard,
      },
    } as GameMessageFromApiContinues
    return messageContinues
  }

  generateDisconnectionMessage(game: GameWs, player: PlayerWithWs): GameMessageFromApi {
    const disconnectionMessage = this.generateMessage(game, player)
    if (isGameMessageFromApiContinues(disconnectionMessage))
      disconnectionMessage.sender.connected = false
    return disconnectionMessage
  }

  parseMessage(event: RawData): GameMessageFromClient {
    return JSON.parse(event.toString('utf-8')) as GameMessageFromClient
  }

  sendMessage(ws: WebSocket, message: GameMessageFromApi) {
    ws.send(JSON.stringify(message))
  }

  getGameInfoFromSocketId(socketId: SocketId): {
    game: GameWs | null
    player: PlayerWithWs | null
    enemy: PlayerWithWs | null
  } {
    let game: GameWs | null = null
    let player: PlayerWithWs | null = null
    let enemy: PlayerWithWs | null = null
    for (const [_, gameData] of this.games) {
      for (const gamePlayer of gameData.players) {
        for (const playerSocketId of gamePlayer.sockets) {
          if (playerSocketId === socketId) {
            game = gameData
            player = gamePlayer
            enemy = gameWsService.getEnemy(game, player.id)
            return { game, player, enemy }
          }
        }
      }
    }
    return { game, player, enemy }
  }
}

export const gameWsService = new GameWsService()

class Sender {
  constructor(private game: Game) {}
  parseMessage(event: RawData): GameMessageFromClient {
    return JSON.parse(event.toString('utf-8')) as GameMessageFromClient
  }

  sendMessage(ws: WebSocket, message: GameMessageFromApi) {
    ws.send(JSON.stringify(message))
  }

  generateMessage(game: Game, player: PlayerWs): GameMessageFromApi {
    const messageBase: GameMessageFromApiBase = {
      game: {
        id: game.id,
        started: game.started,
        startedAt: game.startedAt?.getTime() || null,
        ended: game.ended,
        endedAt: game.endedAt?.getTime() || null,
        players: game.players.map(p => ({ id: p.id, name: p.name })),
        rounds: game.rounds,
      },
    }
    if (isGameMessageFromApiEnded(messageBase)) {
      const messageEnded: GameMessageFromApiEnded = messageBase
      return messageEnded
    }

    const messageContinues = {
      game: messageBase.game,
      sender: {
        user: {
          id: player.id,
          name: player.name,
        },
        connected: true,
        card: player.currentCard,
      },
    } as GameMessageFromApiContinues
    return messageContinues
  }

  generateDisconnectionMessage(player: PlayerWs): GameMessageFromApi {
    const disconnectionMessage = this.generateMessage(this.game, player)
    if (isGameMessageFromApiContinues(disconnectionMessage))
      disconnectionMessage.sender.connected = false
    return disconnectionMessage
  }

  sendPlayerMessageToCurrentSocket(socketId: string, ws: WebSocket, player: PlayerWs) {
    const playerMessage = this.generateMessage(this.game, player)
    console.log(`[init ws] ${socketId}`)
    this.sendMessage(ws, playerMessage)
    console.log(this.game.players.map(p => p.name))
  }

  sendEnemyMessageToCurrentSocket(ws: WebSocket, enemy: PlayerWs) {
    const enemyMessage = this.generateMessage(this.game, enemy)
    // console.log(`[from en]`)
    this.sendMessage(ws, enemyMessage)
  }

  sendPlayerMessageToEnemy(player: PlayerWs, enemy: PlayerWs) {
    const playerMessage = this.generateMessage(this.game, player)
    for (const [_, enemySocket] of enemy.sockets) {
      // console.log(`[to enm from] ${enemySocketId}`)
      this.sendMessage(enemySocket, playerMessage)
    }
  }

  sendPlayerMessageToAllGameSockets(game: Game, player: PlayerWs) {
    const playerMessage = this.generateMessage(game, player)
    for (const gamePlayer of game.players) {
      for (const [gamePlayerSocketId, gamePlayerSocket] of gamePlayer.sockets) {
        console.log(`[to all from] ${player.name} [to ws] ${gamePlayerSocketId}`)
        this.sendMessage(gamePlayerSocket, playerMessage)
      }
    }
  }
}

class Game {
  public readonly createdAt: Date = new Date()
  public started: boolean = false
  public startedAt: Date | null = null
  public ended: boolean = false
  public endedAt: Date | null = null
  public players: PlayerWs[] = []
  public rounds: GameRoundData[] = []

  constructor(public id: GameId) {}

  addRound(breakBetweenRoundsEndsIn: number = Date.now()): number {
    if (!this.isFilled()) {
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

  addPlayer(
    socketId: string,
    ws: WebSocket,
    playerData: { id: string; name: string; currentCard: GameCard }
  ) {
    if (this.isFilled()) {
      throw new Error('Could not add player to filled game')
    }
    const newPlayer = new PlayerWs(playerData.id, playerData.name)
    newPlayer.addSocket(socketId, ws)
    newPlayer.currentCard = playerData.currentCard
    this.players.push(newPlayer)
  }

  setStartedStatus(startedAt: Date = new Date()) {
    this.started = true
    this.startedAt = startedAt
  }

  setEndedStatus(endedAt: Date = new Date()) {
    this.ended = true
    this.endedAt = endedAt
  }

  isFilled() {
    return this.players.length === 2
  }
}

class PlayerWs {
  public sockets: Map<SocketId, WebSocket> = new Map()
  public currentCard: GameCard = 'hand'

  constructor(public id: string, public name: string) {}

  addSocket(socketId: string, ws: WebSocket) {
    if (this.sockets.has(socketId)) throw new Error(`Socket with id ${socketId} is already exists`)
    this.sockets.set(socketId, ws)
  }

  removeSocket(socketId: string) {
    if (!this.sockets.has(socketId)) throw new Error(`Socket with id ${socketId} is not exists`)
    this.sockets.delete(socketId)
  }
}
