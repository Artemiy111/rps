import type { GameCard, GameRoundStatus } from '~/types'

export const getPlayerRoundResult = (
  playerCard: GameCard,
  enemyCard: GameCard
): GameRoundStatus => {
  switch (playerCard) {
    case 'hand':
      switch (enemyCard) {
        case 'hand':
          return 'draw'
        default:
          return 'lose'
      }
    case 'rock':
      switch (enemyCard) {
        case 'hand':
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
        case 'hand':
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
        case 'hand':
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
