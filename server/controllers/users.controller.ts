import { UserDTO } from '../dtos/user.dto'
import { gameWsService } from '../services/gameWs.service'

class UsersController {
  getActiveUsers() {
    return defineEventHandler((event): UserDTO[] => {
      return gameWsService.getCurrentActiveUsers()
    })
  }
}

export const usersController = new UsersController()
