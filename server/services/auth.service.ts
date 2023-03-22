import type { UserApiData, Token } from '~/types'

import bcrypt from 'bcrypt'

import { userServise } from './user.service'
import { tokenService } from './token.service'

import { ApiError } from '~/server/errors/ApiError'
import { UserDTO } from '~/server/dtos/user.dto'

class AuthService {
  async login(data: { username: string; password: string }): Promise<UserApiData> {
    try {
      const user = await userServise.findByName(data.username)
      if (!user) throw ApiError.BadRequest('Username or password is invalid')

      const isExactPassword = await bcrypt.compare(data.password, user.password)
      if (!isExactPassword) throw ApiError.BadRequest('Username or password is invalid')

      const tokens = tokenService.generateTokens({ id: user.id })
      tokenService.createOrUpdateRefreshToken(user.id, tokens.refreshToken)

      return {
        user: new UserDTO(user),
        ...tokens,
      }
    } catch (e) {
      if (typeof e === 'object' && e && 'statusCode' in e && (e as any).statusCode === 400) throw e
      throw ApiError.ServerError('Could not find user')
    }
  }

  async signup(data: { username: string; password: string }): Promise<UserApiData> {
    try {
      const existingUser = await userServise.findByName(data.username)

      if (existingUser)
        throw ApiError.BadRequest(`User with name ${existingUser.name} is already exists`)

      const user = await userServise.create({ username: data.username, password: data.password })
      const tokens = tokenService.generateTokens({ id: user.id })
      tokenService.createOrUpdateRefreshToken(user.id, tokens.refreshToken)

      return {
        user: new UserDTO(user),
        ...tokens,
      }
    } catch (e) {
      if (e && typeof e === 'object' && 'statusCode' in e && (e as any).statusCode === 400) throw e
      throw ApiError.ServerError('Could not create user')
    }
  }

  async logout(refreshToken: string): Promise<Token> {
    const userData = tokenService.verifyRefreshToken(refreshToken)
    if (!userData) throw ApiError.UnauthorizedError()

    const deletedToken = await tokenService.deleteRefreshTokenByUserId(userData.id)
    return deletedToken
  }
  async refresh(refreshToken: string): Promise<UserApiData> {
    const verifiedUserData = tokenService.verifyRefreshToken(refreshToken)
    if (!verifiedUserData) throw ApiError.UnauthorizedError()

    const tokenFromDb = await tokenService.findRefreshToken(refreshToken)
    if (!tokenFromDb) throw ApiError.UnauthorizedError()

    const userFromDb = await userServise.findById(verifiedUserData.id)
    if (!userFromDb) throw ApiError.UnauthorizedError()

    const tokens = tokenService.generateTokens({ id: userFromDb.id })
    tokenService.createOrUpdateRefreshToken(userFromDb.id, tokens.refreshToken)

    return {
      user: {
        id: userFromDb.id,
        name: userFromDb.name,
      },
      ...tokens,
    }
  }
}

export const authService = new AuthService()
