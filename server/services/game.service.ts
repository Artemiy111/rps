import type { Game, GameCard } from '~/types'
import { prisma } from '~/server/db'

const include = {
  players: true,
  rounds: true,
}

class GameService {
  async getAllGames() {
    return await prisma.game.findMany({
      include: include,
    })
  }

  async findGame(id: string) {
    return await prisma.game.findUnique({
      where: {
        id,
      },
      include: include,
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
        players: {
          connect: {
            id: playerId,
          },
        },
        rounds: {
          create: {},
        },
      },
      include: include,
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
      include: include,
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
      include: include,
    })
  }

  async updateRound(gameId: string, roundOrder: number, winnerId?: string, winnerCard?: GameCard) {
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
              winnerId: winnerId,
              winnerCard: winnerCard,
            },
          },
        },
      },
      include: include,
    })
  }
}

export const gameService = new GameService()
