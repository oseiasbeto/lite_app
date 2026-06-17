<template>
    <div class="relative bg-white dark:bg-transparent">
        <Navbar title="Configurações" />
        <div class="mt-[44px]">
            <ul>
                <button :disabled="loadingLogout"
                    class="flex px-4 border-b w-full justify-between items-center text-red-500 border-[#dee0e1] dark:border-[rgb(57,56,57)] py-3"
                    @click="goLogout">
                    <span>Terminar sessão</span>
                </button>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import LoadingScreen from '@/components/UI/LoadingScreen.vue';
import Navbar from '@/views/main/components/Navbar.vue';
import Cookies from "js-cookie";

const router = useRouter()
const store = useStore()

const loading = ref(false)
const loadingLogout = ref(false)

const sessionId = Cookies.get("session_id")


const goLogout = () => {
    const confirmLogout = confirm("Deseja realmente terminar a sessão?");
    if (confirmLogout) {
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
        });
    }
}

</script>