<template>
    <div class="relative">
        <div
            class="relative dark:bg-black bg-white h-[calc(100vh-56px)] w-screen overflow-y-hidden box-border flex flex-col">

            <!--start header-->
            <div class="flex flex-col sticky top-0 w-full z-[100] bg-white dark:bg-black">
                <div class="flex w-full py-2 items-center justify-between">
                    <div class="flex flex-1 pr-2 items-center gap-2">
                        <button :disable="isSubmiting"
                            class="w-9 h-9 flex items-center justify-center text-inherit rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                            @click="openCancelPostDrawer">
                            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="m5.5 5.5 13 13m-13 0 13-13" class="icon_svg-stroke" stroke="currentColor"
                                    stroke-width="1.8" fill="none" fill-rule="evenodd" stroke-linecap="round"></path>
                            </svg>
                        </button>
                        <button
                            class="flex text-inherit items-center gap-1 rounded-full border border-[rgb(207,217,222)] dark:border-[rgb(83,100,113)] px-2.5 py-0.5 text-x-light-blue"
                            @click="openPostAudienceDrawer">
                            <svg v-if="postAudience === 'everyone'" width="16" height="16" viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg">
                                <g class="icon_svg-stroke" transform="translate(4 4)" stroke="currentColor"
                                    stroke-width="1.8" fill="none" fill-rule="evenodd">
                                    <path d="M10 15.5a5 5 0 0 0-10 0m17 0a5 5 0 0 0-7.032-4.57"></path>
                                    <circle cx="5" cy="4" r="4"></circle>
                                    <path d="M9.678 7.258A4 4 0 1 0 9.791.665"></path>
                                </g>
                            </svg>
                            <svg v-else width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <g class="icon_svg-stroke" transform="translate(6 3)" stroke="currentColor"
                                    stroke-width="1.8" fill="none" fill-rule="evenodd">
                                    <path d="M13 18c0-3.314-2.91-6-6.5-6S0 14.686 0 18"></path>
                                    <circle cx="6.5" cy="5" r="4.5"></circle>
                                </g>
                            </svg>
                            <span class="text-[13px] font-bold">{{ audienceText }}</span>
                        </button>
                    </div>
                    <div class="shrink-0 pr-3">
                        <button
                            class="rounded-full font-bold text-[15px] px-4 py-1.5 bg-x-light-blue text-white disabled:bg-[#1d9bf0]/50 disabled:text-white/80 transition-colors"
                            :disabled="!canPost || selectFileLoading" @click="handleSubmit">
                            Postar
                        </button>
                    </div>
                </div>
            </div>
            <!--end header-->

            <!--start body-->
            <div class="flex-1 px-4 pt-3 max-h-full overflow-y-auto justify-between flex-col">
                <div>
                    <!--start error alert-->
                    <div v-if="error" class="px-0 mb-3">
                        <div
                            class="py-3 flex justify-between px-3 bg-light-card dark:bg-dark-card mb-2 rounded-lg text-light-text-secondary dark:text-dark-text-primary relative">
                            <div class="flex">
                                <svg class="shrink-0 mr-2" fill="none" viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="hsl(346, 91%, 47.2%)" fill-rule="evenodd" clip-rule="evenodd"
                                        d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm8-1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-4a1 1 0 0 1-1-1Zm1-3a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z">
                                    </path>
                                </svg>
                                <span class="block leading-5">{{ error }}</span>
                            </div>
                            <button @click="error = null"
                                class="shrink-0 w-[22px] h-[22px] rounded-full flex justify-center items-center bg-light-bg dark:bg-dark-bg top-0 bottom-0 right-0">
                                <svg fill="none" width="12" viewBox="0 0 24 24" height="12"
                                    style="color: rgb(147, 165, 183); pointer-events: none;">
                                    <path fill="hsl(211, 20%, 64.8%)" fill-rule="evenodd" clip-rule="evenodd"
                                        d="M4.293 4.293a1 1 0 0 1 1.414 0L12 10.586l6.293-6.293a1 1 0 1 1 1.414 1.414L13.414 12l6.293 6.293a1 1 0 0 1-1.414 1.414L12 13.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L10.586 12 4.293 5.707a1 1 0 0 1 0-1.414Z">
                                    </path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <!--end error alert-->

                    <!--start author + editor row (side by side, like X)-->
                    <div class="flex gap-3">
                        <div class="shrink-0">
                            <Avatar size="lg" :url="user?.profile_image?.url" />
                        </div>

                        <div class="flex-1 min-w-0">
                            <!--start editor-->
                            <RichTextEditor ref="richTextEditorRef" v-model="postContent"
                                placeholder="O que está a acontecer?"
                                :no-min-height="mediaPreviews.length > 0 || parentPost?._id?.length > 0" />
                            <!--end editor-->

                            <!-- start media previews -->
                            <div class="py-2 pt-0 flex-1 flex flex-row gap-3 rounded-2xl"
                                :class="{ 'overflow-x-auto': mediaPreviews.length > 1, 'justify-center': mediaPreviews.length === 1 }"
                                v-if="mediaPreviews.length" ref="mediaContainer">
                                <div v-for="(media, index) in mediaPreviews" :key="media.id"
                                    class="relative bg-light-card dark:border-[rgb(57,56,57)] border rounded-2xl overflow-hidden shadow-sm flex-shrink-0"
                                    :style="mediaPreviews.length === 1
                                        ? { width: '100%', height: '240px' }
                                        : { width: '192px', height: '192px' }">
                                    <!-- Imagem -->
                                    <img v-if="media.type === 'image'" :src="media.url"
                                        class="w-full h-full object-cover" alt="Prévia da imagem" />

                                    <!-- Vídeo -->
                                    <video v-if="media.type === 'video'" controls class="w-full h-full object-cover"
                                        autoplay loop muted playsinline disablePictureInPicture>
                                        <source :src="media.url" :type="'video/' + media.format" />
                                    </video>

                                    <!-- Botão de remoção -->
                                    <button @click.stop="removeMedia(index)"
                                        class="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors duration-200">
                                        <svg viewBox="0 0 24 24" class="w-5 h-5">
                                            <path fill="currentColor"
                                                d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z">
                                            </path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <!-- end media previews -->

                            <!--start share post component-->
                            <div class="mx-[-2px] pb-4" v-if="parentPost?._id">
                                <ParentPostCard @close="removeParentPost" :show-btn-close="true" :user-id="user?._id"
                                    :data="parentPost" />
                            </div>
                            <!--end share post component-->
                        </div>
                    </div>
                    <!--end author + editor row-->

                    <!--input files-->
                    <input type="file" ref="imageInput" accept="image/*" multiple @change="handleImageUpload"
                        class="hidden" />
                    <input type="file" ref="videoInput" accept="video/*" @change="handleVideoUpload" class="hidden" />
                    <!--input files-->
                </div>
            </div>
            <!--end body-->

            <!-- Modal de Confirmação -->
            <Drawer @close="closeDrawer" :is-open="drawer?.show" :title="drawer?.metadata?.title">
                <template v-if="drawer?.name === 'cancelPost'">
                    <div class="flex flex-col">
                        <DrawerItem @on-press="closeDrawer" title="Continuar editando"></DrawerItem>
                        <DrawerItem @on-press="confirmCancel" title="Descartar tudo"></DrawerItem>
                    </div>
                </template>
                <template v-if="drawer?.name === 'postAudience'">
                    <div class="flex flex-col">
                        <DrawerItem :is-active="postAudience === 'everyone'" @on-press="setPostAudience('everyone')"
                            title="Público"
                            description="Todos verão a tua identidade junto a postagem no seu perfil ou no feed deles." />
                        <DrawerItem :is-active="postAudience === 'limited'" @on-press="setPostAudience('limited')"
                            title="Limitado"
                            description="A sua identidade ficará visível, mas esta postagem não aparecerá no feed dos seu seguidores" />
                    </div>
                </template>
            </Drawer>
        </div>

        <!--start footer-->
        <div
            class="fixed bg-white flex items-center justify-between pl-[15px] px-4 bottom-0 dark:bg-black border-t border-[rgb(239,243,244)] dark:border-[rgb(47,51,54)] h-14 w-full">
            <!--start toolbar -->
            <div class="flex py-2 h-full flex-row items-center overflow-hidden">
                <button @click="toggleToolbar" class="bg-transparent text-x-light-blue border-none mr-2"
                    :title="showToolbar ? 'Ocultar formatação' : 'Mostrar formatação'">
                    <svg v-if="showToolbar" width="22" height="22" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="m5 8.5 7 7 7.005-7" class="icon_svg-stroke" stroke="currentColor" stroke-width="1.8"
                            fill="none" stroke-linecap="round"></path>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                        <path class="icon_svg-fill_as_stroke"
                            d="m10.526 17.352-1.002-3.031H5.162l-1.018 3.031H2L6.205 5.5h2.382l4.214 11.852h-2.275zM7.281 7.759l-1.626 4.887h3.376l-1.61-4.887h-.14zm10.415 8.14c1.232 0 2.152-.797 2.152-1.84v-.715l-2.029.131c-1.142.074-1.676.485-1.676 1.216 0 .756.649 1.207 1.552 1.207zm-.6 1.602c-1.733 0-2.973-1.051-2.973-2.694 0-1.626 1.224-2.563 3.409-2.694l2.316-.14v-.756c0-.879-.591-1.372-1.692-1.372-.936 0-1.577.329-1.766.936h-1.922c.164-1.585 1.651-2.595 3.786-2.595 2.308 0 3.606 1.125 3.606 3.031v6.136h-1.963V16.12h-.14c-.501.871-1.487 1.38-2.661 1.38z"
                            fill="currentColor" fill-rule="evenodd"></path>
                    </svg>
                </button>

                <div class="flex items-center" v-if="!showToolbar">
                    <button :disabled="disableUploadImage" @click="imageInput?.click()"
                        class="bg-transparent text-x-light-blue disabled:opacity-40 border-none ml-1 mr-1.5"
                        title="Adicionar imagem">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
                                stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <path
                                d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
                                stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <path
                                d="M2.67004 18.9501L7.60004 15.6401C8.39004 15.1101 9.53004 15.1701 10.24 15.7801L10.57 16.0701C11.35 16.7401 12.61 16.7401 13.39 16.0701L17.55 12.5001C18.33 11.8301 19.59 11.8301 20.37 12.5001L22 13.9001"
                                stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                    <button :disabled="disableUploadVideo" @click="videoInput?.click()"
                        class="bg-transparent text-x-light-blue disabled:opacity-40 border-none ml-1 mr-2"
                        title="Adicionar vídeo">

                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15Z"
                                stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <path d="M2.52002 7.11011H21.48" stroke="currentColor" stroke-width="1.8"
                                stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M8.52002 2.11011V6.97011" stroke="currentColor" stroke-width="1.8"
                                stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M15.48 2.11011V6.52011" stroke="currentColor" stroke-width="1.8"
                                stroke-linecap="round" stroke-linejoin="round" />
                            <path
                                d="M9.75 14.4501V13.2501C9.75 11.7101 10.84 11.0801 12.17 11.8501L13.21 12.4501L14.25 13.0501C15.58 13.8201 15.58 15.0801 14.25 15.8501L13.21 16.4501L12.17 17.0501C10.84 17.8201 9.75 17.1901 9.75 15.6501V14.4501V14.4501Z"
                                stroke="currentColor" stroke-width="1.8" stroke-miterlimit="10" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>


                <!-- Toolbar expansível -->
                <div v-show="showToolbar && richTextEditorRef?.editor"
                    class="flex scrollbar-hide  flex-nowrap overflow-x-auto gap-1 px-2 pt-0">
                    <button @click="richTextEditorRef?.editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="[
                        'bg-transparent border-none text-sm font-medium mr-2 rounded-md cursor-pointer',
                        richTextEditorRef?.editor && richTextEditorRef?.editor.isActive('heading', { level: 1 }) ? 'text-x-light-blue' : 'text-[rgb(83,100,113)] dark:text-[#71767b]'
                    ]" title="Título H1">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M15 20h-3.15v-6.686h-5.7V20H3V4h3.15v6.098h5.7V4H15v16Zm3.397 0v-8.031l-1.897 1.91V11.78L18.397 10H20.5v10h-2.103Z"
                                fill="currentColor" class="icon_svg-fill_as_stroke"></path>
                        </svg>
                    </button>

                    <button @click="richTextEditorRef?.editor.chain().focus().toggleBold().run()" :class="[
                        'bg-transparent border-none text-sm font-medium mr-2 rounded-md cursor-pointer',
                        richTextEditorRef?.editor && richTextEditorRef?.editor.isActive('bold') ? 'text-x-light-blue' : 'text-[rgb(83,100,113)] dark:text-[#71767b]'
                    ]" title="Negrito (Ctrl+B)">
                        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12.78 20H6V4h6.602c2.929 0 4.676 1.52 4.676 3.992 0 1.696-1.182 3.17-2.73 3.415v.2c1.998.154 3.452 1.75 3.452 3.813 0 2.806-1.998 4.58-5.22 4.58ZM9.16 6.561v4.07h2.374c1.706 0 2.637-.743 2.637-2.03 0-1.275-.868-2.04-2.375-2.04H9.16Zm0 10.878h2.814c1.82 0 2.804-.81 2.804-2.307 0-1.463-1.015-2.24-2.877-2.24H9.16v4.547Z"
                                class="icon_svg-fill_as_stroke" fill="currentColor" fill-rule="evenodd"></path>
                        </svg>
                    </button>

                    <button @click="richTextEditorRef?.editor.chain().focus().toggleItalic().run()" :class="[
                        'bg-transparent border-none text-sm font-medium mr-2 rounded-md cursor-pointer',
                        richTextEditorRef?.editor && richTextEditorRef?.editor.isActive('italic') ? 'text-x-light-blue' : 'text-[rgb(83,100,113)] dark:text-[#71767b]'
                    ]" title="Itálico (Ctrl+I)">
                        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="m13.903 6.712-2.081 10.325a6.896 6.896 0 0 0-.086.798c0 .41.129.687.386.832.258.144.723.231 1.395.262L13.324 20H6.5l.236-1.071c.773-.03 1.327-.152 1.663-.365.336-.213.569-.638.698-1.276l2.081-10.325c.057-.395.086-.661.086-.798 0-.41-.129-.687-.386-.832-.258-.144-.723-.231-1.395-.262L9.676 4H16.5l-.236 1.071c-.773.03-1.327.152-1.663.365-.336.213-.569.638-.698 1.276Z"
                                class="icon_svg-fill_as_stroke" fill="currentColor" fill-rule="evenodd"></path>
                        </svg>
                    </button>

                    <button @click="richTextEditorRef?.editor.chain().focus().toggleOrderedList().run()" :class="[
                        'bg-transparent border-none text-sm font-medium mr-2 rounded-md cursor-pointer',
                        richTextEditorRef?.editor && richTextEditorRef?.editor.isActive('orderedList') ? 'text-x-light-blue' : 'text-[rgb(83,100,113)] dark:text-[#71767b]'
                    ]" title="Lista numerada">
                        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M8.5 5.5h11a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 .5-.5zm0 5.5h11a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 8 12v-.5a.5.5 0 0 1 .5-.5zm0 5.5h11a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V17a.5.5 0 0 1 .5-.5zM5.308 8.123h.738V4.6H5.31l-.911.627v.686l.864-.595h.044zM4 11.145v.012h.684v-.014c0-.325.234-.55.576-.55.322 0 .552.2.552.484 0 .23-.125.412-.62.896l-1.15 1.125v.515h2.541V13H5.04v-.043l.674-.643c.61-.573.818-.903.818-1.286 0-.606-.513-1.028-1.248-1.028C4.522 10 4 10.464 4 11.145zm.908 6.44h.437c.396 0 .637.19.637.498 0 .3-.256.508-.625.508-.378 0-.63-.188-.651-.486H4c.032.664.564 1.099 1.35 1.099.803 0 1.384-.447 1.384-1.065 0-.464-.302-.786-.786-.84v-.044a.794.794 0 0 0 .65-.805c0-.554-.52-.95-1.243-.95-.77 0-1.265.42-1.29 1.086h.682c.02-.305.247-.498.588-.498.345 0 .564.181.564.464 0 .288-.227.484-.561.484h-.43v.549z"
                                class="icon_svg-fill_as_stroke" fill="currentColor" fill-rule="evenodd"></path>
                        </svg>
                    </button>

                    <button @click="richTextEditorRef?.editor.chain().focus().toggleBulletList().run()" :class="[
                        'bg-transparent border-none text-sm font-medium mr-2 rounded-md cursor-pointer',
                        richTextEditorRef?.editor && richTextEditorRef?.editor.isActive('bulletList') ? 'text-x-light-blue' : 'text-[rgb(83,100,113)] dark:text-[#71767b]'
                    ]" title="Lista com marcadores">
                        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M8.5 5.75h11a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-.5a.5.5 0 0 1 .5-.5zm0 5.5h11a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-.5a.5.5 0 0 1 .5-.5zm0 5.5h11a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-.5a.5.5 0 0 1 .5-.5zM4.5 5.5h1A.5.5 0 0 1 6 6v1a.5.5 0 0 1-.5.5h-1A.5.5 0 0 1 4 7V6a.5.5 0 0 1 .5-.5zm0 5.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm0 5.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1A.5.5 0 0 1 4 18v-1a.5.5 0 0 1 .5-.5z"
                                class="icon_svg-fill_as_stroke" fill="currentColor" fill-rule="evenodd"></path>
                        </svg>
                    </button>

                    <button @click="richTextEditorRef?.editor.chain().focus().toggleBlockquote().run()" :class="[
                        'bg-transparent border-none text-sm font-medium mr-2 rounded-md cursor-pointer',
                        richTextEditorRef?.editor && richTextEditorRef?.editor.isActive('blockquote') ? 'text-x-light-blue' : 'text-[rgb(83,100,113)] dark:text-[#71767b]'
                    ]" title="Citação">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                            fill="currentColor">
                            <path class="icon_svg-fill_as_stroke"
                                d="m10.287 9.586.005-.191a3.896 3.896 0 1 0-7.792.001 3.896 3.896 0 0 0 3.896 3.896 3.88 3.88 0 0 0 1.376-.25c-.089.875-.302 1.643-.765 2.26-1.042 1.386-2.377 2.014-3.413 2.244-.277.062-.455.254-.44.534.015.268.251.415.515.42l.036-.001C4.993 18.431 6.5 17.5 8 16c1.472-1.472 2.313-3.784 2.287-6.414zm-1.403 7.297c-1.746 1.746-3.49 2.777-5.097 2.863l-.14.003c-.885-.015-1.688-.621-1.742-1.604-.048-.913.562-1.63 1.418-1.821.991-.22 1.954-.803 2.685-1.775a5.18 5.18 0 0 1-4.757-5.155 5.146 5.146 0 0 1 10.292 0l-.004.213c.021 2.918-.926 5.548-2.653 7.275zm12.653-7.297.005-.191a3.896 3.896 0 1 0-7.792.001 3.896 3.896 0 0 0 3.896 3.896 3.88 3.88 0 0 0 1.376-.25c-.089.875-.302 1.643-.765 2.26-1.042 1.386-2.377 2.014-3.413 2.244-.277.062-.455.254-.44.534.015.268.251.415.515.42l.036-.001C16.243 18.43 17.75 17.5 19.25 16c1.472-1.472 2.313-3.784 2.287-6.414zm-1.403 7.297c-1.746 1.746-3.49 2.777-5.097 2.863l-.14.003c-.885-.015-1.688-.621-1.742-1.604-.048-.913.562-1.63 1.418-1.821.991-.22 1.954-.803 2.685-1.775a5.18 5.18 0 0 1-4.757-5.155 5.146 5.146 0 0 1 10.292 0l-.004.213c.021 2.918-.926 5.548-2.653 7.275z">
                            </path>
                        </svg>
                    </button>
                </div>
            </div>
            <!--end toolbar-->

            <!--start char count ring (só aparece perto do limite, como no X)-->
            <div v-if="remainingChars <= 20" class="flex ml-1 items-center">
                <svg width="30" height="30" fill="none">
                    <path d="M15 0.5
           a14.5 14.5 0 0 1 0 29
           a14.5 14.5 0 0 1 0 -29" stroke-linecap="butt" stroke-width="1"
                        class="text-[rgb(222,224,225)] dark:text-[rgb(57,56,57)]" stroke="currentColor" />
                    <path
                        :class="remainingChars < 0 ? 'text-[#f4212e]' : remainingChars <= 10 ? 'text-[#ffd400]' : 'text-x-light-blue'"
                        :stroke-dasharray="dashArrayCharCount" d="M15 2.5
           a12.5 12.5 0 0 1 0 25
           a12.5 12.5 0 0 1 0 -25" stroke-linecap="butt" stroke-width="3" stroke="currentColor" />
                </svg>
                <span v-if="remainingChars <= 10" class="text-xs font-semibold ml-1"
                    :class="remainingChars < 0 ? 'text-[#f4212e]' : 'text-inherit'">
                    {{ remainingChars }}
                </span>
            </div>
            <!--end char count ring-->
        </div>
        <!--end footer-->
    </div>
