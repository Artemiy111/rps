import type { GameDTO } from '~/types'

import { api } from '.'

export class GameApi {
  async getAllCurrent(): Promise<GameDTO[]> {
    return await api<GameDTO[]>('/api/games/current')
  }

  async getAllPast(): Promise<GameDTO[]> {
    return await api<GameDTO[]>('/api/games/past')
  }
}
export const gameApi = new GameApi()
