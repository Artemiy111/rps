import { WebSocketServer, WebSocket, RawData } from 'ws'

import { gameWsService, type GameWs } from '~/server/services/gameWs.service'

export default defineNitroPlugin(() => {
  const wss = new WebSocketServer({ port: 4000, path: '/api/game/ws' })
  wss.on('connection', onSocketConnection)
})

const onSocketConnection = (ws: WebSocket) => {
  const socketId = gameWsService.generateSocketId()
  console.log(`.\n[con ws] ${socketId}`)

  gameWsService.addSocket(socketId, ws)
  ws.on('message', onSocketMessage(ws, socketId))
  ws.on('close', onSocketClose(socketId))
}

const onSocketMessage = (ws: WebSocket, socketId: string) => {
  return (event: RawData) => {
    console.log(`[get ws] ${socketId}`)
    const message = gameWsService.parseMessage(event)
    const isInitialSocketMessage = message.initial

    if (!gameWsService.getGame(message.game.id)) gameWsService.addGame(message.game.id)

    const gameExisting = gameWsService.getGame(message.game.id)!
    if (gameExisting.ended) return

    if (
      gameExisting.players.length === 0 ||
      (gameExisting.players.length === 1 && gameExisting.players[0].id !== message.sender.user.id)
    )
      gameWsService.addPlayer(socketId, gameExisting, message)

    if (!gameExisting.started && gameExisting.players.length === 2) {
      gameExisting.started = true
      gameExisting.startedAt = new Date()
    }

    const player = gameWsService.getPlayer(gameExisting, message.sender.user.id)
    if (!player) return
    if (!player.sockets.has(socketId)) player.sockets.add(socketId)
    const enemy = gameWsService.getEnemy(gameExisting, message.sender.user.id)

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
      gameWsService.addRound(gameExisting, player, enemy, breakBetweenRoundsEndsIn)

      gameWsService.sendPlayerMessageToAllGameSockets(gameExisting, player)

      setTimeout(() => {
        const isGameEnd = (game: GameWs) => game.rounds.length === 5
        if (isGameEnd(gameExisting)) {
          gameExisting.ended = true
          gameExisting.endedAt = roundEndTime

          gameWsService.sendPlayerMessageToAllGameSockets(gameExisting, player)
          return
        }

        player.currentCard = 'hand'
        enemy.currentCard = 'hand'
        gameWsService.sendPlayerMessageToAllGameSockets(gameExisting, player)
        gameWsService.sendPlayerMessageToAllGameSockets(gameExisting, enemy)
      }, breakBetweenRoundsEndsIn - Date.now())
      return
    }

    if (isInitialSocketMessage) {
      gameWsService.sendPlayerMessageToCurrentSocket(ws, socketId, gameExisting, player)

      if (enemy) {
        gameWsService.sendEnemyMessageToCurrentSocket(ws, gameExisting, enemy)
        gameWsService.sendPlayerMessageToEnemy(gameExisting, player, enemy)
      }
      return
    }

    gameWsService.sendPlayerMessageToAllGameSockets(gameExisting, player)
  }
}

const onSocketClose = (socketId: string) => {
  return () => {
    const { player, enemy, game } = gameWsService.getGameInfoFromSocketId(socketId)

    if (!game || !player) throw new Error('No such game or player')
    const playerDisconnectionMessage = gameWsService.generateDisconnectionMessage(game, player)
    console.log(`ended?`, game.ended)
    const isOnlyPlayerSocket = player.sockets.size === 1
    if (enemy && isOnlyPlayerSocket) {
      for (const enemySocketId of enemy.sockets) {
        gameWsService.sendMessage(
          gameWsService.sockets.get(enemySocketId)!,
          playerDisconnectionMessage
        )
      }

      player.sockets.delete(socketId)
      gameWsService.sockets.delete(socketId)
      console.log(`[del] ws ${socketId}`)
      return
    }
    player.sockets.delete(socketId)
    gameWsService.sockets.delete(socketId)
    console.log(`[del] ws ${socketId}`)
  }
}
