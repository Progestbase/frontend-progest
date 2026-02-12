/**
 * Funções para gerenciamento de relatórios
 * Padrão: POST /relatorios/{recurso}/list com filtros e paginação
 */

/**
 * Lista todas as entradas para o relatório
 * @param {Object} content - Contexto do componente Vue (this)
 * @param {Object} filters - Filtros opcionais (date_from, date_to, setor_id, fornecedor_id)
 * @param {Number} perPage - Itens por página (padrão 50)
 * @param {Number} page - Número da página (padrão 1)
 */
var listEntradasReport = (content, filters = {}, perPage = 50, page = 1) => {
  console.log("📊 Carregando relatório de entradas: POST /relatorios/entradas/list");

  const payload = {
    filters: {
      ...filters,
    },
    per_page: perPage,
    page: page,
  };

  console.log("📋 Payload:", payload);

  return content.$axios
    .post("/relatorios/entradas/list", payload, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      console.log("✅ Resposta da API - Relatório Entradas:", response.data);

      if (response.data && response.data.status) {
        // Normalizar resposta: backend pode retornar data.data ou data diretamente
        const paginatedData = response.data.data;
        const entradas = Array.isArray(paginatedData)
          ? paginatedData
          : (paginatedData?.data || []);

        console.log(
          `📊 Entradas encontradas: ${entradas.length} de ${
            paginatedData?.total || entradas.length
          } total`
        );

        // Commit no Vuex store
        content.$store.commit("setRelatorioEntradas", entradas);
        
        return { 
          success: true, 
          data: entradas,
          pagination: {
            total: paginatedData?.total || entradas.length,
            per_page: paginatedData?.per_page || perPage,
            current_page: paginatedData?.current_page || page,
            last_page: paginatedData?.last_page || 1,
          }
        };
      } else {
        console.warn("⚠️ Resposta da API sem dados válidos:", response.data);
        content.$store.commit("setRelatorioEntradas", []);
        return { success: false, data: [], error: response.data.message };
      }
    })
    .catch((error) => {
      console.error("❌ Erro ao carregar relatório de entradas:", error);
      console.error("Resposta de erro:", error.response?.data);

      // Notificação de erro
      try {
        if (content.$toastr && content.$toastr.e) {
          const mensagem =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Erro ao carregar relatório de entradas";
          content.$toastr.e(mensagem);
        }
      } catch (e) {
        console.warn("Erro ao exibir notificação:", e);
      }

      content.$store.commit("setRelatorioEntradas", []);
      return { success: false, data: [], error };
    });
};

/**
 * Lista todas as movimentações para o relatório
 * @param {Object} content - Contexto do componente Vue (this)
 * @param {Object} filters - Filtros opcionais (date_from, date_to, tipo, setor_origem_id, setor_destino_id)
 * @param {Number} perPage - Itens por página (padrão 50)
 * @param {Number} page - Número da página (padrão 1)
 */
var listMovimentacoesReport = (content, filters = {}, perPage = 50, page = 1) => {
  console.log("📊 Carregando relatório de movimentações: POST /relatorios/movimentacoes/list");

  const payload = {
    filters: {
      ...filters,
    },
    per_page: perPage,
    page: page,
  };

  console.log("📋 Payload:", payload);

  return content.$axios
    .post("/relatorios/movimentacoes/list", payload, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      console.log("✅ Resposta da API - Relatório Movimentações:", response.data);

      if (response.data && response.data.status) {
        // Normalizar resposta
        const paginatedData = response.data.data;
        const movimentacoes = Array.isArray(paginatedData)
          ? paginatedData
          : (paginatedData?.data || []);

        console.log(
          `📊 Movimentações encontradas: ${movimentacoes.length} de ${
            paginatedData?.total || movimentacoes.length
          } total`
        );

        // Commit no Vuex store
        content.$store.commit("setRelatorioMovimentacoes", movimentacoes);
        
        return { 
          success: true, 
          data: movimentacoes,
          pagination: {
            total: paginatedData?.total || movimentacoes.length,
            per_page: paginatedData?.per_page || perPage,
            current_page: paginatedData?.current_page || page,
            last_page: paginatedData?.last_page || 1,
          }
        };
      } else {
        console.warn("⚠️ Resposta da API sem dados válidos:", response.data);
        content.$store.commit("setRelatorioMovimentacoes", []);
        return { success: false, data: [], error: response.data.message };
      }
    })
    .catch((error) => {
      console.error("❌ Erro ao carregar relatório de movimentações:", error);
      console.error("Resposta de erro:", error.response?.data);

      // Notificação de erro
      try {
        if (content.$toastr && content.$toastr.e) {
          const mensagem =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Erro ao carregar relatório de movimentações";
          content.$toastr.e(mensagem);
        }
      } catch (e) {
        console.warn("Erro ao exibir notificação:", e);
      }

      content.$store.commit("setRelatorioMovimentacoes", []);
      return { success: false, data: [], error };
    });
};

/**
 * Lista todas as saídas para o relatório
 * @param {Object} content - Contexto do componente Vue (this)
 * @param {Object} filters - Filtros opcionais (date_from, date_to, setor_id, fornecedor_id)
 * @param {Number} perPage - Itens por página (padrão 50)
 * @param {Number} page - Número da página (padrão 1)
 */
var listSaidasReport = (content, filters = {}, perPage = 50, page = 1) => {
  console.log("📊 Carregando relatório de saídas: POST /relatorios/saidas/list");

  const payload = {
    filters: {
      ...filters,
    },
    per_page: perPage,
    page: page,
  };

  console.log("📋 Payload:", payload);

  return content.$axios
    .post("/relatorios/saidas/list", payload, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      console.log("✅ Resposta da API - Relatório Saídas:", response.data);

      if (response.data && response.data.status) {
        // Normalizar resposta: backend pode retornar data.data ou data diretamente
        const paginatedData = response.data.data;
        const saidas = Array.isArray(paginatedData)
          ? paginatedData
          : (paginatedData?.data || []);

        console.log(
          `📊 Saídas encontradas: ${saidas.length} de ${
            paginatedData?.total || saidas.length
          } total`
        );

        // Commit no Vuex store
        content.$store.commit("setRelatorioSaidas", saidas);
        
        return { 
          success: true, 
          data: saidas,
          pagination: {
            total: paginatedData?.total || saidas.length,
            per_page: paginatedData?.per_page || perPage,
            current_page: paginatedData?.current_page || page,
            last_page: paginatedData?.last_page || 1,
          }
        };
      } else {
        console.warn("⚠️ Resposta da API sem dados válidos:", response.data);
        content.$store.commit("setRelatorioSaidas", []);
        return { success: false, data: [], error: response.data.message };
      }
    })
    .catch((error) => {
      console.error("❌ Erro ao carregar relatório de saídas:", error);
      console.error("Resposta de erro:", error.response?.data);

      // Notificação de erro
      try {
        if (content.$toastr && content.$toastr.e) {
          const mensagem =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Erro ao carregar relatório de saídas";
          content.$toastr.e(mensagem);
        }
      } catch (e) {
        console.warn("Erro ao exibir notificação:", e);
      }

      content.$store.commit("setRelatorioSaidas", []);
      return { success: false, data: [], error };
    });
};

/**
 * Exporta o módulo com os métodos públicos
 */
export default {
  listEntradasReport,
  listMovimentacoesReport,
  listSaidasReport,
};
