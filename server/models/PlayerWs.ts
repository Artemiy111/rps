import type { GameCard } from '~/types'

import { WebSocket } from 'ws'
import { UserDTO } from '../dtos/user.dto'

type SocketId = string

export class PlayerWs {
  public readonly id: string
  public readonly name: string
  private _sockets: Map<SocketId, WebSocket> = new Map()
  public currentCard: GameCard | null = null
  private _isConnected: boolean = false

  constructor(user: UserDTO) {
    this.id = user.id
    this.name = user.name
  }

  isConnected(): boolean {
    return this._isConnected
  }
  setConnected() {
    this._isConnected = false
  }

  hasCard() {
    return this.currentCard !== null
  }

  get sockets() {
    return [...this._sockets]
  }

  hasSocket(socketId: string): boolean {
    return this._sockets.has(socketId)
  }

  getSocket(socketId: string): WebSocket | null {
    return this._sockets.get(socketId) || null
  }

  addSocket(socketId: string, ws: WebSocket) {
    if (this._sockets.has(socketId)) throw new Error(`Socket with id ${socketId} is already exists`)
    this._sockets.set(socketId, ws)
    if (!this._isConnected) this._isConnected = true
  }

  removeSocket(socketId: string) {
    if (!this._sockets.has(socketId)) throw new Error(`Socket with id ${socketId} is not exists`)
    this._sockets.delete(socketId)
    if (this._sockets.size === 0) this._isConnected = false
  }

  closeAllSockets() {
    this._sockets.forEach(ws => ws.close())
    this._isConnected = false
  }
}
