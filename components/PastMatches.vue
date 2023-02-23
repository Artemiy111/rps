<template>
  <section>
    <h2 class="mb-8 font-bold">Прошедшие матчи</h2>
    <div class="grid grid-cols-4 gap-x-5 gap-y-8">
      <PastMatchesMatch
        v-for="i in 6"
        :key="i"
        player1-name="зелибобик"
        :player1-score="2"
        player2-name="Чорт"
        :player2-score="3"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import PastMatchesMatch from './PastMatchesMatch.vue'
</script>
