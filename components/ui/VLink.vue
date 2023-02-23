<template>
  <NuxtLink
    :href="href"
    class="text-blue-500 outline-none hover:text-blue-600 focus:text-blue-600 focus-visible:underline active:text-blue-700"
    ><slot></slot
  ></NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  href: string
}>()
</script>
