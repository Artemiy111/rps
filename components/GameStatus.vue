<template>
  <div
    class="w-fit rounded px-6 py-2"
    :class="[
      props.gameStatus === 'waiting' ? 'bg-slate-500 text-slate-50' : '',
      props.gameStatus === 'timer' ? 'bg-blue-500 text-blue-50' : '',
      props.gameStatus === 'lose' ? 'bg-red-500 text-red-50' : '',
      props.gameStatus === 'draw' ? 'bg-yellow-500 text-yellow-50' : '',
      props.gameStatus === 'win' ? 'bg-green-500 text-green-50' : '',
    ]"
  >
    {{ statustext }}
  </div>
</template>

<script setup lang="ts">
type GameStatus = 'waiting' | 'timer' | 'lose' | 'draw' | 'win'

const props = defineProps<{
  gameStatus: GameStatus
}>()

const { t } = useI18n()

const timeLeftInSeconds = ref(0)

const statustext = computed(() => {
  switch (props.gameStatus) {
    case 'waiting':
      return t('waiting')
    case 'lose':
      return t('lose')
    case 'draw':
      return t('draw')
    case 'win':
      return t('win')
    case 'timer':
      return timeLeftInSeconds.value + ' секунд'
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
    "waiting": "Ждём присоединения игрока",
    "lose": "Вы проиграли",
    "draw": "Ничья",
    "win": "Вы выиграли"
  },
  "en": {
    "waiting": "Waiting for player to join",
    "lose": "You lost",
    "draw": "Draw",
    "win": "You won"
  }
}
</i18n>
