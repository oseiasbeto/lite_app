<template>
    <span class="flip-number" aria-hidden="true">
        <TransitionGroup :name="direction" tag="span" class="flip-number__track">
            <span
                v-for="item in chars"
                :key="item.key"
                class="flip-number__digit"
            >{{ item.char }}</span>
        </TransitionGroup>
    </span>
    <span class="sr-only">{{ display }}</span>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import formattedCount from '@/utils/formatted-count'

const props = defineProps({
    value: {
        type: Number,
        default: 0
    }
})

// texto final que já é exibido hoje (ex: "1.2K", "834", "12,4M")
const display = computed(() => String(formattedCount(props.value)))

// cada caractere vira um "slot" com uma key própria.
// quando o caractere de um slot muda, a key muda junto,
// e o TransitionGroup entende isso como "saiu um / entrou outro"
// no mesmo lugar, disparando o efeito de flip só naquele dígito.
const chars = computed(() =>
    display.value.split('').map((char, index) => ({
        char,
        key: `${index}-${char}`
    }))
)

// direção do flip: sobe quando o valor aumenta, desce quando diminui
const direction = ref('flip-up')

watch(
    () => props.value,
    (newVal, oldVal) => {
        direction.value = newVal >= oldVal ? 'flip-up' : 'flip-down'
    }
)
</script>

<style scoped>
.flip-number {
    display: inline-block;
    overflow: hidden;
    line-height: 1;
    vertical-align: middle;
}

.flip-number__track {
    position: relative;
    display: inline-flex;
    align-items: center;
}

.flip-number__digit {
    display: inline-block;
    min-width: 0.58em;
    text-align: center;
    font-variant-numeric: tabular-nums;
    white-space: pre;
}

/* transições comuns */
.flip-up-enter-active,
.flip-up-leave-active,
.flip-down-enter-active,
.flip-down-leave-active {
    transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1),
        opacity 0.22s ease;
}

.flip-up-move,
.flip-down-move {
    transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* o item que está saindo fica absoluto para sobrepor o que está entrando */
.flip-up-leave-active,
.flip-down-leave-active {
    position: absolute;
}

/* contando pra cima: novo dígito sobe de baixo, antigo sai por cima */
.flip-up-enter-from {
    transform: translateY(65%);
    opacity: 0;
}
.flip-up-enter-to {
    transform: translateY(0);
    opacity: 1;
}
.flip-up-leave-from {
    transform: translateY(0);
    opacity: 1;
}
.flip-up-leave-to {
    transform: translateY(-65%);
    opacity: 0;
}

/* contando pra baixo: inverso */
.flip-down-enter-from {
    transform: translateY(-65%);
    opacity: 0;
}
.flip-down-enter-to {
    transform: translateY(0);
    opacity: 1;
}
.flip-down-leave-from {
    transform: translateY(0);
    opacity: 1;
}
.flip-down-leave-to {
    transform: translateY(65%);
    opacity: 0;
}

/* valor real, acessível pra leitor de tela, já que o visual é aria-hidden */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
</style>