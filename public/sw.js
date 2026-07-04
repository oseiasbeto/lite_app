const CACHE_NAME = 'app-shell-v10'
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            try {
                const response = await fetch(OFFLINE_URL, { cache: 'no-store' })
                if (response.ok) {
                    await cache.put(OFFLINE_URL, response)
                    console.log('[SW] offline.html cacheado com sucesso')
                } else {
                    console.error('[SW] offline.html respondeu com status', response.status)
                }
            } catch (err) {
                console.error('[SW] Falha ao buscar offline.html:', err.message)
            }
        })
    )
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        )
    )
    self.clients.claim()
})

self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url)

    // só intercepta navegação (carregar uma página/rota), e só do mesmo domínio
    if (request.mode !== 'navigate' || url.origin !== self.location.origin) {
        return
    }

    event.respondWith(
        fetch(request).catch(async () => {
            // sem rede: serve a página offline diretamente
            const offlinePage = await caches.match(OFFLINE_URL)
            if (offlinePage) return offlinePage

            // se nem isso estiver em cache (não deveria acontecer), fallback mínimo em texto puro
            return new Response(
                'Sem conexão com a internet.',
                { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
            )
        })
    )
})