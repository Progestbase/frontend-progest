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
        
        const msg = funcao == "ADD" ? "Unidade cadastrada com sucesso!" : "Unidade atualizada com sucesso!";
        
        // Compatibilidade com as duas versões do Toastr
        if (content.$toastr && typeof content.$toastr.success === "function") {
          content.$toastr.success(msg);
        } else if (content.$toastr && typeof content.$toastr.s === "function") {
          content.$toastr.s(msg);
        }

        const returned =
          response.data.data?.unidade ||
          response.data.data?.polo ||
          response.data.data;

        if (funcao == "ADD" && returned?.id) {
          content.$store.commit("setIdDataLoaded", returned.id);
        }
        
        if (returned?.nome) {
          content.$store.commit("setModalTitle", returned.nome);
        }

        content.$store.commit("setModalFunction", "UP");
        // Fechamento via Vuex (compatível com Shadcn UI)
        content.$store.commit("setModalOpen", false);
        content.$store.commit("setModalErrors", {});
        
      } else if (response.data.status == false && response.data.validacao) {
        content.$store.commit("setModalErrors", response.data.erros || {});
        if (content.$toastr && typeof content.$toastr.error === "function") {
          content.$toastr.error("Verifique os campos obrigatórios.");
        }
      }
    })
    .catch(function (error) {
      console.error("Erro na requisição:", error);
      if (content.$toastr && typeof content.$toastr.error === "function") {
        content.$toastr.error("Erro na comunicação com o servidor.");
      }
    });
};

var listAll = (content, url = null) => {
  content.$store.commit("setisSearching", true);

  const attempt = (endpoint) =>
    content.$axios.post(
      endpoint,
      { filters: content.$store.state.searchFilters || [{}] },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
          "Content-Type": "application/json",
        },
      }
    );

  const primary = url == null ? "/unidade/list" : url;

  const handleResponse = (response) => {
    if (response.data && response.data.status && response.data.data) {
      let rawData = response.data.data;
      let unidadesData = rawData.data || rawData; // Pega o array dentro do objeto paginado, se existir

      if (Array.isArray(unidadesData)) {
        const enrichedUnidades = unidadesData.map((u) => {
          const base = u.unidade || u.polo || u;
          return {
            ...base,
            statusFormatted: base.status === "A" ? "Ativo" : "Inativo",
          };
        });
        
        const payload = { ...rawData, data: enrichedUnidades };
        // Atualiza ambos para garantir compatibilidade
        content.$store.commit("setListPolos", payload);
        content.$store.commit("setListUnidades", payload);
      } else {
        content.$store.commit("setListPolos", { status: false, data: [] });
        content.$store.commit("setListUnidades", { status: false, data: [] });
      }
    } else {
      content.$store.commit("setListPolos", { status: false, data: [] });
      content.$store.commit("setListUnidades", { status: false, data: [] });
    }
    content.$store.commit("setisSearching", false);
  };

  attempt(primary)
    .then(handleResponse)
    .catch((error) => {
      const status = error && error.response && error.response.status;
      // Fallback: se usar a rota nova der 404/405, tenta a antiga /polo/list
      if (!url && (status === 404 || status === 405)) {
        attempt("/polo/list")
          .then(handleResponse)
          .catch((err2) => {
            console.error("Erro ao listar unidades (fallback):", err2);
            content.$store.commit("setisSearching", false);
            content.$store.commit("setListPolos", { status: false, data: [] });
            content.$store.commit("setListUnidades", { status: false, data: [] });
          });
      } else {
        console.error("Erro ao listar unidades:", error);
        content.$store.commit("setisSearching", false);
        content.$store.commit("setListPolos", { status: false, data: [] });
        content.$store.commit("setListUnidades", { status: false, data: [] });
      }
    });
};

var listData = (content) => {
  // Removido o clique via document.querySelector
  content.$axios
    .post("/polo/listData", { id: content.idData }, {
      headers: { Authorization: "Bearer " + content.$store.getters.getUserToken },
    })
    .then((response) => {
      if (response.data && response.data.status) {
        content.$store.commit("setIdDataLoaded", content.idData);
        // Suporta resposta vindo como 'unidade', 'polo' ou direto no data
        const payload = response.data.data.unidade || response.data.data.polo || response.data.data;
        content.$store.commit("setModalData", payload);
        if (content.callback) content.callback();
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar dados da unidade:", error);
    });
};

var toggleStatus = (content, poloId) => {
  content.$axios
    .post("/polo/toggleStatus", { id: poloId }, {
      headers: { Authorization: "Bearer " + content.$store.getters.getUserToken },
    })
    .then((response) => {
      if (response.data && response.data.status) {
        listAll(content);
        if (content.$toastr && typeof content.$toastr.success === "function") {
          content.$toastr.success("Status alterado com sucesso!");
        } else if (content.$toastr && typeof content.$toastr.s === "function") {
          content.$toastr.s("Status alterado com sucesso!");
        }
      }
    })
    .catch((error) => {
      console.error("Erro ao alterar status:", error);
    });
};

var deletar = (content, poloId) => {
  if (!confirm("Tem certeza que deseja deletar esta unidade?")) return;

  content.$axios
    .post(`/polo/delete/${poloId}`, {}, {
      headers: { Authorization: "Bearer " + content.$store.getters.getUserToken },
    })
    .then((response) => {
      if (response.data && response.data.status) {
        listAll(content);
        if (content.$toastr && typeof content.$toastr.success === "function") {
          content.$toastr.success("Unidade removida com sucesso!");
        } else if (content.$toastr && typeof content.$toastr.s === "function") {
          content.$toastr.s("Unidade removida com sucesso!");
        }
      } else {
        if (content.$toastr && typeof content.$toastr.error === "function") {
          content.$toastr.error(response.data.message || "Erro ao deletar.");
        }
      }
    })
    .catch((error) => {
      console.error("Erro ao deletar unidade:", error);
    });
};

export default {
  ADD_UP,
  listAll,
  listData,
  toggleStatus,
  deletar,
};