import { ApiError } from '~/server/exceptions/ApiError'
import { tokenService } from '~/server/services/tokenService'

export const authMiddleware = defineEventHandler(event => {
  const authorizationHeader = getHeader(event, 'Authorization')
  if (!authorizationHeader) throw ApiError.UnauthorizedError()

  const accessToken = authorizationHeader.split(' ')[1]
  if (!accessToken) throw ApiError.UnauthorizedError()

  const userData = tokenService.verifyAccessToken(accessToken)
  if (!userData) throw ApiError.UnauthorizedError()
})
