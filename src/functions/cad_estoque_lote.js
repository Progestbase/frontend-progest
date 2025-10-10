/**
 * Módulo de funções para Estoque Lote
 * Pattern: cad_*.js (seguindo arquitetura do projeto)
 */

/**
 * Lista todos os lotes de um estoque específico (produto × unidade)
 * @param {Object} content - Referência ao componente Vue (this)
 * @param {Number} estoqueId - ID do registro na tabela estoque
 */
var listByEstoque = (content, estoqueId) => {
  const payload = {
    estoque_id: estoqueId,
  };

  content.$axios
    .post("/estoqueLote/list", payload, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
      },
    })
    .then((response) => {
      if (response.data && response.data.status) {
        const lotes = response.data.data || [];

        // Commit para Vuex store
        content.$store.commit("setListEstoqueLote", lotes);

        // Toastr success (opcional)
        if (content.$toastr && content.$toastr.s) {
          content.$toastr.s(`${lotes.length} lote(s) carregado(s) com sucesso`);
        }
      }
    })
    .catch((error) => {
      console.error("❌ Erro ao carregar lotes:", error);

      // Tratamento de erros de validação (422)
      if (error.response && error.response.status === 422) {
        const mensagemErro = error.response.data.message || "Dados inválidos";

        if (content.$toastr && content.$toastr.e) {
          content.$toastr.e(`Erro ao carregar lotes: ${mensagemErro}`);
        } else {
          alert(`Erro ao carregar lotes: ${mensagemErro}`);
        }
      } else if (error.response && error.response.status === 500) {
        const mensagemErro = error.response.data?.message || "Erro no servidor";

        if (content.$toastr && content.$toastr.e) {
          content.$toastr.e(`Erro ao carregar lotes: ${mensagemErro}`);
        } else {
          alert(`Erro ao carregar lotes: ${mensagemErro}`);
        }
      } else {
        if (content.$toastr && content.$toastr.e) {
          content.$toastr.e("Erro ao carregar lotes");
        } else {
          alert("Erro ao carregar lotes");
        }
      }

      // Limpar lista em caso de erro
      content.$store.commit("setListEstoqueLote", []);
    });
};

/**
 * Lista todos os lotes (sem filtro de estoque)
 * @param {Object} content - Referência ao componente Vue (this)
 */
var listAll = (content) => {
  content.$axios
    .get("/estoqueLote/listAll", {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
      },
    })
    .then((response) => {
      if (response.data && response.data.status) {
        const lotes = response.data.data || [];
        content.$store.commit("setListEstoqueLote", lotes);
      }
    })
    .catch((error) => {
      console.error("❌ Erro ao listar todos os lotes:", error);
      content.$store.commit("setListEstoqueLote", []);
    });
};

export default {
  listByEstoque,
  listAll,
};
