<template>
  <header class="flex items-center justify-between py-8">
    <NuxtLink :to="localePath('/')" class="outline-none focus-visible:opacity-50">
      <span class="text-md font-medium md:text-base">{{ t('logo') }}</span></NuxtLink
    >
    <div class="flex items-center gap-8 md:gap-6">
      <div class="flex gap-2.5">
        <span class="whitespace-nowrap text-slate-500">{{ t('online') }}</span
        ><span>12</span>
      </div>
      <div class="flex gap-1">
        <button
          :class="
            locale === 'ru'
              ? 'text-black'
              : 'text-slate-500 hover:text-slate-700 active:text-slate-800'
          "
          @click="setLocale('ru')"
        >
          Ru</button
        ><span class="text-slate-400"> | </span
        ><button
          :class="
            locale === 'en'
              ? 'text-black'
              : 'text-slate-500 hover:text-slate-700 active:text-slate-800'
          "
          @click="setLocale('en')"
        >
          En
        </button>
      </div>
      <div v-if="!isLoginPage && !isRegistrationPage && !userStore.user" class="flex gap-5">
        <VButton :to="localePath('login')" size="sm" style-type="primary">{{ t('login') }}</VButton
        ><VButton :to="localePath('signup')" size="sm">{{ t('signup') }}</VButton>
      </div>
      <div v-else-if="userStore.user" class="group relative">
        <span>{{ userStore.user.name }}</span>
        <div class="absolute right-0 z-50 pt-4">
          <div class="hidden rounded-lg bg-slate-50 py-2 px-4 transition-all group-hover:flex">
            <span
              tabindex="0"
              class="cursor-pointer whitespace-nowrap text-slate-500 hover:text-slate-700 active:text-slate-800"
              @click="logout"
              >{{ t('logout') }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import VButton from '~/components/ui/VButton.vue'
import { useAuthStore } from '~/store/authStore'
import { useUserStore } from '~/store/userStore'

const { t, locale, setLocale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const authStore = useAuthStore()
const userStore = useUserStore()

const isLoginPage = computed(() => route.name?.toString().match('login'))
const isRegistrationPage = computed(() => route.name?.toString().match('signup'))

const logout = async () => await authStore.logout()
</script>

<i18n lang="json">
{
  "ru": {
    "logo": "????????????. ??????????????? ????????????!",
    "online": "?? ??????????????",
    "login": "????????",
    "signup": "??????????????????????",
    "logout": "??????????"
  },
  "en": {
    "logo": "Rock. Paper? Scissors!",
    "online": "Online",
    "login": "Login",
    "signup": "Sign up",
    "logout": "Logout"
  }
}
</i18n>
