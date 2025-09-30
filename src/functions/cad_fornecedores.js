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
        // Limpa erros previamente exibidos
        try {
          content.$store.commit("setModalErrors", {});
        } catch (e) {}
        // Atualiza a lista e mostra mensagem (toastr opcional)
        listAll(content);
        try {
          if (content.$toastr && typeof content.$toastr.s === "function") {
            content.$toastr.s(
              funcao == "ADD"
                ? "Cadastrado com sucesso"
                : "Atualizado com sucesso"
            );
          } else {
            // fallback simples para ambientes sem toastr
            alert(
              funcao == "ADD"
                ? "Cadastrado com sucesso"
                : "Atualizado com sucesso"
            );
          }
        } catch (e) {
          // não atrapalha o fluxo
        }

        // Se for ADD, grava id carregado
        if (funcao == "ADD" && response.data.data && response.data.data.id) {
          content.$store.commit("setIdDataLoaded", response.data.data.id);
        }

        // Atualiza modal state para edição (usa razao_social_nome quando disponível)
        if (response.data.data) {
          const title =
            response.data.data.razao_social_nome ||
            response.data.data.razao_social ||
            response.data.data.nome ||
            "";
          if (title) content.$store.commit("setModalTitle", title);
        }
        content.$store.commit("setModalFunction", "UP");

        // Fechamento defensivo do modal para evitar exceções quando window.bootstrap não existir
        try {
          if (window && window.bootstrap) {
            const modalEl = document.querySelector("#addFornecedores");
            if (modalEl) {
              const modalInst = window.bootstrap.Modal.getInstance(modalEl);
              if (modalInst) modalInst.hide();
            }
          }
        } catch (e) {
          // não faz nada se falhar ao fechar o modal
        }
      } else if (response.data.status == false && response.data.validacao) {
        // Mensagens de validação retornadas pela API (forma antiga)
        const dataErros = response.data.erros || {};
        // grava no store para exibição inline
        try {
          content.$store.commit("setModalErrors", dataErros);
        } catch (e) {}
        let erros = "";
        for (let erro of Object.values(dataErros)) {
          erros += erro + "\n";
        }
        try {
          if (content.$toastr && typeof content.$toastr.e === "function")
            content.$toastr.e(erros);
          else alert(erros);
        } catch (e) {}
      } else {
        try {
          if (content.$toastr && typeof content.$toastr.e === "function")
            content.$toastr.e(
              funcao == "ADD" ? "Erro ao cadastrar" : "Erro ao atualizar"
            );
          else
            alert(funcao == "ADD" ? "Erro ao cadastrar" : "Erro ao atualizar");
        } catch (e) {}
      }
    })
    .catch(function (error) {
      console.error(error);

      const resp = error.response;

      // Tratamento especial para validação 422 (já com parsing acima)
      if (resp && resp.status === 422) {
        try {
          console.debug("fornecedores 422 response:", resp.data);
        } catch (e) {}
        const data = resp.data || {};
        try {
          content.$store.commit("setModalErrors", data.erros || {});
        } catch (e) {}

        let erros = "";
        if (data.erros) {
          for (let campo of Object.values(data.erros)) {
            if (Array.isArray(campo)) {
              erros += campo.join("\n") + "\n";
            } else {
              erros += campo + "\n";
            }
          }
        } else if (data.message) {
          erros = data.message;
        } else {
          erros = "Erro de validação. Verifique os campos informados.";
        }

        try {
          if (content.$toastr && typeof content.$toastr.e === "function")
            content.$toastr.e(erros);
          else alert(erros);
        } catch (e) {}
        return;
      }

      // Se o servidor respondeu (erro HTTP diferente de 422)
      if (resp) {
        const statusInfo = `(${resp.status} ${resp.statusText || ""})`;
        const serverMessage =
          resp.data?.message || resp.data || "Erro no servidor";
        const mensagem =
          typeof serverMessage === "string"
            ? `${serverMessage} ${statusInfo}`
            : `Erro no servidor ${statusInfo}`;
        try {
          if (content.$toastr && typeof content.$toastr.e === "function")
            content.$toastr.e(mensagem);
          else alert(mensagem);
        } catch (e) {}
        return;
      }

      // Se não houve resposta (problema de rede / CORS / backend offline)
      if (error.request) {
        const mensagem =
          "Falha de comunicação: verifique se o servidor API está acessível (backend/offline ou CORS).";
        try {
          if (content.$toastr && typeof content.$toastr.e === "function")
            content.$toastr.e(mensagem);
          else alert(mensagem);
        } catch (e) {}
        return;
      }

      // Fallback genérico
      const mensagemFallback = error.message || "Ocorreu um erro inesperado.";
      try {
        if (content.$toastr && typeof content.$toastr.e === "function")
          content.$toastr.e(mensagemFallback);
        else alert(mensagemFallback);
      } catch (e) {}
    });
};

