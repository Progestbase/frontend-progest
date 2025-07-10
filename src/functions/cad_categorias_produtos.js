var ADD_UP = (content, funcao) => {
    content.$axios
        .post(
            funcao == "ADD" ? "/categoriasProdutos/add" : "/categoriasProdutos/update",
            {
                categoriasProdutos:
                    funcao == "ADD" || funcao == "UP"
                        ? content.modalData
                        : content.categoriasProdutos_data
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
                alert(funcao == "ADD" ? "Cadastrado" : "Atualizado" + " com sucesso");
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
};

var listAll = (content, url = null) => {
    content.$store.commit("setisSearching", true);
    content.$axios
        .post(
            url == null ? "/categoriasProdutos/list" : url,
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
            content.$store.commit("setListCategoriasProdutos", response.data);
            console.log("setListCategoriasProdutos", response.data.data);
            content.$store.commit("setisSearching", false);
        })
        .catch(error => {
            console.error(error);
            content.$toastr.e("OPS. Pequena intermitência. Se persistir, realize um novo login.");
        });
};

var listData = content => {
    const abaDados = document.querySelector("#aba_dados");
    if (abaDados) abaDados.click();
    content.$axios
        .post(
            "/categoriasProdutos/listData",
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
            console.log('IMPRIMINDO OS DADOS DA CATEGORIA: ', response.data);
            if (content.callback) content.callback(); // Chama o callback após carregar os dados
        })
        .catch(error => {
            console.error(error);
            content.$toastr.e("OPS. Pequena intermitência. Se persistir, realize um novo login.");
        });
};

var update = (content) => {
    content.$axios
        .post(
            "/categoriasProdutos/update",
            {
                categoriasProdutos: content.modalData
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
                content.$toastr.s("Atualizado com sucesso");
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
                console.log("Erro ao atualizar", response);
                content.$toastr.e("Erro ao atualizar");
            }
        })
        .catch(function (error) {
            console.log(error);
            content.$toastr.e("OPS. Pequena intermitência. Se persistir, realize um novo login.");
        });
};

var exportFunctions = {
    ADD_UP: ADD_UP,
    listAll: listAll,
    listData: listData,
    update: update,
}

export default exportFunctions;