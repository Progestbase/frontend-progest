// MÓDULO DE GRUPO DE PRODUTOS
// Segue o padrão usado em outros módulos (unidades de medida)

import { feedback } from "@/components/ui/feedback-modal";

var ADD_UP = (content, funcao) => {
  console.log(
    "Executando " +
    (funcao == "ADD" ? "cadastro" : "atualização") +
    " de grupo de produto"
  );

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
          "Content-Type": "application/json",
        },
      }
    )
    .then(function (response) {
      console.log("Resposta da API:", response.data);

      if (response.data.status) {
        listAll(content);

        const mensagem =
          funcao == "ADD"
            ? "Grupo de produto cadastrado com sucesso!"
            : "Grupo de produto atualizado com sucesso!";
        if (content.$toastr) {
          content.$toastr.s(mensagem);
        } else {
          feedback.success(mensagem);
        }

        if (funcao == "ADD") {
          content.modalData.id = response.data.data.id;
          content.$store.commit("setIdDataLoaded", response.data.data.id);
        }
        content.$store.commit("setModalTitle", response.data.data.nome);
        content.$store.commit("setModalFunction", "UP");

        // Fechar modal se existir (uso defensivo: window.bootstrap pode não estar definido)
        try {
          const modal = document.querySelector("#addUPGrupoProduto");
          if (modal && window && window.bootstrap && window.bootstrap.Modal) {
            const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) bootstrapModal.hide();
          }
        } catch (e) {
          console.warn("Não foi possível fechar o modal automaticamente:", e);
        }
      }
    });
};

var listAll = (content, url = null) => {
  content.$store.commit("setisSearching", true);

  const endpoint = url == null ? "/grupoProduto/list" : url;
  console.log("Carregando grupos de produto:", endpoint);

  content.$axios
    .post(
      endpoint,
      { filters: content.$store.state.searchFilters || [] },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      console.log("Resposta da API listAll:", response.data);
      if (response.data.status && response.data.data) {
        const enriched = response.data.data.map((item) => ({
          ...item,
          statusFormatted: item.status === "A" ? "Ativo" : "Inativo",
        }));

        content.$store.commit("setListGrupoProdutos", {
          ...response.data,
          data: enriched,
        });
        console.log("setListGrupoProdutos - registros:", enriched.length);
      } else {
        content.$store.commit("setListGrupoProdutos", {
          status: false,
          data: [],
        });
      }

      content.$store.commit("setisSearching", false);
    })
    .catch((error) => {
      console.error("Erro na chamada da API listAll:", error);
      content.$store.commit("setisSearching", false);
      content.$store.commit("setListGrupoProdutos", {
        status: false,
        data: [],
      });
    });
};

var listData = (content) => {
  const abaDados = document.querySelector("#aba_dados");
  if (abaDados) abaDados.click();

  console.log("Carregando dados do grupo ID:", content.idData);

  content.$axios
    .post(
      "/grupoProduto/listData",
      { id: content.idData },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      console.log("Resposta da API listData:", response.data);
      if (response.data.status && response.data.data) {
        content.$store.commit("setIdDataLoaded", content.idData);
        content.$store.commit("setModalData", response.data.data);
        if (content.callback) content.callback();
      } else {
        console.error("Grupo de produto não encontrado", response.data);
      }
    })
    .catch((error) => {
      console.error("Erro na requisição listData:", error);
    });
};

var deleteData = (content, id) => {
  if (!confirm("Tem certeza de que deseja excluir este grupo de produto?"))
    return;

  console.log("Excluindo grupo de produto ID:", id);

  content.$axios
    .post(
      `/grupoProduto/delete/${id}`,
      {},
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
          "Content-Type": "application/json",
        },
      }
    )
    .then(function (response) {
      console.log("Resposta da API delete:", response.data);
      if (response.data.status) {
        listAll(content);
        const mensagem = "Grupo de produto excluído com sucesso.";
        if (content.$toastr) {
          content.$toastr.s(mensagem);
        } else {
          feedback.success(mensagem);
        }
      }
    })
    .catch(function (error) {
      console.error("Erro na requisição delete capturado globalmente:", error);
    });
};

var exportFunctions = {
  ADD_UP: ADD_UP,
  listAll: listAll,
  listData: listData,
  deleteData: deleteData,
};

export default exportFunctions;
