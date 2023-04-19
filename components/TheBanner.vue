<template>
  <div class="relative">
    <img
      src="~/assets/img/banner.png"
      alt="banner"
      class="h-auto min-h-[200px] w-full object-cover"
    />
    <div
      class="absolute bottom-16 left-8 flex gap-5 md:bottom-8 sm:bottom-6 sm:left-6 xs:flex-col xs:gap-3"
    >
      <VButton style-type="primary" size="md">{{ t('quickMatch') }}</VButton>
      <VButton :to="localePath(`/game/${uuid()}`)" size="md">{{ t('createMatch') }}</VButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import VButton from './ui/VButton.vue'

import { v4 as uuid } from 'uuid'

const { t } = useI18n()
const localePath = useLocalePath()
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
