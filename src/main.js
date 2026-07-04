import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import VueLazyload from 'vue-lazyload'
import router from './router'

import "vue3-toastify/dist/index.css"
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import './assets/tailwind.css'
import './assets/styles.css'

const app = createApp(App)

app.use(router)
app.use(VueLazyload)
app.use(store)

app.mount('#app')