import axios from "axios";
import { API_URL } from "@/config";

// Função para adicionar ou atualizar setor (compatível com o sistema existente)
var ADD_UP = (content, funcao) => {
  // Construir payload principal
  const setoresPayload =
    funcao == "ADD" || funcao == "UP" ? content.modalData : content.setor_data;

  const payload = { setores: setoresPayload };

  // Incluir fornecedores quando fornecidos pelo modal
  try {
    const fornecedoresLocal =
      content.modalData.fornecedores || content.fornecedores || [];
    if (Array.isArray(fornecedoresLocal) && fornecedoresLocal.length > 0) {
      if (funcao == "ADD") {
        // Para compatibilidade com endpoints que aceitam um único objeto 'fornecedor',
        // se houver apenas um item, enviar como 'fornecedor', senão enviar 'fornecedores' (API deve aceitar ambos ou ignorar)
        if (fornecedoresLocal.length === 1) {
          payload.fornecedor = {
            setor_id: fornecedoresLocal[0].setor_fornecedor_id,
            tipo_produto: fornecedoresLocal[0].tipo_produto,
          };
        } else {
          payload.fornecedores = fornecedoresLocal.map((f) => ({
            setor_fornecedor_id: f.setor_fornecedor_id,
            tipo_produto: f.tipo_produto,
            id: f.id || undefined,
          }));
        }
      } else if (funcao == "UP") {
        // Para update, API espera 'fornecedores' array (sincronização)
        payload.fornecedores = fornecedoresLocal.map((f) => {
          const item = {
            setor_fornecedor_id: f.setor_fornecedor_id,
            tipo_produto: f.tipo_produto,
          };
          if (f.id) item.id = f.id;
          return item;
        });
      }
    }
  } catch (e) {
    /* ignore */
  }

  // Execução ADD_UP setores (logs de depuração removidos)

  content.$axios
    .post(funcao == "ADD" ? "/setores/add" : "/setores/update", payload, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
      },
    })
    .then(function (response) {
      if (response.data.status === "success" || response.data.status === true) {
        listAll(content);
        content.$toastr.success(
          (funcao == "ADD" ? "Cadastrado" : "Atualizado") + " com sucesso"
        );

        if (funcao == "ADD") {
          content.modalData.id = response.data.data.id;
          content.$store.commit("setIdDataLoaded", response.data.data.id);
        }
        content.$store.commit("setModalTitle", response.data.data.nome);
        content.$store.commit("setModalFunction", "UP");
        // dados retornados processados

        // Fechar modal após sucesso (proteção contra bootstrap não disponível)
        setTimeout(() => {
          try {
            const modalElement = document.getElementById("addUPSetor");
            if (
              modalElement &&
              window &&
              window.bootstrap &&
              window.bootstrap.Modal
            ) {
              const modal = window.bootstrap.Modal.getInstance(modalElement);
              if (modal) modal.hide();
            }
          } catch (e) {
            console.warn(
              "Não foi possível fechar o modal addUPSetor automaticamente:",
              e
            );
          }
        }, 100);
      } else if (response.data.status === "error" && response.data.errors) {
        let erros = "";
        for (let erro of Object.values(response.data.errors)) {
          erros += erro + "\n";
        }
        content.$toastr.error(erros);
        // Commitar erros no Vuex para exibição inline nos modais
        try {
          content.$store.commit("setModalErrors", response.data.errors || {});
        } catch (e) {}
      } else if (response.data.validacao && response.data.erros) {
        let erros = "";
        for (let erro of Object.values(response.data.erros)) {
          erros += erro + "\n";
        }
        content.$toastr.error(erros);
        // Commitar erros no Vuex para exibição inline nos modais
        try {
          content.$store.commit("setModalErrors", response.data.erros || {});
        } catch (e) {}
      } else if (response.data.message) {
        content.$toastr.error(response.data.message);
      } else {
        console.log(
          "Erro ao " + (funcao == "ADD" ? "cadastrar" : "atualizar"),
          response
        );
        content.$toastr.error(
          "Erro ao " + (funcao == "ADD" ? "cadastrar" : "atualizar")
        );
      }
    })
    .catch(function (error) {
      console.log("error caught:", error);

      // Verificar se há detalhes do erro 422 (validação)
      if (error.response && error.response.status === 422) {
        console.log("Erro de validação completo:", error.response);
        console.log("Data do erro:", error.response.data);

        let mensagemErro = "";

        if (error.response.data.erros) {
          // Armazenar erros para o modal
          content.lastValidationErrors = {};

          mensagemErro = "Erros de validação encontrados:\n\n";
          for (let campo in error.response.data.erros) {
            const nomeAmigavel = {
              nome: "Nome",
              descricao: "Descrição",
              status: "Status",
              tipo: "Tipo",
              estoque: "Controle de Estoque",
            };

            const nomeCampo = nomeAmigavel[campo] || campo;
            const erros = error.response.data.erros[campo];

            // Armazenar erro formatado para o campo
            content.lastValidationErrors[campo] = [];

            for (let erro of erros) {
              let mensagemTraduzida = erro;
              if (erro.includes("has already been taken")) {
                // Mensagem genérica de campo já usado
                mensagemTraduzida = "Valor já está em uso. Escolha outro.";
              } else if (erro.includes("is required")) {
                mensagemTraduzida = "Este campo é obrigatório.";
              }
              mensagemErro += `• ${nomeCampo}: ${mensagemTraduzida}\n`;
              content.lastValidationErrors[campo].push(mensagemTraduzida);
            }
          }
        } else if (error.response.data.errors) {
          mensagemErro = "Erros de validação:\n";
          for (let campo in error.response.data.errors) {
            mensagemErro += `- ${campo}: ${error.response.data.errors[
              campo
            ].join(", ")}\n`;
          }
        } else if (error.response.data.message) {
          mensagemErro = error.response.data.message;
        } else {
          mensagemErro = `Erro de validação (422): ${JSON.stringify(
            error.response.data
          )}`;
        }

        console.log("Mensagem de erro formatada:", mensagemErro);

        // Commitar erros no Vuex para exibição inline nos modais
        try {
          content.$store.commit(
            "setModalErrors",
            content.lastValidationErrors || {}
          );
        } catch (e) {}

        if (content.$toastr) {
          content.$toastr.error(mensagemErro);
        } else {
          alert(mensagemErro);
        }
      } else {
        const mensagem =
          "OPS. Pequena intermitência. Se persistir, realize um novo login.";
        if (content.$toastr) {
          content.$toastr.error(mensagem);
        } else {
          alert(mensagem);
        }
      }
    });
};

