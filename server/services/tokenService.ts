import jwt from 'jsonwebtoken'

import { prisma } from '~/server/db'

import type { Token } from '~/types'

const config = useRuntimeConfig()

class TokenService {
  createTokens(payload: { id: string }): {
    accessToken: string
    refreshToken: string
  } {
    const accessToken = jwt.sign(payload, config.jwtAccessSecret, { expiresIn: 60 * 1 })
    const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: 60 * 60 * 30 })
    return {
      accessToken,
      refreshToken,
    }
  }

  async saveRefreshToken(userId: string, refreshToken: string): Promise<Token> {
    const token = await prisma.token.upsert({
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

  async deleteRefreshToken(refreshToken: string): Promise<Token> {
    const deletedToken = await prisma.token.delete({ where: { refresh: refreshToken } })
    return deletedToken
  }

  // async refreshRefreshToken(refreshToken: string): Promise<Token> {
  //   const newRefreshToken = ''
  //   const newToken = await prisma.token.update({
  //     where: {
  //       refresh: refreshToken,
  //     },
  //     data: {
  //       refresh: newRefreshToken,
  //     },
  //   })
  //   return newToken
  // }

  async findRefreshToken(refreshToken: string): Promise<Token | null> {
    const token = await prisma.token.findUnique({
      where: {
        refresh: refreshToken,
      },
    })
    return token
  }
}

export const tokenService = new TokenService()
