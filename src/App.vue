<script setup>
// ============================================================
// IMPORTS
// ============================================================
import { useStore } from "vuex"
import { computed, onMounted, ref, watch, onUnmounted } from "vue"
import { useRoute } from "vue-router"
import Cookies from "js-cookie"
import { getPlayerId } from "webtonative/OneSignal"

import LoadingScreen from "./components/UI/LoadingScreen.vue"
import LoadingComponent from "./components/UI/LoadingComponent.vue"
import Navegator from "./components/UI/Navgator.vue"
import NetworkStatusBanner from "./components/UI/NetworkStatusBanner.vue"
import ToastContainer from "./components/UI/ToastContainer.vue"
import Confirmdialog from "./components/UI/Confirmdialog.vue"

import { getSocket, disconnectSocket } from '@/services/socket'
import { useNetworkStatus } from "@/composables/useNetworkStatus"
import { logger } from "./utils/logger"
import generateSource from "./utils/generate-source"
import { setThemeColor as applyTheme, applyGuestSystemTheme } from "./utils/set-theme-color.js"
import { prompt } from "webtonative/AppReview"

// ============================================================
// CONSTANTES
// ============================================================
const node_env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
const BACKGROUND_RELOAD_TIME = 1 * 60 * 1000 // 1 minuto
const HEARTBEAT_INTERVAL = 15_000 // 15 segundos
const OFFLINE_DISCONNECT_DELAY = 5000 // 5 segundos

// ============================================================
// ESTADO LOCAL
// ============================================================
const loading = ref(true)
const splashRef = ref(null)
const networkBanner = ref(null)

const sessionId = Cookies.get("session_id")
const savedTheme = ref(Cookies.get("theme") || 'light')

let socket
let heartbeat
let backgroundStartTime = null
let wasReallyOffline = false
let backgroundOfflineTime = null

// Som de notificação
const notificationSound = new Audio('/sounds/dm.mp3')
notificationSound.preload = 'auto'

// ============================================================
// STORE / ROUTE / COMPOSABLES
// ============================================================
const store = useStore()
const route = useRoute()

// Fonte real de verdade sobre conectividade
const { isOnline: isReallyOnline } = useNetworkStatus()

// ============================================================
// COMPUTEDS
// ============================================================
const user = computed(() => store.getters.currentUser)
const isNewSession = computed(() => store.getters.isNewSession)
const isLoadingComponent = computed(() => store.getters.isLoadingComponent)
const showBottomNav = computed(() => store.getters.showBottomNav)
const unreadNotificationsCount = computed(() => store.getters?.unreadNotificationsCount || 0)
const unreadMessagesCount = computed(() => store.getters?.unreadMessagesCount || 0)

const networkStatus = computed(() => store.getters.networkStatus)
const isOnline = computed(() => networkStatus.value === 'online' ? true : false)

const accessToken = computed(() => store.getters.accessToken)
const isAuthenticated = computed(() => {
  if (accessToken.value) return true
  else return false
})

// ============================================================
// TEMA (lógica em utils/theme.js)
// ============================================================
const setThemeColor = (theme) => applyTheme(theme, { savedTheme, store })

// ============================================================
// HELPERS
// ============================================================
const reloadApp = async () => {
  // Limpa o histórico do navegador
  window.history.pushState(null, '', '/home')

  // Recarrega a página para resetar completamente o estado (stores, componentes, etc)
  window.location.reload()
}

// Função para tocar o som (com fallback silencioso)
const playNotificationSound = async () => {
  try {
    // Reseta o áudio pro início (permite tocar várias vezes seguidas)
    notificationSound.currentTime = 0
    await notificationSound.play()
  } catch (err) {
    logger.log(err)
    // Usuário não interagiu ainda com a página → navegador bloqueia som
    // Isso é normal no Chrome/Firefox. Só toca após primeira interação.
    logger.log("Som bloqueado (sem interação do usuário ainda)")
  }
}

