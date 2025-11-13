import "./assets/main.css";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./vuex/store"; // Importe o store separado
import "@mdi/font/css/materialdesignicons.min.css";
import VueAxios from "vue-axios";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import VueTheMask from "vue-the-mask";
import { initSetorContext } from "@/init/loadSetorData";
import { setorCookie } from "@/utils/setorCookie";

const app = createApp(App);

// Configuração do Axios
axios.defaults.baseURL = "http://localhost:8000/api";
app.use(VueAxios, axios);
app.config.globalProperties.$axios = axios;

// Adiciona um interceptor para incluir o header Authorization automaticamente
// em todas as requests quando o usuário estiver logado (token no Vuex).
// Lemos o token do store no momento da requisição para refletir atualizações.
axios.interceptors.request.use(
  function (config) {
    try {
      const token = store.getters.getUserToken;
      if (token) {
        config.headers = config.headers || {};
        // Não sobrescrever se já definido explicitamente
        if (!config.headers.Authorization && token) {
          config.headers.Authorization = "Bearer " + token;
        }
        // Garantir content-type por padrão em requisições com payload
        if (
          !config.headers["Content-Type"] &&
          (config.method === "post" ||
            config.method === "put" ||
            config.method === "patch")
        ) {
          config.headers["Content-Type"] = "application/json";
        }
      }
    } catch (e) {
      // Não interrompe a requisição em caso de erro ao acessar o store
      console.warn("Erro ao anexar token Authorization:", e);
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

app.use(router);
app.use(store); // Use o store importado
// Inicializar dados do setor assim que possível (não bloqueante)
try {
  const token = store.getters.getUserToken;
  if (token && setorCookie.hasSector()) {
    // Chamar inicializador (async) — não aguardamos o término para não bloquear o mount
    initSetorContext({ axios, store }).catch((e) =>
      console.warn("Erro no initSetorContext:", e)
    );
  }
} catch (e) {
  console.warn("Erro ao tentar iniciar contexto do setor:", e);
}

app.mount("#app");
app.use(VueTheMask);
