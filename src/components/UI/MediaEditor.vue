<template>
    <Teleport to="body">
        <div class="fixed inset-0 z-[400] flex flex-col bg-black text-white select-none" role="dialog"
            aria-modal="true" aria-label="Editor de mídia">

            <!-- ───────── Barra superior ───────── -->
            <div class="shrink-0 pt-[env(safe-area-inset-top)]">
                <div class="flex h-14 items-center justify-between px-2">
                    <button class="flex h-10 w-10 items-center justify-center rounded-full active:bg-white/10"
                        :disabled="saving" aria-label="Fechar editor" @click="requestClose">
                        <Icon name="close" :size="24" />
                    </button>

                    <button
                        class="flex h-10 items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold active:bg-white/10 disabled:opacity-30"
                        :disabled="!history.length || saving" @click="undo">
                        <Icon name="undo" :size="20" />
                        Desfazer
                    </button>

                    <button
                        class="rounded-md bg-[#FE2C55] px-4 py-1.5 text-[15px] font-semibold active:opacity-80 disabled:opacity-40"
                        :disabled="!ready || saving" @click="handleDone">
                        Concluir
                    </button>
                </div>
            </div>

            <!-- ───────── Palco (pré-visualização) ───────── -->
            <div ref="stageRef" class="relative flex min-h-0 flex-1 items-center justify-center px-3">
                <canvas ref="canvasRef" class="rounded-lg bg-neutral-900"
                    :style="{ width: canvasSize.w + 'px', height: canvasSize.h + 'px', touchAction: 'none', opacity: ready ? 1 : 0 }"
                    @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp"
                    @pointercancel="onPointerUp"></canvas>

                <!-- Reprodução / tempo (só vídeo) -->
                <div v-if="isVideo && ready" class="absolute bottom-2 left-4 flex items-center gap-2">
                    <button
                        class="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur active:bg-black/80"
                        :aria-label="playing ? 'Pausar' : 'Reproduzir'" @click="togglePlay">
                        <Icon :name="playing ? 'pause' : 'play'" :size="20" fill />
                    </button>
                    <span class="rounded-full bg-black/60 px-2.5 py-1 text-[12px] font-medium tabular-nums">
                        {{ fmt(Math.max(0, currentTime - st.trimStart)) }} / {{ fmt(outDuration) }}
                    </span>
                </div>

                <!-- A carregar -->
                <div v-if="!ready && !loadError" class="absolute inset-0 flex items-center justify-center">
                    <div class="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                </div>

                <!-- Erro de carregamento -->
                <div v-if="loadError" class="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
                    <p class="text-[15px] text-white/80">Não foi possível abrir este ficheiro no editor.</p>
                    <button class="rounded-md bg-white/10 px-4 py-2 text-[14px] font-semibold" @click="emit('close')">
                        Fechar
                    </button>
                </div>

                <!-- Aviso de erro ao guardar -->
                <div v-if="errorMsg"
                    class="absolute left-4 right-4 top-2 flex items-start justify-between gap-3 rounded-lg bg-[#2a0f16] px-3 py-2.5 text-[13px] text-[#ff8da1]">
                    <span>{{ errorMsg }}</span>
                    <button class="shrink-0 font-semibold text-white" @click="errorMsg = ''">OK</button>
                </div>
            </div>

            <!-- Vídeo de origem (invisível; é lido para o canvas) -->
            <video v-if="isVideo" ref="videoEl" :src="media.originalUrl" playsinline preload="auto"
                class="pointer-events-none absolute left-0 top-0 h-px w-px opacity-[0.01]" @loadedmetadata="onVideoMeta"
                @loadeddata="onVideoData" @seeked="onSeeked" @play="playing = true" @pause="playing = false"
                @ended="onEnded" @error="loadError = true"></video>

            <!-- ───────── Painel de ferramentas ───────── -->
            <div class="shrink-0 bg-[#161616]">
                <div class="max-h-[38vh] min-h-[132px] overflow-y-auto overscroll-contain py-3">

                    <!-- Enquadrar -->
                    <div v-if="tab === 'crop'" class="flex flex-col gap-3">
                        <div class="no-scrollbar flex gap-2 overflow-x-auto px-4">
                            <button v-for="a in ASPECTS" :key="a.id"
                                class="shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors"
                                :class="st.aspect === a.id ? 'bg-white text-black' : 'bg-white/10 text-white'"
                                @click="setAspect(a.id)">
                                {{ a.label }}
                            </button>
                        </div>
                        <div class="flex items-center gap-2 px-4">
                            <button class="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-[13px] font-semibold active:bg-white/20"
                                @click="rotate">
                                <Icon name="rotate" :size="18" /> Rodar
                            </button>
                            <button class="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-[13px] font-semibold active:bg-white/20"
                                @click="flip">
                                <Icon name="flip" :size="18" /> Espelhar
                            </button>
                        </div>
                        <label class="flex items-center gap-3 px-4 text-[13px]">
                            <span class="w-14 shrink-0 text-white/70">Zoom</span>
                            <input type="range" min="1" max="3" step="0.01" v-model.number="st.zoom"
                                class="w-full accent-[#FE2C55]" @pointerdown="pushHistory" />
                        </label>
                        <p class="px-4 text-[12px] text-white/50">Arrasta a imagem para a reposicionar dentro do enquadramento.</p>
                    </div>

                    <!-- Cortar vídeo -->
                    <div v-if="tab === 'trim' && isVideo" class="flex flex-col gap-4">
                        <div class="px-6">
                            <div ref="trackRef" class="relative h-14 touch-none rounded-md bg-neutral-800"
                                @pointerdown="onTrackDown">
                                <div class="absolute inset-0 flex overflow-hidden rounded-md">
                                    <img v-for="(t, i) in filmstrip" :key="i" :src="t" alt=""
                                        class="h-full min-w-0 flex-1 object-cover" draggable="false" />
                                </div>
                                <!-- zonas fora do corte -->
                                <div class="absolute inset-y-0 left-0 rounded-l-md bg-black/65"
                                    :style="{ width: startPct + '%' }"></div>
                                <div class="absolute inset-y-0 right-0 rounded-r-md bg-black/65"
                                    :style="{ width: 100 - endPct + '%' }"></div>
                                <!-- moldura da seleção -->
                                <div class="pointer-events-none absolute inset-y-0 border-y-2 border-white"
                                    :style="{ left: startPct + '%', width: endPct - startPct + '%' }"></div>
                                <!-- cabeça de reprodução -->
                                <div class="pointer-events-none absolute -inset-y-1 w-0.5 rounded bg-[#FE2C55]"
                                    :style="{ left: playPct + '%' }"></div>
                                <!-- pegas -->
                                <div class="absolute inset-y-0 flex w-6 -translate-x-full cursor-ew-resize items-center justify-center"
                                    :style="{ left: startPct + '%' }" @pointerdown.stop="onHandleDown('start', $event)"
                                    @pointermove="onHandleMove" @pointerup="onHandleUp" @pointercancel="onHandleUp">
                                    <div class="flex h-full w-3.5 items-center justify-center rounded-l-md bg-white">
                                        <div class="h-5 w-0.5 rounded bg-black/50"></div>
                                    </div>
                                </div>
                                <div class="absolute inset-y-0 flex w-6 cursor-ew-resize items-center justify-center"
                                    :style="{ left: endPct + '%' }" @pointerdown.stop="onHandleDown('end', $event)"
                                    @pointermove="onHandleMove" @pointerup="onHandleUp" @pointercancel="onHandleUp">
                                    <div class="-ml-2.5 flex h-full w-3.5 items-center justify-center rounded-r-md bg-white">
                                        <div class="h-5 w-0.5 rounded bg-black/50"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-2 flex justify-between text-[12px] tabular-nums text-white/60">
                                <span>{{ fmt(st.trimStart) }}</span>
                                <span class="font-semibold text-white">Duração final: {{ fmt(outDuration) }}</span>
                                <span>{{ fmt(st.trimEnd) }}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 px-4">
                            <span class="mr-1 text-[13px] text-white/70">Velocidade</span>
                            <button v-for="s in SPEEDS" :key="s"
                                class="rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors"
                                :class="st.speed === s ? 'bg-white text-black' : 'bg-white/10 text-white'"
                                @click="setSpeed(s)">
                                {{ s }}x
                            </button>
                        </div>
                    </div>

                    <!-- Filtros -->
                    <div v-if="tab === 'filters'" class="flex flex-col gap-3">
                        <div class="no-scrollbar flex gap-3 overflow-x-auto px-4">
                            <button v-for="f in FILTERS" :key="f.id" class="flex w-[68px] shrink-0 flex-col items-center gap-1.5"
                                @click="setFilter(f.id)">
                                <div class="h-[88px] w-[68px] overflow-hidden rounded-lg bg-neutral-800 ring-2 transition-shadow"
                                    :class="st.filter === f.id ? 'ring-[#FE2C55]' : 'ring-transparent'">
                                    <img v-if="filterThumbs[f.id]" :src="filterThumbs[f.id]" alt=""
                                        class="h-full w-full object-cover" draggable="false" />
                                </div>
                                <span class="text-[12px]" :class="st.filter === f.id ? 'font-semibold text-white' : 'text-white/60'">
                                    {{ f.label }}
                                </span>
                            </button>
                        </div>
                        <label v-if="st.filter !== 'none'" class="flex items-center gap-3 px-4 text-[13px]">
                            <span class="w-20 shrink-0 text-white/70">Intensidade</span>
                            <input type="range" min="0" max="100" step="1" v-model.number="st.filterAmount"
                                class="w-full accent-[#FE2C55]" @pointerdown="pushHistory" />
                            <span class="w-8 text-right tabular-nums text-white/60">{{ st.filterAmount }}</span>
                        </label>
                    </div>

                    <!-- Ajustar -->
                    <div v-if="tab === 'adjust'" class="flex flex-col gap-3 px-4">
                        <label v-for="s in ADJUSTS" :key="s.key" class="flex items-center gap-3 text-[13px]">
                            <span class="w-20 shrink-0 text-white/70">{{ s.label }}</span>
                            <input type="range" :min="s.min" :max="s.max" step="1" v-model.number="st[s.key]"
                                class="w-full accent-[#FE2C55]" @pointerdown="pushHistory" />
                            <span class="w-9 text-right tabular-nums text-white/60">{{ st[s.key] - s.base }}</span>
                        </label>
                        <button class="self-start rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold active:bg-white/20"
                            @click="resetAdjust">
                            Repor ajustes
                        </button>
                    </div>

                    <!-- Texto -->
                    <div v-if="tab === 'text'" class="flex flex-col gap-3 px-4">
                        <button
                            class="flex items-center justify-center gap-2 rounded-lg bg-white/10 py-2.5 text-[14px] font-semibold active:bg-white/20"
                            @click="addText">
                            <Icon name="text" :size="18" /> Adicionar texto
                        </button>

                        <template v-if="selected && selected.kind === 'text'">
                            <textarea ref="textInputRef" v-model="selected.text" rows="2" maxlength="120"
                                placeholder="Escreve o teu texto"
                                class="w-full resize-none rounded-lg bg-white/10 px-3 py-2 text-[15px] text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/30"
                                @focus="onTextFocus"></textarea>

                            <div class="no-scrollbar flex gap-2.5 overflow-x-auto py-1">
                                <button v-for="c in COLORS" :key="c" class="h-8 w-8 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-[#161616]"
                                    :class="selected.color === c ? 'ring-white' : 'ring-transparent'"
                                    :style="{ background: c, boxShadow: c === '#000000' ? 'inset 0 0 0 1px rgba(255,255,255,.35)' : '' }"
                                    :aria-label="'Cor ' + c" @click="setOverlayProp('color', c)"></button>
                            </div>

                            <div class="flex gap-2">
                                <button v-for="b in TEXT_BGS" :key="b.id"
                                    class="rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors"
                                    :class="selected.bg === b.id ? 'bg-white text-black' : 'bg-white/10 text-white'"
                                    @click="setOverlayProp('bg', b.id)">
                                    {{ b.label }}
                                </button>
                            </div>

                            <label class="flex items-center gap-3 text-[13px]">
                                <span class="w-16 shrink-0 text-white/70">Tamanho</span>
                                <input type="range" min="16" max="120" step="1" v-model.number="selected.size"
                                    class="w-full accent-[#FE2C55]" @pointerdown="pushHistory" />
                            </label>
                            <label class="flex items-center gap-3 text-[13px]">
                                <span class="w-16 shrink-0 text-white/70">Rotação</span>
                                <input type="range" min="-180" max="180" step="1" v-model.number="selected.rot"
                                    class="w-full accent-[#FE2C55]" @pointerdown="pushHistory" />
                            </label>
                            <button class="flex items-center gap-2 self-start rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold text-[#ff8da1] active:bg-white/20"
                                @click="deleteSelected">
                                <Icon name="trash" :size="16" /> Remover texto
                            </button>
                        </template>
                        <p v-else class="text-[12px] text-white/50">Toca num texto no ecrã para o editar ou arrasta-o para o mover.</p>
                    </div>

                    <!-- Autocolantes -->
                    <div v-if="tab === 'stickers'" class="flex flex-col gap-3 px-4">
                        <div class="grid max-h-[132px] grid-cols-8 gap-1 overflow-y-auto">
                            <button v-for="e in EMOJIS" :key="e"
                                class="flex h-10 items-center justify-center rounded-lg text-[24px] active:bg-white/15"
                                @click="addSticker(e)">
                                {{ e }}
                            </button>
                        </div>
                        <template v-if="selected && selected.kind === 'sticker'">
                            <label class="flex items-center gap-3 text-[13px]">
                                <span class="w-16 shrink-0 text-white/70">Tamanho</span>
                                <input type="range" min="30" max="260" step="1" v-model.number="selected.size"
                                    class="w-full accent-[#FE2C55]" @pointerdown="pushHistory" />
                            </label>
                            <label class="flex items-center gap-3 text-[13px]">
                                <span class="w-16 shrink-0 text-white/70">Rotação</span>
                                <input type="range" min="-180" max="180" step="1" v-model.number="selected.rot"
                                    class="w-full accent-[#FE2C55]" @pointerdown="pushHistory" />
                            </label>
                            <button class="flex items-center gap-2 self-start rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold text-[#ff8da1] active:bg-white/20"
                                @click="deleteSelected">
                                <Icon name="trash" :size="16" /> Remover autocolante
                            </button>
                        </template>
                    </div>

                    <!-- Desenhar -->
                    <div v-if="tab === 'draw'" class="flex flex-col gap-3 px-4">
                        <div class="no-scrollbar flex gap-2.5 overflow-x-auto py-1">
                            <button v-for="c in COLORS" :key="c" class="h-8 w-8 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-[#161616]"
                                :class="brush.color === c ? 'ring-white' : 'ring-transparent'"
                                :style="{ background: c, boxShadow: c === '#000000' ? 'inset 0 0 0 1px rgba(255,255,255,.35)' : '' }"
                                :aria-label="'Cor ' + c" @click="brush.color = c"></button>
                        </div>
                        <label class="flex items-center gap-3 text-[13px]">
                            <span class="w-16 shrink-0 text-white/70">Espessura</span>
                            <input type="range" min="2" max="40" step="1" v-model.number="brush.size"
                                class="w-full accent-[#FE2C55]" />
                            <span class="h-6 w-6 shrink-0 rounded-full" :style="{ background: brush.color, transform: `scale(${0.25 + brush.size / 40 * 0.75})` }"></span>
                        </label>
                        <div class="flex items-center gap-2">
                            <button class="rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold active:bg-white/20 disabled:opacity-30"
                                :disabled="!st.strokes.length" @click="undoStroke">
                                Apagar último traço
                            </button>
                            <button class="rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold active:bg-white/20 disabled:opacity-30"
                                :disabled="!st.strokes.length" @click="clearStrokes">
                                Limpar tudo
                            </button>
                        </div>
                        <p class="text-[12px] text-white/50">Desenha diretamente sobre a imagem.</p>
                    </div>

                    <!-- Áudio -->
                    <div v-if="tab === 'audio' && isVideo" class="flex flex-col gap-4 px-4">
                        <button class="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3 text-[14px] font-semibold"
                            @click="toggleMute">
                            <span class="flex items-center gap-2">
                                <Icon name="audio" :size="20" /> Som original
                            </span>
                            <span class="relative h-6 w-11 rounded-full transition-colors" :class="st.mute ? 'bg-white/20' : 'bg-[#FE2C55]'">
                                <span class="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
                                    :class="st.mute ? 'left-0.5' : 'left-[22px]'"></span>
                            </span>
                        </button>
                        <label class="flex items-center gap-3 text-[13px]" :class="st.mute ? 'opacity-40' : ''">
                            <span class="w-16 shrink-0 text-white/70">Volume</span>
                            <input type="range" min="0" max="100" step="1" v-model.number="st.volume" :disabled="st.mute"
                                class="w-full accent-[#FE2C55]" @pointerdown="pushHistory" />
                            <span class="w-8 text-right tabular-nums text-white/60">{{ st.volume }}</span>
                        </label>
                    </div>
                </div>

                <!-- Separadores -->
                <div class="no-scrollbar flex overflow-x-auto border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
                    <button v-for="t in tabs" :key="t.id"
                        class="relative flex min-w-[72px] flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-colors"
                        :class="tab === t.id ? 'text-white' : 'text-white/50'" @click="tab = t.id">
                        <Icon :name="t.icon" :size="22" />
                        {{ t.label }}
                        <span v-if="tab === t.id" class="absolute inset-x-5 top-0 h-0.5 rounded-full bg-[#FE2C55]"></span>
                    </button>
                </div>
            </div>

            <!-- ───────── A processar ───────── -->
            <div v-if="saving" class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/85 px-8 text-center">
                <div class="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[#FE2C55]"></div>
                <p class="text-[16px] font-semibold">{{ isVideo && !isDefaultState ? 'A processar o vídeo…' : 'A aplicar edições…' }}</p>
                <template v-if="isVideo && !isDefaultState">
                    <div class="h-1.5 w-56 overflow-hidden rounded-full bg-white/15">
                        <div class="h-full rounded-full bg-[#FE2C55] transition-[width] duration-200"
                            :style="{ width: saveProgress + '%' }"></div>
                    </div>
                    <p class="text-[13px] text-white/60">{{ saveProgress }}% · mantém este ecrã aberto e ligado</p>
                    <button class="mt-2 rounded-md bg-white/10 px-4 py-2 text-[14px] font-semibold" @click="cancelExport = true">
                        Cancelar
                    </button>
                </template>
            </div>

            <!-- ───────── Confirmar saída ───────── -->
            <div v-if="confirmClose" class="absolute inset-0 z-20 flex items-end justify-center bg-black/70 sm:items-center">
                <div class="w-full max-w-sm rounded-t-2xl bg-[#1f1f1f] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-2xl">
                    <h2 class="text-[17px] font-bold">Descartar alterações?</h2>
                    <p class="mt-1 text-[14px] text-white/60">As edições feitas nesta sessão serão perdidas.</p>
                    <div class="mt-5 flex flex-col gap-2">
                        <button class="rounded-md bg-[#FE2C55] py-3 text-[15px] font-semibold" @click="emit('close')">
                            Descartar
                        </button>
                        <button class="rounded-md bg-white/10 py-3 text-[15px] font-semibold" @click="confirmClose = false">
                            Continuar a editar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick, h } from 'vue';

