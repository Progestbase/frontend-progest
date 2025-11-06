// Módulo para gerenciar vínculos entre usuários e setores (usuario_setor pivot)
// Segue padrão dos outros módulos: usa content.$axios e headers com Bearer token

var listAll = (content, setorId = null) => {
  // Se setorId não foi passado, tenta pegar do store
  const idSetor = setorId || content.$store.state.setorAtualId;

  if (!idSetor) {
    console.warn("⚠️ Sem setor ID para listar usuários");
    return Promise.resolve({ success: false, data: [] });
  }

  return content.$axios
    .post(
      "/usuarioSetor/listBySetor",
      { setor_id: idSetor },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      if (response.data && response.data.status) {
        const usuarios = response.data.data || [];

        // ✅ ATUALIZAR: Se as propriedades forem refs, usar .value
        if (content.usuariosItems?.value !== undefined) {
          content.usuariosItems.value = usuarios;
        } else if (content.usuariosItems !== undefined) {
          Object.assign(content, { usuariosItems: usuarios });
        }

        // Atualizar store
        content.$store.commit("setListUsuariosSetor", usuarios);
        return { success: true, data: usuarios };
      }
      if (content.usuariosItems?.value !== undefined) {
        content.usuariosItems.value = [];
      } else if (content.usuariosItems !== undefined) {
        Object.assign(content, { usuariosItems: [] });
      }
      return { success: false, data: [] };
    })
    .catch((error) => {
      console.error("❌ Erro ao carregar usuários do setor:", error);
      if (content.usuariosItems?.value !== undefined) {
        content.usuariosItems.value = [];
      } else if (content.usuariosItems !== undefined) {
        Object.assign(content, { usuariosItems: [] });
      }
      return { success: false, data: [], error };
    });
};

var listBySetor = (content, setorId) => {
  if (!setorId) return Promise.resolve([]);
  return content.$axios
    .post(
      "/usuarioSetor/listBySetor",
      { setor_id: setorId },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      if (response.data && response.data.status) {
        return response.data.data || [];
      }
      return [];
    })
    .catch((error) => {
      console.error("Erro ao carregar usuários do setor:", error);
      if (content.$toastr)
        content.$toastr.e("Erro ao carregar usuários do setor");
      return [];
    });
};

var create = (content, payload) => {
  // payload: { usuario_id, setor_id, perfil }
  return content.$axios
    .post("/usuarioSetor/create", payload, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Erro ao criar vínculo usuario_setor:", error);
      throw error;
    });
};

var update = (content, payload) => {
  // payload: { usuario_id, setor_id, perfil }
  return content.$axios
    .post("/usuarioSetor/update", payload, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Erro ao atualizar vínculo usuario_setor:", error);
      throw error;
    });
};

var remove = (content, payload) => {
  // payload: { usuario_id, setor_id }
  return content.$axios
    .post("/usuarioSetor/delete", payload, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Erro ao deletar vínculo usuario_setor:", error);
      throw error;
    });
};

// Helpers
var listAllUsers = (content) => {
  // retorna todos os usuários (sem filtro) para permitir seleção ao criar vínculo
  return content.$axios
    .post(
      "/user/list",
      { filters: [] },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      if (response.data && response.data.status)
        return response.data.data || [];
      return [];
    })
    .catch((error) => {
      console.error("Erro ao listar usuários:", error);
      return [];
    });
};

var exportFunctions = {
  listAll: listAll,
  listBySetor: listBySetor,
  create: create,
  update: update,
  remove: remove,
  listAllUsers: listAllUsers,
};

export default exportFunctions;
