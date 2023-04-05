<template>
  <div
    class="flex h-fit flex-col items-center gap-2 rounded-lg bg-slate-50 p-4 focus-visible:border-2"
  >
    <div
      v-for="emoji in emojis"
      :key="emoji"
      tabindex="0"
      class="flex aspect-square cursor-pointer items-center justify-center text-[40px] outline-transparent transition-opacity hover:opacity-70 focus-visible:opacity-70 active:opacity-50"
      @click="selectEmoji(emoji)"
    >
      <span>{{ emoji }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameEmoji } from '~/types'

const emojis: GameEmoji[] = ['😎', '👺', '🤓']

const emit = defineEmits<{
  (e: 'select', emoji: GameEmoji): void
}>()

const selectEmoji = (emoji: GameEmoji) => emit('select', emoji)
</script>
