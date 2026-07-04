import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import VueLazyload from 'vue-lazyload'
import router from './router'

import "vue3-toastify/dist/index.css"
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import './assets/tailwind.css'
import './assets/styles.css'

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((reg) => {
                console.log('Service Worker registrado:', reg.scope)
            })
            .catch((err) => {
                console.error('Falha ao registrar Service Worker:', err)
            })
    })
}

const app = createApp(App)

app.use(router)
app.use(VueLazyload)
app.use(store)

app.mount('#app')