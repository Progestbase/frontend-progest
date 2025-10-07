var ADD_UP = (content, funcao) => {
    const payload =
        funcao == "ADD" || funcao == "UP"
            ? content.modalData
            : content.perfil_data;
    content.$axios
        .post(
            funcao == "ADD" ? "/perfil/add" : "/perfil/update",
            payload,
            {
                headers: {
                    Authorization: "Bearer " + content.$store.getters.getUserToken
                }
            }
        ).then(function (response) {
            if (response.data.status === "success" || response.data.status === true) {
                listAll(content);
                alert((funcao == "ADD" ? "Cadastrado" : "Atualizado") + " com sucesso");
                if (funcao == "ADD") {
                    content.modalData.id = response.data.data.id;
                    content.$store.commit("setIdDataLoaded", response.data.data.id);
                }
                content.$store.commit("setModalTitle", response.data.data.nome);
                content.$store.commit("setModalFunction", "UP");
                console.log(response.data.data);
            } else if (response.data.status === "error" || response.data.errors) {
                let erros = "";
                for (let erro of Object.values(response.data.errors)) {
                    erros += erro + "\n";
                }
                alert("Erro ao " + (funcao == "ADD" ? "cadastrar" : "atualizar") + ": " + erros);
            } else if (response.data.message) {
                alert(response.data.message);
            } else {
                console.log(
                    "Erro ao " + (funcao == "ADD" ? "cadastrar" : "atualizar"),
                    response
                );
                content.$toastr.e(
                    "Erro ao " + (funcao == "ADD" ? "cadastrar" : "atualizar")
                );
            }
        })
        .catch(function (error) {
            console.log(error);
            content.$toastr.e("OPS. Pequena intermitência. Se persistir, realize um novo login.");
        });
}

var exportFunctions = {
    ADD_UP: ADD_UP,
    // listAll: listAll,
    // listData: listData
}

export default exportFunctions;