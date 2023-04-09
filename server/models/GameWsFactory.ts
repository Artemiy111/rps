import type { GameDBWithPlayersAndRounds } from '~/types/server'

import { PlayerWs } from './PlayerWs'

import { GameWs } from './GameWs'

export class GameWsFactory {
  static createFromGameDb(gameDb: GameDBWithPlayersAndRounds): GameWs {
    const gameWs = new GameWs(gameDb.id)

    if (gameDb.startedAt) gameWs.setStartedStatus(gameDb.startedAt)
    if (gameDb.endedAt) gameWs.setEndedStatus(gameDb.endedAt)

    gameDb.players.forEach(playerDb => {
      gameWs.addPlayer(new PlayerWs(playerDb))
    })

    const gameDbRoundsByOrder = [...gameDb.rounds].sort((r1, r2) => r1.order - r2.order)
    gameDbRoundsByOrder.forEach(roundDb => {
      roundDb.players.forEach((roundDbPlayer, index) => {
        gameWs.players[index].currentCard = roundDb.players[index].card
      })
      gameWs.addRound()
    })
    return gameWs
  }
}
