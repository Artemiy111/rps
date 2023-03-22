import { gameService } from './../services/game.service'
import { WebSocketServer, WebSocket, RawData } from 'ws'

import { gameWsService, GameWs, GameWsSender, PlayerWs } from '~/server/services/gameWs.service'

export default defineNitroPlugin(async () => {
  // await gameWsService.loadGames()
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

    const gameFromDB = await gameService.findGame(message.game.id)
    if (gameFromDB) {
      const game = new GameWs(gameFromDB.id)
      game.fillFromGameFromDB(gameFromDB)
      console.log('IN DB')
      const gameSender = new GameWsSender(game)
      gameSender.sendBaseMessageToCurrentSocket(socketId, ws)
      ws.close()
      return
    }

    if (!gameWsService.getGame(message.game.id)) gameWsService.addGame(new GameWs(message.game.id))

    const game = gameWsService.getGame(message.game.id)!
    const gameSender = new GameWsSender(game)

    if (game.ended) return gameSender.sendBaseMessageToCurrentSocket(socketId, ws)

    if (
      game.players.length === 0 ||
      (game.players.length === 1 && game.players[0].id !== message.sender.user.id)
    ) {
      const newPlayer = new PlayerWs(message.sender.user.id, message.sender.user.name)
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
          gameService.createGameFromGameWs(game)

          gameSender.sendPlayerMessageToAllGameSockets(player.id)
          player.closeAllSockets()
          enemy.closeAllSockets()
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

    if (!game) return
    if (!player) throw new Error('No such player')

    player.removeSocket(socketId)
    console.log(`[del] ws ${socketId}`)

    if (game.ended) return

    if (enemy && !player.isConnected) {
      const gameSender = new GameWsSender(game)
      gameSender.sendPlayerMessageToEnemy(player.id, enemy.id)
      return
    }
  }
}
