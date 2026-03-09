// MÓDULO DE UNIDADES / POLOS

import { feedback } from "@/components/ui/feedback-modal";

var ADD_UP = (content, funcao) => {
  const unidadeData = {
    nome: content.modalData.nome,
    status: content.modalData.status || "A",
  };

  if (funcao == "UP") {
    unidadeData.id = content.modalData.id;
  }

  content.$axios
    .post(funcao == "ADD" ? "/polo/add" : "/polo/update", unidadeData, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
      },
    })
    .then(function (response) {
      if (response.data.status) {
        listAll(content);

        const returned = response.data.data;

        if (funcao == "ADD" && returned?.id) {
          content.$store.commit("setIdDataLoaded", returned.id);
        }

        if (returned?.nome) {
          content.$store.commit("setModalTitle", returned.nome);
        }

        content.$store.commit("setModalFunction", "UP");
        content.$store.commit("setModalErrors", {});

        // Fechar o modal antes de exibir o feedback
        if (content.onSuccess && typeof content.onSuccess === "function") {
          content.onSuccess();
        }

        feedback.success(
          funcao == "ADD"
            ? "Unidade cadastrada com sucesso!"
            : "Unidade atualizada com sucesso!"
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
      url == null ? "/polo/list" : url,
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
      if (response.data && response.data.status && response.data.data) {
        let rawData = response.data.data;
        let unidadesData = rawData.data || rawData;

        if (Array.isArray(unidadesData)) {
          const enriched = unidadesData.map((u) => ({
            ...u,
            status: u.status === "A" ? "Ativo" : "Inativo",
          }));

          content.$store.commit("setListPolos", enriched);
          content.$store.commit("setListUnidades", enriched);
        } else {
          content.$store.commit("setListPolos", []);
          content.$store.commit("setListUnidades", []);
        }
      } else {
        content.$store.commit("setListPolos", []);
        content.$store.commit("setListUnidades", []);
      }
      content.$store.commit("setisSearching", false);
    })
    .catch((error) => {
      console.error("Erro ao listar unidades:", error);
      content.$store.commit("setisSearching", false);
      content.$store.commit("setListPolos", []);
      content.$store.commit("setListUnidades", []);
    });
};

var listData = (content) => {
  content.$axios
    .post(
      "/polo/listData",
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
        const payload = response.data.data;
        content.$store.commit("setModalData", payload);
        if (content.callback) content.callback();
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar dados da unidade:", error);
    });
};

var deleteData = (content, id) => {
  if (!confirm("Tem certeza que deseja alterar o status desta unidade?"))
    return;

  content.$axios
    .post(
      `/polo/delete/${id}`,
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

export default {
  ADD_UP,
  listAll,
  listData,
  deleteData,
};