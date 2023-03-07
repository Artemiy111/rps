import { authMiddleware } from '~/server/serverMiddleware/authMiddleware'

import { userServise } from '~/server/services/userService'
import { ApiError } from '~~/server/errors/ApiError'

class UserController {
  getUser() {
    return defineEventHandler(async event => {
      const userData = await authMiddleware(event)

      try {
        const user = userServise.findById(userData.id)
        if (!user) throw ApiError.BadRequest(`No user with id: ${userData.id}`)
      } catch (e) {
        if (typeof e === 'object' && e && 'statusCode' in e && (e as any).statusCode === 400)
          throw e
        throw ApiError.ServerError('Could not get user')
      }
    })
  }
}

export const userController = new UserController()
