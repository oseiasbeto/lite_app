<template>
    <Teleport to="body">
        <transition name="upload-indicator">
            <div v-if="uploadingPost" class="fixed left-0 right-0 z-[200] px-3 pointer-events-none"
                style="bottom: calc(64px + env(safe-area-inset-bottom, 0px));">
                <div class="mx-auto max-w-md pointer-events-auto">
                    <div @click="handleClick" :class="[
                        'flex items-center gap-3 rounded-2xl shadow-lg px-3 py-2.5 select-none transition-colors',
                        'bg-[#16181c] dark:bg-[#eff3f4] text-white dark:text-black',
                        status === 'success' ? 'cursor-pointer active:opacity-90' : 'cursor-default'
                    ]">
                        <!-- start avatar + progress ring / status badge -->
                        <div class="relative shrink-0 w-9 h-9">
                            <div class="w-9 h-9 rounded-full overflow-hidden bg-light-card">
                                <img v-if="user?.profile_image?.url" :src="user.profile_image.url"
                                    class="w-full h-full object-cover" alt="" />
                            </div>

                            <!-- progress ring enquanto carrega mídia ou publica -->
                            <svg v-if="isBusy" class="absolute inset-0 -rotate-90" width="36" height="36"
                                viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.2)"
                                    class="dark:stroke-black/15" stroke-width="2.5" />
                                <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" stroke-width="2.5"
                                    stroke-linecap="round" :stroke-dasharray="ringDashArray"
                                    class="text-x-light-blue transition-[stroke-dasharray] duration-300 ease-linear" />
                            </svg>

                            <!-- badge de sucesso / erro -->
                            <span v-else class="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2"
                                :class="[statusBadgeClass, 'ring-[#16181c] dark:ring-[#eff3f4]']"
                                style="width:18px;height:18px;">
                                <svg v-if="status === 'success'" width="10" height="10" viewBox="0 0 24 24"
                                    fill="none">
                                    <path d="M20 6 9 17l-5-5" stroke="white" stroke-width="3" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                                <svg v-else-if="status === 'error'" width="10" height="10" viewBox="0 0 24 24"
                                    fill="none">
                                    <path d="M6 6l12 12M18 6 6 18" stroke="white" stroke-width="3"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </span>
                        </div>
                        <!-- end avatar + progress ring / status badge -->

                        <!-- start textos -->
                        <div class="flex-1 min-w-0">
                            <p class="text-[14px] font-semibold leading-tight truncate">{{ title }}</p>
                            <p class="text-[12px] opacity-70 leading-tight truncate">{{ subtitle }}</p>
                        </div>
                        <!-- end textos -->

                        <!-- start ação -->
                        <button v-if="status === 'success'"
                            class="text-[13px] font-bold text-x-light-blue shrink-0 px-1 py-1" @click.stop="handleClick">
                            Ver
                        </button>
                        <button v-if="status === 'error'"
                            class="shrink-0 p-1 opacity-70 hover:opacity-100" @click.stop="dismiss"
                            title="Descartar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="m5.5 5.5 13 13m-13 0 13-13" stroke="currentColor" stroke-width="1.8"
                                    fill="none" stroke-linecap="round"></path>
                            </svg>
                        </button>
                        <!-- end ação -->
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup>
/**
 * PostUploadIndicator
 * ---------------------------------------------------------------------------
 * Indicador flutuante fixo no rodapé, estilo Threads/YouTube, que reflete
 * o estado global `uploadingPost` (já existente na store: START_BACKGROUND_POST,
 * SET_BACKGROUND_POST_PROGRESS, SET_BACKGROUND_POST_STATUS, CLEAR_BACKGROUND_POST).
 *
 * Não altera nenhuma lógica de submissão/upload — apenas consome o estado
 * que a action `submitPostWithMedia` já publica em background.
 *
 * Uso: registar uma única vez em App.vue (ver instruções enviadas junto).
 */
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

const uploadingPost = computed(() => store.getters.uploadingPost);
const user = computed(() => store.getters.currentUser);

const status = computed(() => uploadingPost.value?.status);
const isBusy = computed(() => status.value === 'uploading' || status.value === 'publishing');

const ringDashArray = computed(() => {
    const circumference = 2 * Math.PI * 16;
    // enquanto "publishing" (sem % definida) mostra o anel quase cheio, tipo "quase lá"
    const progress = status.value === 'publishing' ? 92 : (uploadingPost.value?.progress ?? 0);
    const dash = (Math.min(Math.max(progress, 0), 100) / 100) * circumference;
    return `${dash} ${circumference - dash}`;
});

const statusBadgeClass = computed(() => {
    if (status.value === 'success') return 'bg-[#00ba7c]';
    if (status.value === 'error') return 'bg-[#f4212e]';
    return 'bg-x-light-blue';
});

const title = computed(() => {
    switch (status.value) {
        case 'uploading': return 'A carregar mídia…';
        case 'publishing': return 'A publicar…';
        case 'success': return 'Publicação criada';
        case 'error': return 'Falha ao publicar';
        default: return '';
    }
});

const subtitle = computed(() => {
    if (status.value === 'uploading') return `${uploadingPost.value?.progress ?? 0}% concluído`;
    if (status.value === 'publishing') return 'Quase lá…';
    if (status.value === 'success') return 'Toca para veres a tua publicação';
    if (status.value === 'error') return uploadingPost.value?.error || 'Toca para descartar';
    return '';
});

const handleClick = () => {
    if (status.value !== 'success') return;
    const postId = uploadingPost.value?.postId;
    dismiss();
    if (postId) {
        router.push(`/post/${postId}`); // ajusta para a tua rota real de visualização de post
    }
};

const dismiss = () => {
    if (!uploadingPost.value?.id) return;
    store.commit('CLEAR_BACKGROUND_POST', { id: uploadingPost.value.id });
};
</script>

<style scoped>
.upload-indicator-enter-active,
.upload-indicator-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}

.upload-indicator-enter-from,
.upload-indicator-leave-to {
    opacity: 0;
    transform: translateY(16px);
}
</style>