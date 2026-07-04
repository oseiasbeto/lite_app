import { ref, onMounted, onUnmounted } from 'vue'

// URLs leves e confiáveis só pra testar se existe internet de fato
// (não dependem do seu backend estar de pé)
const CHECK_URLS = [
    'https://www.gstatic.com/generate_204',
    'https://cloudflare.com/cdn-cgi/trace',
]

const CHECK_INTERVAL_ONLINE = 30000  // 30s quando está tudo ok
const CHECK_INTERVAL_OFFLINE = 5000  // 5s quando offline, tenta reconectar mais rápido
const REQUEST_TIMEOUT = 5000
const FAILURES_TO_CONFIRM_OFFLINE = 2 // evita falso positivo de uma falha isolada de rede

export function useNetworkStatus() {
    const isOnline = ref(navigator.onLine)
    const isChecking = ref(false)

    let failCount = 0
    let intervalId = null
    let currentIntervalMs = CHECK_INTERVAL_ONLINE

    const pingOnce = async (url) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

        try {
            // no-cors: não conseguimos ler o status, mas se o fetch resolver
            // (sem lançar erro de rede) é sinal de que existe conectividade real
            await fetch(url, {
                mode: 'no-cors',
                cache: 'no-store',
                signal: controller.signal
            })
            return true
        } catch {
            return false
        } finally {
            clearTimeout(timeoutId)
        }
    }

    const setCheckInterval = (ms) => {
        if (currentIntervalMs === ms && intervalId) return
        currentIntervalMs = ms
        if (intervalId) clearInterval(intervalId)
        intervalId = setInterval(checkConnectivity, ms)
    }

    const checkConnectivity = async () => {
        if (isChecking.value) return
        isChecking.value = true

        const results = await Promise.all(CHECK_URLS.map(pingOnce))
        const hasConnection = results.some(Boolean)

        if (hasConnection) {
            failCount = 0
            isOnline.value = true
            setCheckInterval(CHECK_INTERVAL_ONLINE)
        } else {
            failCount++
            if (failCount >= FAILURES_TO_CONFIRM_OFFLINE) {
                isOnline.value = false
                setCheckInterval(CHECK_INTERVAL_OFFLINE)
            }
        }

        isChecking.value = false
    }

    const handleBrowserOnline = () => {
        // sinal rápido do browser, mas SEMPRE confirma com ping real
        // antes de assumir que voltou (evita falso positivo de dados móveis sem internet)
        checkConnectivity()
    }

    const handleBrowserOffline = () => {
        // interface de rede caiu de fato — esse evento é confiável pra "offline"
        failCount = FAILURES_TO_CONFIRM_OFFLINE
        isOnline.value = false
        setCheckInterval(CHECK_INTERVAL_OFFLINE)
    }

    onMounted(() => {
        window.addEventListener('online', handleBrowserOnline)
        window.addEventListener('offline', handleBrowserOffline)

        checkConnectivity()
        intervalId = setInterval(checkConnectivity, currentIntervalMs)
    })

    onUnmounted(() => {
        window.removeEventListener('online', handleBrowserOnline)
        window.removeEventListener('offline', handleBrowserOffline)
        if (intervalId) clearInterval(intervalId)
    })

    return {
        isOnline,
        checkConnectivity // exposto pra permitir forçar um recheck manual (ex: pull-to-refresh)
    }
}