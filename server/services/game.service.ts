import type { Game } from '~/types'
import { prisma } from '~/server/db'

const include = {
  player1: true,
  player2: true,
  players: true,
  rounds: true,
}

class GameService {
  async findGame(id: string) {
    return await prisma.game.findUnique({
      where: {
        id,
      },
      include,
    })
  }

  async findPlayerInGame(gameId: string, playerId: string) {
    return await prisma.user.findFirst({
      where: {
        id: playerId,
        games: {
          some: {
            id: gameId,
          },
        },
      },
    })
  }

  async createGame(playerId: string) {
    return await prisma.game.create({
      data: {
        player1Id: playerId,
        rounds: {
          create: {},
        },
      },
      include,
    })
  }

  async addPlayerToGame(gameId: string, playerId: string) {
    return await prisma.game.update({
      where: {
        id: gameId,
      },
      data: {
        players: {
          connect: {
            id: playerId,
          },
        },
      },
      include,
    })
  }

  async addRound(gameId: string, order: number) {
    return prisma.game.update({
      where: { id: gameId },
      data: {
        rounds: {
          create: {
            order,
          },
        },
      },
      include,
    })
  }

  async updateRound(gameId: string, roundOrder: number, winnerId: string) {
    return prisma.game.update({
      where: {
        id: gameId,
      },
      data: {
        rounds: {
          updateMany: {
            where: {
              order: roundOrder,
            },
            data: {
              winnerId,
            },
          },
        },
      },
      include,
    })
  }
}

export const gameService = new GameService()
