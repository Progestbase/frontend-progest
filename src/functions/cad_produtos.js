// MÓDULO DE PRODUTOS
// Refatorado para usar o Interceptor Global de Erros (HTTP 422, 404, 500)

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

  // Se for atualização, incluir ID
  if (funcao == "UP") {
    produtoData.produto.id = content.modalData.id;
  }

  content.$axios
    .post(funcao == "ADD" ? "/produtos/add" : "/produtos/update", produtoData, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
        "Content-Type": "application/json",
      },
    })
    .then(function (response) {
      if (response.data.status) {
        listAll(content);

        const mensagem = funcao == "ADD" ? "Produto cadastrado com sucesso!" : "Produto atualizado com sucesso!";
        feedback.success(mensagem);

        if (funcao == "ADD") {
          content.modalData.id = response.data.data.id;
          content.$store.commit("setIdDataLoaded", response.data.data.id);
        }
        content.$store.commit("setModalTitle", response.data.data.nome);
        content.$store.commit("setModalFunction", "UP");

        content.$store.commit("setModalErrors", {});
      }
    })
    .catch(function (error) {
      console.error("Erro na requisição capturado globalmente:", error);
    });
};

var listAll = (content, url = null) => {
  content.$store.commit("setisSearching", true);

  content.$axios
    .post(
      url == null ? "/produtos/list" : url,
      { filters: content.$store.state.searchFilters || [{}], per_page: 15 },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      if (response.data && response.data.status) {
        content.$store.commit("setListProdutos", response.data.data);
      } else {
        content.$store.commit("setListProdutos", { status: true, data: [] });
      }
      content.$store.commit("setisSearching", false);
    })
    .catch((error) => {
      console.error("Erro ao listar produtos:", error);
      content.$store.commit("setisSearching", false);
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
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      if (response.data && response.data.status && response.data.data) {
        content.$store.commit("setModalData", response.data.data);
        content.$store.commit("setModalTitle", response.data.data.nome);
        content.$store.commit("setModalFunction", "UP");
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
  if (confirm("Tem certeza que deseja excluir este produto?")) {
    content.$axios
      .post(
        "/produtos/delete",
        { id: id },
        {
          headers: {
            Authorization: "Bearer " + content.$store.getters.getUserToken,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        if (response.data && response.data.status) {
          listAll(content);
          feedback.success("Produto excluído com sucesso!");
        }
      })
      .catch((error) => {
        console.error("Erro ao excluir produto:", error);
      });
  }
};

var exportFunctions = {
  ADD_UP: ADD_UP,
  listAll: listAll,
  listData: listData,
  deleteData: deleteData,
};

export default exportFunctions;