<template>
  <section>
    <h2 class="mb-8 font-bold">{{ t('lastMatches') }}</h2>
    <div
      class="grid grid-cols-4 gap-x-5 gap-y-8 lg:grid-cols-3 md:grid-cols-2 [@media(max-width:500px)]:grid-cols-1"
    >
      <PastMatchesMatch v-for="game in pastGamesSortedByTimeEnded" :key="game.id" :game="game" />
    </div>
  </section>
</template>

<script setup lang="ts">
import PastMatchesMatch from './PastMatchesMatch.vue'

import type { GameDTO } from '~/types'

const props = defineProps<{
  pastGames: GameDTO[]
}>()

const { t } = useI18n()

const pastGamesSortedByTimeEnded = computed(() => {
  return [...props.pastGames].sort(
    (g1, g2) => new Date(g2.endedAt!).getTime() - new Date(g1.endedAt!).getTime()
  )
})
</script>

<i18n lang="json">
{
  "ru": {
    "lastMatches": "Прошедшие матчи"
  },
  "en": {
    "lastMatches": "Last matches"
  }
}
</i18n>
