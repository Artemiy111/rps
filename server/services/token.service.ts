import type { Token } from '~/types'

import jwt from 'jsonwebtoken'

import { prisma } from '~/server/db'

const config = useRuntimeConfig()

class TokenService {
  generateTokens(payload: { id: string }): {
    accessToken: string
    refreshToken: string
  } {
    const accessToken = jwt.sign(payload, config.jwtAccessSecret, { expiresIn: 60 * 30 })
    const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: 60 * 60 * 30 })
    return {
      accessToken,
      refreshToken,
    }
  }

  async createOrUpdateRefreshToken(userId: string, refreshToken: string): Promise<Token> {
    const token = await prisma.userToken.upsert({
      where: { userId },
      update: { refresh: refreshToken },
      create: {
        userId,
        refresh: refreshToken,
      },
    })
    return token
  }

  verifyAccessToken(accessToken: string): { id: string } | null {
    try {
      const data = jwt.verify(accessToken, config.jwtAccessSecret) as { id: string }
      return data
    } catch (e) {
      return null
    }
  }

  verifyRefreshToken(refreshToken: string): { id: string } | null {
    try {
      const data = jwt.verify(refreshToken, config.jwtRefreshSecret) as { id: string }
      return data
    } catch (e) {
      return null
    }
  }

  async findRefreshToken(refreshToken: string): Promise<Token | null> {
    const token = await prisma.userToken.findUnique({
      where: {
        refresh: refreshToken,
      },
    })
    return token
  }

  async deleteRefreshTokenByUserId(userId: string): Promise<Token> {
    const deletedToken = await prisma.userToken.delete({
      where: {
        userId,
      },
    })
    return deletedToken
  }
}

export const tokenService = new TokenService()
