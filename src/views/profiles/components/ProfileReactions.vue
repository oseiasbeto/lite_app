<template>
    <div class="flex items-center justify-between">
        <button :disabled="isDisabled" v-if="!isSameUser" @click="$emit('onFollow')"
            class="text-[13px] line-clamp-2 leading-[15px] flex-1">
            <svg v-if="hasFollowed" class="mx-auto" width="24" height="24" viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fill-rule="evenodd">
                    <path
                        d="M10.732 12.97A3.752 3.752 0 0 0 8.25 16.5h7.5a3.752 3.752 0 0 0-2.482-3.53 3 3 0 1 0-2.536 0Zm9.518 1.369a2.493 2.493 0 0 0-.723.63l-1.76 2.262a2.5 2.5 0 0 0-3.933 3.019H7.5a3.75 3.75 0 0 1-3.75-3.75v-9A3.75 3.75 0 0 1 7.5 3.75h9a3.75 3.75 0 0 1 3.75 3.75v6.839Z"
                        class="icon_svg-fill_as_stroke" fill="currentColor" fill-rule="nonzero"></path>
                    <path class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                        stroke-linejoin="round" d="m16 19 2 2 3.5-4.495"></path>
                </g>
            </svg>
            <svg v-else class="mx-auto" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <g class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5" fill="none" fill-rule="evenodd">
                    <path d="M12 12.5A2.25 2.25 0 1 0 12 8a2.25 2.25 0 0 0 0 4.5zm3 4a3 3 0 1 0-6 0"></path>
                    <path d="M13.5 19.5h-6a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v6m-2.5 6h5M19.5 17v5"
                        stroke-linecap="round"></path>
                </g>
            </svg>
            <p>{{ statusFollowTxt }}</p>
        </button>
        <button :disabled="isDisabled" v-if="!isSameUser" @click="$emit('onSubscribe')"
            class="text-[13px] line-clamp-2 leading-[15px] flex-1">

            <svg class="mx-auto" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink">
                <g id="notitifications" class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5"
                    :fill="hasSubscribed ? 'currentColor' : 'none'" fill-rule="evenodd">
                    <g id="Group" transform="translate(5.000000, 3.500000)">
                        <path class="icon_svg-fill" :fill="hasSubscribed ? 'currentColor' : 'none'" fill-rule="nonzero"
                            d="M14,13.723759 L14,14.3519125 C14,14.7104134 13.7094713,15 13.3502278,15 L0.649772207,15 C0.291081705,15 0,14.7112506 0,14.3519125 L0,13.723759 C0,13.4555017 0.111042897,13.2043751 0.302048519,13.0238897 C0.313090029,13.0115804 0.324625282,12.9996397 0.336638125,12.9880845 C0.351085556,12.9741875 0.377072698,12.9486318 0.408325107,12.9174483 C0.471453697,12.8544589 0.539029066,12.7854039 0.609080129,12.712155 C0.827047639,12.4842374 1.03316969,12.2535079 1.21879057,12.0283233 C1.38873203,11.8221601 1.53505484,11.6281976 1.65514129,11.4495176 C1.79508421,11.2412926 1.89583662,11.0588415 1.95369693,10.9112977 C2.05160021,10.6616443 2.13047671,10.2018457 2.17739719,9.5898353 C2.21761334,9.0652734 2.23283286,8.47852227 2.22532038,7.91296096 C2.22328921,7.85659008 2.22225536,7.80009191 2.22224446,7.74708009 C2.22580597,5.11806185 4.36439579,3 7,3 C9.63560421,3 11.774194,5.11806185 11.7777486,7.73054969 C11.7777446,7.80009191 11.7767108,7.85659008 11.7748657,7.90543541 C11.7671671,8.47852227 11.7823867,9.0652734 11.8226028,9.5898353 C11.8695233,10.2018457 11.9483998,10.6616443 12.0463031,10.9112977 C12.1041634,11.0588415 12.2049158,11.2412926 12.3448587,11.4495176 C12.4649452,11.6281976 12.611268,11.8221601 12.7812094,12.0283233 C12.9668303,12.2535079 13.1729524,12.4842374 13.3909199,12.712155 C13.4609709,12.7854039 13.5285463,12.8544589 13.5916749,12.9174483 C13.6229273,12.9486318 13.6489144,12.9741875 13.6633619,12.9880845 C13.6738617,12.9981843 13.6839972,13.0085792 13.6937575,13.0192578 C13.8874365,13.1998777 14,13.4528671 14,13.723759 Z"
                            id="Path"></path>
                        <circle id="Oval-6" cx="7" cy="1.5" r="1.5"></circle>
                        <path
                            d="M6.9998922,17.7499666 C8.380641,17.7499666 9.49995906,16.6306485 9.49995906,15.2498997 C9.53845401,15.2498997 4.49487813,15.2498997 4.49982534,15.2498997 C4.49982534,16.6306485 5.6191434,17.7499666 6.9998922,17.7499666 Z"
                            id="Oval-8"></path>
                    </g>
                </g>
            </svg>
            <p>Notificar-me</p>

        </button>
        <button v-if="isSameUser" @click="$emit('onEdit')" class="text-[13px] justify-center rounded-full border-2 py-1 dark:border-[rgb(57,56,57)] flex items-center gap-1 flex-1">
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fill-rule="evenodd">
                    <path
                        d="M18.571 5.429h0a2 2 0 0 1 0 2.828l-9.9 9.9-4.24 1.416 1.412-4.245 9.9-9.9a2 2 0 0 1 2.828 0Z"
                        class="icon_svg-stroke" stroke="#666" stroke-width="1.5" stroke-linecap="round"
                        stroke-linejoin="round"></path>
                    <path class="icon_svg-fill_as_stroke" fill="#666" d="m4.429 19.571 2.652-.884-1.768-1.768z"></path>
                </g>
            </svg>
            <p>Editar perfil</p>
        </button>
        <button v-if="!isSameUser" @click="$emit('onAsk')" class="text-[13px] line-clamp-2 leading-[15px] flex-1">
            <svg class="mx-auto" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <g class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5" fill="none" fill-rule="evenodd">
                    <g transform="translate(9 7)">
                        <path d="M3 6v-.5A2.5 2.5 0 1 0 .5 3" stroke-linecap="round" stroke-linejoin="round"></path>
                        <circle class="icon_svg-fill_as_stroke" fill="currentColor" cx="3" cy="8.5" r="1" stroke="none">
                        </circle>
                    </g>
                    <path d="M7.5 4h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-3L9 22v-3H7.5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"
                        stroke-linejoin="round"></path>
                </g>
            </svg>
            <p>Perguntar</p>
        </button>

        <button v-if="!isSameUser" @click="$emit('moreOptions')" class="text-[13px] line-clamp-2 leading-[15px] flex-1">
            <svg width="24" height="24" class="mx-auto" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M5 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm7 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm7 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
                    class="icon_svg-stroke" stroke-width="1.5" stroke="currentColor" fill="none"></path>
            </svg>
            <p>Mais</p>
        </button>
    </div>
</template>

<script setup>

const props = defineProps({
    profile: {
        type: Object,
        required: true
    },
    isDisabled: {
        type: Boolean,
        default: false
    },
    isSameUser: {
        type: Boolean,
        default: false
    },
    statusFollowTxt: {
        type: String,
        default: 'Seguir'
    },
    hasFollowed: {
        type: Boolean,
        default: false
    },
    hasSubscribed: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String,
        required: true
    }
})



defineEmits(['onFollow', 'onSubscribe', 'onEdit', 'onAsk', 'moreOptions'])


</script>