<template>
    <div class="h-screen relative w-full bg-black">
        <!--start body media-->
        <ImageMediaPreview 
        v-if="currentMedia?.selected?.type !== 'video'" 
        :current-image="currentMedia?.selected" 
        :list="currentMedia?.list" 
        :post="currentMedia?.post"
        :user-id="user?._id"
        :module="module"
        />
        <VideoMediaPlayer v-else :current-video="currentMedia?.selected" :list="currentMedia?.list" />
        <!--end body media-->

    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import ImageMediaPreview from '../components/ImageMediaPreview.vue';
import VideoMediaPlayer from '../components/VideoMediaPlayer.vue';
import { useRoute } from 'vue-router';

const store = useStore()
const route = useRoute()

const currentMedia = computed(() => store.getters.currentMedia)
const user = computed(() => store.getters.currentUser)

const module = ref(route.query?.module || 'feed')

</script>