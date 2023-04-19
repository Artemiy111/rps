import type { GameRound } from '~/types'

import { getPlayerRoundResult } from '~/server/helpers/getPlayerRoundResult'
import { PlayerWs } from './PlayerWs'

interface Game {
  readonly id: string
  readonly createdAt: Date
  readonly started: boolean
  readonly startedAt: Date | null
  readonly ended: boolean
  readonly endedAt: Date | null
  readonly players: PlayerWs[]
  readonly rounds: GameRound[]
}

export class GameWs implements Game {
  public readonly id: string
  public readonly createdAt: Date
  private _started: boolean = false
  private _startedAt: Date | null = null
  private _ended: boolean = false
  private _endedAt: Date | null = null
  private _players: PlayerWs[] = []

  private _rounds: GameRound[] = []

  constructor(id: string, createdAt?: Date) {
    this.id = id
    this.createdAt = createdAt || new Date()
  }

  get started(): boolean {
    return this._started
  }
  get startedAt(): Date | null {
    return this._startedAt
  }
  get ended(): boolean {
    return this._ended
  }
  get endedAt(): Date | null {
    return this._endedAt
  }
  get players() {
    return [...this._players]
  }
  get rounds() {
    return [...this._rounds]
  }

  isFilled(): boolean {
    return this.players.length === 2
  }
  isEmpty(): boolean {
    return this.players.length === 0
  }
  isBreakBetweenRounds() {
    return (
      this._rounds.length !== 0 && this._rounds.at(-1)!.breakBetweenRoundsEndsIn - Date.now() > 0
    )
  }

  areAllPlayersDisconnected(): boolean {
    return this.isEmpty() || this._players.every(player => !player.isConnected())
  }

  addRound(breakBetweenRoundsEndsIn: number = Date.now() + 1500): number {
    if (!this.isFilled()) {
      throw new Error('Could not add round to not filled game')
    }
    const player1 = this.players[0]
    const player2 = this.players[1]
    const player1RoundResult = getPlayerRoundResult(player1.currentCard, player2.currentCard)
    const newRound: GameRound = {
      order: this._rounds.length + 1,
      players: [
        { id: player1.id, card: player1.currentCard },
        { id: player2.id, card: player2.currentCard },
      ],
      winnerId: null,
      winnerCard: null,
      breakBetweenRoundsEndsIn: breakBetweenRoundsEndsIn,
    }
    switch (player1RoundResult) {
      case 'win':
        newRound.winnerId = player1.id
        newRound.winnerCard = player1.currentCard
        break
      case 'lose':
        newRound.winnerId = player2.id
        newRound.winnerCard = player2.currentCard
        break
    }
    this._rounds.push(newRound)
    return breakBetweenRoundsEndsIn
  }

  getPlayer(playerId: string): PlayerWs | null {
    return this._players.find(player => player.id === playerId) || null
  }

  getEnemy(playerId: string): PlayerWs | null {
    return this._players.find(player => player.id !== playerId) || null
  }

  addPlayer(player: PlayerWs): PlayerWs {
    if (this.isFilled()) {
      throw new Error('Could not add player to filled game')
    }
    this._players.push(player)
    return player
  }

  setStartedStatus(startedAt: Date = new Date()) {
    this._started = true
    this._startedAt = startedAt
  }

  setEndedStatus(endedAt: Date = new Date()) {
    this._ended = true
    this._endedAt = endedAt
  }
}
