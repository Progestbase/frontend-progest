import { feedback } from "@/components/ui/feedback-modal";

var ADD_UP = (content, funcao) => {
  // Construir payload do usuário removendo campos de vinculação a setores/unidades
  const rawUserData =
    funcao == "ADD" || funcao == "UP"
      ? { ...content.modalData }
      : { ...content.user_data };
  // Remover campos relacionados a Setores/Unidades — vinculação será gerenciada por outro módulo
  delete rawUserData.Setores;
  delete rawUserData.setores;
  delete rawUserData.unidades;

  content.$axios
    .post(
      funcao == "ADD" ? "/user/add" : "/user/update",
      {
        user: rawUserData,
      },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then(function (response) {
      if (response.data.status) {
        listALL(content);

        if (funcao == "ADD") {
          content.modalData.id = response.data.data.id;
          content.$store.commit("setIdDataLoaded", response.data.data.id);
        }
        content.$store.commit("setModalTitle", response.data.data.name);
        content.$store.commit("setModalFunction", "UP");
        content.$store.commit("setModalErrors", {});

        // Fechar o modal antes de exibir o feedback
        if (content.onSuccess && typeof content.onSuccess === "function") {
          content.onSuccess();
        }

        feedback.success(
          funcao == "ADD"
            ? "Usuário cadastrado com sucesso!"
            : "Usuário atualizado com sucesso!"
        );
      } else {
        console.log("Erro inesperado com status 200", response);
      }
    })
    .catch(function (error) {
      console.error("Erro capturado globalmente:", error);
    });
};


var EDIT_PERFIL = (content, funcao) => {
  // Ao editar perfil, garantir que não enviamos Setores/Unidades por este módulo
  const userPayload = { ...content.user_data };
  delete userPayload.Setores;
  delete userPayload.setores;
  delete userPayload.unidades;

  content.$axios
    .post(
      "/user/update",
      {
        user: userPayload,
      },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then(function (response) {
      if (response.data.status) {
        // content.$toastr.s(
        //   funcao == "ADD" ? "Cadastrado" : "Atualizado" + " com sucesso"
        // );
        content.$store.commit("setListUserPerfil", response.data.data);
        sessionStorage.setItem("user", JSON.stringify(response.data.data));
        console.log("USER:", response.data.data);
      }
    })
    .catch(function (error) {
      console.log("Erro ao editar perfil:", error);
    });
};

var listALL = (content, url = null) => {
  content.$store.commit("setisSearching", true);
  content.$axios
    .post(
      url == null ? "/user/list" : url,
      {
        filters: content.$store.state.searchFilters,
        search: content.search || "",
        sort_by: content.sort_by || "name",
        sort_dir: content.sort_dir || "asc",
        tipo_vinculo: content.tipo_vinculo || "",
      },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      if (response.data.status && response.data.data) {
        // Substituir os valores dos usuários pelos nomes legíveis
        const enrichedUsers = response.data.data.map((user) => {
          const tiposVinculo = content.$store.state.listTiposVinculo || [];
          const tipoVinculo = tiposVinculo.find(
            (tipo) => tipo.id == user.tipo_vinculo
          );

          return {
            ...user,
            // Preservar o ID original do tipo de vínculo
            tipo_vinculo_id: user.tipo_vinculo,
            // Substitui o valor numérico pelo nome do tipo de vínculo
            tipo_vinculo: tipoVinculo ? tipoVinculo.nome : "N/A",
            // Substitui A/I por Ativo/Inativo
            status: user.status === "A" ? "Ativo" : "Inativo",
          };
        });

        content.$store.commit("setListUsers", enrichedUsers);
      } else {
        console.error("Resposta da API sem dados válidos:", response.data);
        content.$store.commit("setListUsers", []);
      }

      content.$store.commit("setisSearching", false);
    })
    .catch((error) => {
      console.error("Erro na chamada da API listALL:", error);
      content.$store.commit("setisSearching", false);
      content.$store.commit("setListUsers", []);
    });
};

var listData = (content) => {
  const abaDados = document.querySelector("#aba_dados");
  if (abaDados) abaDados.click();
  content.$axios
    .post(
      "/user/listData",
      { id: content.idData },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      // Ao popular o modal, remover os vínculos a Setores/Unidades — estes serão gerenciados por outro módulo
      const modalPayload = { ...response.data.data };
      delete modalPayload.Setores;
      delete modalPayload.setores;
      delete modalPayload.unidades;

      content.$store.commit("setIdDataLoaded", content.idData);
      content.$store.commit("setModalData", modalPayload);
      content.$store.commit("setModalFunction", "UP");
      content.$store.commit(
        "setModalTitle",
        response.data.data.name || "Editar Usuário"
      );
      console.log("IMPRIMINDO OS DADOS DO USUÁRIO: ", response.data);
      if (content.callback) content.callback(); // Chama o callback após carregar os dados
    })
    .catch((error) => {
      console.error("Erro capturado globalmente em listData:", error);
    });
};

