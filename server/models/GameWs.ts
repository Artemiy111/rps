import type { GameFromDBWithPlayersAndRounds, GameRoundData } from '~/types'

import { getPlayerRoundResult } from '~/server/helpers/getPlayerRoundResult'
import { PlayerWs } from './PlayerWs'

export class GameWs {
  public readonly createdAt: Date = new Date()
  private _started: boolean = false
  private _startedAt: Date | null = null
  private _ended: boolean = false
  private _endedAt: Date | null = null
  private _players: PlayerWs[] = []
  public rounds: GameRoundData[] = []

  constructor(public id: string) {}

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
  get players(): PlayerWs[] {
    return this._players
  }
  get isFilled() {
    return this.players.length === 2
  }
  get isEmpty() {
    return this.players.length === 0
  }
  get isBreakBetweenRounds() {
    return this.rounds.length !== 0 && this.rounds.at(-1)!.breakBetweenRoundsEndsIn - Date.now() > 0
  }

  addRound(breakBetweenRoundsEndsIn: number = Date.now() + 1500): number {
    if (!this.isFilled) {
      throw new Error('Could not add round to not filled game')
    }
    const player1 = this.players[0]
    const player2 = this.players[1]
    const player1RoundResult = getPlayerRoundResult(player1.currentCard, player2.currentCard)
    const newRound: GameRoundData = {
      order: this.rounds.length + 1,
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
    this.rounds.push(newRound)
    return breakBetweenRoundsEndsIn
  }

  getPlayer(playerId: string): PlayerWs | null {
    return this.players.find(player => player.id === playerId) || null
  }

  getEnemy(playerId: string): PlayerWs | null {
    return this.players.find(player => player.id !== playerId) || null
  }

  addPlayer(player: PlayerWs): PlayerWs {
    if (this.isFilled) {
      throw new Error('Could not add player to filled game')
    }
    this.players.push(player)
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

  fillFromGameFromDB(game: GameFromDBWithPlayersAndRounds) {
    this.setStartedStatus(game.startedAt!)
    this.setEndedStatus(game.endedAt!)

    const player1 = new PlayerWs(game.players[0].id, game.players[0].name)
    const player2 = new PlayerWs(game.players[1].id, game.players[1].name)

    this.addPlayer(player1)
    this.addPlayer(player2)

    this.rounds = game.rounds.map(r => ({
      order: r.order,
      winnerId: r.winnerId,
      winnerCard: r.winnerCard,
      breakBetweenRoundsEndsIn: Date.now(),
      players: r.players.map(p => ({ id: p.userId, card: p.card })),
    }))
  }
}
