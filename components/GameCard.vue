<template>
  <div
    tabindex="0"
    :class="[
      props.isSelected ? 'text-blue-500' : 'text-slate-700',
      props.isSelectable && !props.isSelected
        ? 'cursor-pointer hover:text-slate-500 focus:text-slate-500 active:text-blue-500'
        : '',
    ]"
    class="h-fit w-fit rounded-[30px] bg-slate-100 px-3 py-12 outline-none transition-colors"
    @click="selectCard"
  >
    <NuxtIcon :name="props.cardName" class="text-[150px]" />
  </div>
</template>

<script setup lang="ts">
type CardName = 'hand' | 'rock' | 'paper' | 'scissors'

const props = withDefaults(
  defineProps<{
    cardName: CardName
    isSelectable?: boolean
    isSelected?: boolean
  }>(),
  {
    isSelectable: true,
    isSelected: false,
  }
)
const emit = defineEmits<{
  (e: 'select'): void
}>()

const selectCard = () => emit('select')
</script>