var toggleData = (content, idToggle, metodo, field = null, checkd = null) => {
  content.$axios
    .post(
      "/user/toggle/" + metodo,
      {
        id: content.$store.state.idDataLoaded,
        id_toggle: idToggle,
        field: field,
        checkd: checkd,
      },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      //content.$store.commit("setIdDataLoaded", content.idData);
      //content.$store.commit("setModalData", response.data.data);
      console.log("toggleData", response.data);
      if (response.data.attached) {
        content.$toastr.s(
          (response.data.attached.length > 0 ? "Vinculado" : "Desvinculado") +
          " com sucesso"
        );
      } else {
        content.$toastr.s("Atualizado com sucesso");
      }
    })
    .catch((error) => {
      console.error("Erro no toggleData:", error);
    });
};

// Mantém apenas a função de tipos de vínculo que é obrigatória
var listTiposVinculo = (content, url = null) => {
  return content.$axios
    .post(
      url == null ? "/tipoVinculo/list" : url,
      {},
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      content.$store.commit("setListTiposVinculo", response.data.data);
      console.log("setListTiposVinculo", response.data.data);
      return response.data.data;
    })
    .catch((error) => {
      console.error("Erro ao carregar tipos de vínculo:", error);
      // Inicializa com array vazio para evitar erros no frontend
      content.$store.commit("setListTiposVinculo", []);
      // Retornar array vazio para que chamadores possam continuar sem rejeição
      return [];
    });
};

var listUnidades = (content, url = null) => {
  return content.$axios
    .post(
      url == null ? "/setores/list" : url,
      {},
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      content.$store.commit("setListSetoresGerais", response.data.data);
      console.log("setListSetoresGerais", response.data.data);
      return response.data.data;
    })
    .catch((error) => {
      console.error("Erro ao carregar unidades:", error);
      content.$store.commit("setListUnidades", []);
      throw error;
    });
};

var deleteData = (content, id) => {
  if (!confirm("Tem certeza que deseja alterar o status deste usuário?")) {
    return;
  }

  content.$axios
    .post(
      `/user/delete/${id}`,
      {},
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      }
    )
    .then((response) => {
      if (response.data.status) {
        listALL(content);
        feedback.success(response.data.message || "Status atualizado com sucesso!");
      } else {
        feedback.error(response.data.message || "Erro ao alterar status.");
      }
    })
    .catch((error) => {
      console.error("Erro ao alterar status do usuário:", error);
    });
};

var exportFunctions = {
  ADD_UP: ADD_UP,
  listALL: listALL,
  listData: listData,
  deleteData: deleteData,
  toggleData: toggleData,
  EDIT_PERFIL: EDIT_PERFIL,
  listTiposVinculo: listTiposVinculo,
  listUnidades: listUnidades,
};

export default exportFunctions;
