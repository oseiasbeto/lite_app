<template>
    <div v-if="data?._id" class="flex flex-col dark:border-x-dark-border border-x-light-border bg-transparent border-b">

        <!--HEADER: avatar + name/username inline + follow button (estilo X no detalhe do post)-->
        <div class="flex items-start items-center justify-between px-4 pt-3">
            <div class="flex items-center gap-3 min-w-0 flex-1">
                <div @click="goToProfile(data?.author?._id)" class="relative shrink-0 cursor-pointer">
                    <Avatar size="md"
                        :url="data?.author?.profile_image?.thumbnails?.sm || data?.author?.profile_image?.url" />
                </div>

                <div class="flex flex-col leading-[22px] cursor-pointer min-w-0"
                    @click="goToProfile(data?.author?._id)">
                    <span
                        class="font-bold flex items-center text-[15px] dark:text-white text-black hover:underline min-w-0">
                        <span class="truncate">{{ data?.author?.name }}</span>

                        <svg v-if="data?.author?.is_verified" :class="{ 'w-[12px] h-[12px]': isParentPost }"
                            viewBox="0 0 22 22" aria-label="Verified account" role="img"
                            class="w-[16px] h-[16px] text-x-light-blue ml-[3px] shrink-0" fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg" data-testid="icon-verified">
                            <g>
                                <path
                                    d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z">
                                </path>
                            </g>
                        </svg>
                    </span>
                    <span class="text-sm text-x-light-textSecondary dark:text-x-dark-textSecondary truncate">
                        @{{ data?.author?.username || data?.author?.name?.toLowerCase()?.replace(/\s+/g, '') }}
                    </span>
                </div>
            </div>

            <div class="flex items-center gap-2">
                <button v-if="canFollowUser" @click="handleFollowUser(data?.author?._id)" :disabled="isFollowingUser"
                    class="px-4 py-1.5 rounded-full text-[14px] font-bold border transition-colors" :class="hasFollowingUser
                        ? 'bg-transparent border-x-light-border dark:border-x-dark-border dark:text-white text-black'
                        : 'bg-black dark:bg-white text-white dark:text-black border-transparent'">
                    {{ hasFollowingUser ? 'A seguir' : 'Seguir' }}
                </button>

                <button @click="$emit('openMoreOptionsDrawer', data)"
                    class="h-8 w-8 flex items-center justify-center rounded-full text-x-light-textSecondary dark:text-x-dark-textSecondary hover:bg-black/5 dark:hover:bg-white/10">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M11.25 11.25a1.06 1.06 0 1 0 1.5 1.5 1.06 1.06 0 0 0-1.5-1.5Zm-7 0a1.06 1.06 0 1 0 1.5 1.5 1.06 1.06 0 0 0-1.5-1.5Zm14 0a1.06 1.06 0 1 0 1.5 1.5 1.06 1.06 0 0 0-1.5-1.5Z"
                            fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </button>
            </div>
        </div>

        <!--CONTENT: fonte maior, igual ao tweet expandido do X-->
        <div v-if="data?.content?.length" class="px-4 mb-[-8px] pt-2">
            <PostContent :content="data?.content" :enable-truncate="false" />
        </div>

        <!--MEDIA-->
        <div class="px-4 pt-3" v-if="data?.media?.length">
            <PostMediaImages v-if="data?.media?.filter(m => m.type === 'image')?.length"
                :images="data.media.filter(m => m.type === 'image')" :post="data" :module="module"
                :is-parent-post="false" @open="setMedia" />

            <PostMediaVideo v-if="data?.media?.find(m => m.type === 'video')"
                :video="data.media.find(m => m.type === 'video')" :is-parent-post="false" @open="openVideo" />
        </div>

        <!--PARENT / SHARED POST-->
        <div v-if="data?.shared_post?._id" class="px-4 pt-3">
            <div class="border border-x-light-border dark:border-x-dark-border rounded-2xl overflow-hidden">
                <PostCard :data="data?.shared_post" :is-parent-post="true" :user-id="user?._id" :module="module" />
            </div>
        </div>

        <!--TIMESTAMP-->
        <div
            class="px-4 pt-4 pb-3 flex items-center gap-1 text-[15px] text-x-light-textSecondary dark:text-x-dark-textSecondary">
            <span>{{ formattedTime }}</span>
            <span>·</span>
            <span>{{ formattedDate }}</span>
        </div>

        <!--DIVIDER-->
        <div class="border-t dark:border-x-dark-border border-x-light-border"></div>

        <!--STATS ROW (Retweets / Citações / Gostos) estilo X-->
        <div
            class="px-4 py-3 flex items-center gap-4 text-[14px] border-b dark:border-x-dark-border border-x-light-border">
            <button class="flex items-center gap-1 hover:underline" @click="goToShare">
                <span class="font-bold dark:text-white text-black">{{ formattedCount(data?.shares_count) }}</span>
                <span class="text-x-light-textSecondary dark:text-x-dark-textSecondary">Partilhas</span>
            </button>
            <button class="flex items-center gap-1 hover:underline">
                <span class="font-bold dark:text-white text-black">{{ formattedCount(data?.comments_count) }}</span>
                <span class="text-x-light-textSecondary dark:text-x-dark-textSecondary">Comentários</span>
            </button>
            <button class="flex items-center gap-1 hover:underline">
                <span class="font-bold dark:text-white text-black">{{ formattedCount(data?.upvotes_count) }}</span>
                <span class="text-x-light-textSecondary dark:text-x-dark-textSecondary">Gostos</span>
            </button>
        </div>

        <!--ACTION BAR (icones grandes, espacados, igual ao X)-->
        <div class="px-2 py-1">
            <PostDetailReactions :loading="isReactingPost" :upvotes="data?.upvotes" :upvotes-count="data?.upvotes_count"
                :downvotes="data?.downvotes" :downvotes-count="data?.downvotes_count"
                :comments-count="data?.comments_count" :shares-count="data?.shares_count" :user-id="user?._id"
                @on-upvote="handleUpvote" @on-downvote="handleDownvote" @on-comment="goToComments"
                @on-share="goToShare" />
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Avatar from '@/components/Utils/Avatar.vue';
import PostMediaImages from './PostMediaImages.vue';
import PostMediaVideo from './PostMediaVideo.vue';
import PostCard from './PostCard.vue';
import PostDetailReactions from './PostDetailReactions.vue';
import formattedCount from '@/utils/formatted-count';
import PostContent from './PostContent.vue';

