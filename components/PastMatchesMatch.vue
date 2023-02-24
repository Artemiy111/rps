<template>
  <div class="">
    <div class="mb-3 flex items-center justify-center rounded-lg bg-slate-50 py-2.5">
      {{ props.player1Score }} : {{ props.player2Score }}
    </div>
    <span class="mb-2 block">{{ props.player1Name }} / {{ props.player2Name }}</span>
    <span class="block text-sm text-slate-500">5 мин назад</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  player1Name: string
  player1Score: number

  player2Name: string
  player2Score: number

  // matchEndTime: Date
}>()
</script>