</template>

<script setup>
import { computed, onMounted, ref, onUnmounted } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from 'vuex';
import Drawer from '@/components/drawer/Drawer.vue';
import DrawerItem from '@/components/drawer/DrawerItem.vue';
import RichTextEditor from '@/components/UI/RichTextEditor.vue';
import Avatar from '@/components/Utils/Avatar.vue';
import { logger } from '@/utils/logger';
import ParentPostCard from '../components/ParentPostCard.vue';

const router = useRouter();
const route = useRoute();
const store = useStore();

// Refs
const isSubmited = ref(false);
const selectFileLoading = ref(false);
const isAnonymous = ref(false);
const postAudience = ref("everyone");
const topics = ref([]);
const postContent = ref('');
const mediaPreviews = ref([]); // { id, url (blob local), type, format, file } — só sobem no submit
const error = ref(null);
const drawer = ref({ show: false, name: "", metadata: {} });
const imageInput = ref(null);
const videoInput = ref(null);
const loadingFetchPostParent = ref(false);
const isSubmiting = ref(false);
const isNavigatingAway = ref(false);
const isSubmittingSuccess = ref(false);

// Estado da toolbar (controlado pelo pai)
const showToolbar = ref(false);

// Referência ao componente RichTextEditor
const richTextEditorRef = ref(null);