const props = defineProps({
    // { id, type: 'image'|'video', url, file, format, duration,
    //   originalUrl, originalFile, originalFormat, originalDuration, edit }
    media: { type: Object, required: true },
});
const emit = defineEmits(['close', 'save']);

const isVideo = props.media.type === 'video';

/* ═════════════ Ícones ═════════════ */
const ICONS = {
    close: 'M18 6 6 18M6 6l12 12',
    undo: 'M3 7v6h6M3 13a9 9 0 1 0 3-7.7L3 8',
    crop: 'M6 2v14a2 2 0 0 0 2 2h14M18 22V8a2 2 0 0 0-2-2H2',
    scissors: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12',
    filters: 'M9 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM15 9a6 6 0 1 0 0 12 6 6 0 0 0 0-12z',
    adjust: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
    text: 'M4 7V4h16v3M9 20h6M12 4v16',
    sticker: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01',
    draw: 'M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z',
    audio: 'M11 5 6 9H2v6h4l5 4zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14',
    rotate: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5',
    flip: 'M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3M12 20v2M12 14v2M12 8v2M12 2v2',
    play: 'M7 4l13 8-13 8z',
    pause: 'M6 4h4v16H6zM14 4h4v16h-4z',
    trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6',
};

const Icon = {
    props: { name: String, size: { type: Number, default: 24 }, fill: Boolean },
    setup(p) {
        return () =>
            h(
                'svg',
                {
                    viewBox: '0 0 24 24',
                    width: p.size,
                    height: p.size,
                    fill: p.fill ? 'currentColor' : 'none',
                    stroke: 'currentColor',
                    'stroke-width': 1.8,
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                    'aria-hidden': 'true',
                },
                [h('path', { d: ICONS[p.name] || '' })]
            );
    },
};

