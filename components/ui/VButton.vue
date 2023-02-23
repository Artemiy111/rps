<template>
  <button
    :class="{
      'bg-blue-500 text-blue-50 hover:bg-blue-600 focus:bg-blue-600 active:bg-blue-700':
        props.type === 'primary',
      'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:bg-blue-100 active:bg-blue-200 ':
        props.type === 'secondary',
      'py-2 px-4': props.size === 'sm',
      'py-3 px-6': props.size === 'md',
    }"
    class="rounded-lg outline-none transition-colors"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ type?: 'primary' | 'secondary'; size?: 'sm' | 'md' }>(), {
  type: 'secondary',
  size: 'sm',
})
</script>
