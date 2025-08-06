var ADD_UP = (content, funcao) => {
  content.$axios
    .post(
      funcao == "ADD" ? "/tiposUsuario/add" : "/tiposUsuario/update",
      {
        tiposUsuario:
          funcao == "ADD" || funcao == "UP"
            ? content.modalData
            : content.tipos_usuario_data
      },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken
        }
      }
    )
    .then(function (response) {
      if (response.data.status) {
        listAll(content);
        alert(funcao == "ADD" ? "Cadastrado" : "Atualizado" + "com sucesso");
        if (funcao == "ADD") {
          content.modalData.id = response.data.data.id;
          content.$store.commit("setIdDataLoaded", response.data.data.id);
        }
        content.$store.commit("setModalTitle", response.data.data.nome);
        content.$store.commit("setModalFunction", "UP");
        console.log(response.data.data);
      } else if (response.data.status == false && response.data.validacao) {
        console.log("Erros!!!");
        let erros = "";
        for (let erro of Object.values(response.data.erros)) {
          erros += erro + "\n";
        }
        alert(erros);
      } else {
        console.log(
          "Erro ao " + funcao == "ADD" ? "cadastrar" : "atualizar",
          response
        );
        content.$toastr.e(
          "Erro ao " + funcao == "ADD" ? "cadastrar" : "atualizar"
        );
      }
    })
    .catch(function (error) {
      console.log(error);
      //alert("OPS! \nEstamos com algum problema, tente novamente mais tarde.");
      content.$toastr.e("OPS. Pequena intermitência. Se persistir, realize um novo login.");
    });
};

var listAll = (content, url = null) => {
  content.$store.commit("setisSearching", true);
  content.$axios
    .post(
      url == null ? "/tiposUsuario/list" : url,
      {
        filters: content.$store.state.searchFilters
      },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken
        }
      }
    )
    .then(response => {
      content.$store.commit("setListTiposUsuario", response.data);
      console.log("setListTiposUsuario", response.data.data);
      content.$store.commit("setisSearching", false);
    })
    .catch(error => {
      console.error(error);
      alert("OPS! \nEstamos com algum problema, tente novamente mais tarde.");
    });
};

var listData = content => {
  const abaDados = document.querySelector("#aba_dados");
  if (abaDados) abaDados.click();
  content.$axios
    .post(
      "/tiposUsuario/listData",
      { id: content.idData },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken
        }
      }
    )
    .then(response => {
      content.$store.commit("setIdDataLoaded", content.idData);
      content.$store.commit("setModalData", response.data.data);
      if (content.callback) content.callback(); // Chama o callback após carregar os dados
    })
    .catch(error => {
      console.error(error);
      content.$toastr.e("OPS. Pequena intermitência. Se persistir, realize um novo login.");
    });
};

var exportFunctions = {
  ADD_UP: ADD_UP,
  listAll: listAll,
  listData: listData,
};

export default exportFunctions;