/* ═════════════ Constantes ═════════════ */
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Apple Color Emoji', 'Noto Color Emoji', sans-serif";

const ASPECTS = [
    { id: 'original', label: 'Original' },
    { id: '9:16', label: '9:16' },
    { id: '1:1', label: '1:1' },
    { id: '4:5', label: '4:5' },
    { id: '3:4', label: '3:4' },
    { id: '16:9', label: '16:9' },
];
const SPEEDS = [0.5, 1, 1.5, 2];
const COLORS = ['#ffffff', '#000000', '#FE2C55', '#FF9F0A', '#FFD60A', '#30D158', '#25F4EE', '#0A84FF', '#BF5AE0'];
const TEXT_BGS = [
    { id: 'none', label: 'Simples' },
    { id: 'box', label: 'Caixa' },
    { id: 'outline', label: 'Contorno' },
];
const ADJUSTS = [
    { key: 'brightness', label: 'Brilho', min: 50, max: 150, base: 100 },
    { key: 'contrast', label: 'Contraste', min: 50, max: 150, base: 100 },
    { key: 'saturation', label: 'Saturação', min: 0, max: 200, base: 100 },
    { key: 'warmth', label: 'Temperatura', min: -50, max: 50, base: 0 },
];
const EMOJIS = [
    '😀', '😂', '🥹', '😍', '😎', '🥳', '🤩', '😭', '😡', '🤔', '🙌', '👏',
    '👍', '🔥', '💯', '✨', '❤️', '💔', '💥', '🎉', '🎶', '⭐', '🌈', '☀️',
    '🌙', '⚡', '🍕', '🍔', '🍉', '☕', '🎂', '🍻', '⚽', '🏀', '🎮', '🚗',
    '✈️', '🏝️', '🌸', '🌹', '🐶', '🐱', '🦋', '👀', '💪', '🙏', '👑', '💎',
];

