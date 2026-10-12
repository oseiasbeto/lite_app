<template>
    <!-- Cartão exibido acima do texto numa mensagem do tipo 'story_reply' (como no TikTok/Instagram) -->
    <div class="srp" :class="{ 'is-mine': mine }">
        <div class="srp__thumb" :style="thumbStyle" aria-hidden="true">
            <span v-if="storyReply.media_type === 'text'" class="srp__text">{{ storyReply.text_content }}</span>
            <svg v-else-if="storyReply.media_type === 'video'" class="srp__play" viewBox="0 0 24 24" width="16"
                height="16" fill="#fff">
                <path d="M8 5v14l11-7z" />
            </svg>
        </div>
        <div class="srp__meta">
            <span class="srp__title">{{ mine ? 'Você respondeu ao story' : 'Respondeu ao seu story' }}</span>
            <span class="srp__sub">Story · 24 h</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { STORY_BACKGROUNDS } from '../../../utils/story-utils'

const props = defineProps({
    // message.story_reply = { story, author, media_type, thumb, text_content, background }
    storyReply: { type: Object, required: true },
    mine: { type: Boolean, default: false },
})

const thumbStyle = computed(() => {
    const s = props.storyReply
    if (s.media_type === 'text') return { background: STORY_BACKGROUNDS[s.background] || STORY_BACKGROUNDS.sunset }
    if (s.thumb) return { backgroundImage: `url(${s.thumb})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    return { background: 'rgba(128,128,128,.3)' }
})
</script>

<style scoped>
.srp {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px;
    margin-bottom: 4px;
    border-radius: 12px;
    background: rgba(128, 128, 128, 0.14);
    max-width: 260px;
}

.srp.is-mine {
    background: rgba(255, 255, 255, 0.18);
}

.srp__thumb {
    position: relative;
    flex: 0 0 auto;
    width: 38px;
    height: 56px;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.srp__text {
    font-size: 6px;
    line-height: 1.2;
    font-weight: 700;
    color: #fff;
    text-align: center;
    padding: 3px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
}

.srp__play {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

.srp__meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.25;
}

.srp__title {
    font-size: 13px;
    font-weight: 600;
}

.srp__sub {
    font-size: 11px;
    opacity: 0.6;
}
</style>