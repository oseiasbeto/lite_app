<template>
    <div class="relative cursor-pointer overflow-hidden bg-black"
        :class="isParentPost ? 'max-h-[200px]' : 'max-h-[400px]'" @click="$emit('open', video)">
        <!-- Thumbnail -->
        <img v-if="video.thumbnail" :src="video.thumbnail" :alt="'Video thumbnail'" class="w-full h-full object-cover"
            :class="isParentPost ? 'max-h-[200px]' : 'max-h-[400px]'" />
        <div v-else class="w-full bg-[rgb(30,30,30)] flex items-center justify-center"
            :class="isParentPost ? 'h-[200px]' : 'h-[300px]'">
            <svg class="w-12 h-12 text-[rgb(120,120,120)]" fill="currentColor" viewBox="0 0 24 24">
                <path
                    d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
        </div>

        <!-- Dark overlay -->
        <div class="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-200" />

        <!-- Play button -->
        <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-14 h-14 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="22"
                    height="22" viewBox="-0.5 0 7 7" version="1.1">

                    <title>play [#1003]</title>
                    <desc>Created with Sketch.</desc>
                    <defs>

                    </defs>
                    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <g id="Dribbble-Light-Preview" transform="translate(-347.000000, -3766.000000)" fill="#fff">
                            <g id="icons" transform="translate(56.000000, 160.000000)">
                                <path
                                    d="M296.494737,3608.57322 L292.500752,3606.14219 C291.83208,3605.73542 291,3606.25002 291,3607.06891 L291,3611.93095 C291,3612.7509 291.83208,3613.26444 292.500752,3612.85767 L296.494737,3610.42771 C297.168421,3610.01774 297.168421,3608.98319 296.494737,3608.57322"
                                    id="play-[#1003]">

                                </path>
                            </g>
                        </g>
                    </g>
                </svg>
            </div>
        </div>

        <!-- Duration badge -->
        <div v-if="video.duration"
            class="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-0.5 rounded backdrop-blur-sm">
            {{ formatDuration(video.duration) }}
        </div>
    </div>
</template>

<script setup>
defineProps({
    video: {
        type: Object,
        required: true
    },
    isParentPost: {
        type: Boolean,
        default: false
    }
})

defineEmits(['open'])

const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'

    const totalSeconds = Math.floor(seconds)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`
}
</script>