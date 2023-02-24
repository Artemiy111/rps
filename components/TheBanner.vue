<template>
  <div class="relative">
    <img
      src="~/assets/img/banner.png"
      alt="banner"
      class="h-auto min-h-[300px] w-full object-cover"
    />
    <div class="absolute bottom-16 left-8 flex gap-5">
      <VButton type="primary" size="md">{{ t('quickMatch') }}</VButton>
      <VButton size="md">{{ t('createMatch') }}</VButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import VButton from './ui/VButton.vue'
const { t } = useI18n()
</script>

<i18n lang="json">
{
  "ru": {
    "quickMatch": "Быстрый матч",
    "createMatch": "Создать матч"
  },
  "en": {
    "quickMatch": "Quick match",
    "createMatch": "Create match"
  }
}
</i18n>
