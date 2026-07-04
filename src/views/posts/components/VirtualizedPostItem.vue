<!-- components/VirtualizedPostItem.vue -->
<template>
    <div ref="el" :style="{ position: 'absolute', top: top + 'px', left: 0, right: 0 }">
        <PostCard :show-border-bottom="showBorderBottom" :show-btn-follow="showBtnFollow" :module="module"
            :data="data" :user="user" @open-more-options-drawer="$emit('open-more-options-drawer', $event)" />
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import PostCard from './PostCard.vue';

const props = defineProps({
    data: { type: Object, required: true },
    top: { type: Number, required: true },
    module: { type: String, default: 'feed' },
    user: { type: Object, default: () => ({}) },
    showBorderBottom: { type: Boolean, default: false },
    showBtnFollow: { type: Boolean, default: false }
});

const emit = defineEmits(['measure', 'open-more-options-drawer']);

const el = ref(null);
let observer = null;
let rafId = null;

const reportHeight = () => {
    if (!el.value) return;
    const h = el.value.offsetHeight;
    if (h > 0) emit('measure', { id: props.data?._id, height: h });
};

onMounted(async () => {
    await nextTick();
    reportHeight();

    if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(() => {
            // Adia para o próximo frame — evita o loop "undelivered notifications"
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(reportHeight);
        });
        observer.observe(el.value);
    }
});

onBeforeUnmount(() => {
    if (rafId) cancelAnimationFrame(rafId);
    if (observer) {
        observer.disconnect();
        observer = null;
    }
});
</script>