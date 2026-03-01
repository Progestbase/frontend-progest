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
      } 
      // O bloco de "Mensagens de validação retornadas pela API (forma antiga)" 
      // foi removido daqui pois o Interceptor Global agora trata o status 422 automaticamente.
    })
    .catch(function (error) {
      console.error("Erro na requisição capturado globalmente:", error);
      // O tratamento especial para validação 422, fallback genérico e problemas 
      // de rede foram removidos daqui e centralizados no nosso main.js
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
      console.error("Erro na chamada da API listAll:", error);
      content.$store.commit("setisSearching", false);
      // fallback silencioso removido, os alertas são gerenciados pelo main.js
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
      console.error("Erro na requisição listData:", error);
      // Aviso visual de intermitência delegado ao Interceptor Global
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
      } 
    })
    .catch((error) => {
      console.error("Erro na requisição delete:", error);
      // Aviso visual de intermitência delegado ao Interceptor Global
    });
};

var exportFunctions = {
  ADD_UP: ADD_UP,
  listAll: listAll,
  listData: listData,
  deleteData: deleteData,
};

export default exportFunctions;