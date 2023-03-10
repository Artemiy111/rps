<template>
  <div class="flex gap-24 md:gap-12 lg:gap-20">
    <div class="flex w-fit flex-col gap-8">
      <section class="flex w-fit min-w-[210px] flex-col gap-2">
        <h2 class="font-bold">{{ t('playing') }}</h2>
        <span>{{ player?.name }} / {{ enemy?.name || '..' }}</span>
      </section>
      <section class="flex flex-col gap-2">
        <h3 class="font-bold">{{ t('score') }}</h3>
        <div
          class="flex w-fit items-center justify-center rounded-lg bg-blue-50 px-10 py-3 text-blue-500"
        >
          {{ playerScore }} : {{ enemyScore }}
        </div>
      </section>
      <section class="custom-scroll flex max-h-[60dvh] w-fit flex-col gap-6 overflow-auto pr-2">
        <div v-for="round in rounds" :key="round.order" class="flex flex-col gap-2">
          <h4 class="font-bold">{{ t('round') }} {{ round.order }}</h4>
          <div class="flex w-fit items-center gap-1 rounded-lg bg-slate-50 py-2 px-4">
            <span :class="round.playerCard === round.winnerCard ? 'text-blue-500' : ''">{{
              t(round.playerCard)
            }}</span>
            /
            <span :class="round.enemyCard === round.winnerCard ? 'text-blue-500' : ''">{{
              t(round.enemyCard)
            }}</span>
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

import type {
  GameCard as Card,
  GameMessageFromApi,
  GameMessageFromClient,
  GameStatus as Status,
  UserSafeInfo,
} from '~/types'

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
const gameStatus = ref<Status>('waiting')

type Round = {
  order: number
  playerCard: Card
  enemyCard: Card
  winnerCard?: Card
  winnerId?: string
}

const rounds = ref<Round[]>([])

const getScore = (player: Ref<UserSafeInfo | null>) => {
  return computed(() => {
    if (!player.value) return 0
    return rounds.value.reduce(
      (acc, round) => (round.winnerId === player.value!.id ? acc + 1 : acc),
      0
    )
  })
}

const player = computed(() => userStore.user)
const playerScore = getScore(player)

const isSelected = (card: Card) => card === currentCard.value
const isEnemySelected = computed(() => enemyCard.value !== 'hand')

const socket = ref<WebSocket | null>(null)
const currentCard = ref<Card>('hand')

const enemy = ref<UserSafeInfo | null>(null)
const enemyCard = ref<Card>('hand')
const enemyScore = getScore(enemy)

watchEffect(() => {
  if (!player) {
    router.push(localePath('/'))
  }
})

// watchEffect(() => {
//   if (currentCard.value === 'hand' && enemyCard.value === 'hand' && gameStatus.value !== 'waiting')
//     gameStatus.value = 'timer'
// })

const selectCard = (card: Card) => {
  if (card === currentCard.value) return
  currentCard.value = card

  sendMessage()
}

const sendMessage = () => {
  if (!player.value || !socket.value) return
  const message: GameMessageFromClient = {
    game: {
      id: gameId,
    },
    sender: player.value,
    message: {
      card: currentCard.value,
    },
  }

  socket.value.send(JSON.stringify(message))
  console.log('[send]')
}

const parseMessage = (event: MessageEvent): GameMessageFromApi => {
  return JSON.parse(event.data) as GameMessageFromApi
}

onMounted(() => {
  socket.value = new WebSocket('ws://localhost:4000/api/game/ws')
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
  if (!player.value) return
  const message = parseMessage(event)

  if (!message.connected) {
    enemyCard.value = 'hand'
    enemy.value = null
    console.log(`[dis]`, message)
    gameStatus.value = 'waiting'
    return
  }

  if (message.sender.id === player.value.id) {
    console.log(`[get]`, message)
    currentCard.value = message.message.card
    if (enemy.value) gameStatus.value = getGameRoundStatus(currentCard.value, enemyCard.value)
  }

  if (message.sender.id !== player.value.id) {
    console.log(`[enm]`, message)
    if (!enemy.value) {
      enemy.value = message.sender
      gameStatus.value = 'timer'
    }
    enemyCard.value = message.message.card
    gameStatus.value = getGameRoundStatus(currentCard.value, enemyCard.value)
  }
  if (enemy) {
    rounds.value = message.message.rounds.map(round => ({
      order: round.order,
      winnerId: round.winnerId,
      winnerCard: round.winnerCard,
      playerCard: round.players.find(p => p.id === player.value?.id)?.card || 'hand',
      enemyCard: round.players.find(p => p.id === enemy.value?.id)?.card || 'hand',
    }))
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

<style scoped>
.custom-scroll::-webkit-scrollbar {
  scrollbar-gutter: stable;
  width: 8px;
  border-radius: 9999px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: theme('colors.slate.100');
}
.custom-scroll::-webkit-scrollbar-thumb {
  background-color: theme('colors.slate.300');
  border-radius: 9999px;
}
</style>

<i18n lang="json">
{
  "ru": {
    "playing": "Играют",
    "score": "Счёт",
    "round": "Раунд",
    "rock": "Камень",
    "paper": "Бумага",
    "scissors": "Ножницы",
    "hand": "Ничего"
  },
  "en": {
    "playing": "Playing",
    "score": "Score",
    "round": "Round",
    "rock": "Rock",
    "paper": "Paper",
    "scissors": "Scissors",
    "hand": "Nothing"
  }
}
</i18n>
