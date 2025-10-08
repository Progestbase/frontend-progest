<template>
  <span>
    <ModalBase01
      :idModal="idModal"
      modalClass="modal-dialog modal-xl modal-dialog-centered"
    >
      <div class="row">
        <div class="col-12">
          <h4 class="mb-3 d-flex align-items-center gap-2">
            <i class="mdi mdi-tray-arrow-down text-primary"></i>
            Registrar entrada de estoque
          </h4>
          <p class="text-muted mb-4">
            Preencha os dados abaixo para lançar uma nova entrada de produtos na
            unidade selecionada.
          </p>
        </div>
      </div>

      <form @submit.prevent="registrarEntradaLocal" novalidate>
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label" for="entradaNotaFiscal">
              Nota fiscal
              <span class="text-muted small">(opcional)</span>
            </label>
            <input
              id="entradaNotaFiscal"
              v-model="form.notaFiscal"
              type="text"
              class="form-control text-uppercase"
              placeholder="Ex: NF-2025/001"
            />
          </div>

          <div class="col-md-8">
            <label class="form-label" for="entradaFornecedor">
              Fornecedor
              <span class="text-danger">*</span>
            </label>
            <div class="input-group">
              <select
                id="entradaFornecedor"
                class="form-select"
                :class="{ 'is-invalid': fornecedorErro }"
                v-model="form.fornecedorId"
              >
                <option value="">Selecione um fornecedor</option>
                <option
                  v-for="fornecedor in fornecedoresDisponiveis"
                  :key="fornecedor.id"
                  :value="fornecedor.id"
                >
                  {{ fornecedorLabel(fornecedor) }}
                </option>
              </select>
              <button
                class="btn btn-outline-primary"
                type="button"
                @click="toggleFornecedorForm"
              >
                <i class="mdi mdi-plus"></i>
              </button>
            </div>
            <div v-if="fornecedorErro" class="invalid-feedback">
              {{ fornecedorErro }}
            </div>
          </div>
        </div>

        <div v-if="showFornecedorForm" class="mt-3 p-3 border rounded bg-light">
          <h6 class="mb-3 text-primary">Cadastrar fornecedor rapidamente</h6>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label" for="novoProdutoGrupo">
                Grupo do produto
              </label>
              <div class="input-group">
                <select
                  id="novoProdutoGrupo"
                  v-model="novoProduto.grupo_produto_id"
                  class="form-select"
                >
                  <option value="">Selecionar grupo</option>
                  <option
                    v-for="grupo in gruposDisponiveis"
                    :key="grupo.id"
                    :value="grupo.id"
                  >
                    {{ grupo.nome }}
                  </option>
                </select>
                <button
                  class="btn btn-outline-primary"
                  type="button"
                  @click="toggleGrupoProdutoForm"
                  title="Cadastrar novo grupo"
                >
                  <i class="mdi mdi-plus"></i>
                </button>
              </div>
              <div
                v-if="showGrupoProdutoForm"
                class="mt-2 p-3 border rounded bg-white"
              >
                <label class="form-label small" for="novoGrupoProdutoNome">
                  Nome do grupo
                  <span class="text-danger">*</span>
                </label>
                <input
                  id="novoGrupoProdutoNome"
                  v-model="novoGrupoProduto.nome"
                  type="text"
                  class="form-control form-control-sm text-uppercase"
                  placeholder="Ex: ANALGÉSICOS"
                />
                <div class="d-flex justify-content-end gap-2 mt-2">
                  <button
                    type="button"
                    class="btn btn-secondary btn-sm"
                    @click="cancelarGrupoProdutoForm"
                  >
                    <i class="mdi mdi-close"></i>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    class="btn btn-success btn-sm"
                    @click="salvarGrupoProdutoInline"
                    :disabled="!novoGrupoProduto.nome"
                  >
                    <i class="mdi mdi-check"></i>
                    Salvar grupo
                  </button>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <label class="form-label" for="novoFornecedorNome">
                Razão social / Nome
                <span class="text-danger">*</span>
              </label>
              <input
                id="novoFornecedorNome"
                v-model="novoFornecedor.nome"
                type="text"
                class="form-control text-uppercase"
                placeholder="Digite o nome do fornecedor"
              />
            </div>
            <div class="col-md-4">
              <label class="form-label" for="novoFornecedorTipo">
                Tipo de pessoa
              </label>
              <select
                id="novoFornecedorTipo"
                v-model="novoFornecedor.tipo"
                class="form-select"
              >
                <option value="J">Pessoa Jurídica</option>
                <option value="F">Pessoa Física</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label" for="novoFornecedorDocumento">
                {{ novoFornecedor.tipo === "J" ? "CNPJ" : "CPF" }}
              </label>
              <input
                id="novoFornecedorDocumento"
                v-model="novoFornecedor.documento"
                type="text"
                class="form-control"
                placeholder="Somente números"
                v-mask="mascaraDocumentoFornecedor"
              />
            </div>
            <div class="col-12 d-flex justify-content-end gap-2">
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                @click="cancelarFornecedorForm"
              >
                <i class="mdi mdi-close"></i>
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-success btn-sm"
                @click="salvarFornecedorInline"
                :disabled="!novoFornecedor.nome"
              >
                <i class="mdi mdi-check"></i>
                Salvar fornecedor
              </button>
            </div>
          </div>
        </div>

        <hr class="my-4" />

        <div
          class="d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-center mb-3"
        >
          <div>
            <h5 class="mb-1">Produtos da entrada</h5>
            <p class="text-muted mb-0">
              Adicione os produtos que estão entrando no estoque e informe as
              quantidades.
            </p>
          </div>
          <div class="d-flex gap-2 align-items-end flex-column flex-md-row">
            <div class="input-group">
              <select
                class="form-select"
                v-model="produtoSelecionadoId"
                :disabled="produtosDisponiveis.length === 0"
              >
                <option value="">Selecione um produto</option>
                <option
                  v-for="produto in produtosDisponiveis"
                  :key="produto.id"
                  :value="produto.id"
                >
                  {{ produtoLabel(produto) }}
                </option>
              </select>
              <button
                class="btn btn-outline-primary"
                type="button"
                @click="toggleProdutoForm"
              >
                <i class="mdi mdi-plus"></i>
              </button>
            </div>
            <div>
              <label class="form-label small" for="produtoQuantidade">
                Quantidade
              </label>
              <input
                id="produtoQuantidade"
                type="number"
                class="form-control"
                min="1"
                v-model.number="produtoQuantidade"
              />
            </div>
            <button
              type="button"
              class="btn btn-success d-flex align-items-center justify-content-center"
              style="min-width: 48px"
              @click="adicionarProduto"
              title="Adicionar produto"
            >
              <i class="mdi mdi-cart-plus"></i>
            </button>
          </div>
        </div>

        <div
          v-if="showProdutoForm"
          class="mt-3 mb-4 p-3 border rounded bg-light"
        >
          <h6 class="mb-3 text-primary">Cadastrar produto rapidamente</h6>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label" for="novoProdutoNome">
                Nome do produto
                <span class="text-danger">*</span>
              </label>
              <input
                id="novoProdutoNome"
                v-model="novoProduto.nome"
                type="text"
                class="form-control text-uppercase"
                placeholder="Ex: DIPIRONA 500MG"
              />
            </div>
            <div class="col-md-4">
              <label class="form-label" for="novoProdutoUnidade">
                Unidade de medida
              </label>
              <select
                id="novoProdutoUnidade"
                v-model="novoProduto.unidade_medida_id"
                class="form-select"
              >
                <option value="">Selecionar unidade</option>
                <option
                  v-for="unidade in unidadesMedidaDisponiveis"
                  :key="unidade.id"
                  :value="unidade.id"
                >
                  {{ unidade.nome }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label" for="novoProdutoStatus"> Status </label>
              <select
                id="novoProdutoStatus"
                v-model="novoProduto.status"
                class="form-select"
              >
                <option value="A">Ativo</option>
                <option value="I">Inativo</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label" for="novoProdutoCodigoSimpras">
                Código SIMPRAS
              </label>
              <input
                id="novoProdutoCodigoSimpras"
                v-model="novoProduto.codigo_simpras"
                type="text"
                class="form-control text-uppercase"
                placeholder="Ex: 10301012"
              />
            </div>
            <div class="col-md-3">
              <label class="form-label" for="novoProdutoMarca"> Marca </label>
              <input
                id="novoProdutoMarca"
                v-model="novoProduto.marca"
                type="text"
                class="form-control text-uppercase"
                placeholder="Ex: EMS"
              />
            </div>
            <div class="col-12 d-flex justify-content-end gap-2">
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                @click="cancelarProdutoForm"
              >
                <i class="mdi mdi-close"></i>
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-success btn-sm"
                @click="salvarProdutoInline"
                :disabled="!novoProduto.nome"
              >
                <i class="mdi mdi-check"></i>
                Salvar produto
              </button>
            </div>
          </div>
        </div>

        <div v-if="form.itens.length > 0" class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th class="text-start">Produto</th>
                <th class="text-center">Quantidade</th>
                <th class="text-center">Unidade</th>
                <th class="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in form.itens" :key="item.localId">
                <td class="text-start">
                  <strong>{{ item.produtoNome }}</strong>
                  <div class="text-muted small" v-if="item.produtoCodigo">
                    {{ item.produtoCodigo }}
                  </div>
                </td>
                <td class="text-center">
                  <div
                    v-if="itemEditandoId === item.localId"
                    class="d-flex justify-content-center align-items-center gap-2"
                  >
                    <input
                      type="number"
                      min="1"
                      class="form-control form-control-sm"
                      style="width: 90px"
                      v-model.number="quantidadeEdicao"
                    />
                    <button
                      type="button"
                      class="btn btn-success btn-sm d-flex align-items-center justify-content-center"
                      style="width: 30px; height: 30px; padding: 0"
                      @click="salvarQuantidadeItem(item.localId)"
                      title="Salvar quantidade"
                    >
                      <i class="mdi mdi-check"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm d-flex align-items-center justify-content-center"
                      style="width: 30px; height: 30px; padding: 0"
                      @click="cancelarEdicaoItem"
                      title="Cancelar"
                    >
                      <i class="mdi mdi-close"></i>
                    </button>
                  </div>
                  <span v-else>{{ item.quantidade }}</span>
                </td>
                <td class="text-center">
                  {{ item.unidadeMedidaNome || "-" }}
                </td>
                <td class="text-center">
                  <button
                    v-if="itemEditandoId !== item.localId"
                    type="button"
                    class="btn btn-outline-primary btn-sm me-1"
                    @click="editarQuantidadeItem(item)"
                    title="Editar quantidade"
                  >
                    <i class="mdi mdi-pencil"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    @click="removerProduto(item.localId)"
                    title="Remover produto"
                  >
                    <i class="mdi mdi-delete"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="alert alert-info d-flex align-items-center">
          <i class="mdi mdi-information-outline me-2"></i>
          <span>Inclua ao menos um produto para registrar a entrada.</span>
        </div>

        <div class="mt-4 d-flex justify-content-end gap-2">
          <button
            type="button"
            class="btn btn-secondary btn-modal"
            data-bs-dismiss="modal"
            :disabled="loading"
          >
            <i class="mdi mdi-close-thick me-2"></i>
            Cancelar
          </button>
          <button
            type="submit"
            class="btn btn-success btn-modal"
            :disabled="loading || !podeSalvar"
          >
            <i class="mdi mdi-check-bold me-2"></i>
            Registrar entrada
          </button>
        </div>
      </form>
    </ModalBase01>
  </span>
</template>

<script>
import ModalBase01 from "@/components/layouts/ModalBase01.vue";
import cadFornecedores from "@/functions/cad_fornecedores.js";
import cadProdutos from "@/functions/cad_produtos.js";
import cadUnidadesMedida from "@/functions/cad_unidades_medida.js";
import cadGrupoProduto from "@/functions/cad_grupo_produto.js";

export default {
  name: "ModalEntradaEstoque",
  components: {
    ModalBase01,
  },
  emits: ["registrado"],
  props: {
    idModal: {
      type: String,
      required: true,
    },
    unidade: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      loading: false,
      form: {
        notaFiscal: "",
        fornecedorId: "",
        itens: [],
      },
      showFornecedorForm: false,
      novoFornecedor: {
        nome: "",
        documento: "",
        tipo: "J",
      },
      fornecedoresCustom: [],
      fornecedorErro: "",
      showProdutoForm: false,
      novoProduto: {
        nome: "",
        unidade_medida_id: "",
        status: "A",
        grupo_produto_id: "",
        codigo_simpras: "",
        marca: "",
      },
      showGrupoProdutoForm: false,
      novoGrupoProduto: {
        nome: "",
      },
      produtosCustom: [],
      gruposCustom: [],
      produtoSelecionadoId: "",
      produtoQuantidade: 1,
      itemEditandoId: null,
      quantidadeEdicao: 1,
    };
  },
  computed: {
    fornecedoresDisponiveis() {
      const base = this.normalizarLista(this.$store.state.listFornecedores);
      return [...base, ...this.fornecedoresCustom];
    },
    produtosDisponiveis() {
      const base = this.normalizarLista(this.$store.state.listProdutos);
      return [...base, ...this.produtosCustom];
    },
    gruposDisponiveis() {
      const base = this.normalizarLista(this.$store.state.listGrupoProdutos);
      return [...base, ...this.gruposCustom];
    },
    unidadesMedidaDisponiveis() {
      return this.normalizarLista(this.$store.state.listUnidadesMedida);
    },
    mascaraDocumentoFornecedor() {
      return this.novoFornecedor.tipo === "J"
        ? "##.###.###/####-##"
        : "###.###.###-##";
    },
    podeSalvar() {
      return (
        !this.loading && this.form.fornecedorId && this.form.itens.length > 0
      );
    },
  },
  watch: {
    "form.fornecedorId"(value) {
      if (value) {
        this.fornecedorErro = "";
      }
    },
    "novoFornecedor.tipo"() {
      this.novoFornecedor.documento = "";
    },
  },
  mounted() {
    this.ensureDadosDependencias();
    this.registrarEventosModal();
  },
  beforeUnmount() {
    this.removerEventosModal();
  },
  methods: {
    ensureDadosDependencias() {
      if (this.fornecedoresDisponiveis.length === 0) {
        cadFornecedores.listAll(this);
      }
      if (this.produtosDisponiveis.length === 0) {
        cadProdutos.listAll(this);
      }
      if (this.unidadesMedidaDisponiveis.length === 0) {
        cadUnidadesMedida.listAll(this);
      }
      if (this.gruposDisponiveis.length === 0) {
        cadGrupoProduto.listAll(this);
      }
    },
    registrarEventosModal() {
      const modalEl = document.getElementById(this.idModal);
      if (!modalEl) return;

      modalEl.addEventListener("show.bs.modal", this.handleShowModal);
      modalEl.addEventListener("hidden.bs.modal", this.resetarFormulario);
    },
    removerEventosModal() {
      const modalEl = document.getElementById(this.idModal);
      if (!modalEl) return;
      modalEl.removeEventListener("show.bs.modal", this.handleShowModal);
      modalEl.removeEventListener("hidden.bs.modal", this.resetarFormulario);
    },
    handleShowModal() {
      this.ensureDadosDependencias();
    },
    normalizarLista(lista) {
      if (!lista) return [];
      if (Array.isArray(lista)) return lista;
      if (lista.data && Array.isArray(lista.data)) return lista.data;
      return [];
    },
    fornecedorLabel(fornecedor) {
      if (!fornecedor) return "-";
      const nome =
        fornecedor.razao_social_nome ||
        fornecedor.razao_social ||
        fornecedor.nome;
      const doc =
        fornecedor.documento_formatado ||
        fornecedor.cnpj ||
        fornecedor.cpf ||
        fornecedor.documento;
      return doc ? `${nome} • ${doc}` : nome;
    },
    produtoLabel(produto) {
      if (!produto) return "-";
      const unidade =
        produto.unidade_medida?.nome || produto.unidade_medida_nome;
      return unidade ? `${produto.nome} (${unidade})` : produto.nome;
    },
    toggleFornecedorForm() {
      this.showFornecedorForm = !this.showFornecedorForm;
      if (this.showFornecedorForm) {
        this.novoFornecedor = {
          nome: "",
          documento: "",
          tipo: "J",
        };
      }
    },
    cancelarFornecedorForm() {
      this.showFornecedorForm = false;
      this.novoFornecedor = {
        nome: "",
        documento: "",
        tipo: "J",
      };
    },
    salvarFornecedorInline() {
      if (!this.novoFornecedor.nome) {
        this.notificar("Informe o nome do fornecedor", "error");
        return;
      }

      const documentoNumerico = (this.novoFornecedor.documento || "").replace(
        /\D/g,
        ""
      );

      const isPessoaJuridica = this.novoFornecedor.tipo === "J";
      const documentoValido = isPessoaJuridica
        ? documentoNumerico.length === 14
        : documentoNumerico.length === 11;

      if (!documentoValido) {
        const mensagem = isPessoaJuridica
          ? "CNPJ deve ter 14 dígitos"
          : "CPF deve ter 11 dígitos";
        this.notificar(mensagem, "error");
        return;
      }

      const novo = {
        id: `tmp-fornecedor-${Date.now()}`,
        razao_social_nome: this.novoFornecedor.nome,
        cnpj: isPessoaJuridica ? documentoNumerico : null,
        cpf: !isPessoaJuridica ? documentoNumerico : null,
        documento_formatado: this.novoFornecedor.documento || "",
        status: "A",
      };

      this.fornecedoresCustom.push(novo);
      this.form.fornecedorId = novo.id;
      this.showFornecedorForm = false;
      this.notificar("Fornecedor adicionado localmente", "success");
    },
    toggleProdutoForm() {
      this.showProdutoForm = !this.showProdutoForm;
      if (this.showProdutoForm) {
        this.novoProduto = {
          nome: "",
          unidade_medida_id: "",
          status: "A",
          grupo_produto_id: "",
          codigo_simpras: "",
          marca: "",
        };
        this.showGrupoProdutoForm = false;
        this.novoGrupoProduto = {
          nome: "",
        };
      }
    },
    toggleGrupoProdutoForm() {
      this.showGrupoProdutoForm = !this.showGrupoProdutoForm;
      if (this.showGrupoProdutoForm) {
        this.novoGrupoProduto = {
          nome: "",
        };
      }
    },
    cancelarProdutoForm() {
      this.showProdutoForm = false;
      this.novoProduto = {
        nome: "",
        unidade_medida_id: "",
        status: "A",
        grupo_produto_id: "",
        codigo_simpras: "",
        marca: "",
      };
      this.cancelarGrupoProdutoForm();
    },
    cancelarGrupoProdutoForm() {
      this.showGrupoProdutoForm = false;
      this.novoGrupoProduto = {
        nome: "",
      };
    },
    salvarGrupoProdutoInline() {
      if (!this.novoGrupoProduto.nome) {
        this.notificar("Informe o nome do grupo", "error");
        return;
      }

      const novo = {
        id: `tmp-grupo-produto-${Date.now()}`,
        nome: this.novoGrupoProduto.nome,
        status: "A",
      };

      this.gruposCustom.push(novo);
      this.novoProduto.grupo_produto_id = novo.id;
      this.cancelarGrupoProdutoForm();
      this.notificar("Grupo de produto adicionado localmente", "success");
    },
    salvarProdutoInline() {
      if (!this.novoProduto.nome) {
        this.notificar("Informe o nome do produto", "error");
        return;
      }

      if (!this.novoProduto.unidade_medida_id) {
        this.notificar("Selecione uma unidade de medida", "error");
        return;
      }

      const unidade = this.unidadesMedidaDisponiveis.find(
        (item) => item.id === this.novoProduto.unidade_medida_id
      );

      const grupo = this.gruposDisponiveis.find(
        (item) => item.id === this.novoProduto.grupo_produto_id
      );

      const novo = {
        id: `tmp-produto-${Date.now()}`,
        nome: this.novoProduto.nome,
        unidade_medida: unidade ? { id: unidade.id, nome: unidade.nome } : null,
        status: this.novoProduto.status || "A",
        grupo_produto: grupo ? { id: grupo.id, nome: grupo.nome } : null,
        grupo_produto_id: grupo ? grupo.id : null,
        codigo_simpras: this.novoProduto.codigo_simpras || null,
        marca: this.novoProduto.marca || null,
      };

      this.produtosCustom.push(novo);
      this.produtoSelecionadoId = novo.id;
      this.showProdutoForm = false;
      this.showGrupoProdutoForm = false;
      this.notificar("Produto adicionado localmente", "success");
    },
    adicionarProduto() {
      if (!this.produtoSelecionadoId) {
        this.notificar("Selecione um produto", "error");
        return;
      }
      if (!this.produtoQuantidade || this.produtoQuantidade <= 0) {
        this.notificar("Informe uma quantidade válida", "error");
        return;
      }

      const produto = this.produtosDisponiveis.find(
        (item) => item.id === this.produtoSelecionadoId
      );

      if (!produto) {
        this.notificar("Produto não encontrado", "error");
        return;
      }

      const item = {
        localId: `item-${Date.now()}-${Math.random()}`,
        produtoId: produto.id,
        produtoNome: produto.nome,
        produtoCodigo:
          produto.codigo ||
          produto.codigo_simpras ||
          produto.codigo_barras ||
          "",
        quantidade: this.produtoQuantidade,
        unidadeMedidaId:
          produto.unidade_medida?.id || produto.unidade_medida_id || null,
        unidadeMedidaNome:
          produto.unidade_medida?.nome || produto.unidade_medida_nome || "",
      };

      this.form.itens.push(item);
      this.produtoQuantidade = 1;
      this.notificar("Produto adicionado à entrada", "success");
    },
    editarQuantidadeItem(item) {
      this.itemEditandoId = item.localId;
      this.quantidadeEdicao = item.quantidade;
    },
    salvarQuantidadeItem(localId) {
      if (!this.quantidadeEdicao || this.quantidadeEdicao <= 0) {
        this.notificar("Informe uma quantidade válida", "error");
        return;
      }

      const alvo = this.form.itens.find((item) => item.localId === localId);
      if (!alvo) {
        this.notificar("Produto não encontrado", "error");
        return;
      }

      alvo.quantidade = this.quantidadeEdicao;
      this.itemEditandoId = null;
      this.quantidadeEdicao = 1;
      this.notificar("Quantidade atualizada", "success");
    },
    cancelarEdicaoItem() {
      this.itemEditandoId = null;
      this.quantidadeEdicao = 1;
    },
    removerProduto(localId) {
      this.form.itens = this.form.itens.filter(
        (item) => item.localId !== localId
      );
      if (this.itemEditandoId === localId) {
        this.cancelarEdicaoItem();
      }
    },
    registrarEntradaLocal() {
      if (!this.form.fornecedorId) {
        this.fornecedorErro = "Selecione um fornecedor";
        this.notificar("Selecione um fornecedor", "error");
        return;
      }

      if (this.form.itens.length === 0) {
        this.notificar("Inclua ao menos um produto", "error");
        return;
      }

      const payload = {
        unidadeId: this.unidade?.id || null,
        notaFiscal: this.form.notaFiscal,
        fornecedorId: this.form.fornecedorId,
        itens: this.form.itens.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
        })),
      };

      this.$emit("registrado", payload);
      this.notificar("Entrada registrada localmente", "success");
      this.fecharModal();
    },
    fecharModal() {
      const modalEl = document.getElementById(this.idModal);
      if (modalEl && window && window.bootstrap && window.bootstrap.Modal) {
        const instance = window.bootstrap.Modal.getInstance(modalEl);
        if (instance) {
          instance.hide();
        }
      }
    },
    resetarFormulario() {
      this.loading = false;
      this.form = {
        notaFiscal: "",
        fornecedorId: "",
        itens: [],
      };
      this.fornecedorErro = "";
      this.produtoSelecionadoId = "";
      this.produtoQuantidade = 1;
      this.showFornecedorForm = false;
      this.showProdutoForm = false;
      this.cancelarEdicaoItem();
      this.novoProduto = {
        nome: "",
        unidade_medida_id: "",
        status: "A",
        grupo_produto_id: "",
        codigo_simpras: "",
        marca: "",
      };
      this.cancelarGrupoProdutoForm();
    },
    notificar(mensagem, tipo = "info") {
      if (this.$toastr) {
        const mapper = {
          success: this.$toastr.success || this.$toastr.s,
          error: this.$toastr.error || this.$toastr.e,
          info: this.$toastr.info || this.$toastr.i,
        };
        const fn = mapper[tipo] || this.$toastr.info || this.$toastr.s;
        if (typeof fn === "function") {
          fn.call(this.$toastr, mensagem);
          return;
        }
      }
      const consoleMapper = {
        success: console.log,
        error: console.error,
        info: console.info,
      };
      const fallback = consoleMapper[tipo] || console.log;
      fallback(`[ModalEntradaEstoque] ${mensagem}`);
    },
  },
};
</script>

<style scoped>
.btn-modal {
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.6rem 1.25rem;
  border-radius: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border: none;
  min-width: 140px;
}

.table thead th {
  background-color: #f8f9fa;
}

.table tbody tr:last-child td {
  border-bottom: none;
}
</style>
