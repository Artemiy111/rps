<template>
  <div class="relative">
    <label :for="props.inputId" class="pointer-events-none mb-3 block">{{ props.labelText }}</label>
    <VInput
      :id="props.inputId"
      v-model="modelValue"
      :type="props.inputType"
      :maxlength="props.maxlength"
      class="w-full"
    />
    <div
      v-if="props.validationErrorMessage"
      class="absolute bottom-[calc(-16px-10px)] text-sm text-red-500 transition-all duration-700"
    >
      {{ props.validationErrorMessage }}
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

const modelValue = computed({
  get() {
    return props.modelValue
  },
  set(value: string) {
    emit('update:modelValue', value)
  },
})
</script>
