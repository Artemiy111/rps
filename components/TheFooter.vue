<template>
  <footer class="flex items-start gap-10">
    <div class="flex flex-col gap-5">
      <span class="font-bold">{{ t('contributors.title') }}</span>
      <ul class="flex flex-col gap-2">
        <li>{{ t('contributors.NaboishikovArtemiy') }}</li>
        <li>{{ t('contributors.YukinDmitry') }}</li>
      </ul>
    </div>
    <VLink to="https://github.com/Artemiy111/rps">{{ t('projectOnGithub') }}</VLink>
    <span
      >{{ t('imageFrom') }}
      <VLink
        to="https://ru.freepik.com/free-photo/businessman-doing-ok-gesture_1356591.htm#page=3&query=rock%20scissors%20paper&position=6&from_view=search&track=ais"
        >Freepic</VLink
      ></span
    >
    <span>Ⓒ2023</span>
  </footer>
</template>

<script setup lang="ts">
import VLink from '~/components/ui/VLink.vue'
const { t, locale } = useI18n()
</script>

<i18n lang="json">
{
  "ru": {
    "contributors": {
      "title": "Контрибьютеры",
      "NaboishikovArtemiy": "Набойщиков Артемий",
      "YukinDmitry": "Юкин Дмитрий"
    },
    "projectOnGithub": "Проект на Github",
    "imageFrom": "Изображение от"
  },
  "en": {
    "contributors": {
      "title": "Contributors",
      "NaboishikovArtemiy": "Naboishikov Artemiy",
      "YukinDmitry": "Yukin Dmitry"
    },
    "imageFrom": "Image from",
    "projectOnGithub": "Project on Github"
  }
}
</i18n>