// Função para alternar a toolbar (usada no footer e pode ser passada para o filho)
const toggleToolbar = () => {
    showToolbar.value = !showToolbar.value;
};

// Constants
const MAX_CHARS = 500;
const MAX_IMAGES = 8;
const MAX_VIDEO_SIZE_MB = 50;

const audienceText = computed(() => {
    switch (postAudience.value) {
        case 'limited': return 'Limitado';
        default: return 'Público';
    }
});

const module = computed(() => route.query.module || null);

// Computed para desabilitar uploads
const disableUploadImage = computed(() => {
    return mediaPreviews.value.length >= MAX_IMAGES ||
        hasVideo.value ||
        parentPost.value?._id?.length > 0;
});

const disableUploadVideo = computed(() => {
    return hasImages.value ||
        hasVideo.value ||
        parentPost.value?._id?.length > 0;
});

const hasImages = computed(() => mediaPreviews.value.some(m => m.type === 'image'));
const hasVideo = computed(() => mediaPreviews.value.some(m => m.type === 'video'));

const plainTextLength = (html) => {
    if (!html) return 0;
    const withoutTags = html.replace(/<[^>]*>/g, '');
    const el = document.createElement('textarea');
    el.innerHTML = withoutTags;
    return el.value.trim().length;
};

const remainingChars = computed(() => MAX_CHARS - plainTextLength(postContent.value));