// Função para listar setores com acesso (para seleção inicial)
var getSetoresWithAccess = (content) => {
  return content.$axios
    .post(
      "/setores/listWithAccess",
      {},
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      console.log("📨 Resposta da API getSetoresWithAccess:", response.data);
      if (response.data.status && response.data.data) {
        // Suporta dois formatos: array direto ou paginação
        let setores = [];
        if (Array.isArray(response.data.data)) {
          setores = response.data.data;
        } else if (
          response.data.data.data &&
          Array.isArray(response.data.data.data)
        ) {
          setores = response.data.data.data;
        }
        console.log("✅ Setores carregados:", setores.length);
        return { success: true, data: setores };
      } else {
        console.warn(
          "⚠️ API retornou status falso ou sem data:",
          response.data
        );
        return { success: false, data: [] };
      }
    })
    .catch((error) => {
      console.error(
        "❌ Erro na requisição getSetoresWithAccess:",
        error.response?.status,
        error.message
      );
      return { success: false, data: [], error };
    });
};

// Função para listar todos os setores
var listAll = (content, url = null) => {
  content.$store.commit("setisSearching", true);
  content.$axios
    .post(
      url == null ? "/setores/list" : url,
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
      if (response.data.status && response.data.data) {
        // Suporta dois formatos: array direto ou paginação do Laravel
        if (Array.isArray(response.data.data)) {
          // Lista simples
          const enriched = response.data.data.map((s) => ({
            ...s,
            statusFormatted: s.status === "A" ? "Ativo" : "Inativo",
          }));
          content.$store.commit("setListSetoresGerais", { data: enriched });
        } else if (
          response.data.data.data &&
          Array.isArray(response.data.data.data)
        ) {
          // Paginação (laravel)
          const setoresArray = response.data.data.data || [];
          const enriched = setoresArray.map((s) => ({
            ...s,
            statusFormatted: s.status === "A" ? "Ativo" : "Inativo",
          }));
          content.$store.commit("setListSetoresGerais", {
            ...response.data.data, // mantém meta de paginação
            data: enriched,
          });
        } else {
          // Caso inesperado, armazenar como vazio
          content.$store.commit("setListSetoresGerais", { data: [] });
        }
      } else {
        console.error("Resposta da API sem dados válidos:", response.data);
        content.$store.commit("setListSetoresGerais", { data: [] });
      }
      content.$store.commit("setisSearching", false);
    })
    .catch((error) => {
      console.error(error);
      content.$toastr.error(
        "OPS! \nEstamos com algum problema, tente novamente mais tarde."
      );
    });
};