const emit = defineEmits(['openNewCommentDrawer', 'openMoreOptionsDrawer']);

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    module: {
        type: String,
        default: 'feed'
    },
    showBtnFollow: {
        type: Boolean,
        default: true
    },
    user: {
        type: Object,
        default: null
    }
});

const store = useStore();
const router = useRouter();

const isReactingPost = ref(false);
const isFollowingUser = ref(false);

const canFollowUser = computed(() => {
    if (!props?.showBtnFollow) return false;
    if (props?.data?.author?._id === props?.user?._id) return false;
    return true;
});

const hasFollowingUser = computed(() => {
    return !!props?.user?.following?.includes(props?.data?.author?._id);
});

const formattedDate = computed(() => {
    if (!props?.data?.created_at) return '';
    const date = new Date(props.data.created_at);
    return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' });
});

const formattedTime = computed(() => {
    if (!props?.data?.created_at) return '';
    const date = new Date(props.data.created_at);
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
});

const handleUpvote = async () => {
    isReactingPost.value = true;
    await store.dispatch('toggleUpvotePost', {
        postId: props?.data?._id,
        module: props?.module,
        userId: props?.user?._id
    }).finally(() => {
        isReactingPost.value = false;
    });
};

const handleDownvote = async () => {
    isReactingPost.value = true;
    await store.dispatch('toggleDownvotePost', {
        postId: props?.data?._id,
        module: props?.module
    }).finally(() => {
        isReactingPost.value = false;
    });
};

const handleFollowUser = async (userId) => {
    isFollowingUser.value = true;
    await store.dispatch('followUser', userId).finally(() => {
        isFollowingUser.value = false;
    });
};

const goToComments = () => {
    emit('openNewCommentDrawer');
};

const goToShare = () => {
    const parentPost = props?.data?.shared_post ? props?.data?.shared_post : props?.data;

    store.commit('SET_PARENT_POST', parentPost);
    router.push({
        path: '/composer',
        query: {
            module: props.module,
            parent_post: parentPost?._id || undefined,
            post_type: 'post'
        }
    });
};

const goToProfile = (userId) => {
    router.push({ path: '/profile/' + userId });
};

const setMedia = ({ selected, list, post, module }) => {
    store.commit('SET_MEDIA', { selected, list, post });
    router.push(`/media/${selected?._id}?module=${module}`);
};

const openVideo = (video) => {
    store.commit('SET_MEDIA', { selected: video, list: [video], post: props.data });
    router.push(`/media/${video._id}?module=${props.module}`);
};
</script>