import type { User, UserSafeInfo } from '~/types'

import bcrypt from 'bcrypt'

import { prisma } from '~/server/db'

class UserService {
  getUserSafeInfo(user: User): UserSafeInfo {
    return {
      id: user.id,
      name: user.name,
    }
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })
    return user
  }

  async findByName(username: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        name: username,
      },
    })
    return user
  }

  async create(data: { username: string; password: string }): Promise<User> {
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
}

export const userServise = new UserService()
