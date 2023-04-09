import { gameWsService } from '~/server/services/gameWs.service'
import { gameDbService } from '~~/server/services/gameDb.service'

import { GameDTO } from '~/server/dtos/game.dto'

export default defineEventHandler(event => {})

class GameController {
  getAllCurrent() {
    return defineEventHandler((event): GameDTO[] => {
      return Array.from(gameWsService.games.values()).map(game => new GameDTO(game))
    })
  }

  getAllPast() {
    return defineEventHandler(async (event): Promise<GameDTO[]> => {
      return (await gameDbService.getAllGames()).map(game => new GameDTO(game))
    })
  }
}

export const gameController = new GameController()
