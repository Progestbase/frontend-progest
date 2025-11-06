/**
 * Funções para gerenciamento de movimentações (solicitações/transferências/saídas)
 */

var listBySetor = (content, setorId, perPage = 50, page = 1) => {
  if (!setorId) {
    console.warn("listBySetor movimentacao: setorId não fornecido");
    return;
  }
  const payload = {
    setor_id: setorId,
    per_page: perPage,
    page: page,
  };

  content.$axios
    .post("/movimentacao/listByUnidade", payload, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      if (response.data && response.data.status) {
        const data = response.data.data || [];
        content.$store.commit(
          "setListMovimentacoes",
          Array.isArray(data) ? data : data.data || []
        );
      } else {
        content.$store.commit("setListMovimentacoes", []);
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar movimentações:", error);
      // Se o backend respondeu 405 (método não permitido), tentar fallback por GET
      const status = error?.response?.status;
      if (status === 405) {
        console.warn(
          "movimentacao listBySetor returned 405, tentando GET como fallback"
        );
        return content.$axios
          .get("/movimentacao/listByUnidade", {
            params: payload,
            headers: {
              Authorization: "Bearer " + content.$store.getters.getUserToken,
            },
          })
          .then((response) => {
            if (response.data && response.data.status) {
              const data = response.data.data || [];
              content.$store.commit(
                "setListMovimentacoes",
                Array.isArray(data) ? data : data.data || []
              );
            } else {
              content.$store.commit("setListMovimentacoes", []);
            }
          })
          .catch((err2) => {
            console.error("Fallback GET também falhou:", err2);
            // última tentativa: usar o endpoint genérico /movimentacao/list com filtro
            return content.$axios
              .post(
                "/movimentacao/list",
                {
                  filters: { setor_id: setorId },
                  per_page: perPage,
                  page: page,
                },
                {
                  headers: {
                    Authorization:
                      "Bearer " + content.$store.getters.getUserToken,
                    "Content-Type": "application/json",
                  },
                }
              )
              .then((resp3) => {
                if (resp3.data && resp3.data.status) {
                  const data = resp3.data.data || [];
                  content.$store.commit(
                    "setListMovimentacoes",
                    Array.isArray(data) ? data : data.data || []
                  );
                } else {
                  content.$store.commit("setListMovimentacoes", []);
                }
              })
              .catch((err3) => {
                console.error(
                  "Fallback /movimentacao/list também falhou:",
                  err3
                );
                if (content.$toastr && content.$toastr.e) {
                  const mensagem =
                    err3.response?.data?.message ||
                    "Erro ao carregar movimentações";
                  content.$toastr.e(mensagem);
                }
                content.$store.commit("setListMovimentacoes", []);
              });
          });
      }

      if (content.$toastr && content.$toastr.e) {
        const mensagem =
          error.response?.data?.message || "Erro ao carregar movimentações";
        content.$toastr.e(mensagem);
      }
      content.$store.commit("setListMovimentacoes", []);
    });
};

var listAll = (content, filters = {}, perPage = 50, page = 1) => {
  // Obter setor_id do store se não foi passado nos filtros
  const setorId = filters.setor_id || content.$store.state.setorAtualId;

  if (!setorId) {
    console.warn("⚠️ Sem setor ID para listar movimentações");
    return Promise.resolve({ success: false, data: [] });
  }

  const payload = {
    setor_id: setorId,
    per_page: perPage,
    page: page,
  };

  console.log("🔄 Tentando /movimentacao/listByUnidade com payload:", payload);

  return content.$axios
    .post("/movimentacao/listByUnidade", payload, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      console.log("✅ Resposta movimentações:", response.data);

      if (response.data && response.data.status) {
        const data = response.data.data || [];
        const movimentacoes = Array.isArray(data) ? data : data.data || [];

        // ✅ ATUALIZAR: Se as propriedades forem refs, usar .value
        if (content.movimentacoesItems?.value !== undefined) {
          content.movimentacoesItems.value = movimentacoes;
        } else if (content.movimentacoesItems !== undefined) {
          Object.assign(content, { movimentacoesItems: movimentacoes });
        }

        content.$store.commit("setListMovimentacoes", movimentacoes);
        console.log("✓ setListMovimentacoes atualizado:", movimentacoes.length);

        return { success: true, data: movimentacoes };
      } else {
        if (content.movimentacoesItems?.value !== undefined) {
          content.movimentacoesItems.value = [];
        } else if (content.movimentacoesItems !== undefined) {
          Object.assign(content, { movimentacoesItems: [] });
        }
        content.$store.commit("setListMovimentacoes", []);
        return { success: false, data: [] };
      }
    })
    .catch((error) => {
      console.error("❌ Erro ao listar movimentações (POST):", error.message);

      // Se o backend respondeu 405 (método não permitido), tentar fallback por GET
      const status = error?.response?.status;
      if (status === 405) {
        console.warn("🔄 POST retornou 405, tentando GET como fallback");
        return content.$axios
          .get("/movimentacao/listByUnidade", {
            params: payload,
            headers: {
              Authorization: "Bearer " + content.$store.getters.getUserToken,
            },
          })
          .then((response) => {
            console.log(
              "✅ Resposta movimentações (GET fallback):",
              response.data
            );
            if (response.data && response.data.status) {
              const data = response.data.data || [];
              const movimentacoes = Array.isArray(data)
                ? data
                : data.data || [];

              // ✅ ATUALIZAR: Se as propriedades forem refs, usar .value
              if (content.movimentacoesItems?.value !== undefined) {
                content.movimentacoesItems.value = movimentacoes;
              } else if (content.movimentacoesItems !== undefined) {
                Object.assign(content, { movimentacoesItems: movimentacoes });
              }

              content.$store.commit("setListMovimentacoes", movimentacoes);
              console.log(
                "✓ setListMovimentacoes atualizado (fallback):",
                movimentacoes.length
              );
              return { success: true, data: movimentacoes };
            } else {
              if (content.movimentacoesItems?.value !== undefined) {
                content.movimentacoesItems.value = [];
              } else if (content.movimentacoesItems !== undefined) {
                Object.assign(content, { movimentacoesItems: [] });
              }
              content.$store.commit("setListMovimentacoes", []);
              return { success: false, data: [] };
            }
          })
          .catch((err2) => {
            console.error("❌ Fallback GET também falhou:", err2.message);
            if (content.movimentacoesItems?.value !== undefined) {
              content.movimentacoesItems.value = [];
            } else if (content.movimentacoesItems !== undefined) {
              Object.assign(content, { movimentacoesItems: [] });
            }
            content.$store.commit("setListMovimentacoes", []);
            return { success: false, data: [], error: err2 };
          });
      }

      console.error("❌ Erro geral ao listar movimentações:", error);
      if (content.movimentacoesItems?.value !== undefined) {
        content.movimentacoesItems.value = [];
      } else if (content.movimentacoesItems !== undefined) {
        Object.assign(content, { movimentacoesItems: [] });
      }
      content.$store.commit("setListMovimentacoes", []);
      return { success: false, data: [], error };
    });
};

