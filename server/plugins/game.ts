import { WebSocketServer, WebSocket, RawData } from 'ws'

import { GameWs } from '../models/GameWs'
import { GameWsFactory } from '../models/GameWsFactory'
import { GameWsSender } from '../models/GameWsSender'
import { PlayerWs } from '../models/PlayerWs'

import { gameDbService } from '../services/gameDb.service'
import { gameWsService } from '../services/gameWs.service'

export default defineNitroPlugin(async () => {
  const wss = new WebSocketServer({ port: 4000, path: '/api/game/ws' })
  wss.on('connection', onSocketConnection)
})

const onSocketConnection = (ws: WebSocket) => {
  const socketId = gameWsService.generateSocketId()
  console.log(`.\n[con ws] ${socketId}`)

  ws.on('message', onSocketMessage(ws, socketId))
  ws.on('close', onSocketClose(socketId))
}

const onSocketMessage = (ws: WebSocket, socketId: string) => {
  return async (event: RawData) => {
    console.log(`[get ws] ${socketId}`)
    const message = GameWsSender.parseMessage(event)
    const isInitialSocketMessage = message.initial

    const gameDb = await gameDbService.findGame(message.game.id)
    if (gameDb) {
      const game = GameWsFactory.createFromGameDb(gameDb)
      console.log('From DB')
      const gameSender = new GameWsSender(game)
      gameSender.sendBaseMessageToCurrentSocket(socketId, ws)
      ws.close()
      return
    }

    let gameMaybeExisting: GameWs | null = gameWsService.getGame(message.game.id)
    if (!gameMaybeExisting) {
      gameMaybeExisting = new GameWs(message.game.id)
      gameWsService.addGame(gameMaybeExisting)
    }
    const game: GameWs = gameMaybeExisting
    const gameSender = new GameWsSender(game)

    if (game.ended) return gameSender.sendBaseMessageToCurrentSocket(socketId, ws)

    if (
      game.players.length === 0 ||
      (game.players.length === 1 && game.players[0].id !== message.sender.user.id)
    ) {
      const newPlayer = new PlayerWs(message.sender.user)
      newPlayer.addSocket(socketId, ws)
      newPlayer.currentCard = message.sender.card
      game.addPlayer(newPlayer)
    }

    if (!game.started && game.isFilled) game.setStartedStatus()

    const player = game.getPlayer(message.sender.user.id)
    if (!player) return
    if (!player.hasSocket(socketId)) player.addSocket(socketId, ws)

    const enemy = game.getEnemy(message.sender.user.id)

    if (game.isBreakBetweenRounds) return
    console.log(`[round]`)
    if (!isInitialSocketMessage) player.currentCard = message.sender.card

    if (enemy && player.hasCard && enemy.hasCard) {
      const breakBetweenRoundsEndsIn = game.addRound()

      gameSender.sendPlayerMessageToAllGameSockets(player.id)

      setTimeout(() => {
        const isGameEnd = (game: GameWs) => game.rounds.length === 5
        if (isGameEnd(game)) {
          game.setEndedStatus()
          gameDbService.createGameFromGameWs(game)

          gameSender.sendPlayerMessageToAllGameSockets(player.id)
          player.closeAllSockets()
          enemy.closeAllSockets()
          gameWsService.removeGame(game.id)
          return
        }

        player.currentCard = null
        enemy.currentCard = null
        gameSender.sendPlayerMessageToAllGameSockets(player.id)
        gameSender.sendPlayerMessageToAllGameSockets(enemy.id)
      }, breakBetweenRoundsEndsIn - Date.now())
      return
    }

    if (isInitialSocketMessage) {
      gameSender.sendPlayerMessageToCurrentSocket(socketId, ws, player.id)

      if (enemy) {
        gameSender.sendEnemyMessageToCurrentSocket(socketId, ws, enemy.id)
        gameSender.sendPlayerMessageToEnemy(player.id, enemy.id)
      }
      return
    }
    gameSender.sendPlayerMessageToAllGameSockets(player.id, message.sender.emoji)
  }
}

const onSocketClose = (socketId: string) => {
  return () => {
    const { player, enemy, game } = gameWsService.getGameInfoFromSocketId(socketId)

    if (!game || game.ended) return
    if (!player) throw new Error('No such player')

    player.removeSocket(socketId)
    console.log(`[del] ws ${socketId}`)

    if (enemy && !player.isConnected) {
      const gameSender = new GameWsSender(game)
      gameSender.sendPlayerMessageToEnemy(player.id, enemy.id)
      return
    }

    if (game.areAllPlayersDisconnected) {
      gameWsService.removeGame(game.id)
    }
  }
}
