<template>
  <div class="reels-page">
    <!-- Abas Para ti / Seguindo, estilo Facebook/Instagram Reels -->
    <div class="reels-tabs">
      <button v-for="tab in tabs" :key="tab.value" class="reels-tab" :class="{ active: feedType === tab.value }"
        @click="onTabChange(tab.value)">
        {{ tab.label }}
      </button>
    </div>

    <!-- Aviso quando o backend caiu para vídeos virais por falta de conteúdo de quem se segue -->
    <Transition name="fade">
      <div v-if="fallback === 'viral' && feedType === 'following'" class="reels-fallback-banner">
        Ainda não segues ninguém — a mostrar vídeos em alta
      </div>
    </Transition>

    <ReelsFeed :items="items" :loading="loading" :has-more="hasMore" :show-close="showClose" @reach-end="loadMore"
      @like="toggleLike" @comment="onComment" @share="onShare" @save="toggleSave" @follow="toggleFollow"
      @close="onClose">
      <template #empty>Ainda não há reels.</template>
    </ReelsFeed>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed } from 'vue'
import ReelsFeed from '../components/Reels.vue'
import { useReels } from '../useReels.js'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  showClose: { type: Boolean, default: true },
  initialType: { type: String, default: 'foryou' } // 'foryou' | 'following'
})

const emit = defineEmits(['close'])
const store = useStore()
const router = useRouter()
const route = useRoute()

const tabs = [
  { value: 'foryou', label: 'Para ti' },
  { value: 'following', label: 'Seguindo' }
]

// lê e consome de imediato — só serve para esta entrada específica
const rawSeed = computed(() => store.getters.reelsSeed)

const initialSeedItem =
  rawSeed.value && (!route.query.videoId || rawSeed.value.id === route.query.videoId)
    ? rawSeed.value
    : null

if (rawSeed.value) {
  store.commit('SET_REELS_SEED', null)
}

const {
  items,
  loading,
  hasMore,
  fallback,
  feedType,
  loadMore,
  setFeedType,
  toggleLike,
  toggleSave,
  toggleFollow,
  incrementComments
} = useReels({
  feedType: props.initialType,
  pageSize: 6,
  seedItem: initialSeedItem,

  // Liga aqui à tua API real — troca isto pelo teu client HTTP (axios,
  // fetch wrapper com token, etc.). `page` começa em 0 aqui e o
  // controller espera 1-based, por isso o +1.
  fetchPage: async (page, pageSize, type) => {
    const res = store.dispatch('getReelsFeed', {
      module: 'main-reels',
      feedType: type,
      page: page + 1,
      limit: pageSize
    })

    return res
  }
})

function onTabChange(type) {
  setFeedType(type)
}

function onComment(item) {
  // Aqui abrirías o teu painel/rota de comentários; a título de
  // demonstração incrementa apenas o contador.
  incrementComments(item, 1)
}

function onShare(item) {
  if (navigator.share) {
    navigator.share({ title: item.author?.name, text: item.caption, url: item.video?.url }).catch(() => { })
  }
}

const currentTheme = computed(() => store.getters.currentTheme)

const setThemeColor = (theme) => {
  // Aplicar classe no HTML
  if (theme === 'dark') {
    //window?.WTN?.setNavigationBarColor({ color: "#000000" });
    window?.WTN?.statusBar({
      style: 'light',
      color: '000000',
      overlay: false //Only for android
    });
  } else if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (isDark) {
      //window?.WTN?.setNavigationBarColor({ color: "#000000" });
      window?.WTN?.statusBar({
        style: 'dark',
        color: '000000',
        overlay: false //Only for android
      });
    } else {
      //window?.WTN?.setNavigationBarColor({ color: "#FFFFFF" });
      window?.WTN.statusBar({
        style: 'dark',
        color: "FFFFFF",
        overlay: false //Only for android
      });
    }
  } else {
    //window?.WTN?.setNavigationBarColor({ color: "#FFFFFF" });
    window?.WTN.statusBar({
      style: 'dark',
      color: "FFFFFF",
      overlay: false //Only for android
    })
  }
}

function onClose() {
  router.back()
}

onMounted(() => {
  loadMore()

  console.log('seedItem', rawSeed.value)
  window?.WTN?.setNavigationBarColor({ color: "#000000" });
  window?.WTN?.statusBar({
    style: 'light',
    color: '000000',
    overlay: false //Only for android
  });
})

onUnmounted(() => {
  setThemeColor(currentTheme.value)
})
</script>

<style scoped>
.reels-page {
  position: fixed;
  inset: 0;
  height: 100dvh;
  width: 100vw;
  background: #000;
}

.reels-tabs {
  position: fixed;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 998;
  display: flex;
  gap: 18px;
}

.reels-tab {
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 15px;
  font-weight: 600;
  padding: 4px 2px;
  cursor: pointer;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.reels-tab.active {
  color: #fff;
  border-bottom: 2px solid #fff;
}

.reels-fallback-banner {
  position: fixed;
  top: 52px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 997;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 999px;
  white-space: nowrap;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>