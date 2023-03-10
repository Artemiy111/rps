import type {
  GameMessageFromClient,
  GameMessageFromApi,
  GameRoundData,
  GameCard,
  UserSafeInfo,
} from '~/types'

import { v4 as uuid } from 'uuid'
import { WebSocketServer, WebSocket, RawData } from 'ws'

import { getPlayerRoundResult } from '~/server/helpers/getPlayerRoundResult'

type SocketId = string
type GameId = string

type Player = {
  sockets: Set<SocketId>
  currentCard: GameCard
} & UserSafeInfo

type GameData = {
  id: GameId
  players: Player[]
  rounds: GameRoundData[]
}

const getGameInfoFromSocketId = (
  socketId: SocketId
): { game: GameData | undefined; player: Player | undefined; enemy: Player | undefined } => {
  let game: GameData | undefined
  let player: Player | undefined
  let enemy: Player | undefined
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

const getGame = (gameId: string): GameData | undefined => games.get(gameId)
const getPlayer = (game: GameData, playerId: string): Player | undefined =>
  game.players.find(player => player.id === playerId)
const getEnemy = (game: GameData, playerId: string): Player | undefined =>
  game.players.find(player => player.id !== playerId)

const parseMessage = (event: RawData): GameMessageFromClient => {
  return JSON.parse(event.toString('utf-8')) as GameMessageFromClient
}
const sendMessage = (ws: WebSocket, message: GameMessageFromApi) => {
  ws.send(JSON.stringify(message))
}

const generateMessage = (player: Player, game: GameData): GameMessageFromApi => {
  return {
    game: {
      id: game.id,
    },
    sender: {
      id: player.id,
      name: player.name,
    },
    connected: true,
    message: {
      card: player.currentCard,
      rounds: game.rounds,
    },
  }
}

const generateDisconnectionMessage = (player: Player, game: GameData): GameMessageFromApi => {
  return { ...generateMessage(player, game), connected: false }
}

const addPlayer = (socketId: string, game: GameData, message: GameMessageFromClient) => {
  const newPlayer = {
    id: message.sender.id,
    name: message.sender.name,
    currentCard: message.message.card,
    sockets: new Set([socketId]),
  }
  game.players.push(newPlayer)
}

const addGame = (gameId: string) => {
  const newGameData: GameData = {
    id: gameId,
    players: [],
    rounds: [],
  }
  games.set(gameId, newGameData)
}

const sockets = new Map<SocketId, WebSocket>()
const games = new Map<GameId, GameData>()

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
    const isInitialSocketMessage = message.message.card === 'hand'

    if (!getGame(message.game.id)) addGame(message.game.id)

    const gameExisting = getGame(message.game.id)!

    if (
      gameExisting.players.length === 0 ||
      (gameExisting.players.length === 1 && gameExisting.players[0].id !== message.sender.id)
    )
      addPlayer(socketId, gameExisting, message)

    const player = getPlayer(gameExisting, message.sender.id)!
    if (!player) return
    if (!player.sockets.has(socketId)) player.sockets.add(socketId)
    const enemy = getEnemy(gameExisting, message.sender.id)

    if (!isInitialSocketMessage) player.currentCard = message.message.card

    if (enemy && player.currentCard !== 'hand' && enemy.currentCard !== 'hand') {
      const playerRoundResult = getPlayerRoundResult(player.currentCard, enemy.currentCard)
      const newRound: GameRoundData = {
        order: gameExisting.rounds.length + 1,
        players: [
          { id: player.id, card: player.currentCard },
          { id: enemy.id, card: enemy.currentCard },
        ],
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
      gameExisting.rounds.push(newRound)
      player.currentCard = 'hand'
      enemy.currentCard = 'hand'
      setTimeout(() => {
        sendPlayerMessageToAllGameSockets(gameExisting, player)
        sendPlayerMessageToAllGameSockets(gameExisting, enemy)
      }, 1000)
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
  game: GameData,
  player: Player
) => {
  const playerMessage = generateMessage(player, game)
  console.log(`[init ws] ${socketId}`)
  sendMessage(ws, playerMessage)
  console.log(game.players.map(p => p.name))
}

const sendEnemyMessageToCurrentSocket = (ws: WebSocket, game: GameData, enemy: Player) => {
  const enemyMessage = generateMessage(enemy, game)
  // console.log(`[from en]`)
  sendMessage(ws, enemyMessage)
}

const sendPlayerMessageToEnemy = (game: GameData, player: Player, enemy: Player) => {
  const playerMessage = generateMessage(player, game)
  enemy.sockets.forEach(enemySocketId => {
    // console.log(`[to enm from] ${enemySocketId}`)
    sendMessage(sockets.get(enemySocketId)!, playerMessage)
  })
}

const sendPlayerMessageToAllGameSockets = (game: GameData, player: Player) => {
  const playerMessage = generateMessage(player, game)
  console.log(game.players)
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

    if (!game || !player) throw new Error('AAA')

    if (enemy && player.sockets.size === 1) {
      for (const playerSocketId of enemy.sockets) {
        console.log(`[dis] ws ${socketId}`)
        const disconnectionMessage = generateDisconnectionMessage(player, game)
        sendMessage(sockets.get(playerSocketId)!, disconnectionMessage)
      }

      player.sockets.delete(socketId)
      game.players = game.players.filter(gamePlayer => gamePlayer.id !== player.id)
      sockets.delete(socketId)
      console.log(`[del] ws ${socketId}`)
      return
    }
    player.sockets.delete(socketId)
    sockets.delete(socketId)
    console.log(`[del] ws ${socketId}`)
  }
}
