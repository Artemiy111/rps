<template>
  <footer class="flex items-start gap-10">
    <div class="flex flex-col gap-5">
      <span class="font-bold">Контрибьютеры</span>
      <ul class="flex flex-col gap-2">
        <li>Набойщиков Артемий</li>
        <li>Юкин Дмитрий</li>
      </ul>
    </div>
    <VLink to="/">Проект на Github</VLink>
    <span
      >Изображение от
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
</script>
