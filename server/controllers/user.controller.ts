import { authMiddleware } from '~/server/serverMiddleware/auth.middleware'

import { userServise } from '~/server/services/user.service'
import { ApiError } from '~/server/errors/ApiError'
import { UserDTO } from '~/server/dtos/user.dto'

class UserController {
  getUser() {
    return defineEventHandler(async (event): Promise<UserDTO> => {
      const userData = await authMiddleware(event)

      try {
        const user = await userServise.findById(userData.id)
        if (!user) throw ApiError.BadRequest(`No user with id: ${userData.id}`)
        return new UserDTO(user)
      } catch (e) {
        if (typeof e === 'object' && e && 'statusCode' in e && (e as any).statusCode === 400)
          throw e
        throw ApiError.ServerError('Could not get user')
      }
    })
  }
}

export const userController = new UserController()