var listData = (content, movimentacaoId) => {
  if (!movimentacaoId) return Promise.reject("ID da movimentação obrigatório");
  return content.$axios
    .get(`/movimentacao/${movimentacaoId}`, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
      },
    })
    .then((res) => (res.data?.status ? res.data.data : null))
    .catch((err) => {
      throw err;
    });
};

var ADD_UP = (content, funcao = "ADD") => {
  console.log(
    "Executando " +
      (funcao == "ADD" ? "cadastro" : "atualização") +
      " de movimentação"
  );

  // suportar chamada a partir de componente (content.form) ou objeto simples
  const src =
    content && content.form ? content.form : content.modalData || content || {};

  const resolvedUserId =
    src.usuario_id ||
    (content && content.$store ? content.$store.state.user?.id : null) ||
    null;
  const payload = {
    usuario_id: resolvedUserId,
    // alguns backends/validações esperam 'user_id' em vez de 'usuario_id'
    user_id: resolvedUserId,
    setor_origem_id: src.setor_origem_id || null,
    setor_destino_id: src.setor_destino_id || null,
    // tipo da movimentação: T = Transferência (padrão)
    tipo: src.tipo || "T",
    tipo_produto: src.tipo_produto || src.tipo || null,
    observacao: src.observacao || "",
    status_solicitacao: src.status_solicitacao || "P",
    itens: Array.isArray(src.itens)
      ? src.itens.map((it) => ({
          produto_id: it.produto_id,
          quantidade_solicitada:
            it.quantidade_solicitada != null
              ? it.quantidade_solicitada
              : it.quantidade || 0,
          lote: it.lote || undefined,
        }))
      : [],
  };

  if (funcao == "UP" && src.id) payload.id = src.id;

  // Retornar a promise para que o chamador possa reagir
  return content.$axios
    .post("/movimentacao/add", payload, {
      headers: {
        Authorization:
          "Bearer " +
          (content.$store ? content.$store.getters.getUserToken : ""),
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      if (response.data && response.data.status) {
        try {
          listAll(content);
        } catch (e) {
          console.warn(
            "Não foi possível atualizar lista após salvar movimentação",
            e
          );
        }
        // limpar erros
        if (content.$store) content.$store.commit("setModalErrors", {});
        return response.data;
      } else if (response.data && response.data.validacao) {
        if (content.$store)
          content.$store.commit("setModalErrors", response.data.erros || {});
        return Promise.reject({
          validation: true,
          errors: response.data.erros || {},
        });
      } else {
        const mensagem =
          response.data?.message || "Erro ao salvar movimentação";
        try {
          if (content.$toastr && content.$toastr.e) content.$toastr.e(mensagem);
        } catch (e) {
          console.warn("Erro ao exibir notificação:", e);
        }
        return Promise.reject({ message: mensagem });
      }
    })
    .catch((error) => {
      console.error("Erro na requisição movimentacao:", error);
      const status = error.response?.status;
      // Erro de validação do backend -> 422 Unprocessable Entity
      if (status === 422) {
        const errs =
          error.response?.data?.errors || error.response?.data?.erros || {};
        if (content.$store) content.$store.commit("setModalErrors", errs || {});
        return Promise.reject({
          validation: true,
          errors: errs,
          response: error.response,
        });
      }

      const mensagem = error.response?.data?.message || "Erro na requisição";
      try {
        if (content.$toastr && content.$toastr.e) content.$toastr.e(mensagem);
      } catch (e) {
        console.warn("Erro ao exibir notificação:", e);
      }
      return Promise.reject(error);
    });
};

export default {
  listBySetor,
  listAll,
  listData,
  ADD_UP,
};
