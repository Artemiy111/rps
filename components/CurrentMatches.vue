<template>
  <section class="">
    <h2 class="mb-8 font-bold">{{ t('currentMatches') }}</h2>
    <div class="grid grid-cols-4 gap-5">
      <CurrentMatchesMatchCreate />

      <CurrentMatchesMatch v-for="game in props.currentGames" :key="game.id" :game="game" />
    </div>
  </section>
</template>

<script setup lang="ts">
import CurrentMatchesMatchCreate from './CurrentMatchesMatchCreate.vue'
import CurrentMatchesMatch from './CurrentMatchesMatch.vue'

import type { GameDTO } from '~/types'

const props = defineProps<{
  currentGames: GameDTO[]
}>()

const { t } = useI18n()
</script>

<i18n lang="json">
{
  "ru": {
    "currentMatches": "Текущие матчи"
  },
  "en": {
    "currentMatches": "Current matches"
  }
}
</i18n>
