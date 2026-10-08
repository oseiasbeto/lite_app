<template>
    <div class="tt-settings [--s-bg:#ffffff] [--s-text:#161823] [--s-text-2:rgba(22,24,35,0.6)] [--s-line:rgba(22,24,35,0.12)] [--s-press:rgba(22,24,35,0.05)] dark:[--s-bg:#000000] dark:[--s-text:#ffffff] dark:[--s-text-2:rgba(255,255,255,0.6)] dark:[--s-line:rgba(255,255,255,0.12)] dark:[--s-press:rgba(255,255,255,0.08)]">
        <Navbar title="Configurações" />

        <div class="mt-[44px]">
            <h2 class="tt-settings__section">Sessão</h2>

            <ul class="tt-settings__list">
                <li>
                    <button :disabled="loadingLogout" class="tt-row tt-row--danger" @click="goLogout">
                        <svg class="tt-row__icon" width="22" height="22" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                            stroke-linejoin="round" aria-hidden="true">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <path d="m16 17 5-5-5-5" />
                            <path d="M21 12H9" />
                        </svg>
                        <span class="tt-row__label">Terminar sessão</span>
                    </button>
                </li>
            </ul>
        </div>

        <ConfirmDialog v-model="showLogoutDialog" title="Terminar sessão?"
            message="Você precisará entrar novamente para acessar sua conta." confirm-text="Terminar sessão"
            cancel-text="Cancelar" danger :loading="loadingLogout" @confirm="confirmLogout" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useStore } from 'vuex';
import Navbar from '@/views/main/components/Navbar.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import Cookies from "js-cookie";

const store = useStore()

const loadingLogout = ref(false)
const showLogoutDialog = ref(false)

const sessionId = Cookies.get("session_id")

// Abre o diálogo (antes era o confirm() nativo)
const goLogout = () => {
    showLogoutDialog.value = true
}

// Mesmo fluxo de logout de antes, executado ao confirmar
const confirmLogout = () => {
    loadingLogout.value = true;
    // Limpar dados do Vuex (dispatch de logout)
    store.dispatch('logout', sessionId).then(() => {
        // Redirecionar para a tela de login ou home
        window.location.reload()
    }).catch((error) => {
        console.error("Erro ao terminar sessão:", error);
        // Mesmo com erro, tentar redirecionar
        window.location.reload()
    }).finally(() => {
        loadingLogout.value = false;
        showLogoutDialog.value = false;
    });
}

// Voltar na navegação com o diálogo aberto: fecha o diálogo e continua na página
onBeforeRouteLeave(() => {
    if (showLogoutDialog.value) {
        if (!loadingLogout.value) showLogoutDialog.value = false
        return false
    }
})
</script>

<style scoped>
.tt-settings {
    /* cores claro/escuro vêm das classes Tailwind no elemento raiz */
    --s-red: #fe2c55;

    position: relative;
    min-height: 100vh;
    min-height: 100dvh;
    background: var(--s-bg);
    color: var(--s-text);
    font-family: 'Proxima Nova', 'TikTokFont', 'Helvetica Neue', Arial, sans-serif;
}

.tt-settings__section {
    margin: 0;
    padding: 20px 16px 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--s-text-2);
}

.tt-settings__list {
    margin: 0;
    padding: 0;
    list-style: none;
}

.tt-row {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    min-height: 52px;
    padding: 0 16px;
    border: 0;
    border-bottom: 1px solid var(--s-line);
    background: transparent;
    color: var(--s-text);
    font-size: 16px;
    text-align: left;
    cursor: pointer;
}

.tt-row:active:not(:disabled) {
    background: var(--s-press);
}

.tt-row:disabled {
    opacity: 0.5;
    cursor: default;
}

.tt-row:focus-visible {
    outline: 2px solid var(--s-red);
    outline-offset: -2px;
}

.tt-row--danger {
    color: var(--s-red);
}

.tt-row__icon {
    flex-shrink: 0;
}

.tt-row__label {
    flex: 1;
}
</style>