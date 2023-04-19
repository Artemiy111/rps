<template>
  <div
    class="w-fit rounded px-6 py-2 xs:px-3"
    :class="[
      isWaiting ? 'bg-slate-500 text-slate-50' : '',
      props.gameStatus === 'timer' || props.gameStatus === 'end' ? 'bg-blue-500 text-blue-50' : '',
      props.gameStatus === 'lose' || props.gameStatus === 'disconnection'
        ? 'bg-red-500 text-red-50'
        : '',
      props.gameStatus === 'draw' ? 'bg-yellow-500 text-yellow-50' : '',
      props.gameStatus === 'win' ? 'bg-green-500 text-green-50' : '',
    ]"
  >
    {{ statusText }}
  </div>
</template>

<script setup lang="ts">
import type { GameStatus, GameStatusWaiting } from '~/types'
import { ruNumberPluralization } from '~/helpers/ruNumberPluralization'

const props = defineProps<{
  gameStatus: GameStatus
}>()

const { t } = useI18n({
  pluralRules: {
    ru: ruNumberPluralization,
  },
})

const timeLeftInSeconds = ref(0)

const WAITING_STATUSES: GameStatusWaiting[] = [
  'waitingEnemyJoin',
  'waitingEnemyMove',
  'waitingPlayerMove',
  'waitingMoves',
]
const isWaiting = computed(() => WAITING_STATUSES.includes(props.gameStatus as GameStatusWaiting))

const statusText = computed(() => {
  switch (props.gameStatus) {
    case 'waitingEnemyJoin':
      return t('waitingEnemyJoin')
    case 'waitingEnemyMove':
      return t('waitingEnemyMove')
    case 'waitingPlayerMove':
      return t('waitingPlayerMove')
    case 'waitingMoves':
      return t('waitingMoves')
    case 'lose':
      return t('lose')
    case 'draw':
      return t('draw')
    case 'win':
      return t('win')
    case 'timer':
      return t('timer', timeLeftInSeconds.value)
    case 'end':
      return t('end')
    case 'disconnection':
      return t('disconnection')
  }
})

const setTimer = (timeInSeconds: number) => {
  timeLeftInSeconds.value = timeInSeconds
  const interval = setInterval(() => {
    timeLeftInSeconds.value -= 1
  }, 1000)
  setTimeout(() => clearInterval(interval), timeInSeconds * 1000)
}
</script>

<i18n lang="json">
{
  "ru": {
    "waitingEnemyJoin": "Ждём присоединения оппонента",
    "waitingEnemyMove": "Ждём хода оппонента",
    "waitingPlayerMove": "Ждём вашего хода",
    "waitingMoves": "Ждём ходов игроков",
    "lose": "Вы проиграли",
    "draw": "Ничья",
    "win": "Вы выиграли",
    "timer": "{n} секунд | {n} секунда | {n} секунды",
    "end": "Игра завершена",
    "disconnection": "Вы вне сети"
  },
  "en": {
    "waitingEnemyJoin": "Waiting for opponent to join",
    "waitingEnemyMove": "Waiting for opponent's move",
    "waitingPlayerMove": "Waiting for your move",
    "waitingMoves": "Waiting for players' moves",
    "lose": "You lost",
    "draw": "Draw",
    "win": "You won",
    "timer": "0 seconds | 1 second | {n} seconds",
    "end": "The game is ended",
    "disconnection": "You are disconnected"
  }
}
</i18n>
