// MÓDULO DE POLOS
// Implementação seguindo a documentação oficial da API

var ADD_UP = (content, funcao) => {
  // Execução de ADD/UP de polo

  // Preparar dados conforme documentação da API (agora tratado como Unidade)
  const unidadeData = {
    nome: content.modalData.nome,
    status: content.modalData.status || "A",
  };

  // Se for atualização, incluir ID
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

        const mensagem =
          funcao == "ADD"
            ? "Unidade cadastrada com sucesso!"
            : "Unidade atualizada com sucesso!";

        // Tratamento defensivo para toastr
        try {
          if (content.$toastr && content.$toastr.s) {
            content.$toastr.s(mensagem);
          } else {
            alert(mensagem);
          }
        } catch (e) {
          console.warn("Erro ao exibir notificação:", e);
          alert(mensagem);
        }

        // response.data.data pode conter a estrutura antiga (polo) ou nova (unidade)
        const returned =
          response.data.data &&
          (response.data.data.unidade ||
            response.data.data.polo ||
            response.data.data);
        if (funcao == "ADD") {
          content.modalData.id = returned.id;
          content.$store.commit("setIdDataLoaded", returned.id);
        }
        content.$store.commit("setModalTitle", returned.nome);
        content.$store.commit("setModalFunction", "UP");

        // Atualiza store de unidades também (compatibilidade)
        if (response.data.data) {
          const raw = response.data.data.data || [response.data.data];
          const arr = Array.isArray(raw) ? raw : [raw];
          const enriched = arr.map((u) => ({
            ...u,
            statusFormatted: u.status === "A" ? "Ativo" : "Inativo",
          }));
          content.$store.commit("setListUnidades", {
            ...(response.data.data || {}),
            data: enriched,
          });
        }

        // Fechar modal (proteção para casos onde bootstrap não esteja disponível)
        try {
          const modal = document.querySelector("#addUPPolo");
          if (modal && window && window.bootstrap && window.bootstrap.Modal) {
            const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) bootstrapModal.hide();
          }
        } catch (e) {
          console.warn("Não foi possível fechar o modal automaticamente:", e);
        }

        // Limpar erros do modal
        content.$store.commit("setModalErrors", {});
      } else if (response.data.status == false && response.data.validacao) {
        console.log("Erros de validação:", response.data.erros);

        // Definir erros no store para exibição inline
        content.$store.commit("setModalErrors", response.data.erros);

        let erros = "";
        for (let campo in response.data.erros) {
          for (let erro of response.data.erros[campo]) {
            erros += erro + "\n";
          }
        }

        try {
          if (content.$toastr && content.$toastr.e) {
            content.$toastr.e("Erro de validação:\n" + erros);
          } else {
            alert("Erro de validação:\n" + erros);
          }
        } catch (e) {
          console.warn("Erro ao exibir notificação:", e);
          alert("Erro de validação:\n" + erros);
        }
      } else {
        console.log(
          "Erro ao " + (funcao == "ADD" ? "cadastrar" : "atualizar"),
          response
        );
        const msgErro =
          "Erro ao " +
          (funcao == "ADD" ? "cadastrar" : "atualizar") +
          " unidade";
        try {
          if (content.$toastr && content.$toastr.e) {
            content.$toastr.e(msgErro);
          } else {
            alert(msgErro);
          }
        } catch (e) {
          alert(msgErro);
        }
      }
    })
    .catch(function (error) {
      console.error("Erro na requisição:", error);
      const msgErro =
        "OPS. Pequena intermitência. Se persistir, realize um novo login.";
      try {
        if (content.$toastr && content.$toastr.e) {
          content.$toastr.e(msgErro);
        } else {
          alert(msgErro);
        }
      } catch (e) {
        alert(msgErro);
      }
    });
};