const dashArrayCharCount = computed(() => {
    const circumference = 2 * Math.PI * 12.5;
    const percentage = ((MAX_CHARS - remainingChars.value) / MAX_CHARS) * 100;
    const dash = (Math.min(Math.max(percentage, 0), 100) / 100) * circumference;
    return `${dash} ${circumference - dash}`;
});

const canPost = computed(() => {
    const hasContent = postContent.value.trim().length > 0 && postContent.value.trim() !== '<p></p>';
    const hasMedia = mediaPreviews.value.length > 0;
    const hasParentPost = !!parentPost?.value?._id;
    const withinLimit = remainingChars.value >= 0;
    return (hasContent || hasMedia || hasParentPost) && withinLimit && !isSubmited.value && !isSubmiting.value;
});

const user = computed(() => store.getters.currentUser);
const parentPost = computed(() => store.getters.parentPost);

// Methods
const setPostAudience = (status) => {
    postAudience.value = status;
    closeDrawer();
};

const resetForm = () => {
    postContent.value = '';
    topics.value = [];
    postAudience.value = 'everyone';
    error.value = null;
    isSubmited.value = false;
};

const openDrawer = (data) => {
    const { show, name, metadata = {} } = data;
    drawer.value = { show, name, metadata };
};

const closeDrawer = () => {
    drawer.value = { show: false, name: '', metadata: {} };
};

