import type { UserDb } from '~/types/server'

import bcrypt from 'bcrypt'

import { prisma } from '~/server/db'
import { tokenService } from './token.service'

class UserService {
  async findById(id: string): Promise<UserDb | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })
    return user
  }

  async findByName(username: string): Promise<UserDb | null> {
    const user = await prisma.user.findUnique({
      where: {
        name: username,
      },
    })
    return user
  }

  async create(data: { username: string; password: string }): Promise<UserDb> {
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

  async deleteById(id: string): Promise<UserDb> {
    const deletedUser = await prisma.user.delete({
      where: {
        id,
      },
    })
    await tokenService.deleteRefreshTokenByUserId(id)

    return deletedUser
  }
}

export const userServise = new UserService()
