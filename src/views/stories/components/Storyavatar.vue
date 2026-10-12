<template>
    <div class="story-avatar" :class="`is-${state}`" :style="{ width: size + 'px', height: size + 'px' }">
        <div class="story-avatar__ring">
            <div class="story-avatar__inner">
                <img v-if="src && !failed" :src="src" :alt="alt" loading="lazy" draggable="false"
                    @error="failed = true" />
                <span v-else class="story-avatar__fallback" :style="{ fontSize: size * 0.38 + 'px' }">{{ initial
                    }}</span>
            </div>
        </div>
        <slot />
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
    src: { type: String, default: '' },
    alt: { type: String, default: '' },
    size: { type: Number, default: 56 },
    // 'unseen' = anel colorido | 'seen' = anel cinza | 'none' = sem anel
    state: { type: String, default: 'none', validator: (v) => ['unseen', 'seen', 'none'].includes(v) },
})

const failed = ref(false)
watch(() => props.src, () => (failed.value = false))

const initial = computed(() => (props.alt || '?').trim().charAt(0).toUpperCase())
</script>

<style scoped>
.story-avatar {
    --story-gap: #fff;
    --story-ring-from: #25f4ee;
    --story-ring-to: #fe2c55;
    position: relative;
    flex-shrink: 0;
}

:global(.dark) .story-avatar {
    --story-gap: #000;
}

.story-avatar__ring {
    width: 100%;
    height: 100%;
    border-radius: 9999px;
    padding: 0;
    box-sizing: border-box;
    transition: background 0.2s ease;
}

.story-avatar__inner {
    width: 100%;
    height: 100%;
    border-radius: 9999px;
    overflow: hidden;
    box-sizing: border-box;
    background: rgba(128, 128, 128, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
}

.story-avatar__inner img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.story-avatar__fallback {
    font-weight: 600;
    color: rgba(128, 128, 128, 0.9);
}

/* com anel: o avatar encolhe para abrir o espaço do anel + folga */
.is-unseen .story-avatar__ring,
.is-seen .story-avatar__ring {
    padding: 2px;
}

.is-unseen .story-avatar__ring {
    background: linear-gradient(135deg, var(--story-ring-from), var(--story-ring-to));
}

.is-seen .story-avatar__ring {
    background: rgba(128, 128, 128, 0.45);
}

.is-unseen .story-avatar__inner,
.is-seen .story-avatar__inner {
    border: 2px solid var(--story-gap);
}
</style>