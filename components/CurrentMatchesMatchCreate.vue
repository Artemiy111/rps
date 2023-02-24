<template>
  <div
    tabindex="0"
    class="flex aspect-video cursor-pointer items-center justify-center rounded-lg bg-blue-50 outline-none transition-colors hover:bg-blue-100 focus:bg-blue-100 active:bg-blue-200"
  >
    <span class="text-blue-500">{{ t('create') }}</span>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
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
