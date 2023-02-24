<template>
  <div class="">
    <section class="mx-auto w-[600px] rounded-lg border-2 border-slate-500 p-8">
      <h1 class="mb-8 font-bold">{{ t('signUp') }}</h1>
      <form class="mb-12 flex flex-col gap-12" @submit.prevent>
        <VFormInputset
          input-id="username"
          :label-text="t('username')"
          validation-error-message="Имя не должно быть длиннее 12 символов"
        />
        <VFormInputset
          input-id="password"
          input-type="password"
          :label-text="t('password')"
          validation-error-message="Пароль должен быть не короче 8 символов"
        />
        <VFormInputset
          input-id="repeat-password"
          input-type="password"
          :label-text="t('repeatPassword')"
          validation-error-message="Пароли не совпадают"
        />

        <VButton disabled size="md">{{ t('continue') }}</VButton>
      </form>
      <div class="flex items-center gap-5">
        <span>{{ t('haveAccount') }}</span>
        <VButton :to="localePath('login')">{{ t('login') }}</VButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import VButton from '~/components/ui/VButton.vue'
import VFormInputset from '~/components/ui/VFormInputset.vue'

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<i18n lang="json">
{
  "ru": {
    "signUp": "Регистрация",
    "username": "Имя пользователя",
    "password": "Пароль",
    "repeatPassword": "Повторите пароль",
    "continue": "Продолжить",
    "haveAccount": "Есть Аккаунт?",
    "login": "Вход"
  },
  "en": {
    "signUp": "Sign up",
    "username": "Username",
    "password": "Password",
    "repeatPassword": "Repeat password",
    "continue": "Continue",
    "haveAccount": "Have account?",
    "login": "Login"
  }
}
</i18n>
