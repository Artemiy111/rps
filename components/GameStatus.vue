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
    {{ timeLeftInSeconds }} секунд
  </div>
</template>

<script setup lang="ts">
type GameStatus = 'waiting' | 'timer' | 'lose' | 'draw' | 'win'

const props = defineProps<{
  gameStatus: GameStatus
}>()

const timeLeftInSeconds = ref(0)

const setTimer = (timeInSeconds: number) => {
  timeLeftInSeconds.value = timeInSeconds
  const interval = setInterval(() => {
    timeLeftInSeconds.value -= 1
  }, 1000)
  setTimeout(() => clearInterval(interval), timeInSeconds * 1000)
}
</script>
