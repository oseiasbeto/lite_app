<template>
  <Transition name="slide-up">
    <div
      v-if="uploadingPost"
      class="fixed left-0 right-0 bottom-0 z-[200] flex items-center justify-between px-4 py-3 bg-black text-white border-t border-[rgb(47,51,54)]"
      style="padding-bottom: max(12px, env(safe-area-inset-bottom));"
    >
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <div class="relative shrink-0 w-8 h-8">
          <svg width="32" height="32" viewBox="0 0 32 32" class="-rotate-90">
            <circle cx="16" cy="16" r="14" fill="none" stroke="rgb(47,51,54)" stroke-width="3" />
            <circle
              v-if="uploadingPost.status !== 'error'"
              cx="16" cy="16" r="14" fill="none"
              stroke="#1d9bf0" stroke-width="3" stroke-linecap="round"
              :stroke-dasharray="`${(uploadingPost.progress / 100) * 87.96} 87.96`"
              style="transition: stroke-dasharray .2s ease"
            />
          </svg>
          <svg v-if="uploadingPost.status === 'success'" class="absolute inset-0 m-auto" width="16" height="16" viewBox="0 0 24 24">
            <path fill="#1d9bf0" d="M9.64 18.952 3.63 15.32l1.03-1.71 4.35 2.63 8.36-9.59 1.5 1.36-9.24 10.94Z" />
          </svg>
          <svg v-else-if="uploadingPost.status === 'error'" class="absolute inset-0 m-auto" width="16" height="16" viewBox="0 0 24 24">
            <path fill="#f4212e" d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm1 11h-2v-2h2v2Zm0-4h-2V7h2v4Z" />
          </svg>
        </div>
        <p class="text-sm font-medium truncate">
          {{ statusText }}
        </p>
      </div>
      <span v-if="uploadingPost.status === 'uploading'" class="text-sm font-semibold text-[rgb(113,118,123)] shrink-0 ml-2">
        {{ uploadingPost.progress }}%
      </span>
    </div>
  </Transition>
</template>
 
<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
 
const store = useStore();
const uploadingPost = computed(() => store.getters.uploadingPost); // ajusta o caminho se usares módulo namespaced (ex: store.state.post.uploadingPost)
 
const statusText = computed(() => {
  switch (uploadingPost.value?.status) {
    case 'uploading': return 'Enviando mídia...';
    case 'publishing': return 'Publicando o teu post...';
    case 'success': return 'Post publicado';
    case 'error': return uploadingPost.value?.error || 'Erro ao publicar o post';
    default: return '';
  }
});
</script>
 
<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform .25s ease, opacity .25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>