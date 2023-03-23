import type { GameCard } from '~/types'

import { WebSocket } from 'ws'

type SocketId = string

export class PlayerWs {
  public sockets: Map<SocketId, WebSocket> = new Map()
  public currentCard: GameCard | null = null
  private _isConnected: boolean = false

  constructor(public id: string, public name: string) {}

  get isConnected(): boolean {
    return this._isConnected
  }

  get hasCard() {
    return this.currentCard !== null
  }

  hasSocket(socketId: string): boolean {
    return this.sockets.has(socketId)
  }

  getSocket(socketId: string): WebSocket | null {
    return this.sockets.get(socketId) || null
  }

  addSocket(socketId: string, ws: WebSocket) {
    if (this.sockets.has(socketId)) throw new Error(`Socket with id ${socketId} is already exists`)
    this.sockets.set(socketId, ws)
    if (!this._isConnected) this._isConnected = true
  }

  removeSocket(socketId: string) {
    if (!this.sockets.has(socketId)) throw new Error(`Socket with id ${socketId} is not exists`)
    this.sockets.delete(socketId)
    if (this.sockets.size === 0) this._isConnected = false
  }

  closeAllSockets() {
    this.sockets.forEach(ws => ws.close())
    this._isConnected = false
  }
}
