import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css';
import App from './App.vue'
import { createLogger } from "vue-logger-plugin";

const app = createApp(App);
const pinia = createPinia()

// Logger
const logger = createLogger({
  enabled: true,
  level: 'debug'
})

app.use(pinia);
app.use(logger);
app.mount('#app');