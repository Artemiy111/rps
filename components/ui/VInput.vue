<template>
  <input
    v-model="modelValue"
    class="rounded-lg bg-slate-50 py-3 px-6 outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const modelValue = computed({
  get() {
    return props.modelValue
  },
  set(value: string) {
    emit('update:modelValue', value)
  },
})
</script>