const NEUTRAL = { brightness: 1, contrast: 1, saturate: 1, sepia: 0, grayscale: 0, hue: 0, vignette: 0, warm: 0 };
const FILTERS = [
    { id: 'none', label: 'Normal', p: {} },
    { id: 'vivid', label: 'Vívido', p: { contrast: 1.12, saturate: 1.45, brightness: 1.03 } },
    { id: 'warm', label: 'Quente', p: { saturate: 1.15, sepia: 0.15, warm: 35, brightness: 1.03 } },
    { id: 'cool', label: 'Frio', p: { saturate: 1.05, warm: -35, contrast: 1.04 } },
    { id: 'mono', label: 'P&B', p: { grayscale: 1, contrast: 1.12 } },
    { id: 'noir', label: 'Noir', p: { grayscale: 1, contrast: 1.35, brightness: 0.9, vignette: 0.45 } },
    { id: 'vintage', label: 'Vintage', p: { sepia: 0.45, contrast: 0.92, saturate: 0.9, brightness: 1.05, vignette: 0.35 } },
    { id: 'fade', label: 'Suave', p: { contrast: 0.85, brightness: 1.1, saturate: 0.85 } },
    { id: 'drama', label: 'Drama', p: { contrast: 1.3, saturate: 1.2, brightness: 0.92, vignette: 0.4 } },
    { id: 'sunset', label: 'Pôr do sol', p: { saturate: 1.3, warm: 55, contrast: 1.05, hue: -10 } },
];

const defaultState = () => ({
    rotation: 0,
    flipH: false,
    aspect: 'original',
    zoom: 1,
    panX: 0,
    panY: 0,
    filter: 'none',
    filterAmount: 100,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    warmth: 0,
    overlays: [],
    strokes: [],
    trimStart: 0,
    trimEnd: 0,
    speed: 1,
    mute: false,
    volume: 100,
});

const CTX_FILTER = (() => {
    try {
        return 'filter' in document.createElement('canvas').getContext('2d');
    } catch {
        return false;
    }
})();

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (t) => {
    const s = Math.max(0, t || 0);
    const m = Math.floor(s / 60);
    const sec = s - m * 60;
    return `${m}:${sec.toFixed(1).padStart(4, '0')}`;
};

/* ═════════════ Motor de renderização (usado no preview e na exportação) ═════════════ */
const scratchCtx = document.createElement('canvas').getContext('2d');

function buildParams(s) {
    const f = FILTERS.find((x) => x.id === s.filter) || FILTERS[0];
    const k = clamp(s.filterAmount, 0, 100) / 100;
    const p = { ...NEUTRAL };
    for (const key in f.p) p[key] = NEUTRAL[key] + (f.p[key] - NEUTRAL[key]) * k;
    p.brightness *= s.brightness / 100;
    p.contrast *= s.contrast / 100;
    p.saturate *= s.saturation / 100;
    p.warm += s.warmth;
    return p;
}

const cssFilter = (p) =>
    `brightness(${p.brightness}) contrast(${p.contrast}) saturate(${p.saturate}) sepia(${p.sepia}) grayscale(${p.grayscale}) hue-rotate(${p.hue}deg)`;

function pixelFilter(ctx, W, H, p) {
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;
    const { brightness: b, contrast: c, saturate: s, sepia: sp, grayscale: g } = p;
    for (let i = 0; i < d.length; i += 4) {
        let r = d[i], gg = d[i + 1], bb = d[i + 2];
        if (g) {
            const l = 0.2126 * r + 0.7152 * gg + 0.0722 * bb;
            r += (l - r) * g; gg += (l - gg) * g; bb += (l - bb) * g;
        }
        if (sp) {
            const tr = 0.393 * r + 0.769 * gg + 0.189 * bb;
            const tg = 0.349 * r + 0.686 * gg + 0.168 * bb;
            const tb = 0.272 * r + 0.534 * gg + 0.131 * bb;
            r += (tr - r) * sp; gg += (tg - gg) * sp; bb += (tb - bb) * sp;
        }
        if (s !== 1) {
            const l = 0.2126 * r + 0.7152 * gg + 0.0722 * bb;
            r = l + (r - l) * s; gg = l + (gg - l) * s; bb = l + (bb - l) * s;
        }
        r = (r * b - 128) * c + 128;
        gg = (gg * b - 128) * c + 128;
        bb = (bb * b - 128) * c + 128;
        d[i] = r < 0 ? 0 : r > 255 ? 255 : r;
        d[i + 1] = gg < 0 ? 0 : gg > 255 ? 255 : gg;
        d[i + 2] = bb < 0 ? 0 : bb > 255 ? 255 : bb;
    }
    ctx.putImageData(img, 0, 0);
}

