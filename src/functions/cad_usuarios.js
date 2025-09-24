var ADD_UP = (content, funcao) => {
  content.$axios
    .post(
      funcao == "ADD" ? "/user/add" : "/user/update",
      {
        user:
          funcao == "ADD" || funcao == "UP"
            ? content.modalData
            : content.user_data
      },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken
        }
      }
    )
    .then(function (response) {
      if (response.data.status) {
        listALL(content);
        alert(funcao == "ADD" ? "Usuário cadastrado com sucesso!" : "Usuário atualizado com sucesso!");

        if (funcao == "ADD") {
          content.modalData.id = response.data.data.id;
          content.$store.commit("setIdDataLoaded", response.data.data.id);
        }
        content.$store.commit("setModalTitle", response.data.data.name);
        content.$store.commit("setModalFunction", "UP");

      } else if (response.data.status == false && response.data.validacao) {
        let erros = "";
        for (let erro of Object.values(response.data.erros)) {
          erros += erro + "\n";
        }
        alert(erros);
      }

      else {
        console.log(
          "Erro ao ", funcao == "ADD" ? "cadastrar" : "atualizar",
          response
        );
      }
    })
    .catch(function (error) {
      alert(error.response.data.message);
    });
};

var EDIT_PERFIL = (content, funcao) => {
  content.$axios
    .post(
      "/user/update",
      {
        user: content.user_data
      },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken
        }
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

var listALL = (content, url = null) => {
  content.$store.commit("setisSearching", true);
  content.$axios
    .post(
      url == null ? "/user/list" : url,
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
      console.log("Resposta completa da API:", response.data);
      console.log("Status da resposta:", response.data.status);
      console.log("Dados dos usuários:", response.data.data);
      
      if (response.data.status && response.data.data) {
        content.$store.commit("setListUsers", response.data.data);
        console.log("Usuários salvos no store:", response.data.data);
      } else {
        console.error("Resposta da API sem dados válidos:", response.data);
        content.$store.commit("setListUsers", []);
      }
      
      content.$store.commit("setisSearching", false);
    })
    .catch(error => {
      console.error("Erro na chamada da API listALL:", error);
      console.error("Response error:", error.response);
      content.$store.commit("setisSearching", false);
      content.$store.commit("setListUsers", []);
      if (content.$toastr) {
        content.$toastr.e("Erro ao carregar usuários. Verifique o console para mais detalhes.");
      }
    });
};

var listData = content => {
  const abaDados = document.querySelector("#aba_dados");
  if (abaDados) abaDados.click();
  content.$axios
    .post(
      "/user/listData",
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
      content.$store.commit("setListUnidades", response.data.unidade);
      content.$store.commit("setListTiposUsuario", response.data.tipo_usuario);
      console.log('IMPRIMINDO OS DADOS DO USUÁRIO: ', response.data);
      if (content.callback) content.callback(); // Chama o callback após carregar os dados
    })
    .catch(error => {
      console.error(error);
      content.$toastr.e("OPS. Pequena intermitência. Se persistir, realize um novo login.");
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
        checkd: checkd
      },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken
        }
      }
    )
    .then(response => {
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
    .catch(error => {
      console.error(error);
      //alert("OPS! \nEstamos com algum problema, tente novamente mais tarde.");
      content.$toastr.e("OPS. Pequena intermitência. Se persistir, realize um novo login.");
    });
};

// Mantém apenas a função de tipos de vínculo que é obrigatória
var listTiposVinculo = (content, url = null) => {
  content.$axios
    .post(url == null ? "/tipoVinculo/list" : url, {}, {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken
      }
    })
    .then(response => {
      content.$store.commit("setListTiposVinculo", response.data.data);
      console.log("setListTiposVinculo", response.data.data);
    })
    .catch(error => {
      console.error("Erro ao carregar tipos de vínculo:", error);
      // Inicializa com array vazio para evitar erros no frontend
      content.$store.commit("setListTiposVinculo", []);
      // Não mostra alert para não interromper o fluxo principal
    });
};

var exportFunctions = {
  ADD_UP: ADD_UP,
  listALL: listALL,
  listData: listData,
  toggleData: toggleData,
  EDIT_PERFIL: EDIT_PERFIL,
  listTiposVinculo: listTiposVinculo,
};

export default exportFunctions;