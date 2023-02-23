<template>
  <div
    :tabindex="props.matchStatus === 'waiting' ? 0 : -1"
    :class="{
      'cursor-pointer bg-slate-50  text-slate-500  hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-200':
        props.matchStatus === 'waiting',
      'bg-slate-300 text-slate-900': props.matchStatus === 'full',
    }"
    class="flex aspect-video items-center justify-center rounded-lg outline-none transition-colors"
  >
    <span>{{ countPlayers }} / 2</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  matchStatus: 'waiting' | 'full'
}>()

const countPlayers = computed(() => (props.matchStatus === 'waiting' ? 1 : 2))
</script>
