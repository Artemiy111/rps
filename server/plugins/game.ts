import { GameMessageFromApiBase, isGameMessageFromApiEnded } from './../../types'
import { isGameMessageFromApiContinues } from '~/types'
import type {
  GameMessageFromClient,
  GameMessageFromApi,
  GameMessageFromApiContinues,
  GameMessageFromApiEnded,
  GameRoundData,
  GameCard,
} from '~/types'

import { v4 as uuid } from 'uuid'
import { WebSocketServer, WebSocket, RawData } from 'ws'

import { getPlayerRoundResult } from '~/server/helpers/getPlayerRoundResult'

type SocketId = string
type GameId = string

type Player = {
  id: string
  name: string
  sockets: Set<SocketId>
  currentCard: GameCard
}

type WsGame = {
  id: GameId
  createdAt: Date
  started: boolean
  startedAt: Date | null
  ended: boolean
  endedAt: Date | null
  players: Player[]
  rounds: GameRoundData[]
}

const getGameInfoFromSocketId = (
  socketId: SocketId
): { game: WsGame | null; player: Player | null; enemy: Player | null } => {
  let game: WsGame | null = null
  let player: Player | null = null
  let enemy: Player | null = null
  for (const [_, gameData] of games) {
    for (const gamePlayer of gameData.players) {
      for (const playerSocketId of gamePlayer.sockets) {
        if (playerSocketId === socketId) {
          game = gameData
          player = gamePlayer
          enemy = getEnemy(game, player.id)
          return { game, player, enemy }
        }
      }
    }
  }
  return { game, player, enemy }
}

const getGame = (gameId: string): WsGame | null => games.get(gameId) || null
const getPlayer = (game: WsGame, playerId: string): Player | null =>
  game.players.find(player => player.id === playerId) || null
const getEnemy = (game: WsGame, playerId: string): Player | null =>
  game.players.find(player => player.id !== playerId) || null

const parseMessage = (event: RawData): GameMessageFromClient => {
  return JSON.parse(event.toString('utf-8')) as GameMessageFromClient
}
const sendMessage = (ws: WebSocket, message: GameMessageFromApi) => {
  ws.send(JSON.stringify(message))
}

