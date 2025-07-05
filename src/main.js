import './assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './vuex/store'; // Importe o store separado
import '@mdi/font/css/materialdesignicons.min.css';
import VueAxios from 'vue-axios';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import VueTheMask from 'vue-the-mask';

const app = createApp(App);

// Configuração do Axios
axios.defaults.baseURL = 'http://localhost:8000/api';
app.use(VueAxios, axios);
app.config.globalProperties.$axios = axios;

app.use(router);
app.use(store); // Use o store importado

app.mount('#app');
app.use(VueTheMask);