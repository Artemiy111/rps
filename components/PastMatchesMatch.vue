<template>
  <div class="">
    <div class="mb-3 flex items-center justify-center rounded-lg bg-slate-50 py-2.5">
      {{ playersScore[0] }} : {{ playersScore[1] }}
    </div>
    <span class="mb-2 block md:mb-1">{{ game.players[0].name }} / {{ game.players[1].name }}</span>
    <span class="block text-sm text-slate-500 md:text-xs">{{
      getRelativeTimeString(new Date(game.endedAt!), locale)
    }}</span>
  </div>
</template>

<script setup lang="ts">
import { GameDTO } from '~/types'

import { getRelativeTimeString } from '~/helpers/getRelativeTimeString'

const props = defineProps<{
  game: GameDTO
}>()

const { locale } = useI18n()

const getPlayersScore = (game: GameDTO): number[] => {
  return game.players.map(player => {
    return game.rounds.reduce((acc, round) => (round.winnerId === player.id ? acc + 1 : acc), 0)
  })
}
const playersScore = computed(() => getPlayersScore(props.game))
</script>
