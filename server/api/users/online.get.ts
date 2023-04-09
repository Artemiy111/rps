import type { UserDTO } from '~~/types'

import { gameWsService } from '~/server/services/gameWs.service'

export default defineEventHandler((event): UserDTO[] => {
  return gameWsService.getCurrentActiveUsers()
})