var listAll = (content, url = null) => {
  content.$store.commit("setisSearching", true);

  const attempt = (endpoint) =>
    content.$axios.post(
      endpoint,
      { filters: content.$store.state.searchFilters },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    );

  // Se url foi passada, usa direto
  const primary = url == null ? "/unidade/list" : url;

  const handleResponse = (response) => {
    if (response.data.status && response.data.data) {
      // A API retorna paginação do Laravel: response.data.data.data
      const unidadesData = response.data.data.data || [];

      // Enriquecer dados com formatação para exibição
      const enrichedUnidades = unidadesData.map((u) => {
        const base = u.unidade || u.polo || u;
        return {
          ...base,
          statusFormatted: base.status === "A" ? "Ativo" : "Inativo",
        };
      });

      content.$store.commit("setListPolos", {
        ...response.data.data,
        data: enrichedUnidades,
      });
      content.$store.commit("setListUnidades", {
        ...response.data.data,
        data: enrichedUnidades,
      });
    } else {
      console.error("Resposta da API sem dados válidos:", response.data);
      content.$store.commit("setListPolos", { status: false, data: [] });
      content.$store.commit("setListUnidades", { status: false, data: [] });
    }
    content.$store.commit("setisSearching", false);
  };

  attempt(primary)
    .then(handleResponse)
    .catch((error) => {
      // se recebeu 404/405 e usamos /unidade como primary, tenta /polo/list
      const status = error && error.response && error.response.status;
      if (!url && (status === 404 || status === 405)) {
        // fallback para endpoint antigo
        attempt("/polo/list")
          .then(handleResponse)
          .catch((err2) => {
            console.error("Erro ao listar unidades (fallback):", err2);
            content.$store.commit("setisSearching", false);
            content.$store.commit("setListPolos", { status: false, data: [] });
            content.$store.commit("setListUnidades", {
              status: false,
              data: [],
            });
            alert(
              "OPS! \nEstamos com algum problema, tente novamente mais tarde."
            );
          });
      } else {
        console.error("Erro ao listar unidades:", error);
        console.error("Response error:", error && error.response);
        content.$store.commit("setisSearching", false);
        content.$store.commit("setListPolos", { status: false, data: [] });
        content.$store.commit("setListUnidades", { status: false, data: [] });
        alert("OPS! \nEstamos com algum problema, tente novamente mais tarde.");
      }
    });
};

var listData = (content) => {
  const abaDados = document.querySelector("#aba_dados");
  if (abaDados) abaDados.click();
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
      content.$store.commit("setIdDataLoaded", content.idData);
      // Suporta resposta com 'unidade' ou 'polo' ou direta
      const payload =
        response.data.data.unidade ||
        response.data.data.polo ||
        response.data.data;
      content.$store.commit("setModalData", payload);
      if (content.callback) content.callback(); // Chama o callback após carregar os dados
    })
    .catch((error) => {
      console.error("Erro ao carregar dados do polo:", error);
      const msgErro =
        "OPS. Pequena intermitência. Se persistir, realize um novo login.";
      try {
        if (content.$toastr && content.$toastr.e) {
          content.$toastr.e(msgErro);
        } else {
          alert(msgErro);
        }
      } catch (e) {
        alert(msgErro);
      }
    });
};

var toggleStatus = (content, poloId) => {
  content.$axios
    .post(
      "/polo/toggleStatus",
      { id: poloId },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      if (response.data.status) {
        listAll(content);
        const mensagem = "Status alterado com sucesso!";
        try {
          if (content.$toastr && content.$toastr.s) {
            content.$toastr.s(mensagem);
          } else {
            alert(mensagem);
          }
        } catch (e) {
          alert(mensagem);
        }
      } else {
        const msgErro = response.data.message || "Erro ao alterar status";
        try {
          if (content.$toastr && content.$toastr.e) {
            content.$toastr.e(msgErro);
          } else {
            alert(msgErro);
          }
        } catch (e) {
          alert(msgErro);
        }
      }
    })
    .catch((error) => {
      console.error("Erro ao alterar status:", error);
      const msgErro =
        "OPS. Pequena intermitência. Se persistir, realize um novo login.";
      try {
        if (content.$toastr && content.$toastr.e) {
          content.$toastr.e(msgErro);
        } else {
          alert(msgErro);
        }
      } catch (e) {
        alert(msgErro);
      }
    });
};

var deletar = (content, poloId) => {
  if (!confirm("Tem certeza que deseja deletar este polo?")) {
    return;
  }

  content.$axios
    .post(
      `/polo/delete/${poloId}`,
      {},
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      if (response.data.status) {
        listAll(content);
        const mensagem = "Unidade deletada com sucesso!";
        try {
          if (content.$toastr && content.$toastr.s) {
            content.$toastr.s(mensagem);
          } else {
            alert(mensagem);
          }
        } catch (e) {
          alert(mensagem);
        }
      } else {
        const msgErro =
          response.data.message ||
          "Erro ao deletar unidade. Pode haver registros vinculados.";
        try {
          if (content.$toastr && content.$toastr.e) {
            content.$toastr.e(msgErro);
          } else {
            alert(msgErro);
          }
        } catch (e) {
          alert(msgErro);
        }
      }
    })
    .catch((error) => {
      console.error("Erro ao deletar unidade:", error);
      const msgErro =
        "Erro ao deletar unidade. Pode haver registros vinculados a esta unidade.";
      try {
        if (content.$toastr && content.$toastr.e) {
          content.$toastr.e(msgErro);
        } else {
          alert(msgErro);
        }
      } catch (e) {
        alert(msgErro);
      }
    });
};

export default {
  ADD_UP,
  listAll,
  listData,
  toggleStatus,
  deletar,
};
