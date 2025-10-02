// MÓDULO DE POLOS
// Implementação seguindo a documentação oficial da API

var ADD_UP = (content, funcao) => {
  console.log(
    "Executando " + (funcao == "ADD" ? "cadastro" : "atualização") + " de polo"
  );

  // Preparar dados conforme documentação da API
  const poloData = {
    nome: content.modalData.nome,
    status: content.modalData.status || "A",
  };

  // Se for atualização, incluir ID
  if (funcao == "UP") {
    poloData.id = content.modalData.id;
  }

  content.$axios
    .post(funcao == "ADD" ? "/polo/add" : "/polo/update", poloData, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
        "Content-Type": "application/json",
      },
    })
    .then(function (response) {
      console.log("Resposta da API:", response.data);

      if (response.data.status) {
        listAll(content);

        const mensagem =
          funcao == "ADD"
            ? "Polo cadastrado com sucesso!"
            : "Polo atualizado com sucesso!";

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

        if (funcao == "ADD") {
          content.modalData.id = response.data.data.id;
          content.$store.commit("setIdDataLoaded", response.data.data.id);
        }
        content.$store.commit("setModalTitle", response.data.data.nome);
        content.$store.commit("setModalFunction", "UP");

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
          "Erro ao " + (funcao == "ADD" ? "cadastrar" : "atualizar") + " polo";
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
  content.$axios
    .post(
      url == null ? "/polo/list" : url,
      {
        filters: content.$store.state.searchFilters,
      },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      console.log("Resposta da API listAll polos:", response.data);

      if (response.data.status && response.data.data) {
        // A API retorna paginação do Laravel: response.data.data.data
        const polosData = response.data.data.data || [];

        console.log("Polos encontrados:", polosData.length);

        // Enriquecer dados com formatação para exibição
        const enrichedPolos = polosData.map((polo) => {
          return {
            ...polo,
            statusFormatted: polo.status === "A" ? "Ativo" : "Inativo",
          };
        });

        content.$store.commit("setListPolos", {
          ...response.data.data, // Mantém info de paginação
          data: enrichedPolos,
        });

        console.log("setListPolos - dados carregados:", enrichedPolos.length);
      } else {
        console.error("Resposta da API sem dados válidos:", response.data);
        content.$store.commit("setListPolos", {
          status: false,
          data: [],
        });
      }

      content.$store.commit("setisSearching", false);
    })
    .catch((error) => {
      console.error("Erro ao listar polos:", error);
      console.error("Response error:", error.response);

      content.$store.commit("setisSearching", false);
      content.$store.commit("setListPolos", {
        status: false,
        data: [],
      });

      const msgErro =
        "OPS! \nEstamos com algum problema, tente novamente mais tarde.";
      alert(msgErro);
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
      content.$store.commit("setModalData", response.data.data);
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
        const mensagem = "Polo deletado com sucesso!";
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
          "Erro ao deletar polo. Pode haver unidades vinculadas.";
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
      console.error("Erro ao deletar polo:", error);
      const msgErro =
        "Erro ao deletar polo. Pode haver unidades vinculadas a este polo.";
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
