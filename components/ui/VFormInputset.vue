<template>
  <div class="relative">
    <label :for="name" class="mb-3 block">Имя пользователя</label>
    <VInput :id="name" type="text" class="w-full" />
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
  name: string
  validationErrorMessage?: string
}>()
</script>
