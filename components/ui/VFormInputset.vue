<template>
  <div class="relative">
    <label :for="inputId" class="mb-3 block">{{ props.labelText }}</label>
    <VInput :id="inputId" type="text" class="w-full" />
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

const props = defineProps<{
  inputId: string
  labelText: string
  validationErrorMessage?: string
}>()
</script>
