import type { UserDb } from '~/types/server'

import { PlayerWs } from '../models/PlayerWs'

export class UserDTO {
  public readonly id: string
  public readonly name: string

  constructor(user: UserDb | PlayerWs) {
    this.id = user.id
    this.name = user.name
  }
}
