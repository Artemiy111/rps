<template>
  <section class="">
    <h2 class="mb-8 font-bold">{{ t('currentMatches') }}</h2>
    <div class="grid grid-cols-4 gap-5">
      <CurrentMatchesMatchCreate />
      <CurrentMatchesMatch match-status="waiting" />
      <CurrentMatchesMatch match-status="full" />
    </div>
  </section>
</template>

<script setup lang="ts">
import CurrentMatchesMatchCreate from './CurrentMatchesMatchCreate.vue'
import CurrentMatchesMatch from './CurrentMatchesMatch.vue'

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
