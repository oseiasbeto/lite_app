<template>
    <div>
        <div v-if="!loadingGetPost">
            <!--NODY-->
            <div>
                <PostCard :module="module" :data="post" :show-more="true" :user-id="user?._id"
                    @open-new-comment-drawer="openNewCommentDrawer" />

                <div class="p-2">
                    <!--CREATE COMMENT TRIGGER-->
                    <CreateCommentTrigger @on-press="openNewCommentDrawer" :user="user" :type="post?.type" />
                </div>

            </div>

            <!--DRWER-->
            <Drawer :is-open="drawer?.show" :title="drawer?.metadata?.title">
                <template v-if="drawer?.name === 'newComment'">
                    <div class="flex w-full gap-2 flex-col p-4">
                        <textarea class="w-full outline-none dark:text-black" v-model="commentContent"
                            placeholder="Escreva o teu comentario"></textarea>
                        <button :disabled="!commentContent.trim().length"
                            class="bg-sky-500 px-1.5 py-1 float-right w-min text-white disabled:opacity-80 rounded-md"
                            @click="handleComment">Postar</button>
                    </div>

                </template>
            </Drawer>
        </div>
        <div v-else>
            <p>Carregando...</p>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import { useStore } from 'vuex';
import PostCard from '../components/PostCard.vue';
import Drawer from '@/components/drawer/Drawer.vue';
import CreateCommentTrigger from '@/views/comments/components/CreateCommentTrigger.vue';

const store = useStore()
const route = useRoute()

const post = computed(() => store.getters.currentPost)
const user = computed(() => store.getters.currentUser)

const postId = route.params.id
const module = route.query.module || 'feed'

const commentContent = ref('')

const loadingGetPost = ref(false)
const drawer = ref({
    show: false,
    name: "",
    metadata: {}
})
const openDrawer = (data) => {
    const { show, name, metadata = {} } = data

    drawer.value = {
        show,
        name,
        metadata
    }
}

const closeDrawer = () => {
    drawer.value = {
        show: false,
        name: '',
        metadata: {}
    }

    resetCommentForm()
}

const resetCommentForm = () => {
    commentContent.value = ""
}

const openNewCommentDrawer = () => {
    openDrawer({
        show: true,
        name: "newComment"
    })
}

const handleComment = async () => {
    console.log("fazer a postagem")
}

onBeforeRouteLeave((to, from, next) => {
    if (drawer.value?.show) {
        closeDrawer()
        next(false)
    } else {
        next();
    }
});

onMounted(async () => {
    if (!post.value?._id) {
        loadingGetPost.value = true
        try {
            await store.dispatch("getPostById", postId)
        } catch (err) {
            console.log("Erro ao buscar o post:", err?.response?.data?.message)
        } finally {
            loadingGetPost.value = false
        }

    }
})
</script>