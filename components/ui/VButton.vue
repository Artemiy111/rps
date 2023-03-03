<template>
  <button
    v-if="typeof props.to === 'undefined'"
    v-bind="$attrs"
    :disabled="props.disabled"
    :class="[
      props.disabled ? 'bg-slate-50 text-slate-500' : '',
      props.type === 'primary' && !props.disabled
        ? 'bg-blue-500 text-blue-50 hover:bg-blue-600 focus:bg-blue-600 active:bg-blue-700'
        : '',
      props.type === 'secondary' && !props.disabled
        ? 'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:bg-blue-100 active:bg-blue-200'
        : '',
      props.size === 'sm' ? 'py-2 px-4' : '',
      props.size === 'md' ? 'py-3 px-6' : '',
    ]"
    class="w-fit rounded-lg outline-none transition-colors"
    @click="emit('click', $event)"
  >
    <slot></slot>
  </button>
  <NuxtLink
    v-else
    v-bind="$attrs"
    :disabled="props.disabled"
    :class="{
      'bg-slate-50 text-slate-500': props.disabled,
      'bg-blue-500 text-blue-50 hover:bg-blue-600 focus:bg-blue-600 active:bg-blue-700':
        props.type === 'primary' && !props.disabled,
      'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:bg-blue-100 active:bg-blue-200 ':
        props.type === 'secondary' && !props.disabled,
      'py-2 px-4': props.size === 'sm',
      'py-3 px-6': props.size === 'md',
    }"
    class="w-fit rounded-lg outline-none transition-colors"
    :to="props.to"
    @click="emit('click', $event)"
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
const props = withDefaults(
  defineProps<{
    type?: 'primary' | 'secondary'
    size?: 'sm' | 'md'
    disabled?: boolean
    to?: string
  }>(),
  {
    type: 'secondary',
    size: 'sm',
    disabled: false,
    to: undefined,
  }
)
const emit = defineEmits<{
  (e: 'click', event: Event): void
}>()
</script>
