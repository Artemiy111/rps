<template>
  <input
    v-model="inputText"
    class="ms:px-3 rounded-lg bg-slate-50 py-3 px-4 outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 sm:py-2"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputText = computed({
  get() {
    return props.modelValue
  },
  set(value: string) {
    emit('update:modelValue', value)
  },
})
</script>
