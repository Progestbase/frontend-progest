import { createStore } from "vuex";

export default createStore({
  state: {
    userToken: localStorage.getItem("token") || null,
    modalData: {
      modalTitle: "",
      modalFunction: "ADD",
      modalData: {},
    },
    listUsers: [],
    listTiposUsuarios: [],
    listUnidades: [],
    listProdutos: [],
    listCategoriasProdutos: [],
    listUnidadesMedida: [],
    listFornecedores: [],
    searchFilters: [],
    idDataLoaded: "",
    isSearching: "",
      listPerfis: [],
      listTiposVinculo: [],
      listSetores: [],
  },
  mutations: {
    setUserToken(state, token) {
      state.userToken = token;
      localStorage.setItem("token", token);
    },
    clearUserToken(state) {
      state.userToken = null;
      localStorage.removeItem("token");
    },
    setModalData(state, payload) {
      state.modalData.modalData = { ...state.modalData.modalData, ...payload };
    },
    resetModalData(state) {
      state.modalData.modalData = {
        status: "A",
        matricula: "",
        name: "",
        cpf: "",
        email: "",
        telefone: "",
        data_nascimento: "",
        tipo_vinculo: "",
        password: "",
      };
    },
    setListUsers(state, users) {
      state.listUsers = users;
    },
    setListTiposUsuario(state, users) {
      state.listTiposUsuario = users;
    },
    setListUnidades(state, unidades) {
      state.listUnidades = unidades;
    },
    setListProdutos(state, produtos) {
      state.listProdutos = produtos;
    },
    setListCategoriasProdutos(state, categorias) {
      state.listCategoriasProdutos = categorias;
    },
    setListUnidadesMedida(state, unidadesMedida) {
      state.listUnidadesMedida = unidadesMedida;
    },
    setListFornecedores(state, fornecedores) {
      state.listFornecedores = fornecedores;
    },
    setListEstoque(state, estoque) {
      state.listEstoque = estoque;
    },
      setListPerfis(state, perfis) {
        state.listPerfis = perfis;
      },
      setListTiposVinculo(state, tipos) {
        state.listTiposVinculo = tipos;
      },
      setListSetores(state, setores) {
        state.listSetores = setores;
      },
    setModalTitle(state, title) {
      state.modalData.modalTitle = title;
    },
    setModalFunction(state, func) {
      state.modalData.modalFunction = func;
    },
    setIdDataLoaded(state, id) {
      state.idDataLoaded = id;
    },
    setisSearching(state, id) {
      state.isSearching = id;
    },
  },
  actions: {
    // Você pode adicionar ações assíncronas aqui se necessário
  },
  getters: {
    getUserToken: (state) => state.userToken,
    getModalData: (state) => state.modalData.modalData,
    getListUsers: (state) => state.listUsers,
    getListTiposUsuario: (state) => state.listTiposUsuario,
    getListUnidades: (state) => state.listUnidades,
    getListCategoriasProdutos: (state) => state.listCategoriasProdutos,
    getListFornecedores: (state) => state.listFornecedores,
      getListPerfis: (state) => state.listPerfis,
      getListTiposVinculo: (state) => state.listTiposVinculo,
      getListSetores: (state) => state.listSetores,
  },
});
