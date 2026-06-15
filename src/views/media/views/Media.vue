<template>
    <div class="h-screen w-full bg-black">
        <!--start body media-->
        <ImageMediaPreview v-if="currentMedia?.selected?.type !== 'video'" :current-image="currentMedia?.selected" :list="currentMedia?.list" />
        <VideoMediaPlayer v-else :current-video="currentMedia?.selected" :list="currentMedia?.list" />
        <!--end body media-->
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import ImageMediaPreview from '../components/ImageMediaPreview.vue';
import VideoMediaPlayer from '../components/VideoMediaPlayer.vue';


const store = useStore()

const currentMedia = computed(() => store.getters.currentMedia)

</script>