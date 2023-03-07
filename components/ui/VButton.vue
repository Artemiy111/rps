<template>
  <button
    v-if="typeof to === 'undefined'"
    v-bind="$attrs"
    :disabled="disabled"
    :class="[
      disabled ? 'bg-slate-50 text-slate-500' : '',
      styleType === 'primary' && !disabled
        ? 'bg-blue-500 text-blue-50 hover:bg-blue-600 focus:bg-blue-600 active:bg-blue-700'
        : '',
      styleType === 'secondary' && !disabled
        ? 'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:bg-blue-100 active:bg-blue-200'
        : '',
      size === 'sm' ? 'py-2 px-4 sm:py-1.5 md:px-3' : '',
      size === 'md' ? 'py-3 px-6 sm:py-2 md:px-4' : '',
    ]"
    class="w-fit whitespace-nowrap rounded-lg outline-none transition-colors"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
  <NuxtLink
    v-else
    v-bind="$attrs"
    :disabled="disabled"
    :class="[
      disabled ? 'bg-slate-50 text-slate-500' : '',
      styleType === 'primary' && !disabled
        ? 'bg-blue-500 text-blue-50 hover:bg-blue-600 focus:bg-blue-600 active:bg-blue-700'
        : '',
      styleType === 'secondary' && !disabled
        ? 'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:bg-blue-100 active:bg-blue-200'
        : '',
      size === 'sm' ? 'py-2 px-4 sm:py-1.5 md:px-3' : '',
      size === 'md' ? 'py-3 px-6 sm:py-2 md:px-4' : '',
    ]"
    class="w-fit whitespace-nowrap rounded-lg outline-none transition-colors"
    :to="to"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </NuxtLink>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
withDefaults(
  defineProps<{
    styleType?: 'primary' | 'secondary'
    size?: 'sm' | 'md'
    disabled?: boolean
    to?: string
  }>(),
  {
    styleType: 'secondary',
    size: 'sm',
    disabled: false,
    to: undefined,
  }
)

defineEmits<{
  (e: 'click', event: Event): void
}>()
</script>
