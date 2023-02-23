<template>
  <header class="flex items-center justify-between py-8">
    <NuxtLink :to="'/'" class="outline-none focus-visible:opacity-50">
      <span class="text-md font-medium">Камень. Ножницы? Бумага!</span></NuxtLink
    >
    <div class="flex items-center gap-10">
      <div class="flex gap-2.5"><span class="text-slate-500">В онлайне</span><span>12</span></div>
      <div class="flex gap-1">
        <button>Ru</button><span class="text-slate-500"> | </span
        ><button class="text-slate-500 hover:text-slate-600 active:text-slate-700">En</button>
      </div>
      <div class="flex gap-5">
        <VButton size="sm" type="primary">Вход</VButton><VButton size="sm">Регистрация</VButton>
      </div>
    </div>
  </header>
</template>
<script setup lang="ts">
import VButton from '~/components/ui/VButton.vue'
</script>
<style scoped></style>
