<template>
  <span>
    <ModalBase01
      :idModal="idModal"
      modalClass="modal-dialog modal-fullscreen-xxl-down modal-dialog-scrollable modal-dialog-centered"
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
                class="btn btn-success btn-sm d-flex align-items-center gap-2"
                @click="salvarFornecedorInline"
                :disabled="
                  salvandoFornecedorInline ||
                  !novoFornecedor.nome ||
                  !novoFornecedor.documento
                "
              >
                <template v-if="!salvandoFornecedorInline">
                  <i class="mdi mdi-check"></i>
                  <span>Salvar fornecedor</span>
                </template>
                <template v-else>
                  <span
                    class="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span>Salvando...</span>
                </template>
              </button>
            </div>
          </div>
        </div>

        <hr class="my-4" />

        <div class="mb-3">
          <h5 class="mb-1">Produtos da entrada</h5>
          <p class="text-muted mb-3">
            Selecione o produto e preencha os dados do lote, quantidade e datas.
          </p>

          <div class="row g-3 p-3 border rounded bg-light">
            <div class="col-md-4">
              <label class="form-label" for="produtoSelect">
                Produto
                <span class="text-danger">*</span>
              </label>
              <div class="input-group">
                <select
                  id="produtoSelect"
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
                  title="Cadastrar novo produto"
                >
                  <i class="mdi mdi-plus"></i>
                </button>
              </div>
            </div>

            <div class="col-md-2">
              <label class="form-label" for="produtoQuantidade">
                Quantidade
                <span class="text-danger">*</span>
              </label>
              <input
                id="produtoQuantidade"
                type="number"
                class="form-control"
                min="1"
                v-model.number="itemAtual.quantidade"
                placeholder="Ex: 100"
              />
            </div>

            <div class="col-md-2">
              <label class="form-label" for="produtoLote">
                Lote
                <span class="text-danger">*</span>
              </label>
              <input
                id="produtoLote"
                type="text"
                class="form-control text-uppercase"
                maxlength="50"
                v-model="itemAtual.lote"
                placeholder="Ex: LOTE123"
              />
            </div>

            <div class="col-md-2">
              <label class="form-label" for="produtoDataFabricacao">
                Data fabricação
              </label>
              <input
                id="produtoDataFabricacao"
                type="date"
                class="form-control"
                v-model="itemAtual.data_fabricacao"
                :max="dataHoje"
              />
            </div>

            <div class="col-md-2">
              <label class="form-label" for="produtoDataVencimento">
                Data vencimento
                <span class="text-danger">*</span>
              </label>
              <input
                id="produtoDataVencimento"
                type="date"
                class="form-control"
                v-model="itemAtual.data_vencimento"
                :min="dataAmanha"
              />
            </div>

            <div class="col-12 d-flex justify-content-end">
              <button
                type="button"
                class="btn btn-success d-flex align-items-center gap-2"
                @click="adicionarProduto"
              >
                <i class="mdi mdi-cart-plus"></i>
                <span>Adicionar à lista</span>
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="showProdutoForm"
          class="mt-3 mb-4 p-3 border rounded bg-light"
        >
          <h6 class="mb-3 text-primary">Cadastrar produto rapidamente</h6>
          <div class="row g-3">
            <div class="col-lg-4 col-md-6">
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
            <div class="col-lg-4 col-md-6">
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
            </div>
            <div class="col-lg-4 col-md-6">
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
            <div class="col-md-3">
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
              <label class="form-label" for="novoProdutoCodigoBarras">
                Código de barras
              </label>
              <input
                id="novoProdutoCodigoBarras"
                v-model="novoProduto.codigo_barras"
                type="text"
                class="form-control"
                placeholder="EAN (opcional)"
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
            <div v-if="showGrupoProdutoForm" class="col-12">
              <div class="p-3 border rounded bg-white">
                <div class="row g-3 align-items-end">
                  <div class="col-md-6">
                    <label class="form-label small" for="novoGrupoProdutoNome">
                      Nome do grupo
                      <span class="text-danger">*</span>
                    </label>
                    <input
                      id="novoGrupoProdutoNome"
                      v-model="novoGrupoProduto.nome"
                      type="text"
                      class="form-control text-uppercase"
                      placeholder="Ex: ANALGÉSICOS"
                    />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label small" for="novoGrupoProdutoTipo">
                      Tipo
                    </label>
                    <select
                      id="novoGrupoProdutoTipo"
                      v-model="novoGrupoProduto.tipo"
                      class="form-select"
                    >
                      <option value="Material">Material</option>
                      <option value="Medicamento">Medicamento</option>
                    </select>
                  </div>
                  <div class="col-md-3 d-flex justify-content-end gap-2">
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
                      class="btn btn-success btn-sm d-flex align-items-center gap-2"
                      @click="salvarGrupoProdutoInline"
                      :disabled="
                        salvandoGrupoProdutoInline || !novoGrupoProduto.nome
                      "
                    >
                      <template v-if="!salvandoGrupoProdutoInline">
                        <i class="mdi mdi-check"></i>
                        <span>Salvar grupo</span>
                      </template>
                      <template v-else>
                        <span
                          class="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span>Salvando...</span>
                      </template>
                    </button>
                  </div>
                </div>
              </div>
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
                class="btn btn-success btn-sm d-flex align-items-center gap-2"
                @click="salvarProdutoInline"
                :disabled="
                  salvandoProdutoInline ||
                  !novoProduto.nome ||
                  !novoProduto.unidade_medida_id
                "
              >
                <template v-if="!salvandoProdutoInline">
                  <i class="mdi mdi-check"></i>
                  <span>Salvar produto</span>
                </template>
                <template v-else>
                  <span
                    class="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span>Salvando...</span>
                </template>
              </button>
            </div>
          </div>
        </div>

        <div v-if="form.itens.length > 0" class="table-responsive">
          <table class="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th class="text-start">Produto</th>
                <th class="text-center">Quantidade</th>
                <th class="text-center">Lote</th>
                <th class="text-center">Data fabricação</th>
                <th class="text-center">Data vencimento</th>
                <th class="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in form.itens" :key="item.localId">
                <td class="text-start">
                  <strong>{{ item.produtoNome }}</strong>
                  <div class="text-muted small" v-if="item.unidadeMedidaNome">
                    {{ item.unidadeMedidaNome }}
                  </div>
                </td>
                <td class="text-center">
                  <span class="badge bg-primary">{{ item.quantidade }}</span>
                </td>
                <td class="text-center">
                  <code class="text-dark">{{ item.lote }}</code>
                </td>
                <td class="text-center">
                  <small>{{ formatarData(item.data_fabricacao) || "-" }}</small>
                </td>
                <td class="text-center">
                  <small>{{ formatarData(item.data_vencimento) }}</small>
                </td>
                <td class="text-center">
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
            class="btn btn-success btn-modal d-flex align-items-center gap-2"
            :disabled="loading || !podeSalvar"
          >
            <template v-if="!loading">
              <i class="mdi mdi-check-bold"></i>
              <span>Registrar entrada</span>
            </template>
            <template v-else>
              <span
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              <span>Registrando...</span>
            </template>
          </button>
        </div>
      </form>
    </ModalBase01>
  </span>