const openCancelPostDrawer = () => {
    if (isSubmiting.value) return;
    if (canPost.value && !isSubmittingSuccess.value) {
        openDrawer({ show: true, name: 'cancelPost', metadata: { title: 'Descartar post?' } });
    } else {
        confirmCancel();
    }
};

const openPostAudienceDrawer = () => {
    if (isSubmiting.value) return;
    openDrawer({ show: true, name: 'postAudience', metadata: { title: 'Audiencia' } });
};

const removeParentPost = () => {
    store.commit("RESET_PARENT_POST");
};

// ── Validação de integridade do vídeo ──
const validateVideoIntegrity = (file) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata = () => {
            if (video.duration === Infinity || isNaN(video.duration) || video.videoWidth === 0) {
                URL.revokeObjectURL(video.src);
                reject(new Error('Vídeo corrompido ou inválido.'));
            } else {
                URL.revokeObjectURL(video.src);
                resolve(true);
            }
        };
        video.onerror = () => {
            URL.revokeObjectURL(video.src);
            reject(new Error('Vídeo corrompido ou não pôde ser lido.'));
        };
    });
};

// Apenas cria a prévia local (blob URL). Nada é enviado ao Cloudinary aqui —
// o upload real só acontece dentro de handleSubmit / na action de background.
const handleImageUpload = (e) => {
    if (isSubmiting.value) {
        error.value = 'Aguarde o post atual ser enviado';
        return;
    }

    const files = Array.from(e.target.files || []);
    const availableSlots = MAX_IMAGES - mediaPreviews.value.length;

    if (files.length > availableSlots) {
        error.value = `Você pode adicionar no máximo ${MAX_IMAGES} imagens`;
        return;
    }

    error.value = null;
    selectFileLoading.value = true;

    for (const file of files.slice(0, availableSlots)) {
        if (!(file instanceof File) || !file.type.startsWith('image/')) {
            error.value = 'Arquivo inválido ou não é uma imagem.';
            continue;
        }

        const id = uuidv4();
        const media = {
            id,
            url: URL.createObjectURL(file),
            type: 'image',
            format: file.type.split('/')[1],
            file,
        };
        mediaPreviews.value.push(media);
        logger.log('Imagem adicionada à prévia (upload adiado até Postar):', media.id);
    }

    selectFileLoading.value = false;
    e.target.value = '';
};

