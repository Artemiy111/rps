<template>
  <footer class="flex flex-wrap items-start gap-x-10 gap-y-5">
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
const { t } = useI18n()
</script>

<i18n lang="json">
{
  "ru": {
    "projectOnGithub": "Проект на Github",
    "imageFrom": "Изображение от"
  },
  "en": {
    "imageFrom": "Image from",
    "projectOnGithub": "Project on Github"
  }
}
</i18n>
