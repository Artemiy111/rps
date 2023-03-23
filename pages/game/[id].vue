<template>
  <div class="flex justify-between gap-24 md:gap-12 lg:gap-20">
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
            <span :class="player!.id === round.winnerId ? 'text-blue-500' : ''">{{
              t(round.playerCard || 'hand')
            }}</span>
            /
            <span :class="enemy?.id === round.winnerId ? 'text-blue-500' : ''">{{
              t(round.enemyCard || 'hand')
            }}</span>
          </div>
        </div>
      </section>
    </div>
    <div class="flex flex-col items-center gap-8">
      <GameCard :card-name="null" :is-selected="isEnemySelected" :is-selectable="false" />
      <GameStatus :game-status="gameStatus" />
      <div class="flex gap-10">
        <GameCard
          card-name="rock"
          :is-selected="isCardSelected('rock')"
          :is-selectable="isCardSelectable"
          @select="selectCard"
        />
        <GameCard
          card-name="scissors"
          :is-selected="isCardSelected('scissors')"
          :is-selectable="isCardSelectable"
          @select="selectCard"
        />
        <GameCard
          card-name="paper"
          :is-selected="isCardSelected('paper')"
          :is-selectable="isCardSelectable"
          @select="selectCard"
        />
      </div>
    </div>

    <GameEmojiBar
      class="transition-opacity"
      :class="[gameStatus === 'end' ? ' opacity-0' : 'opacity-100']"
      @select="sendMessage($event)"
    />
    <GameEmojiShow ref="gameEmojiShow" />
  </div>
</template>

<script setup lang="ts">
import GameCard from '~/components/GameCard.vue'
import GameStatus from '~/components/GameStatus.vue'
import GameEmojiBar from '~/components/GameEmojiBar.vue'
import GameEmojiShow from '~/components/GameEmojiShow.vue'

import {
  GameCard as Card,
  GameEmoji,
  GameMessageFromApi,
  GameMessageFromClient,
  GameStatus as Status,
  isGameMessageFromApiEnded,
  UserDTO,
  isGameMessageFromApiContinues,
} from '~/types'

import { useUserStore } from '~/stores/user.store.js'
import { getPlayerRoundResult } from '~/helpers/getPlayerRoundResult.js'

definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()
const localePath = useLocalePath()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const gameId = route.params.id as string
const gameStatus = ref<Status>('waitingEnemyJoin')
const gameInitialized = ref(false)
const isBreakBetweenRounds = ref(false)

type Round = {
  order: number
  playerCard: Card | null
  enemyCard: Card | null
  winnerCard: Card | null
  winnerId: string | null
}

const rounds = ref<Round[]>([])

const getScore = (player: Ref<UserDTO | null>) => {
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

const isCardSelected = (card: Card | null) => card === currentCard.value
const isPlayerSelected = computed(() => currentCard.value !== null)
const isEnemySelected = computed(() => enemyCard.value !== null)
const isCardSelectable = computed(() => gameStatus.value !== 'end' && !isBreakBetweenRounds.value)

const socket = ref<WebSocket | null>(null)
const currentCard = ref<Card | null>(null)

const enemy = ref<UserDTO | null>(null)
const enemyCard = ref<Card | null>(null)
const enemyScore = getScore(enemy)

const gameEmojiShow = ref<InstanceType<typeof GameEmojiShow> | null>(null)

watchEffect(() => {
  if (!player.value) {
    router.push(localePath('/'))
  }
})

watchEffect(() => {
  if (gameStatus.value === 'end') return
  if (!enemy.value) {
    gameStatus.value = 'waitingEnemyJoin'
    return
  }

  if (isPlayerSelected.value && isEnemySelected.value)
    gameStatus.value = getPlayerRoundResult(currentCard.value, enemyCard.value)
  else if (!isPlayerSelected.value && !isEnemySelected.value) gameStatus.value = 'waitingMoves'
  else if (isPlayerSelected.value && !isEnemySelected.value) gameStatus.value = 'waitingEnemyMove'
  else if (!isPlayerSelected.value && isEnemySelected.value) gameStatus.value = 'waitingPlayerMove'
})

const selectCard = (card: Card | null) => {
  if (card === currentCard.value) return
  currentCard.value = card
  sendMessage()
}

const sendMessage = (emoji?: GameEmoji) => {
  if (!player.value || !socket.value || gameStatus.value === 'end') return
  const message: GameMessageFromClient = {
    initial: !gameInitialized.value,
    game: {
      id: gameId,
    },
    sender: {
      user: player.value,
      card: currentCard.value,
      emoji: emoji,
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
  if (!player.value) throw new Error('No player')

  const message = parseMessage(event) satisfies GameMessageFromApi

  const gameEnemy = message.game.players.find(p => p.id !== player.value?.id) || null

  if (!enemy.value && gameEnemy) {
    console.log(`[enm init]`)
    enemy.value = gameEnemy
  }
  if (enemy.value) {
    rounds.value = message.game.rounds.map(round => {
      return {
        order: round.order,
        winnerId: round.winnerId,
        winnerCard: round.winnerCard,
        playerCard: round.players.find(p => p.id === player.value!.id)!.card || null,
        enemyCard: round.players.find(p => p.id === gameEnemy!.id)!.card || null,
      }
    })
  }

  if (isGameMessageFromApiEnded(message)) {
    console.log('ENDED', message)
    gameStatus.value = 'end'
    currentCard.value = null
    enemyCard.value = null
    return
  }

  if (!isGameMessageFromApiContinues(message)) return

  if (message.sender.emoji) gameEmojiShow.value?.show(message.sender.emoji)

  if (enemy.value?.id === message.sender.user.id && !message.sender.connected) {
    console.log(`[enm dis]`, message)
    enemy.value = null
    enemyCard.value = null
    return
  }

  const isBreak =
    message.game.rounds.length !== 0 &&
    message.game.rounds.at(-1)!.breakBetweenRoundsEndsIn - Date.now() > 0

  isBreakBetweenRounds.value = isBreak

  if (message.sender.user.id === player.value.id) {
    if (!gameInitialized.value) gameInitialized.value = true
    console.log(`[get]`, message)
    currentCard.value = message.sender.card
  }

  if (message.sender.user.id === enemy.value?.id) {
    console.log(`[enm]`, message)
    enemyCard.value = message.sender.card
  }
}

const onSocketClose = (event: CloseEvent) => {
  if (event.wasClean) {
    console.log('[cls clean]')
  } else {
    console.log('[cls]')
  }
  if (gameStatus.value === 'end') return
  socket.value = null
  gameStatus.value = 'disconnection'
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

@keyframes emoji {
  0% {
    transform: translate(0px, 0px);
    scale: 0.9;
  }

  50% {
    transform: translate(-100px, -200px);
    scale: 1.5;
    rotate: 10deg;
  }

  70% {
    opacity: 90%;
  }

  100% {
    transform: translate(-300px, -440px);
    opacity: 0;
  }
}
.emoji {
  animation: emoji 2s cubic-bezier(0.4, 0, 1, 1) forwards;
  user-select: none;
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
