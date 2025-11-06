// Módulo para gerenciar vínculos entre usuários e setores (usuario_setor pivot)
// Segue padrão dos outros módulos: usa content.$axios e headers com Bearer token

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
  listBySetor: listBySetor,
  create: create,
  update: update,
  remove: remove,
  listAllUsers: listAllUsers,
};

export default exportFunctions;
