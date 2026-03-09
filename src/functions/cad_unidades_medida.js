// MÓDULO DE UNIDADES DE MEDIDA

import { feedback } from "@/components/ui/feedback-modal";

var ADD_UP = (content, funcao) => {
  // Preparar dados conforme documentação da API
  const unidadeMedidaData = {
    unidadeMedida: {
      nome: content.modalData.nome,
      quantidade_unidade_minima:
        parseInt(content.modalData.quantidade_unidade_minima) || 1,
      status: content.modalData.status || "A",
    },
  };

  // Se for atualização, incluir ID
  if (funcao == "UP") {
    unidadeMedidaData.unidadeMedida.id = content.modalData.id;
  }

  content.$axios
    .post(
      funcao == "ADD" ? "/unidadeMedida/add" : "/unidadeMedida/update",
      unidadeMedidaData,
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
            ? "Unidade de medida cadastrada com sucesso!"
            : "Unidade de medida atualizada com sucesso!"
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
      url == null ? "/unidadeMedida/list" : url,
      {
        filters: content.$store.state.searchFilters || [],
        search: content.search || "",
        sort_by: content.sort_by || "nome",
        sort_dir: content.sort_dir || "asc",
      },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      if (response.data.status && response.data.data) {
        // Enriquecer dados com formatação para exibição
        const enrichedUnidades = response.data.data.map((unidade) => {
          return {
            ...unidade,
            status: unidade.status === "A" ? "Ativo" : "Inativo",
          };
        });

        content.$store.commit("setListUnidadesMedida", enrichedUnidades);
      } else {
        content.$store.commit("setListUnidadesMedida", []);
      }

      content.$store.commit("setisSearching", false);
    })
    .catch((error) => {
      console.error("Erro na chamada da API listAll:", error);
      content.$store.commit("setisSearching", false);
      content.$store.commit("setListUnidadesMedida", []);
    });
};

var listData = (content) => {
  content.$axios
    .post(
      "/unidadeMedida/listData",
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
  if (!confirm("Tem certeza que deseja alterar o status desta unidade de medida?")) {
    return;
  }

  content.$axios
    .post(
      `/unidadeMedida/delete/${id}`,
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
