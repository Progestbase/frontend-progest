// MÓDULO DE FORNECEDORES

import { feedback } from "@/components/ui/feedback-modal";

var ADD_UP = (content, funcao) => {
  content.$axios
    .post(
      funcao == "ADD" ? "/fornecedores/add" : "/fornecedores/update",
      { fornecedor: content.modalData },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then(function (response) {
      if (response.data.status) {
        listAll(content);

        if (funcao == "ADD" && response.data.data?.id) {
          content.$store.commit("setIdDataLoaded", response.data.data.id);
        }

        if (response.data.data) {
          const title =
            response.data.data.razao_social_nome ||
            response.data.data.razao_social ||
            response.data.data.nome ||
            "";
          if (title) content.$store.commit("setModalTitle", title);
        }

        content.$store.commit("setModalFunction", "UP");
        content.$store.commit("setModalErrors", {});

        // Fechar o modal antes de exibir o feedback
        if (content.onSuccess && typeof content.onSuccess === "function") {
          content.onSuccess();
        }

        feedback.success(
          funcao == "ADD"
            ? "Fornecedor cadastrado com sucesso!"
            : "Fornecedor atualizado com sucesso!"
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
      url == null ? "/fornecedores/list" : url,
      {
        filters: content.$store.state.searchFilters || [],
        search: content.search || "",
        sort_by: content.sort_by || "razao_social_nome",
        sort_dir: content.sort_dir || "asc",
        tipo_pessoa: content.tipo_pessoa || "",
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
        let fornecedoresData = rawData.data || rawData;

        if (Array.isArray(fornecedoresData)) {
          const enriched = fornecedoresData.map((f) => ({
            ...f,
            status: f.status === "A" ? "Ativo" : "Inativo",
          }));
          content.$store.commit("setListFornecedores", enriched);
        } else {
          content.$store.commit("setListFornecedores", []);
        }
      } else {
        content.$store.commit("setListFornecedores", []);
      }

      content.$store.commit("setisSearching", false);
    })
    .catch((error) => {
      console.error("Erro na chamada da API listAll:", error);
      content.$store.commit("setisSearching", false);
      content.$store.commit("setListFornecedores", []);
    });
};

var listData = (content) => {
  content.$axios
    .post(
      "/fornecedores/listData",
      { id: content.idData },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      if (response.data && response.data.status && response.data.data) {
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
  if (!confirm("Tem certeza que deseja alterar o status deste fornecedor?"))
    return;

  content.$axios
    .post(
      `/fornecedores/delete/${id}`,
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
        feedback.success(
          response.data.message || "Status atualizado com sucesso!"
        );
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