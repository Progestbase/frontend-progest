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
import { API_URL } from "@/config";
import { toast } from '@/components/ui/toast'

const app = createApp(App);

// Configuração do Axios - usando variável de ambiente
axios.defaults.baseURL = API_URL;
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

// Interceptor de Resposta Global para tratar erros
axios.interceptors.response.use(
  function (response) {
    // Se o backend devolver sucesso (2xx), passa a resposta diretamente para o .then()
    return response;
  },
  function (error) {
    // Se o backend devolver um erro (ex: 422, 403, 500), interceptamos aqui antes de chegar ao .catch()
    
    if (error.response && error.response.status === 422) {
      // 1. Tratamento Global para Erros de Validação do FormRequest (Laravel)
      let errosFormatados = "Corrija os seguintes campos:\n\n";
      
      // O Laravel pode enviar em 'erros' (nosso BaseFormRequest) ou 'errors' (padrão nativo)
      const mensagensDeErro = error.response.data.erros || error.response.data.errors;
      
      if (mensagensDeErro) {
        for (let campo in mensagensDeErro) {
          errosFormatados += "• " + mensagensDeErro[campo][0] + "\n";
        }
        alert(errosFormatados); // Pode trocar por um Toast global no futuro!
      } else if (error.response.data.message) {
        alert(error.response.data.message);
      }
      
    } else if (error.response && error.response.status === 401) {
      // 2. Opcional: Tratamento Global para Sessão Expirada (Token Inválido)
      alert("A sua sessão expirou. Por favor, faça login novamente.");
      // Aqui poderia adicionar: store.commit('clearAuth'); router.push('/login');
      
    } else if (error.response && error.response.data && error.response.data.message) {
      // 3. Tratamento Global para outros erros enviados pelo backend
      alert("Erro: " + error.response.data.message);
      
    } else {
      // 4. Erros de rede genéricos (servidor offline, etc)
      alert("Ocorreu um erro de comunicação com o servidor.");
    }

    // Devolve o erro na mesma para que o ficheiro local possa parar o "loading", se necessário
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

// Isso ensina o sistema que quando chamarem "$toastr.s", ele deve exibir um Toast Verde (Sucesso)
// e quando chamarem "$toastr.e", ele deve exibir um Toast Vermelho (Erro/Destructive)
app.config.globalProperties.$toastr = {
  s: (mensagem) => {
    toast({
      title: 'Sucesso',
      description: mensagem,
      variant: 'default', // Pode mudar para 'success' se tiver customizado
      duration: 4000,
    })
  },
  e: (mensagem) => {
    toast({
      title: 'Erro',
      description: mensagem,
      variant: 'destructive', // Geralmente usado para erros no Shadcn
      duration: 5000,
    })
  },
  // Opcional: warning ou info
  i: (mensagem) => {
    toast({
      title: 'Informação',
      description: mensagem,
      variant: 'default',
    })
  }
}

app.mount('#app');
app.use(VueTheMask);
