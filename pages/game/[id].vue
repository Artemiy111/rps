<template>
  <div class="flex gap-24 md:gap-12 lg:gap-20">
    <div class="flex w-fit flex-col gap-8">
      <section class="flex w-fit min-w-[210px] flex-col gap-2">
        <h2 class="font-bold">{{ t('playing') }}</h2>
        <span>Зелибобик / Чорт</span>
      </section>
      <section class="flex flex-col gap-2">
        <h3 class="font-bold">{{ t('score') }}</h3>
        <div
          class="flex w-fit items-center justify-center rounded-lg bg-blue-50 px-10 py-3 text-blue-500"
        >
          3 : 2
        </div>
      </section>
      <section class="flex w-fit flex-col gap-6">
        <div v-for="i in 3" :key="i" class="flex flex-col gap-2">
          <h4 class="font-bold">{{ t('raund') }} {{ i }}</h4>
          <div class="flex w-fit items-center gap-1 rounded-lg bg-slate-50 py-2 px-4">
            <span>{{ t('scissors') }}</span>
            / <span>{{ t('rock') }}</span>
          </div>
        </div>
      </section>
    </div>
    <div class="flex flex-col items-center gap-8">
      <GameCard card-name="hand" :is-selectable="false" />
      <GameStatus game-status="win" />
      <div class="flex gap-10">
        <GameCard card-name="rock" :is-selected="isSelected('rock')" @select="selectCard" />
        <GameCard card-name="scissors" :is-selected="isSelected('scissors')" @select="selectCard" />
        <GameCard card-name="paper" :is-selected="isSelected('paper')" @select="selectCard" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GameCard from '~/components/GameCard.vue'
import GameStatus from '~/components/GameStatus.vue'

import type { GameCard as Card, GameMessage } from '~/types'

import { useUserStore } from '~/store/userStore'

definePageMeta({
  middleware: 'auth-middleware',
})

const { t } = useI18n()
const localePath = useLocalePath()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const gameId = route.params.id as string

const isSelected = (card: Card) => card === currentCard.value

const socket = ref<WebSocket>()
const currentCard = ref<Card>('hand')
const enemyCard = ref<Card>('hand')

// watchEffect(() => {
//   if (!userStore.user) {
//     router.push(localePath('/'))
//   }
// })

const sendMessage = () => {
  if (!userStore.user) return
  const message: GameMessage = {
    gameId: gameId,
    userId: userStore.user.id,
    message: {
      card: currentCard.value,
    },
  }

  if (!socket.value) return
  socket.value.send(JSON.stringify(message))
  console.log('[send]')
}

const parseMessage = (event: MessageEvent<any>): GameMessage => {
  return JSON.parse(event.data) as GameMessage
}
//FIXME Баг при перезагрузке
onMounted(() => {
  socket.value = new WebSocket('ws://localhost:4000/api/game')

  socket.value.onopen = event => {
    console.log('[opn]')
    sendMessage()
  }

  socket.value.onmessage = event => {
    if (!userStore.user) return
    const message = parseMessage(event)
    console.log(`[get]`, message)

    if (message.userId === userStore.user.id) {
      currentCard.value = message.message.card
    } else {
      enemyCard.value = message.message.card
    }
  }

  socket.value.onclose = event => {
    if (event.wasClean) {
    } else {
      console.log('[cls]')
    }
  }

  socket.value.onerror = error => {
    console.log(`[err], ${error}`)
  }
})

const selectCard = (card: Card) => {
  currentCard.value = card

  sendMessage()
}
</script>

<i18n lang="json">
{
  "ru": {
    "playing": "Играют",
    "score": "Счёт",
    "raund": "Раунд",
    "rock": "Камень",
    "paper": "Бумага",
    "scissors": "Ножницы"
  },
  "en": {
    "playing": "Playing",
    "score": "Score",
    "raund": "Raund",
    "rock": "Rock",
    "paper": "Paper",
    "scissors": "Scissors"
  }
}
</i18n>
