import "./assets/main.css";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./vuex/store"; // Importe o store separado
import "@mdi/font/css/materialdesignicons.min.css";
import VueAxios from "vue-axios";
import axios from "axios";
import VueTheMask from "vue-the-mask";
import { initSetorContext } from "@/init/loadSetorData";
import { setorCookie } from "@/utils/setorCookie";
import { API_URL } from "@/config";
import { toast } from "@/components/ui/toast";
import { feedback } from "@/components/ui/feedback-modal";

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
  },
);

// Interceptor de Resposta Global para tratar erros
axios.interceptors.response.use(
  function (response) {
    // Se o backend devolver sucesso (2xx), limpa erros de validação anteriores
    store.commit("setModalErrors", {});
    return response;
  },
  function (error) {
    // Se o backend devolver um erro (ex: 422, 403, 500), interceptamos aqui antes de chegar ao .catch()

    if (error.response && error.response.status === 422) {
      // 1. Tratamento Global para Erros de Validação do FormRequest (Laravel)
      // O Laravel pode enviar em 'erros' (nosso BaseFormRequest) ou 'errors' (padrão nativo)
      const mensagensDeErro = error.response.data.erros || error.response.data.errors;

      if (mensagensDeErro) {
        // Normalizar chaves: "user.name" → "name", "produto.nome" → "nome"
        const errosNormalizados = {};
        for (let campo in mensagensDeErro) {
          const chaveCurta = campo.includes(".") ? campo.split(".").pop() : campo;
          errosNormalizados[chaveCurta] = mensagensDeErro[campo];
        }

        // 1a. Armazenar erros no Vuex para exibição inline nos campos
        store.commit("setModalErrors", errosNormalizados);

        // 1b. Exibir modal de validação com a lista de erros
        feedback.validation(mensagensDeErro, "Corrija os seguintes campos:");
      } else if (error.response.data.message) {
        feedback.error(error.response.data.message);
      }

    } else if (error.response && error.response.status === 401) {
      // 2. Sessão Expirada (Token Inválido)
      feedback.warning("A sua sessão expirou. Por favor, faça login novamente.", "Sessão Expirada");
      // Aqui poderia adicionar: store.commit('clearAuth'); router.push('/login');

    } else if (error.response && error.response.data && error.response.data.message) {
      // 3. Outros erros enviados pelo backend
      feedback.error(error.response.data.message);

    } else {
      // 4. Erros de rede genéricos (servidor offline, etc)
      feedback.error("Ocorreu um erro de comunicação com o servidor.", "Erro de Conexão");
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
      console.warn("Erro no initSetorContext:", e),
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
      title: "Sucesso",
      description: mensagem,
      variant: "default", // Pode mudar para 'success' se tiver customizado
      duration: 4000,
    });
  },
  success: function (mensagem) {
    this.s(mensagem);
  },
  e: (mensagem) => {
    toast({
      title: "Erro",
      description: mensagem,
      variant: "destructive", // Geralmente usado para erros no Shadcn
      duration: 5000,
    });
  },
  error: function (mensagem) {
    this.e(mensagem);
  },
  // Opcional: warning ou info
  i: (mensagem) => {
    toast({
      title: "Informação",
      description: mensagem,
      variant: "default",
    });
  },
  info: function (mensagem) {
    this.i(mensagem);
  },
};

// Registrar $feedback como globalProperty para uso em componentes
app.config.globalProperties.$feedback = feedback;

app.mount("#app");
app.use(VueTheMask);
