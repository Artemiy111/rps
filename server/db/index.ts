import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()
export type { User, Match, Token } from '@prisma/client'
