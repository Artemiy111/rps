<template>
  <NuxtLink
    :to="localePath(`/game/${props.game.id}`)"
    :class="[canJoin ? '' : '[pointer-events:none]']"
    class="group outline-transparent"
  >
    <div
      :tabindex="!props.game.started ? 0 : -1"
      :class="[
        !props.game.started
          ? 'cursor-pointer bg-slate-50  text-slate-500  group-hover:bg-slate-100 group-focus:bg-slate-100 group-active:bg-slate-200'
          : 'bg-slate-300 text-slate-900',
      ]"
      class="flex aspect-video flex-col items-center justify-center gap-2 rounded-lg outline-none transition-colors"
    >
      {{ props.game.players[0].name }}
      <span>{{ props.game.players.length }} / 2</span>
      {{ props.game.players[1]?.name }}
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { GameDTO } from '~/types'

const props = defineProps<{
  game: GameDTO
}>()

const localePath = useLocalePath()

const canJoin = computed(() => !props.game.started && props.game.players.length === 1)
</script>