const handleVideoUpload = async (e) => {
    if (isSubmiting.value) {
        error.value = 'Aguarde o post atual ser enviado';
        return;
    }

    const file = e.target.files?.[0];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi'];

    if (!file || !(file instanceof File) || !file.type.startsWith('video/')) {
        error.value = 'Arquivo inválido ou não é um vídeo.';
        return;
    }

    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        error.value = `O vídeo deve ter no máximo ${MAX_VIDEO_SIZE_MB}MB.`;
        return;
    }

    if (!allowedVideoTypes.includes(file.type)) {
        error.value = 'Formato de vídeo não suportado. Use MP4 ou WebM.';
        return;
    }

    error.value = null;
    selectFileLoading.value = true;

    try {
        await validateVideoIntegrity(file);

        const id = uuidv4();
        const media = {
            id,
            url: URL.createObjectURL(file),
            type: 'video',
            format: file.type.split('/')[1],
            file,
        };
        mediaPreviews.value = [media]; // vídeo substitui tudo

        e.target.value = '';
    } catch (err) {
        error.value = err.message || 'Vídeo corrompido ou inválido.';
    } finally {
        selectFileLoading.value = false;
    }
};

// Como nada foi enviado ainda, remover é só tirar da lista local (e libertar o blob URL).
const removeMedia = (index) => {
    if (isSubmiting.value) {
        error.value = 'Aguarde o post atual ser enviado';
        return;
    }

    const media = mediaPreviews.value[index];
    if (media?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(media.url);
    }
    mediaPreviews.value.splice(index, 1);
};

