<script setup>
import LoadingScreen from "./components/UI/LoadingScreen.vue"
import { useStore } from "vuex"
import { computed, onMounted, ref, watch, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import Cookies from "js-cookie";
import { getSocket, disconnectSocket } from '@/services/socket';
import { getPlayerId } from "webtonative/OneSignal";
import { statusBar } from "webtonative"
import { logger } from "./utils/logger";
import generateSource from "./utils/generate-source";
import LoadingComponent from "./components/UI/LoadingComponent.vue";

// Estado de loading do app
const loading = ref(true)

// Vuex store
const store = useStore()

// Rota atual
const route = useRoute()

// Pega sessão salva em cookie
const sessionId = Cookies.get("session_id")

// Tema salvo em cookie
const savedTheme = ref(Cookies.get("theme") || 'light')

// Ambiente (prod ou dev)
const node_env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev'

let socket;

// Pega dados do usuário
const user = computed(() => store.getters.currentUser)
const isNewSession = computed(() => store.getters.isNewSession)
const isLoadingComponent = computed(() => store.getters.isLoadingComponent)

// Estado da rede
const networkStatus = computed(() => {
  return store.getters.networkStatus
})

// Computed para verificar se está online
const isOnline = computed(() => {
  return networkStatus.value === 'online' ? true : false
})

// Pega token de acesso
const accessToken = computed(() => {
  return store.getters.accessToken
})

// Verifica se está autenticado
const isAuthenticated = computed(() => {
  if (accessToken.value) return true
  else return false
})

// Preparar som de notificação
const notificationSound = new Audio('/sounds/boop.mp3');
notificationSound.preload = 'auto'

// Configuração de background
let backgroundStartTime = null;
const BACKGROUND_RELOAD_TIME = 2 * 60 * 1000; // 2 minutos


const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    handleAppForeground();
  } else {
    handleAppBackground();
  }
};

const handleAppForeground = () => {
  const backgroundTime = backgroundStartTime ? Date.now() - backgroundStartTime : 0;
  logger.log(`App voltou ao foreground - Tempo em background: ${Math.round(backgroundTime / 1000)}s`);

  backgroundStartTime = null;

  // Se ficou mais de 5min em background, tenta reconexão inteligente
  if (backgroundTime > BACKGROUND_RELOAD_TIME) {
    logger.log(`Ficou mais de 2min em background - Reconectando socket...`);
    reloadApp()
    return;
  }
};

const handleAppBackground = () => {
  logger.log('App em background - monitorando...');
  backgroundStartTime = Date.now();
};

// MODIFICADO: handleOnline com comportamento inteligente
const handleOnline = () => {
  logger.log('Rede online detectada');
  store.commit("SET_NETWORK_STATUS", 'online')
  isOnline.value = true;
  reloadApp()
};

// MODIFICADO: handleOffline mais inteligente
const handleOffline = async () => {
  logger.log('Rede offline detectada - bufferizando mensagens');
  store.commit("SET_NETWORK_STATUS", 'offline')
  isOnline.value = false;

  // Não desconecta imediatamente - tenta manter
  setTimeout(() => {
    if (!isOnline.value) {
      // Só desconecta após 5 segundos offline
      logger.log('Rede permanece offline, desconectando...');
      disconnectSocket();
    }
  }, 5000);
};

const initializeSocket = () => {
  socket = getSocket();

  if (socket) {
    heartbeat = setInterval(() => {
      if (socket?.connected) {
        socket.emit('heartbeat'); // só isso!
      }
    }, 15_000); // a cada 15 segundos

    // Conectar socket
    socket.on('new_message', async (msg) => {
      // Meu ID
      const myId = user.value?._id;
      const source = generateSource(msg.conversation, myId)

      // Verifica se a mensagem é minha
      const isFromMe = msg.sender?._id === myId;

      // ID da conversa atualmente aberta
      const currentConvId = route.params?.convId || route.query?.convId;

      // Atualiza conversa na sidebar
      store.commit("ADD_OR_UPDATE_CONVERSATION", {
        conversation: msg.conversation, // pode estar incompleto  
        userId: user.value?._id, // meu ID
        senderId: msg.sender?._id, // quem enviou a mensagem 
        source
      });

      // Se não for mensagem minha
      if (!isFromMe) {
        logger.log('Nova mensagem recebida via socket:', msg);

        // Adiciona mensagem no chat (mesmo se estiver em outra conversa)
        store.commit("ADD_MESSAGE_REALTIME", {
          convId: msg.conversation._id, // pode ser incompleto
          message: msg, // mensagem completa 
          source
        });

        // Tocar som de notificação
        await playNotificationSound();

        // Verifica se a conversa aberta é essa
        const isChatOpen = currentConvId === msg.conversation._id;

        // Marca como lido automaticamente só se eu estiver vendo exatamente essa conversa
        if (isChatOpen && route.name === 'Messages') {
          // Marca como lido
          await store.dispatch("markAsRead", {
            convId: msg?.conversation?._id,
            source
          });
        }
      }
    })

    socket.on('delete_message', (msg) => {
      const myId = user.value?._id;
      const isFromMe = msg?.sender?._id === myId;

      const source = generateSource(msg?.conversation, myId)

      if (!isFromMe) {
        logger.log("Mensagem apagada para todos via socket: ", msg)
        store.commit("DELETE_MESSAGE", {
          convId: msg?.conversation?._id,
          source,
          msgId: msg?._id
        })
      }
    })

    socket.on('react_message', async ({ msgId, conv, core, emoji, sender }) => {
      const myId = user.value?._id;
      const isFromMe = sender?._id === myId;
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
          isFromMe:
            !isFromMe && !hasSeen ? false : true
        })

        if (hasSeen) {
          await store.dispatch("markAsRead", {
            convId: conv?._id,
            source
          });
        }
      }
    })

    // Listeners de digitação
    socket.on("user_typing_start", ({ conv, userId }) => {

      if (userId !== user.value?._id) {

        const myId = user.value?._id
        const source = generateSource(conv, myId)

        // Atualiza estado de digitação na conversa
        store.commit("UPDATE_TYPING_ON_CONVERSATION", {
          convId: conv?._id,
          source,
          payload: true,
          source
        })
      }
    })

    // Listener para quando o outro usuário parar de digitar
    socket.on("user_typing_stop", ({ conv, userId }) => {
      if (userId !== user.value?._id) {

        const myId = user.value?._id
        const source = generateSource(conv, myId)

        store.commit("UPDATE_TYPING_ON_CONVERSATION", {
          convId: conv?._id,
          payload: false,
          source
        })
      }
    })

    socket.on("user_online", (userId) => {
      const isFromMe = user?._id === userId;
      if (isFromMe) return

      store.commit("UPDATE_STATUS_NETWORK_CONVERSATION", {
        userId,
        payload: true
      })

      logger.log("Novo usuário conectado:", userId)
    })

    socket.on("user_offline", (userId) => {
      store.commit("UPDATE_STATUS_NETWORK_CONVERSATION", {
        userId,
        payload: false
      })

      logger.log("Usuário desconectado:", userId)
    })

    socket.on("conversation_as_read", (data) => {
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
        }, 300);
      }
    })
  } else {
    logger.log('Nenhum socket encontrado');
    return false;
  }
}

