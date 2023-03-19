import { User } from '~/types'

export class UserDTO {
  public id: string = ''
  public name: string = ''
  constructor(user: User) {
    this.id = user.id
    this.name = user.name
  }
}
