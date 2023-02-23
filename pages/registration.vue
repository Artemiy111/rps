<template>
  <div class="">
    <section class="mx-auto w-[600px] rounded-lg border-2 border-slate-500 p-8">
      <h1 class="mb-8 font-bold">Регистрация</h1>
      <form class="mb-12 flex flex-col gap-12" @submit.prevent>
        <VFormInputset
          input-id="username"
          label-text="Имя пользователя"
          validation-error-message="Имя не должно быть длиннее 12 символов"
        />
        <VFormInputset
          input-id="password"
          label-text="Пароль"
          validation-error-message="Пароль должен быть не короче 8 символов"
        />
        <VFormInputset
          input-id="repeat-password"
          label-text="Повторите пароль"
          validation-error-message="Пароли не совпадают"
        />

        <VButton disabled size="md">Зарегистрироваться</VButton>
      </form>
      <div class="flex items-center gap-5">
        <span>Есть Аккаунт?</span>
        <VButton to="login">Войти</VButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import VButton from '~/components/ui/VButton.vue'
import VFormInputset from '~/components/ui/VFormInputset.vue'
</script>
