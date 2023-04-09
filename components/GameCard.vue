<template>
  <div
    :tabindex="!props.isSelected ? 0 : -1"
    :class="[
      props.isSelected ? 'text-blue-500' : 'text-slate-700',
      props.isSelectable && !props.isSelected
        ? 'cursor-pointer hover:text-slate-500 focus:text-slate-500 active:text-blue-500'
        : '',
    ]"
    class="h-fit w-fit rounded-[30px] bg-slate-100 px-3 py-12 outline-none transition-colors lg:py-8 lg:px-2"
    @click="selectCard"
  >
    <NuxtIcon :name="props.cardName || 'hand'" class="md:text[100px] text-[150px]" />
  </div>
</template>

<script setup lang="ts">
import type { GameCard } from '~/types/index.js'

const props = withDefaults(
  defineProps<{
    cardName: GameCard | null
    isSelectable?: boolean
    isSelected?: boolean
  }>(),
  {
    isSelectable: true,
    isSelected: false,
  }
)
const emit = defineEmits<{
  (e: 'select', cardName: GameCard | null): void
}>()

const selectCard = () => {
  if (!props.isSelectable) return
  emit('select', props.cardName)
}
</script>
