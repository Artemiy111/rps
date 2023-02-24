<template>
  <div class="relative">
    <label :for="props.inputId" class="pointer-events-none mb-3 block">{{ props.labelText }}</label>
    <VInput
      :id="props.inputId"
      :type="props.inputType"
      :maxlength="props.maxlength"
      class="w-full"
    />
    <div
      v-if="props.validationErrorMessage"
      class="absolute bottom-[calc(-16px-10px)] text-sm text-red-500"
    >
      {{ props.validationErrorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import VInput from '~/components/ui/VInput.vue'

const props = withDefaults(
  defineProps<{
    labelText: string
    inputId: string
    inputType?: 'text' | 'password' | 'number'
    maxlength?: number
    validationErrorMessage?: string
  }>(),
  {
    inputType: 'text',
    maxlength: undefined,
    validationErrorMessage: undefined,
  }
)
</script>