const handleRefreshToken = async () => {
  await store.dispatch('refreshToken', sessionId)
    .then(() => {

      initializeSocket()

      // setar com base no valor do corrente usuario
      if (user.value) {
        const userTheme = user?.value?.settings?.theme || 'light'
        setThemeColor(userTheme)
      } else {
        setThemeColor('system')
      }

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
        });
      }
    })
    .finally(() => {
      loading.value = false
    })
}

const reloadApp = () => {
  window.location.href = '/home'
}

// Função para tocar o som (com fallback silencioso)
const playNotificationSound = async () => {
  try {
    // Reseta o áudio pro início (permite tocar várias vezes seguidas)
    notificationSound.currentTime = 0;
    await notificationSound.play();

  } catch (err) {
    logger.log(err)
    // Usuário não interagiu ainda com a página → navegador bloqueia som
    // Isso é normal no Chrome/Firefox. Só toca após primeira interação.
    logger.log("Som bloqueado (sem interação do usuário ainda)");
  }
}

// Configurar listeners de conexão
const setupConnectionListeners = () => {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Remover listeners de conexão
const removeConnectionListeners = () => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
}

const setThemeColor = (theme) => {
  // Salvar preferência
  if (savedTheme.value !== theme) {
    Cookies.set('theme', theme)
    savedTheme.value = theme
  }

  // Aplicar classe no HTML
  if (savedTheme.value === 'dark') {
    // Aplicar tema escuro  
    document.documentElement.classList.add('dark');
  } else if (savedTheme.value === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } else {
    // Aplicar tema claro
    document.documentElement.classList.remove('dark');
  }

  // Ajustar status bar
  statusBar({
    style: 'light',
    color: theme == 'dark' ? '000' : "fff",
    overlay: false //Only for android
  });
}

let heartbeat;
onMounted(async () => {

  // Aplicar tema salvo
  setThemeColor(savedTheme.value)

  if (sessionId) {
    // Configurar listeners de conexão
    setupConnectionListeners();
  }

  // Se tiver sessão salva, tentar restaurar
  if (sessionId && !isAuthenticated.value) {
    await handleRefreshToken()
    .then(async () => {
      await store.dispatch("getTopicList")
    })
  } else {
    loading.value = false
  }
  setTimeout(() => {
    setThemeColor(savedTheme.value)
  }, 2000);
})

watch(() => isNewSession.value, () => {
  
  initializeSocket()

  
  // Configurar listeners de conexão
  setupConnectionListeners();

  // setar com base no valor do corrente usuario
  if (user.value) {
    const userTheme = user?.value?.settings?.theme || 'light'
    setThemeColor(userTheme)
  } else {
    setThemeColor('system')
  }

  store.dispatch("getTopicList")
})

onUnmounted(() => {
  const socket = getSocket();
  if (socket) {
    socket.off('newMessage');
    disconnectSocket()
  }


  if (sessionId) {
    // Remover listeners de conexão
    removeConnectionListeners()
  }


  clearInterval(heartbeat);
});
</script>

<template>

  <div
    :class="['font-primary bg-background-primary text-text-primary relative w-screen text-sm h-screen text-light-text-primary overflow-auto']">
    <!-- start main app area-->
    <div v-if="!loading">
      <!--start content-->
      <div class="overflow-hidden">
        <router-view v-slot="{ Component }">
          <keep-alive :include="['ActiveChats', 'Home', 'PostDetails', 'ArchivedChats', 'NewMessage', 'Messages']">
            <component :is="Component" />
          </keep-alive>
        </router-view>

        <loading-component v-if="isLoadingComponent"/>
      </div>

      <!--start sidebar-->
      <!--<sidebar v-show="isAuthenticated && route.meta.rootPage == 'main'" />-->
      <!--end sidebar-->

      <!--start modals-->
      <!--end modals-->
    </div>
    <div v-else>
      <loading-screen />
    </div>
    <!-- end main app area-->
  </div>

</template>