const confirmCancel = async () => {
    if (isSubmiting.value) return;

    isNavigatingAway.value = true;

    mediaPreviews.value.forEach(m => {
        if (m.url?.startsWith('blob:')) URL.revokeObjectURL(m.url);
    });

    resetForm();
    mediaPreviews.value = [];
    closeDrawer();
    store.commit("SET_PARENT_POST", {});
    router.back();
};

// Upload + criação do post passam a correr em background (ver store action
// "submitPostWithMedia"). Assim que despachamos, voltamos logo para trás;
// o <PostUploadIndicator /> global mostra o progresso em % na página anterior.
const handleSubmit = async () => {
    if (!canPost.value || isSubmiting.value) return;

    isSubmiting.value = true;

    const mediaFiles = mediaPreviews.value.map(m => ({
        id: m.id,
        file: m.file,
        type: m.type,
        format: m.format,
    }));

    const payload = {
        content: postContent.value,
        mediaFiles,
        sharedPost: parentPost?.value?._id || null,
        isAnonymous: isAnonymous.value,
        topics: topics.value || [],
        audience: postAudience.value,
        module: module.value,
    };

    try {
        // Fire-and-forget: a promise continua a correr mesmo depois do
        // componente ser desmontado, porque não depende de refs locais.
        store.dispatch('submitPostWithMedia', payload).catch(err => {
            console.error('Erro ao publicar post em background:', err);
        });

        isSubmittingSuccess.value = true;
        isSubmited.value = true;
        isNavigatingAway.value = true;

        mediaPreviews.value.forEach(m => {
            if (m.url?.startsWith('blob:')) URL.revokeObjectURL(m.url);
        });

        resetForm();
        mediaPreviews.value = [];
        store.commit("SET_PARENT_POST", {});

        router.back();
    } catch (err) {
        console.error("Erro ao iniciar publicação:", err);
        error.value = err.message || "Erro ao criar post. Tente novamente.";
    } finally {
        isSubmiting.value = false;
    }
};

