<template>
  <div class="relative">
    <label :for="inputId" class="pointer-events-none mb-3 block">{{ labelText }}</label>
    <VInput
      :id="inputId"
      v-model="inputModelValue"
      :type="inputType"
      :maxlength="maxlength"
      class="w-full"
    />
    <div
      v-if="validationErrorMessage"
      class="absolute bottom-[calc(-16px-10px)] text-sm text-red-500 transition-all duration-700"
    >
      {{ validationErrorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import VInput from '~/components/ui/VInput.vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    labelText: string
    inputId: string
    inputType?: 'text' | 'password'
    maxlength?: number
    validationErrorMessage?: string
  }>(),
  {
    inputType: 'text',
    maxlength: undefined,
    validationErrorMessage: undefined,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputModelValue = computed({
  get() {
    return props.modelValue
  },
  set(value: string) {
    emit('update:modelValue', value)
  },
})
</script>
