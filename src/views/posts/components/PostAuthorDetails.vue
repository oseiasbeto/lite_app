<template>
    <div>
        <div v-if="author?._id" class="flex gap-2.5 flex-row items-center">
            <div @click="goToProfile(author?._id)" class="shrink-0">
                <Avatar size="md" url="https://qph.cf2.quoracdn.net/main-thumb-1537728686-50-coazxvvqyfnxyobjcizaenssonnrjoar.jpeg" />
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-1">
                        <div @click="goToProfile(author?._id)">
                            <span class="text-[13px] dark:text-white text-black font-bold">{{ author?.name }}</span>
                        </div>
                        <span class="dark:text-[#e6e7e8] text-[13px]" v-if="showBtnFollow"> · </span>
                        <div>
                            <button :disabled="isFollowingUser" @click="$emit('onFollow')" class="text-[13px] text-[#4894fd] disabled:text-gray-400 font-semibold"
                                v-if="showBtnFollow">Seguir</button>
                        </div>
                    </div>

                </div>

                <div class="flex text-[13px] gap-1.5 items-center dark:text-[#e6e7e8]">
                    <span>Coach Executivo e Consultor</span>
                    <span>{{ formattedDate(createdAt) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue';
import formattedDate from '@/utils/formatted-date';
import { useRouter } from 'vue-router';

const router = useRouter()

const goToProfile = (userId) => {
    router.push({
        path: '/profile/' + userId
    })
}

defineEmits(['onFollow'])

defineProps({
    author: {
        type: Object,
        required: true
    },
    isParentPost: {
        type: Boolean,
        default: false
    },
    isFollowingUser: {
        type: Boolean,
        default: false
    },
    showBtnFollow: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: String
    },
    userId: {
        type: String,
        default: null
    }
})
</script>