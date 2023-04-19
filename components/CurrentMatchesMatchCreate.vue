<template>
  <NuxtLink
    :to="localePath(`/game/${uuid()}`)"
    class="group flex aspect-video outline-transparent sm:h-32 sm:w-full"
  >
    <div
      class="flex w-full cursor-pointer items-center justify-center rounded-lg bg-blue-50 outline-none transition-colors group-hover:bg-blue-100 group-focus:bg-blue-100 group-active:bg-blue-200"
    >
      <span class="text-blue-500">{{ t('create') }}</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { v4 as uuid } from 'uuid'
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<i18n lang="json">
{
  "ru": {
    "create": "Создать"
  },
  "en": {
    "create": "Create"
  }
}
</i18n>
