import { createStore } from "vuex";

export default createStore({
  state: {
    userToken: localStorage.getItem("token") || null,
    modalData: {
      modalTitle: "",
      modalFunction: "ADD",
      modalData: {},
    },
    // Armazena erros de validação para exibição no modal
    modalErrors: {},
    listUsers: [],
    listTiposUsuarios: [],
    listUnidades: [],
    listProdutos: [],
    listUnidadesMedida: [],
    listGrupoProdutos: [],
    listFornecedores: [],
    listPolos: [],
    searchFilters: [],
    idDataLoaded: "",
    isSearching: "",
    listPerfis: [],
    listTiposVinculo: [],
    listSetores: [],
    listUnidadesGerais: [],
    unidadeAtual: null,
    gruposProdutos: [],
    unidadesMedidaAux: [],
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
    setListGrupoProdutos(state, grupos) {
      state.listGrupoProdutos = grupos;
    },
    setListUnidadesMedida(state, unidadesMedida) {
      state.listUnidadesMedida = unidadesMedida;
    },
    setListFornecedores(state, fornecedores) {
      state.listFornecedores = fornecedores;
    },
    setListPolos(state, polos) {
      state.listPolos = polos;
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
    setListUnidadesGerais(state, unidades) {
      state.listUnidadesGerais = unidades;
    },
    setUnidadeAtual(state, unidade) {
      state.unidadeAtual = unidade;
    },
    SET_MODAL_DATA(state, payload) {
      state.modalData.modalTitle = payload.modalTitle || "";
      state.modalData.modalData = payload.modalData || {};
      state.modalData.modalFunction = payload.modalFunction || "ADD";
    },
    setModalTitle(state, title) {
      state.modalData.modalTitle = title;
    },
    setModalFunction(state, func) {
      state.modalData.modalFunction = func;
    },
    setModalErrors(state, errors) {
      state.modalErrors = errors || {};
    },
    setIdDataLoaded(state, id) {
      state.idDataLoaded = id;
    },
    setisSearching(state, id) {
      state.isSearching = id;
    },
    setGruposProdutos(state, grupos) {
      state.gruposProdutos = grupos;
    },
    setUnidadesMedidaAux(state, unidades) {
      state.unidadesMedidaAux = unidades;
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
    getListGrupoProdutos: (state) => state.listGrupoProdutos,
    getListFornecedores: (state) => state.listFornecedores,
    getListPerfis: (state) => state.listPerfis,
    getListTiposVinculo: (state) => state.listTiposVinculo,
    getListSetores: (state) => state.listSetores,
    getListUnidadesGerais: (state) => state.listUnidadesGerais,
  },
});
