import type { GameCard, GameRoundStatus } from '~/types'

export const getPlayerRoundResult = (
  playerCard: GameCard | null,
  enemyCard: GameCard | null
): GameRoundStatus => {
  switch (playerCard) {
    case null:
      switch (enemyCard) {
        case null:
          return 'draw'
        default:
          return 'lose'
      }
    case 'rock':
      switch (enemyCard) {
        case null:
          return 'win'
        case 'rock':
          return 'draw'
        case 'paper':
          return 'lose'
        case 'scissors':
          return 'win'
      }
    case 'paper':
      switch (enemyCard) {
        case null:
          return 'win'
        case 'rock':
          return 'win'
        case 'paper':
          return 'draw'
        case 'scissors':
          return 'lose'
      }
    case 'scissors':
      switch (enemyCard) {
        case null:
          return 'win'
        case 'rock':
          return 'lose'
        case 'paper':
          return 'win'
        case 'scissors':
          return 'draw'
      }
  }
}
