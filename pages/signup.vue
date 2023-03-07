<template>
  <div class="">
    <section class="mx-auto w-[600px] rounded-lg border-2 border-slate-500 p-8 md:w-full">
      <h1 class="mb-8 font-bold">{{ t('signup') }}</h1>
      <form class="mb-12 flex flex-col gap-12 sm:mb-10 sm:gap-10" @submit.prevent>
        <VFormInputset
          v-model="form.username"
          input-id="username"
          :label-text="t('username')"
          :validation-error-message="errors.username"
        />
        <VFormInputset
          v-model="form.password"
          input-id="password"
          input-type="password"
          :label-text="t('password')"
          :validation-error-message="errors.password"
        />
        <VFormInputset
          v-model="form.repeatPassword"
          input-id="repeat-password"
          input-type="password"
          :label-text="t('repeatPassword')"
          :validation-error-message="errors.repeatPassword"
        />
        <div v-if="additionalError" class="rounded-lg bg-red-50 px-6 py-4 text-red-500">
          <span>{{ additionalError }}</span>
        </div>
        <VButton :disabled="!areFieldsFull" size="md" @click="signup()">{{
          t('continue')
        }}</VButton>
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

import { FetchError } from 'ofetch'
import type { ZodError } from 'zod'

import { signupSchema } from '~/schema/authSchema'
import { useAuthStore } from '~/store/authStore'

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const userStore = useAuthStore()

const form = ref({
  username: '',
  password: '',
  repeatPassword: '',
})

const errors = ref<{
  username?: string
  password?: string
  repeatPassword?: string
}>({})

const additionalError = ref<string>()

watch(
  form,
  () => {
    if (additionalError) additionalError.value = undefined
  },
  { deep: true }
)

const areFieldsFull = computed(() =>
  form.value.username.length && form.value.password.length && form.value.repeatPassword.length
    ? true
    : false
)

watch(
  () => form.value.username,
  () => {
    if (typeof errors.value.username === 'string') errors.value.username = undefined
  }
)

watch(
  () => form.value.password,
  () => {
    if (typeof errors.value.username === 'string') errors.value.password = undefined
  }
)

watch(
  () => form.value.repeatPassword,
  () => {
    if (typeof errors.value.username === 'string') errors.value.repeatPassword = undefined
  }
)

const signup = async () => {
  try {
    signupSchema.parse({
      username: form.value.username,
      password: form.value.password,
      repeatPassword: form.value.repeatPassword,
    })
    errors.value = {}
  } catch (_e) {
    const e = _e as ZodError
    if (e.formErrors.fieldErrors === undefined) return

    for (const field in e.formErrors.fieldErrors) {
      errors.value[field as keyof typeof errors.value] = (
        e.formErrors.fieldErrors[field] as string[]
      )[0]
    }
    return
  }

  try {
    userStore.signup(form.value.username, form.value.password, form.value.repeatPassword)
    router.push(localePath('/login'))
  } catch (e) {
    if (e instanceof FetchError) additionalError.value = e.data.message
  }
}
</script>

<i18n lang="json">
{
  "ru": {
    "signup": "Регистрация",
    "username": "Имя пользователя",
    "password": "Пароль",
    "repeatPassword": "Повторите пароль",
    "continue": "Продолжить",
    "haveAccount": "Есть Аккаунт?",
    "login": "Войти"
  },
  "en": {
    "signup": "Sign up",
    "username": "Username",
    "password": "Password",
    "repeatPassword": "Repeat password",
    "continue": "Continue",
    "haveAccount": "Have account?",
    "login": "Login"
  }
}
</i18n>