// ============================================================
// FOREGROUND / BACKGROUND
// ============================================================
const handleAppForeground = () => {
  const backgroundTime = backgroundStartTime ? Date.now() - backgroundStartTime : 0
  logger.log(`App voltou ao foreground - Tempo em background: ${Math.round(backgroundTime / 1000)}s`)

  backgroundStartTime = null

  // Se ficou muito tempo em background, recarrega o app
  if (backgroundTime > BACKGROUND_RELOAD_TIME) {
    logger.log(`Ficou mais de 2min em background - Reconectando socket...`)
    reloadApp()
    return
  }
}

const handleAppBackground = () => {
  logger.log('App em background - monitorando...')
  backgroundStartTime = Date.now()
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    handleAppForeground()
  } else {
    handleAppBackground()
  }
}

// ============================================================
// REDE (online / offline)
// ============================================================
const handleOnline = () => {
  logger.log('Rede online detectada')
  store.commit("SET_NETWORK_STATUS", 'online')
  isOnline.value = true
  reloadApp()
}

const handleOffline = async () => {
  logger.log('Rede offline detectada - bufferizando mensagens')
  store.commit("SET_NETWORK_STATUS", 'offline')
  isOnline.value = false

  // Não desconecta imediatamente - tenta manter
  setTimeout(() => {
    if (!isOnline.value) {
      // Só desconecta após alguns segundos offline
      logger.log('Rede permanece offline, desconectando...')
      disconnectSocket()
    }
  }, OFFLINE_DISCONNECT_DELAY)
}

const setupConnectionListeners = () => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  document.addEventListener('visibilitychange', handleVisibilityChange)
}

const removeConnectionListeners = () => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
}

// ============================================================
// SOCKET - HANDLERS
// ============================================================
const onNewMessage = async (msg) => {
  // Meu ID
  const myId = user.value?._id
  const source = generateSource(msg.conversation, myId)

  // Verifica se a mensagem é minha
  const isFromMe = msg.sender?._id === myId

  // ID da conversa atualmente aberta
  const currentConvId = route.params?.convId || route.query?.convId

  // Atualiza conversa na sidebar
  store.commit("ADD_OR_UPDATE_CONVERSATION", {
    conversation: msg.conversation, // pode estar incompleto
    userId: user.value?._id, // meu ID
    senderId: msg.sender?._id, // quem enviou a mensagem
    source
  })

  // Se não for mensagem minha
  if (!isFromMe) {
    logger.log('Nova mensagem recebida via socket:', msg)

    // Adiciona mensagem no chat (mesmo se estiver em outra conversa)
    store.commit("ADD_MESSAGE_REALTIME", {
      convId: msg.conversation._id, // pode ser incompleto
      message: msg, // mensagem completa
      source
    })

    // Tocar som de notificação
    await playNotificationSound()

    // Verifica se a conversa aberta é essa
    const isChatOpen = currentConvId === msg.conversation._id

    // Marca como lido automaticamente só se eu estiver vendo exatamente essa conversa
    if (isChatOpen && route.name === 'Messages') {
      await store.dispatch("markAsRead", {
        convId: msg?.conversation?._id,
        source
      })
    }

    const unreadCount = unreadMessagesCount.value

    if (route.name == 'Chats' || route.meta.rootPage == 'chats') {
      await store.dispatch("updateUnreadMessagesCount", 0)
    } else {
      await store.dispatch("updateUnreadMessagesCount", unreadCount + 1)
    }
  }
}

const onDeleteMessage = (msg) => {
  const myId = user.value?._id
  const isFromMe = msg?.sender?._id === myId

  const source = generateSource(msg?.conversation, myId)

  if (!isFromMe) {
    logger.log("Mensagem apagada para todos via socket: ", msg)
    store.commit("DELETE_MESSAGE", {
      convId: msg?.conversation?._id,
      source,
      msgId: msg?._id
    })
  }
}

