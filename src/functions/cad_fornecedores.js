var ADD_UP = (content, funcao) => {
  const headers = {
    Authorization: "Bearer " + content.$store.getters.getUserToken,
  };

  content.$axios
    .post(
      funcao == "ADD" ? "/fornecedores/add" : "/fornecedores/update",
      { fornecedor: content.modalData },
      { headers }
    )
    .then(function (response) {
      if (response.data.status) {
        content.$store.commit("setModalErrors", {});
        listAll(content);

        const msg = funcao == "ADD" ? "Fornecedor cadastrado com sucesso!" : "Fornecedor atualizado com sucesso!";
        
        // Suporte aos dois padrões de toastr encontrados no projeto
        if (content.$toastr && typeof content.$toastr.success === "function") {
          content.$toastr.success(msg);
        } else if (content.$toastr && typeof content.$toastr.s === "function") {
          content.$toastr.s(msg);
        }

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
        
        // Fechamento do modal via Vuex (compatível com o novo CadastroDialog do Shadcn UI)
        content.$store.commit("setModalOpen", false);

      } else if (response.data.status == false && response.data.validacao) {
        // Tratamento de validação explícito mantido como segurança
        content.$store.commit("setModalErrors", response.data.erros || {});
        if (content.$toastr && typeof content.$toastr.error === "function") {
          content.$toastr.error("Verifique os campos obrigatórios.");
        }
      } else {
        if (content.$toastr && typeof content.$toastr.error === "function") {
          content.$toastr.error(response.data.message || "Erro na operação.");
        }
      }
    })
    .catch(function (error) {
      console.error("Erro na requisição capturado global/localmente:", error);
    });
};

var listAll = (content, url = null) => {
  content.$store.commit("setisSearching", true);
  const headers = {
    Authorization: "Bearer " + content.$store.getters.getUserToken,
    "Content-Type": "application/json",
  };

  content.$axios
    .post(
      url == null ? "/fornecedores/list" : url,
      { filters: content.$store.state.searchFilters || [{}] },
      { headers }
    )
    .then((response) => {
      try {
        if (response.data && response.data.status) {
          let rawData = response.data.data;

          // Se for objeto paginado, extrai o array interno
          if (rawData && rawData.data && Array.isArray(rawData.data)) {
            rawData = rawData.data;
          }

          if (Array.isArray(rawData)) {
            const enriched = rawData.map((f) => ({
              ...f,
              statusFormatted: f.status === "A" ? "Ativo" : "Inativo",
            }));

            content.$store.commit("setListFornecedores", {
              ...response.data,
              data: enriched,
            });
          } else {
            content.$store.commit("setListFornecedores", { status: false, data: [] });
          }
        } else {
          content.$store.commit("setListFornecedores", { status: false, data: [] });
        }
      } catch (e) {
        console.error("Erro ao processar resposta de listAll fornecedores:", e);
        content.$store.commit("setListFornecedores", { status: false, data: [] });
      }

      content.$store.commit("setisSearching", false);
    })
    .catch((error) => {
      console.error("Erro na chamada da API listAll:", error);
      content.$store.commit("setisSearching", false);
    });
};

var listData = (content) => {
  const headers = {
    Authorization: "Bearer " + content.$store.getters.getUserToken,
  };

  content.$axios
    .post("/fornecedores/listData", { id: content.idData }, { headers })
    .then((response) => {
      if (response.data && response.data.status) {
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
  // Confirm mantido para segurança do usuário
  if (confirm("Deseja realmente excluir este fornecedor?")) {
    const headers = {
      Authorization: "Bearer " + content.$store.getters.getUserToken,
    };

    content.$axios
      .post(`/fornecedores/delete/${id}`, {}, { headers })
      .then((response) => {
        if (response.data && response.data.status) {
          listAll(content);
          if (content.$toastr && typeof content.$toastr.success === "function") {
            content.$toastr.success("Fornecedor removido com sucesso.");
          } else if (content.$toastr && typeof content.$toastr.s === "function") {
            content.$toastr.s("Fornecedor removido com sucesso.");
          }
        } else {
          if (content.$toastr && typeof content.$toastr.error === "function") {
            content.$toastr.error(response.data.message || "Erro ao remover.");
          }
        }
      })
      .catch((error) => {
        console.error("Erro na requisição delete:", error);
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