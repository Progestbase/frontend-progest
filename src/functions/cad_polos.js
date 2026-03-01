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
        "Content-Type": "application/json",
      },
    })
    .then(function (response) {
      if (response.data.status) {
        listAll(content);
        const msg =
          funcao == "ADD" ? "Unidade cadastrada!" : "Unidade atualizada!";
        if (content.$toastr) content.$toastr.success(msg);

        const returned =
          response.data.data?.unidade ||
          response.data.data?.polo ||
          response.data.data;
        if (funcao == "ADD") {
          content.$store.commit("setIdDataLoaded", returned.id);
        }

        content.$store.commit("setModalOpen", false);
        content.$store.commit("setModalErrors", {});
      } else if (response.data.status == false && response.data.validacao) {
        content.$store.commit("setModalErrors", response.data.erros || {});
        if (content.$toastr)
          content.$toastr.error("Verifique os campos obrigatórios.");
      }
    })
    .catch(function (error) {
      console.error(error);
      if (content.$toastr)
        content.$toastr.error("Erro na comunicação com o servidor.");
    });
};

var listAll = (content, url = null) => {
  content.$store.commit("setisSearching", true);
  const primary = url == null ? "/unidade/list" : url;

  content.$axios
    .post(
      primary,
      { filters: content.$store.state.searchFilters || [{}] },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      },
    )
    .then((response) => {
      if (response.data.status && response.data.data) {
        const array = response.data.data.data || [];
        content.$store.commit("setListUnidades", response.data.data);
        content.$store.commit("setListPolos", response.data.data); // Compatibilidade
      }
      content.$store.commit("setisSearching", false);
    })
    .catch(() => {
      // Fallback para endpoint antigo /polo/list se falhar
      if (!url) {
        content.$axios
          .post(
            "/polo/list",
            { filters: [{}] },
            {
              headers: {
                Authorization: "Bearer " + content.$store.getters.getUserToken,
              },
            },
          )
          .then((r) => {
            content.$store.commit("setListUnidades", r.data.data);
            content.$store.commit("setisSearching", false);
          })
          .catch(() => content.$store.commit("setisSearching", false));
      } else {
        content.$store.commit("setisSearching", false);
      }
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
      },
    )
    .then((response) => {
      if (response.data.status) {
        const payload =
          response.data.data.unidade ||
          response.data.data.polo ||
          response.data.data;
        content.$store.commit("setModalData", payload);
        if (content.callback) content.callback();
      }
    });
};

var deletar = (content, poloId) => {
  if (confirm("Tem certeza que deseja deletar esta unidade?")) {
    content.$axios
      .post(
        `/polo/delete/${poloId}`,
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
          if (content.$toastr) content.$toastr.success("Unidade removida.");
        } else {
          if (content.$toastr)
            content.$toastr.error(response.data.message || "Erro ao deletar.");
        }
      });
  }
};

export default {
  ADD_UP,
  listAll,
  listData,
  deletar,
};