const onReactMessage = async ({ msgId, conv, core, emoji, sender }) => {
  const myId = user.value?._id
  const isFromMe = sender?._id === myId
  let hasSeen = false

  const source = generateSource(conv, myId)

  const convIdParams = route?.params?.convId

  if (convIdParams && convIdParams === conv?._id) {
    hasSeen = true
  }

  if (!isFromMe) {
    store.commit("REACT_MESSAGE", {
      convId: conv?._id,
      core,
      source,
      msgId,
      emoji,
      sender,
      isFromMe: !isFromMe && !hasSeen ? false : true
    })

    if (hasSeen) {
      await store.dispatch("markAsRead", {
        convId: conv?._id,
        source
      })
    }
  }
}

const onUserOnline = (userId) => {
  const isFromMe = user?._id === userId
  if (isFromMe) return

  store.commit("UPDATE_STATUS_NETWORK_CONVERSATION", {
    userId,
    payload: true
  })

  logger.log("Novo usuário conectado:", userId)
}

const onUserOffline = (userId) => {
  store.commit("UPDATE_STATUS_NETWORK_CONVERSATION", {
    userId,
    payload: false
  })

  logger.log("Usuário desconectado:", userId)
}

const onUserTypingStart = ({ convId, userId, source }) => {
  if (userId !== user.value?._id) {
    console.log("comecou a escrever")
    // Atualiza estado de digitação na conversa
    store.commit("UPDATE_TYPING_ON_CONVERSATION", {
      convId,
      source,
      payload: true
    })
  }
}

// Quando o outro usuário parar de digitar
const onUserTypingStop = ({ convId, userId, source }) => {
  if (userId !== user.value?._id) {
    console.log("pausou escrever")

    store.commit("UPDATE_TYPING_ON_CONVERSATION", {
      convId,
      source,
      payload: false
    })
  }
}

//
const onConversationAsRead = (data) => {
  if (user.value?._id === data.user?._id) return
  else {
    setTimeout(() => {
      const { user: reciver, read_at, conv } = data

      const myId = user.value?._id
      const source = generateSource(conv, myId)

      store.commit("MARK_AS_READ_CONVERSATION", {
        user: reciver,
        read_at,
        source,
        convId: conv?._id
      })
    }, 300)
  }
}

const onNewNotification = async (newNotification) => {
  logger.log("nova notificacao:", newNotification)
  store.commit("PUSH_NOTIFICATION_FROM_NOTIFICATIONS", newNotification)

  const unreadCount = unreadNotificationsCount.value
  if (route.name == 'Notifications') {
    await store.dispatch("updateUnreadNotificationsCount", 0)
  } else {
    await store.dispatch("updateUnreadNotificationsCount", unreadCount + 1)
  }
  // Tocar som de notificação
  playNotificationSound()
}

// ============================================================
// SOCKET - INICIALIZAÇÃO
// ============================================================
const initializeSocket = () => {
  socket = getSocket()

  if (socket) {
    heartbeat = setInterval(() => {
      if (socket?.connected) {
        socket.emit('heartbeat')
      }
    }, HEARTBEAT_INTERVAL)

    socket.on('new_message', onNewMessage)
    socket.on('delete_message', onDeleteMessage)
    socket.on('react_message', onReactMessage)
    socket.on('user_online', onUserOnline)
    socket.on('user_offline', onUserOffline)
    socket.on('user_typing_start', onUserTypingStart)
    socket.on('user_typing_stop', onUserTypingStop)
    socket.on('conversation_as_read', onConversationAsRead)
    socket.on('new_notification', onNewNotification)
  } else {
    logger.log('Nenhum socket encontrado')
    return false
  }
}

// ============================================================
// AUTENTICAÇÃO
// ============================================================
const handleRefreshToken = async () => {
  await store.dispatch('refreshToken', sessionId)
    .then(() => {
      initializeSocket()

      // Registrar OneSignal Player ID
      if (node_env === 'prod') {
        getPlayerId().then(async function (playerId) {
          if (playerId) {
            if (!user.value?.player_id_onesignal || user.value?.player_id_onesignal !== playerId) {
              await store.dispatch("updateUser", {
                playerIdOneSignal: playerId
              })
            }
          }
        })
      }
    })
}

