import { createApp } from 'vue';
import { setupPrimeVue } from '@/plugins/primevue';
import '@/style.css';
import App from '@/App.vue';
import router from '@/router';

const app = createApp(App);
app.use(router);
setupPrimeVue(app);
app.mount('#app');