// Função para buscar dados de um setor específico
var listData = (content) => {
  const abaDados = document.querySelector("#aba_dados");
  if (abaDados) abaDados.click();
  content.$axios
    .post(
      "/setores/listData",
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
      if (content.callback) content.callback();
    })
    .catch((error) => {
      console.error(error);
      content.$toastr.error(
        "OPS. Pequena intermitência. Se persistir, realize um novo login."
      );
    });
};

// Funções modernas para uso direto (sem dependências do Vue 2)
export const criarSetor = async (dadosSetor) => {
  try {
    const response = await fetch(`${API_URL}/setores/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ setores: dadosSetor }),
    });

    const result = await response.json();

    if (result.status) {
      return { success: true, data: result.data };
    } else {
      return {
        success: false,
        errors: result.erros || null,
        message: result.message || "Erro ao criar setor",
      };
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    return { success: false, message: "Erro de conexão com o servidor" };
  }
};

export const listarSetores = async (
  filters = null,
  paginate = false,
  axiosInstance = null
) => {
  try {
    // Se não tiver axios instance, usar fetch como fallback
    if (!axiosInstance) {
      const body = {};
      if (filters) body.filters = filters;
      if (paginate) body.paginate = paginate;

      const response = await fetch(`${API_URL}/setores/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.status) {
        return { success: true, data: result.data };
      } else {
        return {
          success: false,
          message: result.message || "Erro ao listar setores",
        };
      }
    } else {
      // Usar axios instance do Vue
      const body = {};
      if (filters) body.filters = filters;
      if (paginate) body.paginate = paginate;

      const response = await axiosInstance.post("/setores/list", body, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.status) {
        return { success: true, data: response.data.data };
      } else {
        return {
          success: false,
          message: response.data.message || "Erro ao listar setores",
        };
      }
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    return { success: false, message: "Erro de conexão com o servidor" };
  }
};

