import { gameWsService } from '~/server/services/gameWs.service'
import { GameDTO } from '~/server/dtos/GameDTO'

export default defineEventHandler(event => {
  return Array.from(gameWsService.games.values()).map(game => new GameDTO(game))
})