// ============================================================
// LIFECYCLE
// ============================================================
onMounted(async () => {
  if (sessionId) {
    setupConnectionListeners()
  }

  // Se tiver sessão salva, tentar restaurar
  if (sessionId && !isAuthenticated.value) {
    await handleRefreshToken()
      .then(async () => {
        // setar com base no valor do corrente usuario
        if (user.value) {
          const userTheme = user?.value?.settings?.theme || 'light'
          setThemeColor(userTheme)
        } else {
          setThemeColor('system')
        }
        splashRef.value.finish()
        prompt()
      })
  } else {
    applyGuestSystemTheme()
    loading.value = false
  }
})

onUnmounted(() => {
  const socket = getSocket()
  if (socket) {
    socket.off('new_message')
    socket.off('new_notification')
    socket.off('conversation_as_read')
    disconnectSocket()
  }

  if (sessionId) {
    removeConnectionListeners()
  }

  clearInterval(heartbeat)
})

// ============================================================
// WATCHERS
// ============================================================
watch(() => isNewSession.value, () => {
  initializeSocket()
  setupConnectionListeners()

  // setar com base no valor do corrente usuario
  if (user.value) {
    const userTheme = user?.value?.settings?.theme || 'light'
    setThemeColor(userTheme)
  } else {
    alert("Watch: Sem usuário logado, aplicando tema do sistema")
    // Se não tiver usuário, aplicar tema do sistema
  }
})

watch(isReallyOnline, (online) => {
  // mantém o store sincronizado (outros componentes que usam
  // store.getters.networkStatus continuam funcionando igual)
  store.commit("SET_NETWORK_STATUS", online ? 'online' : 'offline')

  if (!online) {
    logger.log('Sem conectividade real detectada (ping falhou)')
    wasReallyOffline = true
    backgroundOfflineTime = Date.now()
    return
  }

  // online === true
  if (wasReallyOffline) {
    const offlineDuration = backgroundOfflineTime ? Date.now() - backgroundOfflineTime : 0
    logger.log(`Conectividade restaurada após ${Math.round(offlineDuration / 1000)}s offline`)

    wasReallyOffline = false
    backgroundOfflineTime = null

    // só recarrega/reconecta socket se ficou offline por tempo relevante,
    // evita reload em flutuações rápidas de sinal
    if (offlineDuration > BACKGROUND_RELOAD_TIME) {
      reloadApp()
    } else {
      // reconexão leve, sem reload de página inteira
      const socket = getSocket()
      if (socket && !socket.connected) {
        socket.connect()
      }
    }
  }
})
</script>

<template>
  <div
    class="font-primary text-[13px] dark:bg-x-dark-bg dark:text-x-dark-textPrimary bg-x-light-bg text-x-light-textPrimary relative w-screen text-sm h-screen overflow-x-hidden text-light-text-primary overflow-auto">
    <!-- Banner de status de rede, sempre no topo, fora do keep-alive -->
    <NetworkStatusBanner v-if="!loading" ref="networkBanner" />

    <!-- start main app area-->
    <div v-if="!loading">
      <!--start sidebar-->
      <Navegator :show-bottom-nav="isAuthenticated && route.meta.rootPage == 'main' && showBottomNav" />

      <Confirmdialog />

      <!--toast-->
      <ToastContainer />

      <!--start content-->
      <div class="overflow-hidden">
        <router-view v-slot="{ Component }">
          <keep-alive
            :include="['Home', 'Profile', 'Chats', 'Notifications', 'PostDetails', 'ArchivedChats', 'NewMessage', 'Messages']">
            <component :is="Component" />
          </keep-alive>
        </router-view>

        <loading-component v-if="isLoadingComponent" />
      </div>
    </div>
    <div v-else>
      <loading-screen ref="splashRef" :on-finish="() => (loading = false)" />
    </div>
    <!-- end main app area-->
  </div>
</template>