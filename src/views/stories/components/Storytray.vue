<template>
    <section class="story-tray" aria-label="Stories">
        <ul class="story-tray__list" role="list">
            <!-- Seu story -->
            <li class="story-tray__item">
                <button type="button" class="story-tray__btn" @click="onOwnPress"
                    :aria-label="myGroup ? 'Ver seu story' : 'Criar story'">
                    <StoryAvatar :src="me?.profile_image?.url" :alt="me?.name || me?.username" :size="64"
                        :state="myGroup ? 'unseen' : 'none'" />
                    <span class="story-tray__label">{{ myGroup ? 'Seu story' : 'Criar story' }}</span>
                </button>
                <button type="button" class="story-tray__plus" aria-label="Adicionar ao story"
                    @click.stop="emit('create')">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
                        <path d="M12 6v12M6 12h12" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
                    </svg>
                </button>
            </li>

            <!-- Esqueleto durante o primeiro carregamento -->
            <template v-if="loading && !loaded">
                <li v-for="n in 5" :key="'sk' + n" class="story-tray__item" aria-hidden="true">
                    <div class="story-tray__skeleton" />
                    <div class="story-tray__skeleton-label" />
                </li>
            </template>

            <!-- Amigos -->
            <li v-for="group in friends" :key="group.user._id" class="story-tray__item">
                <button type="button" class="story-tray__btn" @click="open(group)"
                    :aria-label="`Ver story de ${displayName(group.user)}`">
                    <StoryAvatar :src="group.user.profile_image?.url" :alt="displayName(group.user)" :size="64"
                        :state="hasUnseen(group) ? 'unseen' : 'seen'" />
                    <span class="story-tray__label" :class="{ 'is-seen': !hasUnseen(group) }">
                        {{ displayName(group.user) }}
                    </span>
                </button>
            </li>

            <li v-if="loaded && !friends.length" class="story-tray__hint">
                Os stories de quem você segue aparecem aqui.
            </li>
        </ul>
    </section>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import StoryAvatar from './Storyavatar.vue'

const emit = defineEmits(['create'])

const store = useStore()

const me = computed(() => store.getters.currentUser)
const myGroup = computed(() => store.getters.myStoryGroup)
const friends = computed(() => store.getters.friendsStoryGroups)
const loading = computed(() => store.getters.storiesLoading)
const loaded = computed(() => store.getters.storiesLoaded)

const displayName = (u) => u?.name || `@${u?.username}`
const hasUnseen = (group) => group.stories.some((s) => !s.viewed)

const open = (group) => store.dispatch('openStoryViewer', { userId: group.user._id })

const onOwnPress = () => {
    if (myGroup.value) open(myGroup.value)
    else emit('create')
}
</script>

<style scoped>
.story-tray {
    width: 100%;
}

.story-tray__list {
    display: flex;
    gap: 14px;
    padding: 10px 20px 8px;
    margin: 0;
    list-style: none;
    overflow-x: auto;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
}

.story-tray__list::-webkit-scrollbar {
    display: none;
}

.story-tray__item {
    position: relative;
    flex: 0 0 auto;
    width: 68px;
    scroll-snap-align: start;
}

.story-tray__btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    width: 100%;
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
    color: inherit;
    -webkit-tap-highlight-color: transparent;
}

.story-tray__btn:active :deep(.story-avatar) {
    transform: scale(0.94);
}

.story-tray__btn :deep(.story-avatar) {
    transition: transform 0.12s ease;
}

.story-tray__btn:focus-visible {
    outline: 2px solid #fe2c55;
    outline-offset: 3px;
    border-radius: 12px;
}

.story-tray__label {
    width: 100%;
    font-size: 12px;
    line-height: 1.2;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
}

.story-tray__label.is-seen {
    opacity: 0.55;
    font-weight: 400;
}

.story-tray__plus {
    position: absolute;
    right: 2px;
    top: 44px;
    width: 22px;
    height: 22px;
    border-radius: 9999px;
    background: #fe2c55;
    color: #fff;
    border: 2px solid var(--story-gap, #fff);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
}

:global(.dark) .story-tray__plus {
    --story-gap: #000;
}

.story-tray__skeleton {
    width: 64px;
    height: 64px;
    border-radius: 9999px;
    background: rgba(128, 128, 128, 0.2);
    margin: 0 auto;
    animation: tray-pulse 1.4s ease-in-out infinite;
}

.story-tray__skeleton-label {
    width: 44px;
    height: 8px;
    border-radius: 4px;
    margin: 10px auto 0;
    background: rgba(128, 128, 128, 0.2);
}

.story-tray__hint {
    flex: 0 0 140px;
    align-self: center;
    font-size: 12px;
    line-height: 1.35;
    opacity: 0.55;
}

@keyframes tray-pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

@media (prefers-reduced-motion: reduce) {
    .story-tray__skeleton {
        animation: none;
    }
}
</style>