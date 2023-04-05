import type { User } from '~/types'
import { PlayerWs } from '../models/PlayerWs'

export class UserDTO {
  public id: string = ''
  public name: string = ''

  constructor(user: User | PlayerWs) {
    this.id = user.id
    this.name = user.name
  }
}
