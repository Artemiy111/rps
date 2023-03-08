<template>
  <div class="flex gap-24 md:gap-12 lg:gap-20">
    <div class="flex w-fit flex-col gap-8">
      <section class="flex w-fit min-w-[210px] flex-col gap-2">
        <h2 class="font-bold">{{ t('playing') }}</h2>
        <span>{{ userStore.user?.name }} / {{ enemy?.name || '..' }}</span>
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
      <GameCard card-name="hand" :is-selected="isEnemySelected" :is-selectable="false" />
      <GameStatus :game-status="gameStatus" />
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

import type { GameCard as Card, GameMessage, GameStatus as Status, UserSafeInfo } from '~/types'

import { useUserStore } from '~/store/userStore'
import { getGameRoundStatus } from '~/helpers/getGameRoundStatus'

definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()
const localePath = useLocalePath()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const gameId = route.params.id as string

const isSelected = (card: Card) => card === currentCard.value
const isEnemySelected = computed(() => enemyCard.value !== 'hand')

const socket = ref<WebSocket | null>(null)
const currentCard = ref<Card>('hand')

const enemy = ref<UserSafeInfo | null>(null)
const enemyCard = ref<Card>('hand')

const gameStatus = ref<Status>('waiting')

watchEffect(() => {
  if (!userStore.user) {
    router.push(localePath('/'))
  }
})

const selectCard = (card: Card) => {
  if (card === currentCard.value) return
  currentCard.value = card

  sendMessage()
}

const sendMessage = () => {
  if (!userStore.user || !socket.value) return
  const message: GameMessage = {
    game: {
      id: gameId,
    },
    sender: userStore.user,
    disconnected: false,
    message: {
      card: currentCard.value,
    },
  }

  socket.value.send(JSON.stringify(message))
  console.log('[send]')
}

const parseMessage = (event: MessageEvent): GameMessage => {
  return JSON.parse(event.data) as GameMessage
}

onMounted(() => {
  socket.value = new WebSocket('ws://localhost:4000/api/game')
  socket.value.onopen = onSocketOpen
  socket.value.onmessage = onSocketMessage
  socket.value.onclose = onSocketClose
  socket.value.onerror = onSocketError
})

onBeforeUnmount(() => {
  socket.value?.close()
})

const onSocketOpen = (event: Event) => {
  console.log('[opn]')
  sendMessage()
}

const onSocketMessage = (event: MessageEvent) => {
  if (!userStore.user) return
  const message = parseMessage(event)

  if (message.disconnected) {
    enemyCard.value = 'hand'
    enemy.value = null
    console.log(`[dis]`, message)
    return
  }

  if (message.sender.id === userStore.user.id) {
    console.log(`[get]`, message)
    currentCard.value = message.message.card
    if (enemy.value) gameStatus.value = getGameRoundStatus(currentCard.value, enemyCard.value)
  }

  if (message.sender.id !== userStore.user.id) {
    console.log(`[enm]`, message)
    if (!enemy.value) {
      enemy.value = message.sender
      gameStatus.value = 'timer'
    }
    enemyCard.value = message.message.card
    gameStatus.value = getGameRoundStatus(currentCard.value, enemyCard.value)
  }
}

const onSocketClose = (event: CloseEvent) => {
  if (event.wasClean) {
  } else {
    console.log('[cls]')
  }
  socket.value = null
}

const onSocketError = (error: Event) => {
  console.log(`[err], ${error}`)
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