const generateMessage = (player: Player, game: WsGame): GameMessageFromApi => {
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

const generateRound = (
  game: WsGame,
  player: Player,
  enemy: Player,
  breakBetweenRoundsEndsIn: number
): GameRoundData => {
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
  return newRound
}

const generateDisconnectionMessage = (player: Player, game: WsGame): GameMessageFromApi => {
  const disconnectionMessage = generateMessage(player, game)
  if (isGameMessageFromApiContinues(disconnectionMessage))
    disconnectionMessage.sender.connected = false
  return disconnectionMessage
}

const addPlayer = (socketId: string, game: WsGame, message: GameMessageFromClient) => {
  const newPlayer = {
    id: message.sender.user.id,
    name: message.sender.user.name,
    currentCard: message.sender.card,
    sockets: new Set([socketId]),
  }
  game.players.push(newPlayer)
}

const addGame = (gameId: string) => {
  const newGameData: WsGame = {
    id: gameId,
    createdAt: new Date(),
    started: false,
    startedAt: null,
    ended: false,
    endedAt: null,
    players: [],
    rounds: [],
  }
  games.set(gameId, newGameData)
}

const sockets = new Map<SocketId, WebSocket>()
const games = new Map<GameId, WsGame>()

export default defineNitroPlugin(() => {
  const wss = new WebSocketServer({ port: 4000, path: '/api/game/ws' })
  wss.on('connection', onSocketConnection)
})

const onSocketConnection = (ws: WebSocket) => {
  const socketId = uuid()
  console.log(`.\n[con ws] ${socketId}`)

  sockets.set(socketId, ws)

  ws.on('message', onSocketMessage(ws, socketId))
  ws.on('close', onSocketClose(socketId))
}

const onSocketMessage = (ws: WebSocket, socketId: SocketId) => {
  return (event: RawData) => {
    console.log(`[get ws] ${socketId}`)
    const message = parseMessage(event)
    const isInitialSocketMessage = message.initial

    if (!getGame(message.game.id)) addGame(message.game.id)

    const gameExisting = getGame(message.game.id)!

    if (
      gameExisting.players.length === 0 ||
      (gameExisting.players.length === 1 && gameExisting.players[0].id !== message.sender.user.id)
    )
      addPlayer(socketId, gameExisting, message)

    if (!gameExisting.started && gameExisting.players.length === 2) {
      gameExisting.started = true
      gameExisting.startedAt = new Date()
    }

    const player = getPlayer(gameExisting, message.sender.user.id)
    if (!player) return
    if (!player.sockets.has(socketId)) player.sockets.add(socketId)
    const enemy = getEnemy(gameExisting, message.sender.user.id)

    const isNextRound =
      gameExisting.rounds.length === 0 ||
      (gameExisting.rounds.length >= 1 &&
        gameExisting.rounds.at(-1)!.breakBetweenRoundsEndsIn - Date.now() < 0)

    const isBreakBetweenRounds = !isNextRound

    if (isBreakBetweenRounds) return
    console.log(`[round]`)
    if (!isInitialSocketMessage) player.currentCard = message.sender.card

    if (enemy && player.currentCard !== 'hand' && enemy.currentCard !== 'hand') {
      const roundEndTime = new Date()
      const breakBetweenRoundsEndsIn = roundEndTime.getTime() + 1000
      const newRound = generateRound(gameExisting, player, enemy, breakBetweenRoundsEndsIn)

      gameExisting.rounds.push(newRound)
      sendPlayerMessageToAllGameSockets(gameExisting, player)
      setTimeout(() => {
        const isGameEnd = (game: WsGame) => game.rounds.length === 5
        if (isGameEnd(gameExisting)) {
          gameExisting.ended = true
          gameExisting.endedAt = roundEndTime

          sendPlayerMessageToAllGameSockets(gameExisting, player)
          // gameExisting.players.forEach(gamePlayer =>
          //   gamePlayer.sockets.forEach(playerSocketId => sockets.get(playerSocketId)!.close())
          // )
          return
        }

        player.currentCard = 'hand'
        enemy.currentCard = 'hand'
        sendPlayerMessageToAllGameSockets(gameExisting, player)
        sendPlayerMessageToAllGameSockets(gameExisting, enemy)
      }, breakBetweenRoundsEndsIn - Date.now())

      // if (gameExisting.rounds.length === 5) {

      // }
      return
    }

    if (isInitialSocketMessage) {
      sendPlayerMessageToCurrentSocket(ws, socketId, gameExisting, player)

      if (enemy) {
        sendEnemyMessageToCurrentSocket(ws, gameExisting, enemy)
        sendPlayerMessageToEnemy(gameExisting, player, enemy)
      }
      return
    }

    sendPlayerMessageToAllGameSockets(gameExisting, player)
  }
}

const sendPlayerMessageToCurrentSocket = (
  ws: WebSocket,
  socketId: string,
  game: WsGame,
  player: Player
) => {
  const playerMessage = generateMessage(player, game)
  console.log(`[init ws] ${socketId}`)
  sendMessage(ws, playerMessage)
  console.log(game.players.map(p => p.name))
}

const sendEnemyMessageToCurrentSocket = (ws: WebSocket, game: WsGame, enemy: Player) => {
  const enemyMessage = generateMessage(enemy, game)
  // console.log(`[from en]`)
  sendMessage(ws, enemyMessage)
}

const sendPlayerMessageToEnemy = (game: WsGame, player: Player, enemy: Player) => {
  const playerMessage = generateMessage(player, game)
  enemy.sockets.forEach(enemySocketId => {
    // console.log(`[to enm from] ${enemySocketId}`)
    sendMessage(sockets.get(enemySocketId)!, playerMessage)
  })
}

const sendPlayerMessageToAllGameSockets = (game: WsGame, player: Player) => {
  const playerMessage = generateMessage(player, game)
  for (const gamePlayer of game.players) {
    for (const gamePlayerSocketId of gamePlayer.sockets) {
      console.log(`[to all from] ${player.name} [to ws] ${gamePlayerSocketId}`)
      sendMessage(sockets.get(gamePlayerSocketId)!, playerMessage)
    }
  }
}

const onSocketClose = (socketId: SocketId) => {
  return () => {
    const { player, enemy, game } = getGameInfoFromSocketId(socketId)

    if (!game || !player) throw new Error('No such game or player')
    const playerDisconnectionMessage = generateDisconnectionMessage(player, game)
    console.log(`ended?`, playerDisconnectionMessage.game.ended)
    const isOnlyPlayerSocket = player.sockets.size === 1
    if (enemy && isOnlyPlayerSocket) {
      for (const enemySocketId of enemy.sockets) {
        sendMessage(sockets.get(enemySocketId)!, playerDisconnectionMessage)
      }

      player.sockets.delete(socketId)
      //game.players = game.players.filter(gamePlayer => gamePlayer.id !== player.id)
      sockets.delete(socketId)
      console.log(`[del] ws ${socketId}`)
      return
    }
    player.sockets.delete(socketId)
    sockets.delete(socketId)
    console.log(`[del] ws ${socketId}`)
  }
}
