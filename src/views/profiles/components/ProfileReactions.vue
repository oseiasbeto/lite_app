<template>
    <div class="flex gap-2 items-center justify-center px-4">
        <!-- Seguir (vermelho TikTok; cinzento quando já segue) -->
        <button :disabled="isDisabled" v-if="!isSameUser" @click="$emit('onFollow')"
            class="flex-[1.4] justify-center disabled:opacity-50 disabled:pointer-events-none flex text-[15px] active:opacity-50 items-center font-semibold gap-1 py-2.5 px-4 rounded-[6px] transition-colors"
            :class="hasFollowed
                ? 'bg-[#f1f1f2] text-[rgb(22,24,35)] dark:bg-[#2f2f2f] dark:text-white'
                : 'bg-[#fe2c55] text-white'">
            <p>{{ statusFollowTxt }}</p>
        </button>

        <!-- bloco comentado original (Notificar-me) mantido aqui --> 

        <button v-if="isSameUser" @click="$emit('onEdit')"
            class="justify-center flex-1 disabled:opacity-50 disabled:pointer-events-none flex text-[15px] active:opacity-50 bg-[#f1f1f2] text-[rgb(22,24,35)] dark:bg-[#2f2f2f] dark:text-white items-center font-semibold gap-1 py-2.5 px-4 rounded-[6px]">
            <p>Editar perfil</p>
        </button>

        <button v-if="isSameUser" @click="handleNativeShare"
            class="justify-center flex-1 disabled:opacity-50 disabled:pointer-events-none flex text-[15px] active:opacity-50 bg-[#f1f1f2] text-[rgb(22,24,35)] dark:bg-[#2f2f2f] dark:text-white items-center font-semibold gap-1 py-2.5 px-4 rounded-[6px]">
            <p>Partilhar perfil</p>
        </button>

        <button :disabled="isDisabled || sendMessageBtnOff" v-if="!isSameUser" @click="$emit('onSendMessage')"
            class="justify-center flex-1 disabled:opacity-50 disabled:pointer-events-none flex text-[15px] active:opacity-50 bg-[#f1f1f2] text-[rgb(22,24,35)] dark:bg-[#2f2f2f] dark:text-white items-center font-semibold gap-1 py-2.5 px-4 rounded-[6px]">
            <p>Mensagem</p>
        </button>

        <!-- bloco comentado original (Mais) mantido aqui -->
    </div>
</template>

<script setup>

const props = defineProps({
    profile: { type: Object, required: true },
    isDisabled: { type: Boolean, default: false },
    isSameUser: { type: Boolean, default: false },
    statusFollowTxt: { type: String, default: 'Seguir' },
    hasFollowed: { type: Boolean, default: false },
    hasSubscribed: { type: Boolean, default: false },
    sendMessageBtnOff: { type: Boolean, default: false },
    userId: { type: String, required: true }
})

const handleNativeShare = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Partilhar Perfil',
                text: 'Baixe agora o App 1kolet e veja este perfil!',
                url: 'https://play.google.com/store/apps/details?id=com.wnapp.id1753308188170'
            });
        } catch (error) {
            console.error('Erro ao partilhar:', error);
        }
    } else {
        console.warn('Web Share API não suportada neste navegador.');
    }
};

defineEmits(['onFollow', 'onSubscribe', 'onEdit', 'onSendMessage', 'moreOptions'])

</script>