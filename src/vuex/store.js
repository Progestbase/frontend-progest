import { createStore } from "vuex";

export default createStore({
  state: {
    userToken: localStorage.getItem("token") || null,
    // usuário autenticado (objeto básico com id, name, role, ...)
    user: JSON.parse(localStorage.getItem("user") || "null"),
    modalData: {
      modalTitle: "",
      modalFunction: "ADD",
      modalData: {},
    },
    // Armazena erros de validação para exibição no modal
    modalErrors: {},
    listUsers: [],
    listTiposUsuarios: [],
    listSetores: [],
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
    listSetoresGerais: [],
    setorAtual: null,
    gruposProdutos: [],
    unidadesMedidaAux: [],
    listEntradas: [],
    listEstoqueLote: [],
    listMovimentacoes: [],
  },
  mutations: {
    setUserToken(state, token) {
      state.userToken = token;
      localStorage.setItem("token", token);
    },
    setUser(state, user) {
      state.user = user || null;
      try {
        if (user) localStorage.setItem("user", JSON.stringify(user));
        else localStorage.removeItem("user");
      } catch (e) {
        console.warn("Não foi possível persistir usuário no localStorage", e);
      }
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
    setListSetores(state, setores) {
      state.listSetores = setores;
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
    setListSetoresGerais(state, setores) {
      state.listSetoresGerais = setores;
    },
    setSetorAtual(state, setor) {
      state.setorAtual = setor;
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
    setListEntradas(state, entradas) {
      state.listEntradas = entradas || [];
    },
    setListMovimentacoes(state, movimentacoes) {
      state.listMovimentacoes = movimentacoes || [];
    },
    setListEstoqueLote(state, lotes) {
      state.listEstoqueLote = lotes || [];
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
    getListGrupoProdutos: (state) => state.listGrupoProdutos,
    getListFornecedores: (state) => state.listFornecedores,
    getListPerfis: (state) => state.listPerfis,
    getListTiposVinculo: (state) => state.listTiposVinculo,
    getListEntradas: (state) => state.listEntradas,
    getListMovimentacoes: (state) => state.listMovimentacoes,
  },
});
