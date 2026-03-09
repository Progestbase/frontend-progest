// MÓDULO DE PRODUTOS

import { feedback } from "@/components/ui/feedback-modal";

var ADD_UP = (content, funcao) => {
  const produtoData = {
    produto: {
      nome: content.modalData.nome,
      marca: content.modalData.marca || "",
      codigo_simpras: content.modalData.codigo_simpras || "",
      codigo_barras: content.modalData.codigo_barras || "",
      grupo_produto_id: content.modalData.grupo_produto_id,
      unidade_medida_id: content.modalData.unidade_medida_id,
      status: content.modalData.status || "A",
    },
  };

  if (funcao == "UP") {
    produtoData.produto.id = content.modalData.id;
  }

  content.$axios
    .post(funcao == "ADD" ? "/produtos/add" : "/produtos/update", produtoData, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
      },
    })
    .then(function (response) {
      if (response.data.status) {
        listAll(content);

        if (funcao == "ADD" && response.data.data?.id) {
          content.$store.commit("setIdDataLoaded", response.data.data.id);
        }

        if (response.data.data?.nome) {
          content.$store.commit("setModalTitle", response.data.data.nome);
        }

        content.$store.commit("setModalFunction", "UP");
        content.$store.commit("setModalErrors", {});

        // Fechar modal
        if (content.onSuccess && typeof content.onSuccess === "function") {
          content.onSuccess();
        }

        feedback.success(
          funcao == "ADD"
            ? "Produto cadastrado com sucesso!"
            : "Produto atualizado com sucesso!"
        );
      }
    })
    .catch(function (error) {
      console.error("Erro na requisição:", error);
    });
};

var listAll = (content, url = null) => {
  content.$store.commit("setisSearching", true);

  content.$axios
    .post(
      url == null ? "/produtos/list" : url,
      {
        filters: content.$store.state.searchFilters || [],
        search: content.search || "",
        sort_by: content.sort_by || "nome",
        sort_dir: content.sort_dir || "asc",
        grupo_produto_id: content.grupo_produto_id || "",
        marca: content.marca_filter || "",
      },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      if (response.data && response.data.status && response.data.data) {
        let rawData = response.data.data;
        let produtosData = rawData.data || rawData;

        if (Array.isArray(produtosData)) {
          const enriched = produtosData.map((p) => ({
            ...p,
            status: p.status === "A" ? "Ativo" : "Inativo",
          }));
          content.$store.commit("setListProdutos", enriched);
        } else {
          content.$store.commit("setListProdutos", []);
        }
      } else {
        content.$store.commit("setListProdutos", []);
      }
      content.$store.commit("setisSearching", false);
    })
    .catch((error) => {
      console.error("Erro ao listar produtos:", error);
      content.$store.commit("setisSearching", false);
      content.$store.commit("setListProdutos", []);
    });
};

var listData = (content) => {
  content.$axios
    .post(
      "/produtos/listData",
      { id: content.idData },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      if (response.data && response.data.status && response.data.data) {
        content.$store.commit("setModalData", response.data.data);
        content.$store.commit("setModalTitle", response.data.data.nome);
        content.$store.commit("setIdDataLoaded", response.data.data.id);

        if (content.callback && typeof content.callback === "function") {
          content.callback();
        }
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar dados do produto:", error);
    });
};

var deleteData = (content, id) => {
  if (!confirm("Tem certeza que deseja alterar o status deste produto?"))
    return;

  content.$axios
    .post(
      `/produtos/delete/${id}`,
      {},
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      if (response.data.status) {
        listAll(content);
        feedback.success(
          response.data.message || "Status atualizado com sucesso!"
        );
      } else {
        feedback.error(response.data.message || "Erro ao alterar status.");
      }
    })
    .catch((error) => {
      console.error("Erro ao alterar status:", error);
    });
};

var exportFunctions = {
  ADD_UP: ADD_UP,
  listAll: listAll,
  listData: listData,
  deleteData: deleteData,
};

export default exportFunctions;