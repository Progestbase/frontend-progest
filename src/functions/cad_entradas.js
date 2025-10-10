/**
 * Funções para gerenciamento de entradas de estoque
 */

/**
 * Lista todas as entradas de estoque
 * @param {Object} content - Contexto do componente Vue (this)
 * @param {Object} filters - Filtros opcionais (nota_fiscal, unidade_id, fornecedor_id)
 * @param {Number} perPage - Itens por página (padrão 15)
 * @param {Number} page - Número da página (padrão 1)
 */
var listAll = (content, filters = {}, perPage = 50, page = 1) => {
  console.log("Carregando entradas de estoque: POST /entrada/list");

  const payload = {
    filters: filters || {},
    per_page: perPage,
    page: page,
  };

  console.log("Payload:", payload);

  content.$axios
    .post("/entrada/list", payload, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      console.log("Resposta da API listAll entradas:", response.data);

      if (response.data && response.data.status) {
        // Laravel retorna paginação com estrutura: { data: { data: [...], total, per_page, ... } }
        const paginatedData = response.data.data;
        const entradas = paginatedData?.data || [];

        console.log(
          `Entradas encontradas: ${entradas.length} de ${
            paginatedData?.total || 0
          } total`
        );

        // Commit no Vuex store (só os items, não a paginação completa)
        content.$store.commit("setListEntradas", entradas);
      } else {
        console.warn("Resposta da API sem dados válidos:", response.data);
        content.$store.commit("setListEntradas", []);
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar entradas:", error);
      console.error("Resposta de erro:", error.response?.data);
      console.error("Status:", error.response?.status);

      if (content.$toastr && content.$toastr.e) {
        const mensagem =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Erro ao carregar entradas de estoque";
        content.$toastr.e(mensagem);
      }
      content.$store.commit("setListEntradas", []);
    });
};

/**
 * Lista entradas filtradas por unidade
 * @param {Object} content - Contexto do componente Vue (this)
 * @param {Number} unidadeId - ID da unidade para filtrar
 * @param {Number} perPage - Itens por página (padrão 50)
 * @param {Number} page - Número da página (padrão 1)
 */
var listByUnidade = (content, unidadeId, perPage = 50, page = 1) => {
  if (!unidadeId) {
    console.warn("listByUnidade: unidadeId não fornecido");
    return;
  }

  console.log(
    `Carregando entradas da unidade ${unidadeId}: POST /entrada/list`
  );

  const payload = {
    filters: {
      unidade_id: unidadeId,
    },
    per_page: perPage,
    page: page,
  };

  console.log("Payload:", payload);

  content.$axios
    .post("/entrada/list", payload, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      console.log(
        `Resposta da API entradas unidade ${unidadeId}:`,
        response.data
      );

      if (response.data && response.data.status) {
        // Laravel retorna paginação com estrutura: { data: { data: [...], total, per_page, ... } }
        const paginatedData = response.data.data;

        console.log("Estrutura paginatedData:", paginatedData);
        console.log("Tipo de paginatedData:", typeof paginatedData);
        console.log("É array?", Array.isArray(paginatedData));

        // Se paginatedData for um array, usar direto; se for objeto com data, extrair
        const entradas = Array.isArray(paginatedData)
          ? paginatedData
          : paginatedData?.data || [];

        const total = paginatedData?.total || entradas.length;

        console.log(
          `Entradas da unidade ${unidadeId}: ${entradas.length} de ${total} total`
        );

        // Commit no Vuex store
        content.$store.commit("setListEntradas", entradas);
      } else {
        console.warn("Resposta da API sem dados válidos:", response.data);
        content.$store.commit("setListEntradas", []);
      }
    })
    .catch((error) => {
      console.error(
        `Erro ao carregar entradas da unidade ${unidadeId}:`,
        error
      );
      console.error("Resposta de erro:", error.response?.data);
      console.error("Status:", error.response?.status);
      console.error("Headers:", error.response?.headers);

      if (content.$toastr && content.$toastr.e) {
        const mensagem =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Erro ao carregar entradas da unidade";
        content.$toastr.e(mensagem);
      }
      content.$store.commit("setListEntradas", []);
    });
};

/**
 * Busca uma entrada específica por ID
 * @param {Object} content - Contexto do componente Vue (this)
 * @param {Number} entradaId - ID da entrada
 */
var listData = (content, entradaId) => {
  if (!entradaId) {
    console.warn("listData: entradaId não fornecido");
    return Promise.reject("ID da entrada é obrigatório");
  }

  console.log(`Buscando entrada ID ${entradaId}: /entrada/${entradaId}`);

  return content.$axios
    .get(`/entrada/${entradaId}`, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
      },
    })
    .then((response) => {
      console.log(`Resposta da API entrada ${entradaId}:`, response.data);

      if (response.data && response.data.status && response.data.data) {
        return response.data.data;
      } else {
        console.warn("Entrada não encontrada ou resposta inválida");
        return null;
      }
    })
    .catch((error) => {
      console.error(`Erro ao buscar entrada ${entradaId}:`, error);
      if (content.$toastr && content.$toastr.e) {
        content.$toastr.e("Erro ao buscar entrada");
      }
      throw error;
    });
};

export default {
  listAll,
  listByUnidade,
  listData,
};
