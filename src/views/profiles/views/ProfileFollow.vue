<template>
    <Followlist :user-id="userId" :username="profile?.username" :type="type" />
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import Followlist from '@/views/users/components/Followlist.vue';

const store = useStore()
const route = useRoute()

const profile = computed(() => store.getters?.currentProfile || null)
const userId = computed(() => route.params.user_id)
const type = computed(() => route.query.type)
</script>