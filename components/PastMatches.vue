<template>
  <section>
    <h2 class="mb-8 font-bold">{{ t('lastMatches') }}</h2>
    <div class="grid grid-cols-4 gap-x-5 gap-y-8 md:grid-cols-3">
      <PastMatchesMatch
        v-for="i in 6"
        :key="i"
        player1-name="зелибобик000"
        :player1-score="2"
        player2-name="123456789000"
        :player2-score="3"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import PastMatchesMatch from './PastMatchesMatch.vue'
const { t } = useI18n()
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
