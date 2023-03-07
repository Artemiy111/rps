import type { GameMessage, GameCard } from '~/types'

import { v4 as uuid } from 'uuid'

import { WebSocketServer, WebSocket, RawData } from 'ws'

type SocketId = string
type GameId = string

type Player = {
  id: string
  sockets: Set<SocketId>
  card: GameCard
}

type GameData = {
  players: Player[]
}

const parseMessage = (event: RawData): GameMessage => {
  return JSON.parse(event.toString('utf-8')) as GameMessage
}

const sendMessage = (ws: WebSocket, message: GameMessage) => {
  ws.send(JSON.stringify(message))
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

    const newPlayer: Player = {
      id: message.user.id,
      card: message.message.card,
      sockets: new Set([socketId]),
    }

    const game = games.get(message.game.id)
    if (!game) {
      const newGameData: GameData = { players: [newPlayer] }
      games.set(message.game.id, newGameData)
    } else if (game.players.length === 1 && game.players[0].id !== message.user.id) {
      game.players.push(newPlayer)
    }

    const gameExisting = games.get(message.game.id)!

    for (const player of gameExisting.players) {
      if (player.id === message.user.id) {
        if (!isInitialSocketMessage) player.card = message.message.card

        if (!player.sockets.has(socketId)) player.sockets.add(socketId)
      }
    }

    if (isInitialSocketMessage) {
      const sendInitialMessage = () => {
        const playerExisting = gameExisting.players.find(player => player.id === message.user.id)!
        const initialResponseMessage: GameMessage = {
          game: {
            id: message.game.id,
          },
          user: message.user,
          message: {
            card: playerExisting.card,
          },
        }

        console.log(`[init] ws ${socketId}`)
        sendMessage(ws, initialResponseMessage)
      }

      sendInitialMessage()
      return
    }

    for (const player of gameExisting.players) {
      for (const playerSocketId of player.sockets) {
        if (playerSocketId !== socketId) {
          console.log(`[send] ws ${socketId}`)
          sendMessage(sockets.get(playerSocketId)!, message)
        }
      }
    }
  }
}

const onSocketClose = (socketId: SocketId) => {
  return () => {
    console.log(`[del] ws ${socketId}`)
    sockets.delete(socketId)
    games.forEach(game => game.players.forEach(player => player.sockets.delete(socketId)))
  }
}
