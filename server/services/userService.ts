import bcrypt from 'bcrypt'

import { prisma, type User } from '~/server/db'

import { tokenService, type Token } from '~/server/services/tokenService'

import { ApiError } from '~/server/exceptions/ApiError'

export type { Token } from '~/server/services/tokenService'

export type UserSafeInfo = Omit<User, 'password'>
export type UserData = { user: UserSafeInfo; accessToken: string; refreshToken: string }

class UserService {
  getUserSafeInfo(user: User): UserSafeInfo {
    return {
      id: user.id,
      name: user.name,
    }
  }

  private async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })
    return user
  }

  private async findByName(username: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        name: username,
      },
    })
    return user
  }

  private async create(data: { username: string; password: string }): Promise<User> {
    const saltRounds = 7
    const hashPassword = bcrypt.hashSync(data.password, saltRounds)

    const user = await prisma.user.create({
      data: {
        name: data.username,
        password: hashPassword,
      },
    })
    return user
  }

  async login(data: { username: string; password: string }): Promise<UserData> {
    try {
      const user = await userService.findByName(data.username)
      if (!user) throw ApiError.BadRequest('Username or password is invalid')

      const isExactPassword = await bcrypt.compare(data.password, user.password)
      if (!isExactPassword) throw ApiError.BadRequest('Username or password is invalids')

      const tokens = tokenService.createTokens({ id: user.id })
      tokenService.saveRefreshToken(user.id, tokens.refreshToken)

      return {
        user: userService.getUserSafeInfo(user),
        ...tokens,
      }
    } catch (e) {
      if (e && typeof e === 'object' && 'statusCode' in e && (e as any).statusCode === 400) throw e
      throw ApiError.ServerError('Could not find user')
    }
  }

  async signup(data: { username: string; password: string }): Promise<UserData> {
    try {
      const existingUser = await userService.findByName(data.username)

      if (existingUser)
        throw ApiError.BadRequest(`User with name ${existingUser.name} is already exist`)

      const user = await userService.create({ username: data.username, password: data.password })
      const tokens = tokenService.createTokens({ id: user.id })

      return {
        user: userService.getUserSafeInfo(user),
        ...tokens,
      }
    } catch (e) {
      if (e && typeof e === 'object' && 'statusCode' in e && (e as any).statusCode === 400) throw e
      throw ApiError.ServerError('Could not create user')
    }
  }

  async logout(refreshToken: string): Promise<Token> {
    const deletedToken = await tokenService.deleteRefreshToken(refreshToken)
    return deletedToken
  }

  async refresh(refreshToken: string): Promise<UserData> {
    const verifiedUserData = tokenService.verifyRefreshToken(refreshToken)
    if (!verifiedUserData) throw ApiError.UnauthorizedError()

    const tokenFromDb = await tokenService.findRefreshToken(refreshToken)
    if (!tokenFromDb) throw ApiError.UnauthorizedError()

    const userFromDb = await userService.findById(verifiedUserData.id)
    if (!userFromDb) throw ApiError.UnauthorizedError()

    const tokens = tokenService.createTokens({ id: userFromDb.id })

    return {
      user: {
        id: userFromDb.id,
        name: userFromDb.name,
      },
      ...tokens,
    }
  }
}

export const userService = new UserService()