var listAll = (content, url = null) => {
  content.$store.commit("setisSearching", true);
  const headers = {
    Authorization: "Bearer " + content.$store.getters.getUserToken,
  };

  content.$axios
    .post(
      url == null ? "/fornecedores/list" : url,
      { filters: content.$store.state.searchFilters },
      { headers: { ...headers, "Content-Type": "application/json" } }
    )
    .then((response) => {
      // A API de fornecedores pode retornar um objeto paginado em response.data.data
      // (ex: { current_page, data: [...] }) ou diretamente um array.
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

            // Mantemos a mesma assinatura usada em outros módulos: commit de um objeto com .data = Array
            content.$store.commit("setListFornecedores", {
              ...response.data,
              data: enriched,
            });
          } else {
            // garante formato consistente
            content.$store.commit("setListFornecedores", {
              status: false,
              data: [],
            });
          }
        } else {
          content.$store.commit("setListFornecedores", {
            status: false,
            data: [],
          });
        }
      } catch (e) {
        console.error("Erro ao processar resposta de listAll fornecedores:", e);
        content.$store.commit("setListFornecedores", {
          status: false,
          data: [],
        });
      }

      content.$store.commit("setisSearching", false);
    })
    .catch((error) => {
      console.error(error);
      content.$store.commit("setisSearching", false);
      try {
        if (content.$toastr && typeof content.$toastr.e === "function")
          content.$toastr.e(
            "OPS. Pequena intermitência. Se persistir, realize um novo login."
          );
      } catch (e) {
        // fallback silencioso
      }
    });
};

var listData = (content) => {
  const abaDados = document.querySelector("#aba_dados");
  if (abaDados) abaDados.click();
  const headers = {
    Authorization: "Bearer " + content.$store.getters.getUserToken,
  };

  content.$axios
    .post("/fornecedores/listData", { id: content.idData }, { headers })
    .then((response) => {
      content.$store.commit("setIdDataLoaded", content.idData);
      content.$store.commit("setModalData", response.data.data);
      if (content.callback) content.callback(); // Chama o callback após carregar os dados
    })
    .catch((error) => {
      console.error(error);
      try {
        if (content.$toastr && typeof content.$toastr.e === "function")
          content.$toastr.e(
            "OPS. Pequena intermitência. Se persistir, realize um novo login."
          );
        else
          alert(
            "OPS. Pequena intermitência. Se persistir, realize um novo login."
          );
      } catch (e) {}
    });
};

var deleteData = (content, id) => {
  const headers = {
    Authorization: "Bearer " + content.$store.getters.getUserToken,
  };

  content.$axios
    .post(`/fornecedores/delete/${id}`, {}, { headers })
    .then((response) => {
      if (response.data.status) {
        listAll(content);
        try {
          if (content.$toastr && typeof content.$toastr.s === "function")
            content.$toastr.s("Removido com sucesso");
          else alert("Removido com sucesso");
        } catch (e) {}
      } else {
        try {
          if (content.$toastr && typeof content.$toastr.e === "function")
            content.$toastr.e("Erro ao remover");
          else alert("Erro ao remover");
        } catch (e) {}
      }
    })
    .catch((error) => {
      console.error(error);
      try {
        if (content.$toastr && typeof content.$toastr.e === "function")
          content.$toastr.e(
            "OPS. Pequena intermitência. Se persistir, realize um novo login."
          );
        else
          alert(
            "OPS. Pequena intermitência. Se persistir, realize um novo login."
          );
      } catch (e) {}
    });
};

var exportFunctions = {
  ADD_UP: ADD_UP,
  listAll: listAll,
  listData: listData,
  deleteData: deleteData,
};

export default exportFunctions;
