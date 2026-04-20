import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@/styles.css'; // ou o nome do teu arquivo

createApp(App).use(router).mount('#app');
