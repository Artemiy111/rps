import type { GameMessage, GameCard, UserSafeInfo } from '~/types'

import { v4 as uuid } from 'uuid'

import { WebSocketServer, WebSocket, RawData } from 'ws'

type SocketId = string
type GameId = string

type Player = {
  sockets: Set<SocketId>
  currentCard: GameCard
} & UserSafeInfo

type GameData = {
  id: GameId
  players: Player[]
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

const parseMessage = (event: RawData): GameMessage => {
  return JSON.parse(event.toString('utf-8')) as GameMessage
}
const sendMessage = (ws: WebSocket, message: GameMessage) => {
  ws.send(JSON.stringify(message))
}

const generateInitialMessage = (player: Player, gameId: string): GameMessage => {
  return {
    game: {
      id: gameId,
    },
    sender: {
      id: player.id,
      name: player.name,
    },
    disconnected: false,
    message: {
      card: player.currentCard,
    },
  }
}

const generatePlayer = (socketId: SocketId, message: GameMessage): Player => {
  return {
    id: message.sender.id,
    name: message.sender.name,
    currentCard: message.message.card,
    sockets: new Set([socketId]),
  }
}

const sockets = new Map<SocketId, WebSocket>()
const games = new Map<GameId, GameData>()

export default defineNitroPlugin(() => {
  const wss = new WebSocketServer({ port: 4000, path: '/api/game' })
  wss.on('connection', onSocketConnection)
})

const onSocketConnection = (ws: WebSocket) => {
  const socketId = uuid()
  console.log(`.\n[con] ws ${socketId}`)

  sockets.set(socketId, ws)

  ws.on('message', onSocketMessage(ws, socketId))
  ws.on('close', onSocketClose(socketId))
}

const onSocketMessage = (ws: WebSocket, socketId: SocketId) => {
  return (event: RawData) => {
    console.log(`[get] ws ${socketId}`)
    const message = parseMessage(event)

    const isInitialSocketMessage = message.message.card === 'hand'

    const game = getGame(message.game.id)
    if (!game) {
      const newGameData: GameData = {
        id: message.game.id,
        players: [generatePlayer(socketId, message)],
      }
      games.set(message.game.id, newGameData)
    } else if (game.players.length === 1 && game.players[0].id !== message.sender.id) {
      game.players.push(generatePlayer(socketId, message))
    }

    const gameExisting = getGame(message.game.id)!
    const playerExisting = getPlayer(gameExisting, message.sender.id)!
    const enemyMaybeExisting = getEnemy(gameExisting, message.sender.id)

    if (!isInitialSocketMessage) playerExisting.currentCard = message.message.card
    if (!playerExisting.sockets.has(socketId)) playerExisting.sockets.add(socketId)

    if (isInitialSocketMessage) {
      const initialMessageForSocket = generateInitialMessage(playerExisting, message.game.id)
      console.log(`[init] ws ${socketId}`)
      sendMessage(ws, initialMessageForSocket)

      console.log(gameExisting.players.map(p => p.name))
      if (enemyMaybeExisting) {
        const initialMessageOfEnemy = generateInitialMessage(enemyMaybeExisting, message.game.id)
        sendMessage(ws, initialMessageOfEnemy)

        const initialMessageForEnemy = generateInitialMessage(enemyMaybeExisting, message.game.id)
        enemyMaybeExisting.sockets.forEach(enemySocketId => {
          console.log(`[enm] ws ${enemySocketId}`)
          sendMessage(sockets.get(enemySocketId)!, initialMessageForEnemy)
        })
      }
      return
    }

    for (const player of gameExisting.players) {
      for (const playerSocketId of player.sockets) {
        console.log(`[send] ws ${socketId}`)
        sendMessage(sockets.get(playerSocketId)!, message)
      }
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
        const disconnectionMessage: GameMessage = {
          disconnected: true,
          game: {
            id: game?.id,
          },
          sender: {
            id: player.id,
            name: player.name,
          },
          message: {
            card: player.currentCard,
          },
        }
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
