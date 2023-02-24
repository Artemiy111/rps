<template>
  <div class="flex gap-24">
    <div class="flex w-fit flex-col gap-8">
      <section class="flex w-fit min-w-[210px] flex-col gap-2">
        <h2 class="font-bold">{{ t('playing') }}</h2>
        <span>Зелибобик / Чорт</span>
      </section>
      <section class="flex flex-col gap-2">
        <h3 class="font-bold">{{ t('score') }}</h3>
        <div
          class="flex w-fit items-center justify-center rounded-lg bg-blue-50 px-10 py-3 text-blue-500"
        >
          3 : 2
        </div>
      </section>
      <section class="flex w-fit flex-col gap-6">
        <div v-for="i in 3" :key="i" class="flex flex-col gap-2">
          <h4 class="font-bold">{{ t('raund') }} {{ i }}</h4>
          <div class="flex w-fit items-center gap-1 rounded-lg bg-slate-50 py-2 px-4">
            <span>{{ t('scissors') }}</span>
            / <span>{{ t('rock') }}</span>
          </div>
        </div>
      </section>
    </div>
    <div class="flex flex-col items-center gap-8">
      <GameCard card-name="hand" :is-selectable="false" />
      <GameStatus game-status="win" />
      <div class="flex gap-10">
        <GameCard card-name="rock" :is-selected="true" />
        <GameCard card-name="scissors" />
        <GameCard card-name="paper" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GameCard from '~/components/GameCard.vue'
import GameStatus from '~/components/GameStatus.vue'

const { t } = useI18n()
</script>

<i18n lang="json">
{
  "ru": {
    "playing": "Играют",
    "score": "Счёт",
    "raund": "Раунд",
    "rock": "Камень",
    "paper": "Бумага",
    "scissors": "Ножницы"
  },
  "en": {
    "playing": "Playing",
    "score": "Score",
    "raund": "Raund",
    "rock": "Rock",
    "paper": "Paper",
    "scissors": "Scissors"
  }
}
</i18n>
