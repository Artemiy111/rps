<template>
  <div class="">
    <TheBanner class="mb-16" />
    <CurrentMatches :current-games="currentGames" class="mb-16" />
    <PastMatches :past-games="pastGames" />
  </div>
</template>

<script setup lang="ts">
import TheBanner from '~/components/TheBanner.vue'
import CurrentMatches from '~/components/CurrentMatches.vue'
import PastMatches from '~/components/PastMatches.vue'

import type { GameDTO } from '~/types'

import { gameApi } from '~/http/api/gameApi'

const currentGames = ref<GameDTO[]>([])
const pastGames = ref<GameDTO[]>([])

const timeoutIdForLoadingGames = ref<number | null>(null)

const loadGames = async () => {
  currentGames.value = await gameApi.getAllCurrent()
  pastGames.value = await gameApi.getAllPast()
  timeoutIdForLoadingGames.value = setTimeout(() => loadGames(), 2000) as unknown as number
}
loadGames()

onUnmounted(() => {
  if (timeoutIdForLoadingGames.value !== null) clearTimeout(timeoutIdForLoadingGames.value)
})
</script>
