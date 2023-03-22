import type { GameDTO } from '~/types'

export class GameApi {
  async getAll(): Promise<GameDTO[]> {
    return await $fetch('/api/games')
  }
}
export const gameApi = new GameApi()
