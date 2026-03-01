var ADD_UP = (content, funcao) => {
  const headers = {
    Authorization: "Bearer " + content.$store.getters.getUserToken,
  };

  content.$axios
    .post(
      funcao == "ADD" ? "/fornecedores/add" : "/fornecedores/update",
      { fornecedor: content.modalData },
      { headers },
    )
    .then(function (response) {
      if (response.data.status) {
        content.$store.commit("setModalErrors", {});
        listAll(content);

        const msg =
          funcao == "ADD" ? "Fornecedor cadastrado!" : "Fornecedor atualizado!";
        if (content.$toastr) content.$toastr.success(msg);

        if (funcao == "ADD" && response.data.data?.id) {
          content.$store.commit("setIdDataLoaded", response.data.data.id);
        }

        if (response.data.data) {
          const title =
            response.data.data.razao_social_nome ||
            response.data.data.nome ||
            "";
          if (title) content.$store.commit("setModalTitle", title);
        }

        content.$store.commit("setModalFunction", "UP");
        content.$store.commit("setModalOpen", false);
      } else if (response.data.status == false && response.data.validacao) {
        content.$store.commit("setModalErrors", response.data.erros || {});
        if (content.$toastr)
          content.$toastr.error("Verifique os campos obrigatórios.");
      } else {
        if (content.$toastr)
          content.$toastr.error(response.data.message || "Erro na operação.");
      }
    })
    .catch(function (error) {
      console.error(error);
      if (content.$toastr)
        content.$toastr.error("Erro de conexão com o servidor.");
    });
};

var listAll = (content, url = null) => {
  content.$store.commit("setisSearching", true);
  content.$axios
    .post(
      url == null ? "/fornecedores/list" : url,
      { filters: content.$store.state.searchFilters || [{}] },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
          "Content-Type": "application/json",
        },
      },
    )
    .then((response) => {
      if (response.data && response.data.status) {
        content.$store.commit("setListFornecedores", response.data.data);
      }
      content.$store.commit("setisSearching", false);
    })
    .catch((error) => {
      console.error(error);
      content.$store.commit("setisSearching", false);
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
      },
    )
    .then((response) => {
      if (response.data.status) {
        content.$store.commit("setIdDataLoaded", content.idData);
        content.$store.commit("setModalData", response.data.data);
        if (content.callback) content.callback();
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

var deleteData = (content, id) => {
  if (confirm("Deseja realmente excluir este fornecedor?")) {
    content.$axios
      .post(
        `/fornecedores/delete/${id}`,
        {},
        {
          headers: {
            Authorization: "Bearer " + content.$store.getters.getUserToken,
          },
        },
      )
      .then((response) => {
        if (response.data.status) {
          listAll(content);
          if (content.$toastr) content.$toastr.success("Fornecedor removido.");
        } else {
          if (content.$toastr)
            content.$toastr.error(response.data.message || "Erro ao remover.");
        }
      })
      .catch((error) => {
        console.error(error);
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
