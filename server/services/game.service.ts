import type { GameCard, GameFromDBWithPlayersAndRounds, User } from '~/types'

import { prisma } from '../db'
import { GameWs } from '../models/GameWs'

const includeInResponse = {
  players: true,
  rounds: { include: { players: true } },
}

class GameService {
  async getAllGames(): Promise<GameFromDBWithPlayersAndRounds[]> {
    return await prisma.game.findMany({
      include: includeInResponse,
    })
  }

  async hasGame(gameId: string): Promise<boolean> {
    const game = await prisma.game.findUnique({ where: { id: gameId } })
    return game ? true : false
  }

  async findGame(gameId: string): Promise<GameFromDBWithPlayersAndRounds | null> {
    return await prisma.game.findUnique({
      where: {
        id: gameId,
      },
      include: includeInResponse,
    })
  }

  async findPlayerInGame(gameId: string, playerId: string): Promise<User | null> {
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

  // async createGame(playerId: string) {
  //   return await prisma.game.create({
  //     data: {
  //       players: {
  //         connect: {
  //           id: playerId,
  //         },
  //       },
  //       rounds: {
  //         create: {},
  //       },
  //     },
  //     include: includeInResponse,
  //   })
  // }

  // async addPlayerToGame(gameId: string, playerId: string) {
  //   return await prisma.game.update({
  //     where: {
  //       id: gameId,
  //     },
  //     data: {
  //       players: {
  //         connect: {
  //           id: playerId,
  //         },
  //       },
  //     },
  //     include: includeInResponse,
  //   })
  // }

  // async addRound(gameId: string, order: number) {
  //   return prisma.game.update({
  //     where: { id: gameId },
  //     data: {
  //       rounds: {
  //         create: {
  //           order,
  //         },
  //       },
  //     },
  //     include: includeInResponse,
  //   })
  // }

  // async updateRound(
  //   gameId: string,
  //   roundOrder: number,
  //   winnerId?: string,
  //   winnerCard?: GameCardWithNull
  // ) {
  //   return prisma.game.update({
  //     where: {
  //       id: gameId,
  //     },
  //     data: {
  //       rounds: {
  //         updateMany: {
  //           where: {
  //             order: roundOrder,
  //           },
  //           data: {
  //             winnerId: winnerId,
  //             winnerCard: winnerCard,
  //           },
  //         },
  //       },
  //     },
  //     include: includeInResponse,
  //   })
  // }

  async createGameFromGameWs(game: GameWs): Promise<GameFromDBWithPlayersAndRounds> {
    await prisma.game.create({
      data: {
        id: game.id,
        createdAt: game.createdAt,
        startedAt: game.startedAt,
        endedAt: game.endedAt,
        players: {
          connect: [{ id: game.players[0].id }, { id: game.players[1].id }],
        },
        rounds: {
          createMany: {
            data: game.rounds.map(r => ({
              order: r.order,
              winnerId: r.winnerId,
              winnerCard: r.winnerCard,
            })),
          },
        },
      },
    })

    for (const round of game.rounds) {
      await prisma.gameRound.update({
        where: {
          gameId_order: { gameId: game.id, order: round.order },
        },
        data: {
          players: {
            createMany: {
              data: [
                { userId: round.players[0].id, card: round.players[0].card as GameCard },
                { userId: round.players[1].id, card: round.players[1].card as GameCard },
              ],
            },
          },
        },
      })
    }

    const newGame = (await prisma.game.findUnique({
      where: {
        id: game.id,
      },
      include: includeInResponse,
    })) as GameFromDBWithPlayersAndRounds
    return newGame
  }
}

export const gameService = new GameService()
