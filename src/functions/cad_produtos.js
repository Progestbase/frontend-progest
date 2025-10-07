// MÓDULO DE PRODUTOS
// Implementação seguindo a documentação oficial da API

var ADD_UP = (content, funcao) => {
  console.log(
    "Executando " +
      (funcao == "ADD" ? "cadastro" : "atualização") +
      " de produto"
  );

  // Preparar dados conforme documentação da API
  const produtoData = {
    produto: {
      nome: content.modalData.nome,
      marca: content.modalData.marca || "",
      codigo_simpras: content.modalData.codigo_simpras || "",
      codigo_barras: content.modalData.codigo_barras || "",
      grupo_produto_id: content.modalData.grupo_produto_id,
      unidade_medida_id: content.modalData.unidade_medida_id,
      status: content.modalData.status || "A",
    },
  };

  // Se for atualização, incluir ID
  if (funcao == "UP") {
    produtoData.produto.id = content.modalData.id;
  }

  content.$axios
    .post(funcao == "ADD" ? "/produtos/add" : "/produtos/update", produtoData, {
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
            ? "Produto cadastrado com sucesso!"
            : "Produto atualizado com sucesso!";

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
          const modal = document.querySelector("#addUPProduto");
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
        const mensagem =
          response.data.message ||
          "Erro ao " + (funcao == "ADD" ? "cadastrar" : "atualizar");

        try {
          if (content.$toastr && content.$toastr.e) {
            content.$toastr.e(mensagem);
          } else {
            alert(mensagem);
          }
        } catch (e) {
          console.warn("Erro ao exibir notificação:", e);
          alert(mensagem);
        }
      }
    })
    .catch(function (error) {
      console.error("Erro na requisição:", error);
      const mensagem =
        error.response?.data?.message ||
        "OPS. Pequena intermitência. Se persistir, realize um novo login.";

      try {
        if (content.$toastr && content.$toastr.e) {
          content.$toastr.e(mensagem);
        } else {
          alert(mensagem);
        }
      } catch (e) {
        console.warn("Erro ao exibir notificação:", e);
        alert(mensagem);
      }
    });
};

var listAll = (content, url = null) => {
  console.log("Listando produtos...");
  content.$store.commit("setisSearching", true);

  content.$axios
    .post(
      url == null ? "/produtos/list" : url,
      {
        filters: content.$store.state.searchFilters || [{}],
        per_page: 15,
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

      // Formato esperado: { status: true, data: { data: [...], pagination info } }
      if (response.data && response.data.status) {
        content.$store.commit("setListProdutos", response.data.data);
      } else {
        // Fallback para formato antigo ou inesperado
        content.$store.commit("setListProdutos", { status: true, data: [] });
      }

      content.$store.commit("setisSearching", false);
    })
    .catch((error) => {
      console.error("Erro ao listar produtos:", error);
      content.$store.commit("setisSearching", false);

      // Tratamento defensivo para notificação de erro
      const mensagem =
        "OPS! \nEstamos com algum problema, tente novamente mais tarde.";
      try {
        if (content.$toastr && content.$toastr.e) {
          content.$toastr.e(mensagem);
        } else {
          alert(mensagem);
        }
      } catch (e) {
        console.warn("Erro ao exibir notificação:", e);
        alert(mensagem);
      }
    });
};

var listData = (content) => {
  const id = content.idData;
  console.log("Carregando dados do produto ID:", id);

  content.$axios
    .post(
      "/produtos/listData",
      { id: id },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      console.log("Resposta listData:", response.data);

      if (response.data && response.data.status && response.data.data) {
        // Carregar dados no modal
        content.$store.commit("setModalData", response.data.data);
        content.$store.commit("setModalTitle", response.data.data.nome);
        content.$store.commit("setModalFunction", "UP");
        content.$store.commit("setIdDataLoaded", response.data.data.id);

        // Executar callback se fornecido
        if (content.callback && typeof content.callback === "function") {
          content.callback();
        }
      } else {
        const mensagem = "Produto não encontrado";
        try {
          if (content.$toastr && content.$toastr.e) {
            content.$toastr.e(mensagem);
          } else {
            alert(mensagem);
          }
        } catch (e) {
          console.warn("Erro ao exibir notificação:", e);
          alert(mensagem);
        }
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar dados do produto:", error);
      const mensagem = "Erro ao carregar dados do produto";
      try {
        if (content.$toastr && content.$toastr.e) {
          content.$toastr.e(mensagem);
        } else {
          alert(mensagem);
        }
      } catch (e) {
        console.warn("Erro ao exibir notificação:", e);
        alert(mensagem);
      }
    });
};

var deleteData = (content, id) => {
  console.log("Excluindo produto ID:", id);

  if (confirm("Tem certeza que deseja excluir este produto?")) {
    content.$axios
      .post(
        "/produtos/delete",
        { id: id },
        {
          headers: {
            Authorization: "Bearer " + content.$store.getters.getUserToken,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        console.log("Resposta delete:", response.data);

        if (response.data && response.data.status) {
          listAll(content);
          const mensagem = "Produto excluído com sucesso!";
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
        } else {
          const mensagem = response.data.message || "Erro ao excluir produto";
          try {
            if (content.$toastr && content.$toastr.e) {
              content.$toastr.e(mensagem);
            } else {
              alert(mensagem);
            }
          } catch (e) {
            console.warn("Erro ao exibir notificação:", e);
            alert(mensagem);
          }
        }
      })
      .catch((error) => {
        console.error("Erro ao excluir produto:", error);
        const mensagem =
          error.response?.data?.message || "Erro ao excluir produto";
        try {
          if (content.$toastr && content.$toastr.e) {
            content.$toastr.e(mensagem);
          } else {
            alert(mensagem);
          }
        } catch (e) {
          console.warn("Erro ao exibir notificação:", e);
          alert(mensagem);
        }
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
