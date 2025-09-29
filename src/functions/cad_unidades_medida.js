// MÓDULO DE UNIDADES DE MEDIDA
// Implementação seguindo a documentação oficial da API

var ADD_UP = (content, funcao) => {
  console.log(
    "Executando " +
      (funcao == "ADD" ? "cadastro" : "atualização") +
      " de unidade de medida"
  );

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
            ? "Unidade de medida cadastrada com sucesso!"
            : "Unidade de medida atualizada com sucesso!";
        if (content.$toastr) {
          content.$toastr.s(mensagem);
        } else {
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
          const modal = document.querySelector("#addUPUnidadesMedida");
          if (modal && window && window.bootstrap && window.bootstrap.Modal) {
            const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) bootstrapModal.hide();
          }
        } catch (e) {
          console.warn('Não foi possível fechar o modal automaticamente:', e);
        }
      } else if (response.data.status == false && response.data.validacao) {
        console.log("Erros de validação:", response.data.erros);
        let erros = "";
        for (let campo in response.data.erros) {
          for (let erro of response.data.erros[campo]) {
            erros += erro + "\n";
          }
        }
        if (content.$toastr) {
          content.$toastr.e("Erro de validação:\n" + erros);
        } else {
          alert("Erro de validação:\n" + erros);
        }
      } else {
        console.log(
          "Erro ao " + (funcao == "ADD" ? "cadastrar" : "atualizar"),
          response
        );
        const mensagem =
          response.data.message ||
          "Erro ao " + (funcao == "ADD" ? "cadastrar" : "atualizar");
        if (content.$toastr) {
          content.$toastr.e(mensagem);
        } else {
          alert(mensagem);
        }
      }
    })
    .catch(function (error) {
      console.error("Erro na requisição:", error);
      const mensagem =
        error.response?.data?.message ||
        "OPS. Pequena intermitência. Se persistir, realize um novo login.";
      if (content.$toastr) {
        content.$toastr.e(mensagem);
      } else {
        alert(mensagem);
      }
    });
};

var listAll = (content, url = null) => {
  content.$store.commit("setisSearching", true);

  const endpoint = url == null ? "/unidadeMedida/list" : url;
  console.log("Carregando unidades de medida:", endpoint);

  content.$axios
    .post(
      endpoint,
      {
        filters: content.$store.state.searchFilters || [],
      },
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
        // Enriquecer dados com formatação para exibição
        const enrichedUnidades = response.data.data.map((unidade) => {
          return {
            ...unidade,
            // Manter campo status original da API e adicionar versão formatada
            statusFormatted: unidade.status === "A" ? "Ativo" : "Inativo",
          };
        });

        content.$store.commit("setListUnidadesMedida", {
          ...response.data,
          data: enrichedUnidades,
        });

        console.log(
          "setListUnidadesMedida - dados carregados:",
          enrichedUnidades.length
        );
      } else {
        console.error("Resposta da API sem dados válidos:", response.data);
        content.$store.commit("setListUnidadesMedida", {
          status: false,
          data: [],
        });
      }

      content.$store.commit("setisSearching", false);
    })
    .catch((error) => {
      console.error("Erro na chamada da API listAll:", error);
      console.error("Response error:", error.response);
      content.$store.commit("setisSearching", false);
      content.$store.commit("setListUnidadesMedida", {
        status: false,
        data: [],
      });

      const mensagem =
        error.response?.data?.message ||
        "Erro ao carregar unidades de medida. Verifique sua conexão.";
      if (content.$toastr) {
        content.$toastr.e(mensagem);
      } else {
        alert(mensagem);
      }
    });
};

var listData = (content) => {
  const abaDados = document.querySelector("#aba_dados");
  if (abaDados) abaDados.click();

  console.log("Carregando dados da unidade de medida ID:", content.idData);

  content.$axios
    .post(
      "/unidadeMedida/listData",
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
        console.log("DADOS DA UNIDADE DE MEDIDA:", response.data.data);
        if (content.callback) content.callback();
      } else {
        console.error("Erro ao carregar dados:", response.data);
        const mensagem =
          response.data.message || "Unidade de medida não encontrada";
        if (content.$toastr) {
          content.$toastr.e(mensagem);
        } else {
          alert(mensagem);
        }
      }
    })
    .catch((error) => {
      console.error("Erro na requisição listData:", error);
      const mensagem =
        error.response?.data?.message ||
        "OPS. Pequena intermitência. Se persistir, realize um novo login.";
      if (content.$toastr) {
        content.$toastr.e(mensagem);
      } else {
        alert(mensagem);
      }
    });
};

var deleteData = (content, id) => {
  if (!confirm("Tem certeza de que deseja excluir esta unidade de medida?")) {
    return;
  }

  console.log("Excluindo unidade de medida ID:", id);

  content.$axios
    .post(
      `/unidadeMedida/delete/${id}`,
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
        const mensagem = "Unidade de medida excluída com sucesso.";
        if (content.$toastr) {
          content.$toastr.s(mensagem);
        } else {
          alert(mensagem);
        }
      } else {
        console.log("Erro ao excluir", response);
        const mensagem = response.data.message || "Erro ao excluir";
        if (content.$toastr) {
          content.$toastr.e(mensagem);
        } else {
          alert(mensagem);
        }
      }
    })
    .catch(function (error) {
      console.error("Erro na requisição delete:", error);
      let mensagem =
        "OPS. Pequena intermitência. Se persistir, realize um novo login.";

      // Tratar erro específico de referências existentes (422)
      if (error.response?.status === 422 && error.response?.data?.message) {
        mensagem = error.response.data.message;
        if (error.response.data.references) {
          mensagem +=
            "\nReferências: " + error.response.data.references.join(", ");
        }
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      }

      if (content.$toastr) {
        content.$toastr.e(mensagem);
      } else {
        alert(mensagem);
      }
    });
};

var exportFunctions = {
  ADD_UP: ADD_UP,
  listAll: listAll,
  listData: listData,
  deleteData: deleteData,
};

export default exportFunctions;
