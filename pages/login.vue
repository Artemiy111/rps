<template>
  <div class="">
    <section class="mx-auto w-[600px] rounded-lg border-2 border-slate-500 p-8 md:w-full">
      <h1 class="mb-8 font-bold">{{ t('login') }}</h1>
      <form class="mb-12 flex flex-col gap-12 sm:mb-10 sm:gap-10" @submit.prevent="">
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
          :maxlength="30"
          :label-text="t('password')"
          :validation-error-message="errors.password"
        />
        <div v-if="additionalError" class="rounded-lg bg-red-50 px-6 py-4 text-red-500">
          <span>{{ additionalError }}</span>
        </div>
        <VButton :disabled="!areFieldsFull" size="md" @click="login()">{{ t('continue') }}</VButton>
      </form>

      <div class="flex items-center gap-5">
        <span>{{ t('noAccount') }}</span>
        <VButton :to="localePath('signup')">{{ t('signUp') }}</VButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import VButton from '~/components/ui/VButton.vue'
import VFormInputset from '~/components/ui/VFormInputset.vue'

import { FetchError } from 'ofetch'
import type { ZodError } from 'zod'

import { loginSchema } from '~/schema/authSchema'
import { useAuthStore } from '~/store/authStore'

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const userStore = useAuthStore()

const form = ref({
  username: '',
  password: '',
})

const errors = ref<{
  username?: string
  password?: string
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
  form.value.username.length && form.value.password.length ? true : false
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

const login = async () => {
  try {
    loginSchema.parse({
      username: form.value.username,
      password: form.value.password,
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
    userStore.login(form.value.username, form.value.password)

    router.push(localePath('/'))
  } catch (e) {
    if (e instanceof FetchError) additionalError.value = e.data.message
  }
}
</script>

<i18n lang="json">
{
  "ru": {
    "login": "Вход",
    "username": "Имя пользователя",
    "password": "Пароль",
    "continue": "Продолжить",
    "noAccount": "Нет Аккаунта?",
    "signUp": "Зарегистрироваться"
  },
  "en": {
    "login": "Login",
    "username": "Username",
    "password": "Password",
    "continue": "Continue",
    "noAccount": "Haven't account?",
    "signUp": "Sign up"
  }
}
</i18n>
