<template>
  <div class="">
    <section class="mx-auto w-[600px] rounded-lg border-2 border-slate-500 p-8">
      <h1 class="mb-8 font-bold">Регистрация</h1>
      <form class="mb-12 flex flex-col gap-12" @submit.prevent>
        <VFormInputset
          name="username"
          validation-error-message="Имя не должно быть длиннее 12 символов"
        />
        <VFormInputset
          name="password"
          validation-error-message="Пароль должен быть не короче 8 символов"
        />

        <VButton disabled size="md">Войти</VButton>
      </form>
      <div class="flex items-center gap-5">
        <span>Нет Аккаунта?</span>
        <VButton to="registration">Зарегистрироваться</VButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import VButton from '~/components/ui/VButton.vue'
import VFormInputset from '~/components/ui/VFormInputset.vue'
</script>