onBeforeRouteLeave((to, from, next) => {
    if (isCancellingOrDone()) { next(); return; }

    if (drawer.value?.show) {
        closeDrawer();
        next(false);
        return;
    }

    const hasUnsavedContent = (canPost.value || mediaPreviews.value.length > 0 || postContent.value.trim().length > 0)
        && !isSubmited.value
        && !isNavigatingAway.value;

    if (hasUnsavedContent) {
        openCancelPostDrawer();
        next(false);
    } else {
        if (!isNavigatingAway.value && !isSubmittingSuccess.value) {
            mediaPreviews.value.forEach(m => {
                if (m.url?.startsWith('blob:')) URL.revokeObjectURL(m.url);
            });
            resetForm();
            mediaPreviews.value = [];
            store.commit("SET_PARENT_POST", {});
        }
        next();
    }
});

function isCancellingOrDone() {
    return isNavigatingAway.value || isSubmittingSuccess.value;
}

onMounted(async () => {
    if (parentPost.value?._id) {
        loadingFetchPostParent.value = true;
        await store.dispatch("getPostById", {
            postId: route.query?.parent_post,
            type: 'parentPost'
        }).finally(() => {
            loadingFetchPostParent.value = false;
        });
    }
});

onUnmounted(() => {
    // Não revoga blobs aqui: se o utilizador só navegou para outro sítio sem
    // cancelar/publicar (ex.: back do telemóvel tratado no beforeRouteLeave
    // acima), a limpeza já foi feita lá. Isto evita revogar URLs que a
    // action de background ainda possa estar a ler do File original.
});
</script>