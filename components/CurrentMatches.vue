<template>
  <section class="">
    <h2 class="mb-8 font-bold">{{ t('currentMatches') }}</h2>
    <div class="grid grid-cols-4 gap-5">
      <CurrentMatchesMatchCreate />

      <CurrentMatchesMatch
        v-for="game in currentGames"
        :key="game.id"
        :match="game"
        @goto-game="gotoGame"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import CurrentMatchesMatchCreate from './CurrentMatchesMatchCreate.vue'
import CurrentMatchesMatch from './CurrentMatchesMatch.vue'

import type { GameDTO } from '~/types'

import { gameApi } from '~/http/api/gameApi'

const { t } = useI18n()
const router = useRouter()
const localePath = useLocalePath()

const games = ref<GameDTO[]>([])
const currentGames = computed(() => games.value.filter(game => !game.ended))

const timeout = ref<number | null>(null)

const loadGames = async () => {
  games.value = await gameApi.getAll()
  timeout.value = setTimeout(() => loadGames(), 2000) as unknown as number
}
loadGames()

onUnmounted(() => {
  if (timeout.value !== null) clearTimeout(timeout.value)
})

const gotoGame = (gameId: string) => {
  //   router.push(localePath(`/game/${gameId}`))
}
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
