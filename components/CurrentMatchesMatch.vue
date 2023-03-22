<template>
  <div
    :tabindex="!props.match.started ? 0 : -1"
    :class="[
      !props.match.started
        ? 'cursor-pointer bg-slate-50  text-slate-500  hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-200'
        : 'bg-slate-300 text-slate-900',
    ]"
    class="flex aspect-video flex-col items-center justify-center gap-2 rounded-lg outline-none transition-colors"
    @click="gotoGame()"
    @keydown.enter.space.prevent="gotoGame()"
  >
    {{ props.match.players[0].name }}
    <span>{{ props.match.players.length }} / 2</span>
    {{ props.match.players[1].name }}
  </div>
</template>

<script setup lang="ts">
import type { GameDTO } from '~/types'

const props = defineProps<{
  match: GameDTO
}>()

const emit = defineEmits<{
  (e: 'goto-game', gameId: string): void
}>()

const gotoGame = () => {
  if (props.match.started && props.match.players.length === 1) {
    emit('goto-game', props.match.id)
  }
}
</script>