export const buscarSetorPorId = async (id) => {
  try {
    console.log("=== buscarSetorPorId iniciado para ID:", id);

    const response = await axios.post(
      `${API_URL}/setores/listData`,
      { id },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    // response recebido

    if (response.data.status) {
      console.log("Setor encontrado:", response.data.data);
      return { success: true, data: response.data.data };
    } else {
      console.log("Erro no status:", response.data.message);
      return {
        success: false,
        message: response.data.message || "Erro ao buscar setor",
      };
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    return { success: false, message: "Erro de conexão com o servidor" };
  }
};

export const atualizarSetor = async (dadosSetor) => {
  try {
    const response = await axios.post(
      `${API_URL}/setores/update`,
      { setores: dadosSetor },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.data.status) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        errors: response.data.erros || null,
        message: response.data.message || "Erro ao atualizar setor",
      };
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    return { success: false, message: "Erro de conexão com o servidor" };
  }
};

// Função para excluir setor (seguindo o padrão das funções antigas)
var deleteSetor = (content, id) => {
  // Retorna uma Promise para uso em chamadas async
  return content.$axios
    .post(
      `/setores/delete/${id}`,
      {},
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then(function (response) {
      if (response.data.status) {
        // Recarregar lista
        try {
          listAll(content);
        } catch (e) {}
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || "Erro ao excluir setor",
          references: response.data.references || null,
        };
      }
    })
    .catch(function (error) {
      console.error("Erro na requisição de exclusão:", error);
      return { success: false, message: "Erro de conexão com o servidor" };
    });
};

// Toggle status via API (A <-> I)
var toggleStatus = (content, setorId) => {
  return content.$axios
    .post(
      "/setores/toggleStatus",
      { id: setorId },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      if (response.data.status) {
        try {
          listAll(content);
        } catch (e) {}
        return { success: true, data: response.data.data };
      } else {
        return { success: false, message: response.data.message };
      }
    })
    .catch((error) => {
      console.error("Erro ao alternar status:", error);
      return { success: false, message: "Erro de conexão" };
    });
};

// Obter detalhes completos de um setor específico
var getSetorDetail = (content, setorId) => {
  return content.$axios
    .post(
      "/setores/getDetail",
      { id: setorId },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      if (response.data.status) {
        // Dados completos já vêm do backend, incluindo fornecedores_relacionados
        const setorData = response.data.data;

        console.log("✓ Detalhes do setor carregados:", setorData.nome);
        console.log(
          "✓ Fornecedores relacionados:",
          setorData.fornecedores_relacionados?.length || 0
        );

        // Armazenar detalhes do setor no Vuex
        content.$store.commit("setSetorDetails", setorData);
        return { success: true, data: setorData };
      } else {
        console.error(
          "Erro ao obter detalhes do setor:",
          response.data.message
        );
        return { success: false, message: response.data.message };
      }
    })
    .catch((error) => {
      console.error("Erro na requisição de detalhes do setor:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Erro de conexão com o servidor",
      };
    });
};

// Adicionar fornecedor a um setor
export const addFornecedor = async (setorSolicitanteId, setorFornecedorId) => {
  try {
    const response = await axios.post(
      `${API_URL}/setores/addFornecedor`,
      {
        setor_solicitante_id: setorSolicitanteId,
        setor_fornecedor_id: setorFornecedorId,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.data.status) {
      return { success: true, message: response.data.message };
    } else {
      return {
        success: false,
        message: response.data.message || "Erro ao adicionar fornecedor",
      };
    }
  } catch (error) {
    console.error("Erro ao adicionar fornecedor:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Erro de conexão com o servidor",
    };
  }
};

// Remover fornecedor de um setor
export const removeFornecedor = async (id) => {
  try {
    const response = await axios.post(
      `${API_URL}/setores/removeFornecedor`,
      { id },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.data.status) {
      return { success: true, message: response.data.message };
    } else {
      return {
        success: false,
        message: response.data.message || "Erro ao remover fornecedor",
      };
    }
  } catch (error) {
    console.error("Erro ao remover fornecedor:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Erro de conexão com o servidor",
    };
  }
};

var exportFunctions = {
  getSetoresWithAccess: getSetoresWithAccess,
  ADD_UP: ADD_UP,
  listAll: listAll,
  listData: listData,
  criarSetor: criarSetor,
  listarSetores: listarSetores,
  buscarSetorPorId: buscarSetorPorId,
  atualizarSetor: atualizarSetor,
  deleteSetor: deleteSetor,
  getSetorDetail: getSetorDetail,
  addFornecedor: addFornecedor,
  removeFornecedor: removeFornecedor,
};

export default exportFunctions;
