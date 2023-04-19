<template>
  <div class="text-[40px]">
    <div
      v-for="emoji in currentEmojis"
      :key="emoji.id"
      class="emoji relative"
      :style="{
        bottom: emoji.emojiOffsetX + 'px',
        right: emoji.emojiOffsetY + 'px',
      }"
    >
      <span>{{ emoji.emoji }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GameEmoji } from '~/types'

type EmojiData = {
  id: number
  emoji: GameEmoji
  emojiOffsetX: number
  emojiOffsetY: number
}
const currentEmojis = ref<EmojiData[]>([])

const randomNumber = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

const show = (emoji: GameEmoji) => {
  const emojiData = {
    id: Date.now(),
    emoji: emoji,
    emojiOffsetX: randomNumber(0, 30),
    emojiOffsetY: randomNumber(0, 30),
  }

  currentEmojis.value.push(emojiData)

  setTimeout(() => {
    currentEmojis.value = currentEmojis.value.filter(emoji => emoji.id !== emojiData.id)
  }, 2000)
}

defineExpose({
  show,
})
</script>

<style scoped>
@keyframes emoji {
  0% {
    transform: translate(0px, 0px);
    scale: 0.9;
  }

  50% {
    transform: translate(-10vw, -19vh);
    scale: 1.5;
    rotate: 10deg;
  }

  70% {
    opacity: 90%;
  }

  100% {
    transform: translate(-33vw, -44vh);
    opacity: 0;
  }
}
.emoji {
  animation: emoji 2s cubic-bezier(0.4, 0, 1, 1) forwards;
  user-select: none;
}
</style>