</template>

<script>
import ModalBase01 from "@/components/layouts/ModalBase01.vue";
import { Modal } from "bootstrap";
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
    setorTipo: {
      type: String,
      default: null,
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
        codigo_barras: "",
      },
      showGrupoProdutoForm: false,
      novoGrupoProduto: {
        nome: "",
        tipo: "Material",
      },
      produtosCustom: [],
      gruposCustom: [],
      produtoSelecionadoId: "",
      itemAtual: {
        quantidade: 1,
        lote: "",
        data_fabricacao: "",
        data_vencimento: "",
      },
      salvandoFornecedorInline: false,
      salvandoProdutoInline: false,
      salvandoGrupoProdutoInline: false,
    };
  },
  computed: {
    fornecedoresDisponiveis() {
      const base = this.normalizarLista(this.$store.state.listFornecedores);
      const custom = this.fornecedoresCustom.filter(
        (item) => !base.some((baseItem) => baseItem.id === item.id)
      );
      return [...base, ...custom];
    },
    produtosDisponiveis() {
      let base = this.normalizarLista(this.$store.state.listProdutos);

      // Filtrar por tipo de grupo se setorTipo estiver definido
      if (this.setorTipo) {
        const gruposDoTipo = this.normalizarLista(
          this.$store.state.listGrupoProdutos
        )
          .filter((grupo) => grupo.tipo === this.setorTipo)
          .map((grupo) => grupo.id);

        base = base.filter((produto) =>
          gruposDoTipo.includes(produto.grupo_produto_id)
        );
      }

      const custom = this.produtosCustom.filter(
        (item) => !base.some((baseItem) => baseItem.id === item.id)
      );
      return [...base, ...custom];
    },
    gruposDisponiveis() {
      const base = this.normalizarLista(this.$store.state.listGrupoProdutos);
      const custom = this.gruposCustom.filter(
        (item) => !base.some((baseItem) => baseItem.id === item.id)
      );
      return [...base, ...custom];
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
    dataHoje() {
      return new Date().toISOString().split("T")[0];
    },
    dataAmanha() {
      const amanha = new Date();
      amanha.setDate(amanha.getDate() + 1);
      return amanha.toISOString().split("T")[0];
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
    async salvarFornecedorInline() {
      if (this.salvandoFornecedorInline) return;

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

      const payload = {
        fornecedor: {
          razao_social_nome: this.novoFornecedor.nome,
          tipo_pessoa: this.novoFornecedor.tipo,
          status: "A",
          cnpj: isPessoaJuridica ? documentoNumerico : null,
          cpf: !isPessoaJuridica ? documentoNumerico : null,
        },
      };

      this.salvandoFornecedorInline = true;

      try {
        const response = await this.$axios.post("/fornecedores/add", payload, {
          headers: {
            Authorization: "Bearer " + this.$store.getters.getUserToken,
          },
        });

        if (response.data?.status && response.data.data?.id) {
          const fornecedor = response.data.data;
          this.fornecedoresCustom = [
            ...this.fornecedoresCustom.filter((f) => f.id !== fornecedor.id),
            fornecedor,
          ];
          this.form.fornecedorId = fornecedor.id;
          this.notificar("Fornecedor cadastrado com sucesso", "success");
          this.showFornecedorForm = false;
          this.novoFornecedor = {
            nome: "",
            documento: "",
            tipo: "J",
          };
          cadFornecedores.listAll(this);
        } else {
          const mensagem =
            response.data?.message ||
            "Não foi possível cadastrar o fornecedor. Tente novamente.";
          this.notificar(mensagem, "error");
        }
      } catch (error) {
        const mensagem =
          error.response?.data?.message ||
          error.response?.data?.erros?.[0] ||
          "Erro ao cadastrar fornecedor. Verifique os dados e tente novamente.";
        this.notificar(mensagem, "error");
        console.error("Erro ao cadastrar fornecedor inline", error);
      } finally {
        this.salvandoFornecedorInline = false;
      }
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
          codigo_barras: "",
        };
        this.showGrupoProdutoForm = false;
        this.novoGrupoProduto = {
          nome: "",
          tipo: "Material",
        };
      }
    },
    toggleGrupoProdutoForm() {
      this.showGrupoProdutoForm = !this.showGrupoProdutoForm;
      if (this.showGrupoProdutoForm) {
        this.novoGrupoProduto = {
          nome: "",
          tipo: "Material",
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
        codigo_barras: "",
      };
      this.cancelarGrupoProdutoForm();
    },
    cancelarGrupoProdutoForm() {
      this.showGrupoProdutoForm = false;
      this.novoGrupoProduto = {
        nome: "",
        tipo: "Material",
      };
    },
    async salvarGrupoProdutoInline() {
      if (this.salvandoGrupoProdutoInline) return;

      if (!this.novoGrupoProduto.nome) {
        this.notificar("Informe o nome do grupo", "error");
        return;
      }

      const payload = {
        grupoProduto: {
          nome: this.novoGrupoProduto.nome,
          tipo: this.novoGrupoProduto.tipo || "Material",
          status: "A",
        },
      };

      this.salvandoGrupoProdutoInline = true;

      try {
        const response = await this.$axios.post("/grupoProduto/add", payload, {
          headers: {
            Authorization: "Bearer " + this.$store.getters.getUserToken,
            "Content-Type": "application/json",
          },
        });

        if (response.data?.status && response.data.data?.id) {
          const grupo = response.data.data;
          this.gruposCustom = [
            ...this.gruposCustom.filter((g) => g.id !== grupo.id),
            grupo,
          ];
          this.novoProduto.grupo_produto_id = grupo.id;
          this.notificar("Grupo de produto cadastrado com sucesso", "success");
          cadGrupoProduto.listAll(this);
          this.cancelarGrupoProdutoForm();
        } else {
          const mensagem =
            response.data?.message ||
            "Não foi possível cadastrar o grupo. Tente novamente.";
          this.notificar(mensagem, "error");
        }
      } catch (error) {
        const mensagem =
          error.response?.data?.message ||
          "Erro ao cadastrar grupo de produto. Verifique os dados e tente novamente.";
        this.notificar(mensagem, "error");
        console.error("Erro ao cadastrar grupo de produto inline", error);
      } finally {
        this.salvandoGrupoProdutoInline = false;
      }
    },
    async salvarProdutoInline() {
      if (this.salvandoProdutoInline) return;

      if (!this.novoProduto.nome) {
        this.notificar("Informe o nome do produto", "error");
        return;
      }

      if (!this.novoProduto.unidade_medida_id) {
        this.notificar("Selecione uma unidade de medida", "error");
        return;
      }

      const payload = {
        produto: {
          nome: this.novoProduto.nome,
          unidade_medida_id: this.novoProduto.unidade_medida_id,
          status: this.novoProduto.status || "A",
          grupo_produto_id: this.novoProduto.grupo_produto_id || null,
          codigo_simpras: this.novoProduto.codigo_simpras || "",
          codigo_barras: this.novoProduto.codigo_barras || "",
          marca: this.novoProduto.marca || "",
        },
      };

      this.salvandoProdutoInline = true;

      try {
        const response = await this.$axios.post("/produtos/add", payload, {
          headers: {
            Authorization: "Bearer " + this.$store.getters.getUserToken,
            "Content-Type": "application/json",
          },
        });

        if (response.data?.status && response.data.data?.id) {
          const produto = response.data.data;
          this.produtosCustom = [
            ...this.produtosCustom.filter((p) => p.id !== produto.id),
            produto,
          ];
          this.produtoSelecionadoId = produto.id;
          this.notificar("Produto cadastrado com sucesso", "success");
          this.showProdutoForm = false;
          this.showGrupoProdutoForm = false;
          this.novoProduto = {
            nome: "",
            unidade_medida_id: "",
            status: "A",
            grupo_produto_id: "",
            codigo_simpras: "",
            marca: "",
            codigo_barras: "",
          };
          cadProdutos.listAll(this);
        } else {
          const mensagem =
            response.data?.message ||
            "Não foi possível cadastrar o produto. Tente novamente.";
          this.notificar(mensagem, "error");
        }
      } catch (error) {
        const mensagem =
          error.response?.data?.message ||
          "Erro ao cadastrar produto. Verifique os dados e tente novamente.";
        this.notificar(mensagem, "error");
        console.error("Erro ao cadastrar produto inline", error);
      } finally {
        this.salvandoProdutoInline = false;
      }
    },
    adicionarProduto() {
      if (!this.produtoSelecionadoId) {
        this.notificar("Selecione um produto", "error");
        return;
      }
      if (!this.itemAtual.quantidade || this.itemAtual.quantidade <= 0) {
        this.notificar("Informe uma quantidade válida", "error");
        return;
      }
      if (!this.itemAtual.lote || this.itemAtual.lote.trim() === "") {
        this.notificar("Informe o lote do produto", "error");
        return;
      }
      if (
        !this.itemAtual.data_vencimento ||
        this.itemAtual.data_vencimento === ""
      ) {
        this.notificar("Informe a data de vencimento", "error");
        return;
      }

      // Validar data de vencimento deve ser futura
      const dataVenc = new Date(this.itemAtual.data_vencimento);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      if (dataVenc <= hoje) {
        this.notificar(
          "A data de vencimento deve ser posterior à data atual",
          "error"
        );
        return;
      }

      // Validar data de fabricação não pode ser futura (se informada)
      if (this.itemAtual.data_fabricacao) {
        const dataFab = new Date(this.itemAtual.data_fabricacao);
        if (dataFab > hoje) {
          this.notificar("A data de fabricação não pode ser futura", "error");
          return;
        }
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
        produto_id: produto.id,
        produtoNome: produto.nome,
        quantidade: this.itemAtual.quantidade,
        lote: this.itemAtual.lote.trim().toUpperCase(),
        data_vencimento: this.itemAtual.data_vencimento,
        data_fabricacao: this.itemAtual.data_fabricacao || null,
        unidadeMedidaId:
          produto.unidade_medida?.id || produto.unidade_medida_id || null,
        unidadeMedidaNome:
          produto.unidade_medida?.nome || produto.unidade_medida_nome || "",
      };

      this.form.itens.push(item);

      // Resetar campos
      this.produtoSelecionadoId = "";
      this.itemAtual = {
        quantidade: 1,
        lote: "",
        data_fabricacao: "",
        data_vencimento: "",
      };

      this.notificar("Produto adicionado à entrada", "success");
    },
    removerProduto(localId) {
      this.form.itens = this.form.itens.filter(
        (item) => item.localId !== localId
      );
    },
    async registrarEntradaLocal() {
      console.log("🔍 Iniciando registro de entrada...");

      if (!this.form.fornecedorId) {
        this.fornecedorErro = "Selecione um fornecedor";
        this.notificar("Selecione um fornecedor", "error");
        return;
      }

      if (this.form.itens.length === 0) {
        this.notificar("Inclua ao menos um produto", "error");
        return;
      }

      console.log("✅ Validações passaram. Unidade:", this.unidade);
      console.log("✅ Fornecedor ID:", this.form.fornecedorId);
      console.log("✅ Itens:", this.form.itens);

      this.loading = true;

      try {
        const payload = {
          nota_fiscal: this.form.notaFiscal || null,
          setor_id: this.unidade?.id || null,
          fornecedor_id: this.form.fornecedorId,
          itens: this.form.itens.map((item) => ({
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            lote: item.lote,
            data_vencimento: item.data_vencimento,
            data_fabricacao: item.data_fabricacao,
          })),
        };

        console.log("📤 Enviando entrada para API:", payload);

        const response = await this.$axios.post("/entrada/add", payload, {
          headers: {
            Authorization: "Bearer " + this.$store.getters.getUserToken,
            "Content-Type": "application/json",
          },
        });

        console.log("📥 Resposta da API:", response.data);

        if (response.data?.status) {
          this.notificar("Entrada registrada com sucesso!", "success");
          this.$emit("registrado", response.data.data);
          this.fecharModal();
        } else {
          const mensagem =
            response.data?.message ||
            "Não foi possível registrar a entrada. Tente novamente.";
          this.notificar(mensagem, "error");
        }
      } catch (error) {
        console.error("❌ Erro ao registrar entrada:", error);
        console.error("Response:", error.response?.data);

        if (error.response?.data?.validacao && error.response?.data?.erros) {
          // Erros de validação
          const erros = error.response.data.erros;
          const primeiraChave = Object.keys(erros)[0];
          const mensagem = erros[primeiraChave]?.[0] || "Erro de validação";
          this.notificar(mensagem, "error");
          console.error("Erros de validação:", erros);
        } else {
          const mensagem =
            error.response?.data?.message ||
            "Erro ao registrar entrada. Verifique os dados e tente novamente.";
          this.notificar(mensagem, "error");
          console.error("Erro ao registrar entrada", error);
        }
      } finally {
        this.loading = false;
      }
    },
    fecharModal() {
      const modalEl = document.getElementById(this.idModal);
      if (modalEl) {
        const instance = Modal.getInstance(modalEl);
        if (instance) {
          instance.hide();
        }
      }
      // Resetar o formulário após fechar
      this.$nextTick(() => {
        this.resetarFormulario();
      });
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
      this.itemAtual = {
        quantidade: 1,
        lote: "",
        data_fabricacao: "",
        data_vencimento: "",
      };
      this.showFornecedorForm = false;
      this.showProdutoForm = false;
      this.novoProduto = {
        nome: "",
        unidade_medida_id: "",
        status: "A",
        grupo_produto_id: "",
        codigo_simpras: "",
        marca: "",
        codigo_barras: "",
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
    formatarData(data) {
      if (!data) return null;
      const [ano, mes, dia] = data.split("-");
      return `${dia}/${mes}/${ano}`;
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

/* Aumentar largura máxima do modal */
:deep(.modal-dialog) {
  max-width: 98vw !important;
  width: 98vw !important;
  margin: 1rem auto;
}

@media (min-width: 1400px) {
  :deep(.modal-dialog) {
    max-width: 1800px !important;
    width: 95vw !important;
  }
}

@media (min-width: 1920px) {
  :deep(.modal-dialog) {
    max-width: 2200px !important;
  }
}
</style>
