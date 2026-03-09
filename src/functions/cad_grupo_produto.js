// MÓDULO DE GRUPO DE PRODUTOS

import { feedback } from "@/components/ui/feedback-modal";

var ADD_UP = (content, funcao) => {
  const grupoData = {
    grupoProduto: {
      nome: content.modalData.nome,
      tipo: content.modalData.tipo || "Material",
      status: content.modalData.status || "A",
    },
  };

  if (funcao == "UP") {
    grupoData.grupoProduto.id = content.modalData.id;
  }

  content.$axios
    .post(
      funcao == "ADD" ? "/grupoProduto/add" : "/grupoProduto/update",
      grupoData,
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then(function (response) {
      if (response.data.status) {
        listAll(content);

        if (funcao == "ADD") {
          content.modalData.id = response.data.data.id;
          content.$store.commit("setIdDataLoaded", response.data.data.id);
        }
        content.$store.commit("setModalTitle", response.data.data.nome);
        content.$store.commit("setModalFunction", "UP");
        content.$store.commit("setModalErrors", {});

        // Fechar o modal antes de exibir o feedback
        if (content.onSuccess && typeof content.onSuccess === "function") {
          content.onSuccess();
        }

        feedback.success(
          funcao == "ADD"
            ? "Grupo de produto cadastrado com sucesso!"
            : "Grupo de produto atualizado com sucesso!"
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
      url == null ? "/grupoProduto/list" : url,
      {
        filters: content.$store.state.searchFilters || [],
        search: content.search || "",
        sort_by: content.sort_by || "nome",
        sort_dir: content.sort_dir || "asc",
        tipo: content.tipo || "",
      },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      if (response.data.status && response.data.data) {
        const enriched = response.data.data.map((item) => ({
          ...item,
          status: item.status === "A" ? "Ativo" : "Inativo",
        }));

        content.$store.commit("setListGrupoProdutos", enriched);
      } else {
        content.$store.commit("setListGrupoProdutos", []);
      }

      content.$store.commit("setisSearching", false);
    })
    .catch((error) => {
      console.error("Erro na chamada da API listAll:", error);
      content.$store.commit("setisSearching", false);
      content.$store.commit("setListGrupoProdutos", []);
    });
};

var listData = (content) => {
  content.$axios
    .post(
      "/grupoProduto/listData",
      { id: content.idData },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      if (response.data.status && response.data.data) {
        content.$store.commit("setIdDataLoaded", content.idData);
        content.$store.commit("setModalData", response.data.data);
        if (content.callback) content.callback();
      }
    })
    .catch((error) => {
      console.error("Erro na requisição listData:", error);
    });
};

var deleteData = (content, id) => {
  if (!confirm("Tem certeza que deseja alterar o status deste grupo de produto?"))
    return;

  content.$axios
    .post(
      `/grupoProduto/delete/${id}`,
      {},
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then(function (response) {
      if (response.data.status) {
        listAll(content);
        feedback.success(response.data.message || "Status atualizado com sucesso!");
      } else {
        feedback.error(response.data.message || "Erro ao alterar status.");
      }
    })
    .catch(function (error) {
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
