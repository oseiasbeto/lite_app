<template>
    <div v-if="!loading">
        <template v-if="!editForm">
            <div>
                <ul>
                    <li @click="goToEditForm('picture')">Editar Foto</li>
                    <li class="flex flex-col" @click="goToEditForm('name')">
                        <span>Editar Nome</span>
                        <span>Oseias BC</span>
                    </li>
                    <li @click="goToEditForm('credentials')">
                        <span>Editar credencial de perfil</span>
                    </li>
                    <li @click="goToEditForm('location')">
                        <span>Editar localizacao</span>
                    </li>
                    <li @click="goToEditForm('bio')">
                        <span>Editar biografia</span>
                    </li>
                </ul>
            </div>
        </template>
        <template v-else>
            <EditProfileForm />
        </template>
    </div>
    <div v-else>
        <LoadingScreen/>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import EditProfileForm from './EditProfileForm.vue';
import LoadingScreen from '@/components/UI/LoadingScreen.vue';

const route = useRoute()
const router = useRouter()
const store = useStore()

const profileId = route.params.profile_id
const editForm = computed(() => route.query?.edit_form || null)
const profile = computed(() => store.getters.currentProfile)

const loading = ref(false)

const goToEditForm = (form) => {
    router.push({ query: { edit_form: form } })
}

onMounted(async () => {
    if (!profile.value || profile.value._id !== profileId) {
        loading.value = true
        await store.dispatch('getProfileByUserId', profileId)
            .finally(() => {
                loading.value = false
            })
    }
})
</script>