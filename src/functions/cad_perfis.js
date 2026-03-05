import { feedback } from "@/components/ui/feedback-modal";

var ADD_UP = (content, funcao) => {
  const payload =
    funcao == "ADD" || funcao == "UP" ? content.modalData : content.perfil_data;
  content.$axios
    .post(funcao == "ADD" ? "/perfil/add" : "/perfil/update", payload, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
      },
    })
    .then(function (response) {
      if (response.data.status === "success" || response.data.status === true) {
        listAll(content);
        if (content.$toastr) {
          content.$toastr.success(
            (funcao == "ADD" ? "Cadastrado" : "Atualizado") + " com sucesso",
          );
        } else {
          feedback.success(
            (funcao == "ADD" ? "Cadastrado" : "Atualizado") + " com sucesso",
          );
        }
        if (funcao == "ADD") {
          content.modalData.id = response.data.data.id;
          content.$store.commit("setIdDataLoaded", response.data.data.id);
        }
        content.$store.commit("setModalTitle", response.data.data.nome);
        content.$store.commit("setModalFunction", "UP");
        content.$store.commit("setModalOpen", false);
      } else if (response.data.status === "error" || response.data.errors) {
        let erros = "";
        for (let erro of Object.values(response.data.errors)) {
          erros += erro + "\n";
        }
        if (content.$toastr) {
          content.$toastr.error(
            "Erro ao " +
            (funcao == "ADD" ? "cadastrar" : "atualizar") +
            ": " +
            erros,
          );
        } else {
          feedback.error(
            "Erro ao " +
            (funcao == "ADD" ? "cadastrar" : "atualizar") +
            ": " +
            erros,
          );
        }
      } else if (response.data.message) {
        if (content.$toastr) {
          content.$toastr.error(response.data.message);
        } else {
          feedback.error(response.data.message);
        }
      }
    })
    .catch(function (error) {
      console.log(error);
      if (content.$toastr) {
        content.$toastr.error("Erro na operação de perfil.");
      }
    });
};

var listAll = (content, url = null) => {
  content.$store.commit("setisSearching", true);
  content.$axios
    .post(
      url == null ? "/perfil/list" : url,
      {
        filters: content.$store.state.searchFilters,
      },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      },
    )
    .then((response) => {
      if (response.data.status && response.data.data) {
        content.$store.commit("setListPerfis", response.data.data);
      }
      content.$store.commit("setisSearching", false);
    })
    .catch((error) => {
      console.error(error);
      content.$store.commit("setisSearching", false);
    });
};

var listData = (content) => {
  content.$axios
    .post(
      "/perfil/listData",
      { id: content.idData },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken,
        },
      },
    )
    .then((response) => {
      content.$store.commit("setIdDataLoaded", content.idData);
      content.$store.commit("setModalData", response.data.data);
      if (content.callback) content.callback();
    })
    .catch((error) => {
      console.error(error);
    });
};

var deleteData = (content, id) => {
  if (confirm("Tem certeza que deseja excluir este perfil?")) {
    content.$axios
      .post(
        `/perfil/delete/${id}`,
        {},
        {
          headers: {
            Authorization: "Bearer " + content.$store.getters.getUserToken,
          },
        },
      )
      .then((response) => {
        if (response.data.status) {
          listAll(content);
          if (content.$toastr) content.$toastr.success("Perfil removido.");
        } else {
          if (content.$toastr)
            content.$toastr.error(response.data.message || "Erro ao remover.");
        }
      })
      .catch((e) => {
        console.error(e);
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