function coverGeometry(W, H, sw, sh, s) {
    const swap = s.rotation % 180 !== 0;
    const rw = swap ? sh : sw;
    const rh = swap ? sw : sh;
    const scale = Math.max(W / rw, H / rh) * s.zoom;
    return {
        scale,
        maxX: Math.max(0, (rw * scale - W) / 2),
        maxY: Math.max(0, (rh * scale - H) / 2),
    };
}

function drawSource(ctx, W, H, src, sw, sh, s) {
    const { scale, maxX, maxY } = coverGeometry(W, H, sw, sh, s);
    const p = buildParams(s);

    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    if (CTX_FILTER) ctx.filter = cssFilter(p);
    ctx.translate(W / 2 + s.panX * maxX, H / 2 + s.panY * maxY);
    ctx.scale(s.flipH ? -1 : 1, 1);
    ctx.rotate((s.rotation * Math.PI) / 180);
    ctx.drawImage(src, (-sw * scale) / 2, (-sh * scale) / 2, sw * scale, sh * scale);
    ctx.restore();

    if (!CTX_FILTER) {
        const needs = p.brightness !== 1 || p.contrast !== 1 || p.saturate !== 1 || p.sepia || p.grayscale;
        if (needs) pixelFilter(ctx, W, H, p);
    }

    if (p.warm) {
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = Math.min(Math.abs(p.warm) / 100, 1) * 0.6;
        ctx.fillStyle = p.warm > 0 ? '#ff9a3c' : '#3c8cff';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
    }

    if (p.vignette > 0) {
        const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.hypot(W, H) / 2);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(1, `rgba(0,0,0,${p.vignette})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
    }
}

function isLight(hex) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

function layoutOverlay(ctx, o, W) {
    const px = (o.size * W) / 360;
    ctx.font = `${o.kind === 'text' ? '700' : '400'} ${px}px ${FONT}`;
    if (o.kind === 'sticker') {
        const m = ctx.measureText(o.text);
        return { px, lines: [o.text], w: Math.max(m.width, px), h: px * 1.25, pad: 0 };
    }
    const lines = (o.text || ' ').split('\n');
    const pad = o.bg === 'box' ? px * 0.35 : px * 0.1;
    const wmax = Math.max(...lines.map((l) => ctx.measureText(l || ' ').width));
    return { px, lines, w: wmax + pad * 2, h: lines.length * px * 1.2 + pad * 2, pad };
}

function roundRectPath(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function drawOverlay(ctx, o, W, H, selected) {
    ctx.save();
    ctx.translate(o.x * W, o.y * H);
    ctx.rotate((o.rot * Math.PI) / 180);
    const L = layoutOverlay(ctx, o, W);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (o.kind === 'sticker') {
        ctx.fillText(o.text, 0, 0);
    } else {
        let textColor = o.color;
        if (o.bg === 'box') {
            ctx.fillStyle = o.color;
            roundRectPath(ctx, -L.w / 2, -L.h / 2, L.w, L.h, L.px * 0.3);
            ctx.fill();
            textColor = isLight(o.color) ? '#000000' : '#ffffff';
        }
        L.lines.forEach((line, i) => {
            const y = -L.h / 2 + L.pad + L.px * 1.2 * (i + 0.5);
            if (o.bg === 'outline') {
                ctx.lineJoin = 'round';
                ctx.lineWidth = L.px * 0.2;
                ctx.strokeStyle = isLight(o.color) ? '#000000' : '#ffffff';
                ctx.strokeText(line, 0, y);
            } else if (o.bg === 'none') {
                ctx.shadowColor = 'rgba(0,0,0,0.45)';
                ctx.shadowBlur = L.px * 0.18;
            }
            ctx.fillStyle = textColor;
            ctx.fillText(line, 0, y);
            ctx.shadowBlur = 0;
        });
    }

    if (selected) {
        const dpr = Math.max(1, W / 360);
        ctx.setLineDash([8 * dpr * 0.5, 6 * dpr * 0.5]);
        ctx.lineWidth = Math.max(1.5, dpr);
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.strokeRect(-L.w / 2 - 6, -L.h / 2 - 6, L.w + 12, L.h + 12);
    }
    ctx.restore();
}

function renderScene(ctx, W, H, src, sw, sh, s, opts = {}) {
    drawSource(ctx, W, H, src, sw, sh, s);

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const stroke of s.strokes) {
        if (!stroke.points.length) continue;
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = (stroke.width * W) / 360;
        const [fx, fy] = stroke.points[0];
        ctx.moveTo(fx * W, fy * H);
        if (stroke.points.length === 1) ctx.lineTo(fx * W + 0.01, fy * H);
        for (let i = 1; i < stroke.points.length; i++) ctx.lineTo(stroke.points[i][0] * W, stroke.points[i][1] * H);
        ctx.stroke();
    }
    ctx.restore();

    for (const o of s.overlays) drawOverlay(ctx, o, W, H, opts.selectedId === o.id);
}

/* ═════════════ Estado ═════════════ */
const st = reactive(
    Object.assign(defaultState(), props.media.edit ? JSON.parse(JSON.stringify(props.media.edit)) : {})
);
const history = ref([]);
const selectedId = ref(null);
const tab = ref(isVideo ? 'trim' : 'crop');
const brush = reactive({ color: '#FE2C55', size: 8 });

const ready = ref(false);
const loadError = ref(false);
const saving = ref(false);
const saveProgress = ref(0);
const errorMsg = ref('');
const confirmClose = ref(false);
const playing = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const srcDims = reactive({ w: 0, h: 0 });
const filterThumbs = ref({});
const filmstrip = ref([]);
let initialJson = '';
let cancelExport = false;

const stageRef = ref(null);
const canvasRef = ref(null);
const videoEl = ref(null);
const trackRef = ref(null);
const textInputRef = ref(null);
const stageSize = reactive({ w: 0, h: 0 });
let imgEl = null;
let destroyed = false;

const tabs = computed(() => [
    { id: 'crop', label: 'Enquadrar', icon: 'crop' },
    ...(isVideo ? [{ id: 'trim', label: 'Cortar', icon: 'scissors' }] : []),
    { id: 'filters', label: 'Filtros', icon: 'filters' },
    { id: 'adjust', label: 'Ajustar', icon: 'adjust' },
    { id: 'text', label: 'Texto', icon: 'text' },
    { id: 'stickers', label: 'Autocolantes', icon: 'sticker' },
    { id: 'draw', label: 'Desenhar', icon: 'draw' },
    ...(isVideo ? [{ id: 'audio', label: 'Áudio', icon: 'audio' }] : []),
]);

const selected = computed(() => st.overlays.find((o) => o.id === selectedId.value) || null);
const rotatedDims = computed(() =>
    st.rotation % 180 !== 0 ? { w: srcDims.h, h: srcDims.w } : { w: srcDims.w, h: srcDims.h }
);
const frameAR = computed(() => {
    if (!srcDims.w || !srcDims.h) return 9 / 16;
    if (st.aspect === 'original') return rotatedDims.value.w / rotatedDims.value.h;
    const [a, b] = st.aspect.split(':').map(Number);
    return a / b;
});
const canvasSize = computed(() => {
    const { w, h } = stageSize;
    if (!w || !h) return { w: 0, h: 0 };
    let cw = w;
    let ch = w / frameAR.value;
    if (ch > h) {
        ch = h;
        cw = h * frameAR.value;
    }
    return { w: Math.floor(cw), h: Math.floor(ch) };
});

const startPct = computed(() => (duration.value ? (st.trimStart / duration.value) * 100 : 0));
const endPct = computed(() => (duration.value ? (st.trimEnd / duration.value) * 100 : 100));
const playPct = computed(() =>
    duration.value ? clamp((currentTime.value / duration.value) * 100, startPct.value, endPct.value) : 0
);
const outDuration = computed(() => (st.trimEnd - st.trimStart) / (st.speed || 1));

const baseJson = () => JSON.stringify({ ...defaultState(), trimEnd: isVideo ? duration.value : 0 });
const hasChanges = computed(() => ready.value && JSON.stringify(st) !== initialJson);
const isDefaultState = computed(() => ready.value && JSON.stringify(st) === baseJson());

/* ═════════════ Histórico ═════════════ */
function pushHistory() {
    history.value.push(JSON.stringify(st));
    if (history.value.length > 40) history.value.shift();
}
function undo() {
    const snap = history.value.pop();
    if (!snap) return;
    Object.assign(st, JSON.parse(snap));
    if (selectedId.value && !st.overlays.some((o) => o.id === selectedId.value)) selectedId.value = null;
    if (isVideo && videoEl.value) videoEl.value.playbackRate = st.speed;
}

/* ═════════════ Render ═════════════ */
let raf = 0;
let needsRender = false;
const getDpr = () => Math.min(window.devicePixelRatio || 1, 2);

function requestRender() {
    needsRender = true;
    if (!raf) raf = requestAnimationFrame(tick);
}

function tick() {
    raf = 0;
    if (destroyed) return;
    if (isVideo && playing.value && videoEl.value) {
        const v = videoEl.value;
        if (v.currentTime >= st.trimEnd - 0.03) v.currentTime = st.trimStart;
        currentTime.value = v.currentTime;
        needsRender = true;
    }
    if (needsRender) {
        needsRender = false;
        draw();
    }
    if (isVideo && playing.value) raf = requestAnimationFrame(tick);
}

function getSource() {
    return isVideo ? videoEl.value : imgEl;
}

function draw() {
    const c = canvasRef.value;
    const src = getSource();
    if (!c || !src || !ready.value || !c.width || !srcDims.w) return;
    if (isVideo && src.readyState < 2) return;
    renderScene(c.getContext('2d'), c.width, c.height, src, srcDims.w, srcDims.h, st, {
        selectedId: selectedId.value,
    });
}

function resizeCanvas() {
    const c = canvasRef.value;
    if (!c) return;
    const d = getDpr();
    const nw = Math.max(1, Math.round(canvasSize.value.w * d));
    const nh = Math.max(1, Math.round(canvasSize.value.h * d));
    if (c.width !== nw || c.height !== nh) {
        c.width = nw;
        c.height = nh;
    }
    requestRender();
}

watch(st, requestRender, { deep: true });
watch(selectedId, requestRender);
watch([canvasSize, ready], () => nextTick(resizeCanvas));
watch(tab, (t) => {
    if (t !== 'text' && t !== 'stickers') selectedId.value = null;
});
watch(
    () => [st.mute, st.volume, st.speed],
    () => applyAudioSettings()
);

function applyAudioSettings() {
    const v = videoEl.value;
    if (!v) return;
    v.muted = st.mute || st.volume === 0;
    v.volume = clamp(st.volume / 100, 0, 1);
    v.playbackRate = st.speed;
}

/* ═════════════ Carregamento ═════════════ */
function captureInitial() {
    initialJson = JSON.stringify(st);
}

function makeFilterThumbs() {
    const src = getSource();
    if (!src || !srcDims.w) return;
    const c = document.createElement('canvas');
    c.width = 72;
    c.height = 96;
    const cx = c.getContext('2d');
    const out = {};
    for (const f of FILTERS) {
        drawSource(cx, 72, 96, src, srcDims.w, srcDims.h, { ...defaultState(), aspect: '3:4', filter: f.id });
        out[f.id] = c.toDataURL('image/jpeg', 0.6);
    }
    filterThumbs.value = out;
}

function loadImage() {
    const img = new Image();
    img.onload = () => {
        imgEl = img;
        srcDims.w = img.naturalWidth;
        srcDims.h = img.naturalHeight;
        captureInitial();
        ready.value = true;
        makeFilterThumbs();
    };
    img.onerror = () => (loadError.value = true);
    img.src = props.media.originalUrl;
}

function onVideoMeta() {
    const v = videoEl.value;
    if (!v || !isFinite(v.duration) || !v.videoWidth) {
        loadError.value = true;
        return;
    }
    duration.value = v.duration;
    srcDims.w = v.videoWidth;
    srcDims.h = v.videoHeight;
    if (!st.trimEnd || st.trimEnd > v.duration) st.trimEnd = v.duration;
    if (st.trimStart >= st.trimEnd) st.trimStart = 0;
    captureInitial();
    v.currentTime = st.trimStart;
    applyAudioSettings();
    buildFilmstrip();
}

let firstFrame = true;
function onVideoData() {
    const v = videoEl.value;
    if (!v || ready.value) return;
    ready.value = true;
    nextTick(() => {
        resizeCanvas();
        makeFilterThumbs();
        v.play().catch(() => {});
    });
}

function onSeeked() {
    if (videoEl.value) currentTime.value = videoEl.value.currentTime;
    requestRender();
    if (firstFrame && ready.value) {
        firstFrame = false;
        makeFilterThumbs();
    }
}

function onEnded() {
    const v = videoEl.value;
    if (!v) return;
    v.currentTime = st.trimStart;
    v.play().catch(() => {});
}

const once = (el, evt, ms = 3000) =>
    new Promise((resolve, reject) => {
        const t = setTimeout(() => {
            el.removeEventListener(evt, ok);
            reject(new Error('timeout'));
        }, ms);
        const ok = () => {
            clearTimeout(t);
            resolve();
        };
        el.addEventListener(evt, ok, { once: true });
    });

async function buildFilmstrip() {
    const N = 8;
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.src = props.media.originalUrl;
    try {
        await once(v, 'loadeddata', 4000);
    } catch {
        return;
    }
    const W = 54, H = 72;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const cx = c.getContext('2d');
    const arr = [];
    for (let i = 0; i < N; i++) {
        if (destroyed) break;
        v.currentTime = Math.min(Math.max(duration.value - 0.05, 0), ((i + 0.5) * duration.value) / N);
        try {
            await once(v, 'seeked', 2500);
        } catch {
            /* usa o último frame disponível */
        }
        const vw = v.videoWidth || 1, vh = v.videoHeight || 1;
        const s = Math.max(W / vw, H / vh);
        cx.drawImage(v, (W - vw * s) / 2, (H - vh * s) / 2, vw * s, vh * s);
        arr.push(c.toDataURL('image/jpeg', 0.5));
        filmstrip.value = [...arr];
    }
    v.removeAttribute('src');
    v.load();
}

/* ═════════════ Ações das ferramentas ═════════════ */
function setAspect(id) {
    if (st.aspect === id) return;
    pushHistory();
    st.aspect = id;
    st.panX = 0;
    st.panY = 0;
}
function rotate() {
    pushHistory();
    st.rotation = (st.rotation + (st.flipH ? 270 : 90)) % 360;
    st.panX = 0;
    st.panY = 0;
}
function flip() {
    pushHistory();
    st.flipH = !st.flipH;
}
function setFilter(id) {
    if (st.filter === id) return;
    pushHistory();
    st.filter = id;
    st.filterAmount = 100;
}
function resetAdjust() {
    pushHistory();
    st.brightness = 100;
    st.contrast = 100;
    st.saturation = 100;
    st.warmth = 0;
}
function setSpeed(s) {
    if (st.speed === s) return;
    pushHistory();
    st.speed = s;
}
function toggleMute() {
    pushHistory();
    st.mute = !st.mute;
}

function addText() {
    pushHistory();
    const o = { id: uid(), kind: 'text', text: 'Texto', color: '#ffffff', bg: 'none', size: 40, rot: 0, x: 0.5, y: 0.5 };
    st.overlays.push(o);
    selectedId.value = o.id;
    nextTick(() => textInputRef.value?.focus());
}
function addSticker(emoji) {
    pushHistory();
    const o = { id: uid(), kind: 'sticker', text: emoji, color: '#ffffff', bg: 'none', size: 90, rot: 0, x: 0.5, y: 0.5 };
    st.overlays.push(o);
    selectedId.value = o.id;
}
function setOverlayProp(key, value) {
    if (!selected.value) return;
    pushHistory();
    selected.value[key] = value;
}
function deleteSelected() {
    if (!selected.value) return;
    pushHistory();
    const id = selected.value.id;
    st.overlays = st.overlays.filter((o) => o.id !== id);
    selectedId.value = null;
}
function onTextFocus(e) {
    pushHistory();
    if (e.target.value === 'Texto') e.target.select();
}
function undoStroke() {
    if (!st.strokes.length) return;
    pushHistory();
    st.strokes.pop();
}
function clearStrokes() {
    if (!st.strokes.length) return;
    pushHistory();
    st.strokes = [];
}

/* ═════════════ Vídeo: reprodução e corte ═════════════ */
function togglePlay() {
    const v = videoEl.value;
    if (!v) return;
    if (v.paused) {
        if (v.currentTime < st.trimStart || v.currentTime >= st.trimEnd - 0.05) v.currentTime = st.trimStart;
        v.play().catch(() => {});
        requestRender();
    } else {
        v.pause();
    }
}

let handleDrag = null;
function timeFromEvent(e) {
    const r = trackRef.value.getBoundingClientRect();
    return clamp((e.clientX - r.left) / r.width, 0, 1) * duration.value;
}
function onHandleDown(which, e) {
    pushHistory();
    handleDrag = which;
    videoEl.value?.pause();
    e.currentTarget.setPointerCapture?.(e.pointerId);
}
function onHandleMove(e) {
    if (!handleDrag || !trackRef.value) return;
    const t = timeFromEvent(e);
    const minGap = Math.min(1, duration.value / 2);
    if (handleDrag === 'start') {
        st.trimStart = clamp(t, 0, st.trimEnd - minGap);
        videoEl.value.currentTime = st.trimStart;
    } else {
        st.trimEnd = clamp(t, st.trimStart + minGap, duration.value);
        videoEl.value.currentTime = Math.max(st.trimStart, st.trimEnd - 0.1);
    }
}
function onHandleUp() {
    handleDrag = null;
}
function onTrackDown(e) {
    if (!trackRef.value || !videoEl.value) return;
    const t = clamp(timeFromEvent(e), st.trimStart, st.trimEnd);
    videoEl.value.currentTime = t;
}

/* ═════════════ Interação no canvas ═════════════ */
let drag = null;

function toNorm(e) {
    const r = canvasRef.value.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, r };
}

function hitTest(nx, ny) {
    const c = canvasRef.value;
    const W = c.width, H = c.height;
    const X = nx * W, Y = ny * H;
    const pad = 12 * getDpr();
    for (let i = st.overlays.length - 1; i >= 0; i--) {
        const o = st.overlays[i];
        const L = layoutOverlay(scratchCtx, o, W);
        const dx = X - o.x * W, dy = Y - o.y * H;
        const a = (-o.rot * Math.PI) / 180;
        const lx = dx * Math.cos(a) - dy * Math.sin(a);
        const ly = dx * Math.sin(a) + dy * Math.cos(a);
        if (Math.abs(lx) <= L.w / 2 + pad && Math.abs(ly) <= L.h / 2 + pad) return o;
    }
    return null;
}

function onPointerDown(e) {
    if (!ready.value || saving.value) return;
    canvasRef.value.setPointerCapture?.(e.pointerId);
    const { x, y } = toNorm(e);

    if (tab.value === 'draw') {
        pushHistory();
        st.strokes.push({ color: brush.color, width: brush.size, points: [[x, y]] });
        drag = { mode: 'draw', stroke: st.strokes[st.strokes.length - 1] };
        return;
    }
    if (tab.value === 'crop') {
        drag = { mode: 'pan', sx: e.clientX, sy: e.clientY, panX: st.panX, panY: st.panY, pushed: false };
        return;
    }
    const hit = hitTest(x, y);
    if (hit) {
        selectedId.value = hit.id;
        if (tab.value === 'text' || tab.value === 'stickers') tab.value = hit.kind === 'text' ? 'text' : 'stickers';
        drag = { mode: 'move', id: hit.id, dx: x - hit.x, dy: y - hit.y, pushed: false };
    } else {
        selectedId.value = null;
    }
}

function onPointerMove(e) {
    if (!drag) return;
    const { x, y, r } = toNorm(e);

    if (drag.mode === 'draw') {
        drag.stroke.points.push([clamp(x, 0, 1), clamp(y, 0, 1)]);
    } else if (drag.mode === 'move') {
        const o = st.overlays.find((v) => v.id === drag.id);
        if (!o) return;
        if (!drag.pushed) {
            pushHistory();
            drag.pushed = true;
        }
        o.x = clamp(x - drag.dx, 0, 1);
        o.y = clamp(y - drag.dy, 0, 1);
    } else if (drag.mode === 'pan') {
        const c = canvasRef.value;
        const { maxX, maxY } = coverGeometry(c.width, c.height, srcDims.w, srcDims.h, st);
        const k = c.width / r.width;
        if (!drag.pushed && (Math.abs(e.clientX - drag.sx) > 2 || Math.abs(e.clientY - drag.sy) > 2)) {
            pushHistory();
            drag.pushed = true;
        }
        if (maxX > 0.5) st.panX = clamp(drag.panX + ((e.clientX - drag.sx) * k) / maxX, -1, 1);
        if (maxY > 0.5) st.panY = clamp(drag.panY + ((e.clientY - drag.sy) * k) / maxY, -1, 1);
    }
}

function onPointerUp(e) {
    canvasRef.value?.releasePointerCapture?.(e.pointerId);
    drag = null;
}

/* ═════════════ Guardar / exportar ═════════════ */
function snapshot() {
    return JSON.parse(JSON.stringify(st));
}

function originalResult() {
    return {
        file: props.media.originalFile,
        url: props.media.originalUrl,
        format: props.media.originalFormat,
        duration: props.media.originalDuration,
        edit: null,
    };
}

async function exportImage() {
    const ar = frameAR.value;
    const maxLong = Math.min(2048, Math.max(srcDims.w, srcDims.h));
    let W, H;
    if (ar >= 1) {
        W = maxLong;
        H = Math.round(W / ar);
    } else {
        H = maxLong;
        W = Math.round(H * ar);
    }
    const c = document.createElement('canvas');
    c.width = Math.max(2, W);
    c.height = Math.max(2, H);
    renderScene(c.getContext('2d'), c.width, c.height, imgEl, srcDims.w, srcDims.h, st, {});
    const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.92));
    if (!blob) throw new Error('Não foi possível gerar a imagem editada.');
    const file = new File([blob], `${props.media.id}-editada.jpg`, { type: 'image/jpeg' });
    return { file, url: URL.createObjectURL(file), format: 'jpeg', duration: undefined, edit: snapshot() };
}

async function exportVideo() {
    if (typeof window.MediaRecorder === 'undefined') {
        throw new Error('O teu navegador não suporta a exportação de vídeo editado.');
    }
    const mimes = [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
    ];
    const mime = mimes.find((t) => MediaRecorder.isTypeSupported?.(t));
    if (!mime) throw new Error('O teu navegador não suporta a exportação de vídeo editado.');

    videoEl.value?.pause();
    cancelExport = false;

    const ar = frameAR.value;
    const maxLong = Math.min(1280, Math.max(srcDims.w, srcDims.h));
    let W, H;
    if (ar >= 1) {
        W = maxLong;
        H = Math.round(W / ar);
    } else {
        H = maxLong;
        W = Math.round(H * ar);
    }
    W = Math.max(2, Math.round(W / 2) * 2);
    H = Math.max(2, Math.round(H / 2) * 2);

    const start = st.trimStart;
    const end = st.trimEnd;

    // Criado de forma síncrona (ainda dentro do gesto do utilizador) para o áudio funcionar.
    let audioCtx = null;
    const v = document.createElement('video');
    v.playsInline = true;
    v.preload = 'auto';
    v.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0.01;pointer-events:none';
    document.body.appendChild(v);

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(30);

    if (!st.mute && st.volume > 0) {
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AC();
            audioCtx.resume?.();
            const node = audioCtx.createMediaElementSource(v);
            const gain = audioCtx.createGain();
            gain.gain.value = st.volume / 100;
            const dest = audioCtx.createMediaStreamDestination();
            node.connect(gain);
            gain.connect(dest); // não liga às colunas: exporta sem tocar o som
            dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
        } catch {
            audioCtx = null;
        }
    }

    let recorder = null;
    const cleanup = () => {
        try {
            if (recorder && recorder.state !== 'inactive') recorder.stop();
        } catch { /* ignora */ }
        stream.getTracks().forEach((t) => t.stop());
        v.pause();
        v.removeAttribute('src');
        v.load();
        v.remove();
        audioCtx?.close?.().catch(() => {});
    };

    try {
        v.src = props.media.originalUrl;
        await once(v, 'loadedmetadata', 8000);

        if (Math.abs(v.currentTime - start) > 0.01) {
            v.currentTime = start;
            await once(v, 'seeked', 5000).catch(() => {});
        }

        renderScene(ctx, W, H, v, srcDims.w, srcDims.h, st, {});

        recorder = new MediaRecorder(stream, {
            mimeType: mime,
            videoBitsPerSecond: 5_000_000,
            audioBitsPerSecond: 128_000,
        });
        const chunks = [];
        recorder.ondataavailable = (e) => {
            if (e.data && e.data.size) chunks.push(e.data);
        };
        const stopped = new Promise((res) => (recorder.onstop = res));

        v.playbackRate = st.speed;
        recorder.start();
        try {
            await v.play();
        } catch {
            v.muted = true;
            await v.play();
        }

        await new Promise((resolve, reject) => {
            const t0 = performance.now();
            const limit = ((end - start) / st.speed) * 1000 + 20000;
            const step = () => {
                if (cancelExport) return reject(new Error('cancelled'));
                renderScene(ctx, W, H, v, srcDims.w, srcDims.h, st, {});
                saveProgress.value = Math.round(clamp((v.currentTime - start) / (end - start), 0, 1) * 100);
                if (v.currentTime >= end - 0.04 || v.ended || performance.now() - t0 > limit) return resolve();
                requestAnimationFrame(step);
            };
            step();
        });

        v.pause();
        if (recorder.state !== 'inactive') recorder.stop();
        await stopped;

        const type = mime.split(';')[0];
        const ext = type.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(chunks, { type });
        if (!blob.size) throw new Error('Não foi possível gerar o vídeo editado.');
        const file = new File([blob], `${props.media.id}-editado.${ext}`, { type });
        return {
            file,
            url: URL.createObjectURL(file),
            format: ext,
            duration: (end - start) / st.speed,
            edit: snapshot(),
        };
    } finally {
        cleanup();
    }
}

async function handleDone() {
    if (!ready.value || saving.value) return;
    if (!hasChanges.value) {
        emit('close');
        return;
    }
    saving.value = true;
    saveProgress.value = 0;
    errorMsg.value = '';
    try {
        let result;
        if (isDefaultState.value) result = originalResult();
        else result = isVideo ? await exportVideo() : await exportImage();
        emit('save', props.media.id, result);
    } catch (err) {
        if (err?.message !== 'cancelled') {
            errorMsg.value = err?.message || 'Não foi possível processar a edição. Tenta novamente.';
        }
    } finally {
        saving.value = false;
        cancelExport = false;
    }
}

function requestClose() {
    if (saving.value) return;
    if (hasChanges.value) confirmClose.value = true;
    else emit('close');
}
defineExpose({ requestClose });

/* ═════════════ Ciclo de vida ═════════════ */
let ro = null;
let prevOverflow = '';

onMounted(() => {
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    ro = new ResizeObserver((entries) => {
        const r = entries[0].contentRect;
        stageSize.w = Math.floor(r.width);
        stageSize.h = Math.floor(r.height);
    });
    if (stageRef.value) ro.observe(stageRef.value);

    if (!isVideo) loadImage();
});

onBeforeUnmount(() => {
    destroyed = true;
    cancelExport = true;
    ro?.disconnect();
    if (raf) cancelAnimationFrame(raf);
    document.body.style.overflow = prevOverflow;
    videoEl.value?.pause?.();
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>