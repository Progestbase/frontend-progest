<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader class="text-start">
        <DialogTitle class="flex gap-2">
          <i class="mdi mdi-tray-arrow-down text-primary"></i>
          Registrar entrada de estoque
        </DialogTitle>
        <DialogDescription>
          Preencha os dados abaixo para lançar uma nova entrada de produtos na
          unidade selecionada.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="registrarEntradaLocal" novalidate>
        <div class="row g-3">
          <div class="col-md-4">
            <Label for="entradaNotaFiscal">
              Nota fiscal
              <span class="text-muted small">(opcional)</span>
            </Label>
            <Input
              id="entradaNotaFiscal"
              v-model="form.notaFiscal"
              type="text"
              class="text-uppercase"
              placeholder="Ex: NF-2025/001"
            />
          </div>

          <div class="col-md-8">
            <Label for="entradaFornecedor">
              Fornecedor
              <span class="text-danger">*</span>
            </Label>
            <div class="flex gap-2">
              <div class="flex-1">
                <Select v-model="form.fornecedorId">
                  <SelectTrigger
                    id="entradaFornecedor"
                    :class="{ 'border-red-500': fornecedorErro }"
                  >
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent class="z-[9999]">
                    <SelectItem
                      v-for="fornecedor in fornecedoresDisponiveis"
                      :key="fornecedor.id"
                      :value="fornecedor.id"
                    >
                      {{ fornecedorLabel(fornecedor) }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="icon"
                type="button"
                @click="toggleFornecedorForm"
              >
                <i class="mdi mdi-plus"></i>
              </Button>
            </div>
            <div v-if="fornecedorErro" class="text-red-500 text-sm mt-1">
              {{ fornecedorErro }}
            </div>
          </div>
        </div>

        <div v-if="showFornecedorForm" class="mt-3 p-3 border rounded bg-light">
          <h6 class="mb-3 text-primary">Cadastrar fornecedor rapidamente</h6>
          <div class="row g-3">
            <div class="col-md-4">
              <Label for="novoFornecedorNome">
                Razão social / Nome
                <span class="text-danger">*</span>
              </Label>
              <Input
                id="novoFornecedorNome"
                v-model="novoFornecedor.nome"
                type="text"
                class="text-uppercase"
                placeholder="Digite o nome do fornecedor"
              />
            </div>
            <div class="col-md-4">
              <Label for="novoFornecedorTipo"> Tipo de pessoa </Label>
              <Select v-model="novoFornecedor.tipo">
                <SelectTrigger id="novoFornecedorTipo" class="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent class="z-[9999]">
                  <SelectItem value="J">Pessoa Jurídica</SelectItem>
                  <SelectItem value="F">Pessoa Física</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="col-md-4">
              <Label for="novoFornecedorDocumento">
                {{ novoFornecedor.tipo === "J" ? "CNPJ" : "CPF" }}
              </Label>
              <Input
                id="novoFornecedorDocumento"
                v-model="novoFornecedor.documento"
                type="text"
                placeholder="Somente números"
                v-mask="mascaraDocumentoFornecedor"
              />
            </div>
            <div class="col-12 d-flex justify-content-end gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                @click="cancelarFornecedorForm"
              >
                <i class="mdi mdi-close"></i>
                Cancelar
              </Button>
              <Button
                variant="default"
                size="sm"
                type="button"
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
              </Button>
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
              <Label for="produtoSelect">
                Produto
                <span class="text-danger">*</span>
              </Label>
              <div class="flex gap-2">
                <div class="flex-1">
                  <Select v-model="produtoSelecionadoId">
                    <SelectTrigger
                      id="produtoSelect"
                      :disabled="produtosDisponiveis.length === 0"
                    >
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent class="z-[9999]">
                      <SelectItem
                        v-for="produto in produtosDisponiveis"
                        :key="produto.id"
                        :value="produto.id"
                      >
                        {{ produtoLabel(produto) }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  @click="toggleProdutoForm"
                  title="Cadastrar novo produto"
                >
                  <i class="mdi mdi-plus"></i>
                </Button>
              </div>
            </div>

            <div class="col-md-2">
              <Label for="produtoQuantidade">
                Quantidade
                <span class="text-danger">*</span>
              </Label>
              <Input
                id="produtoQuantidade"
                type="number"
                min="1"
                v-model.number="itemAtual.quantidade"
                placeholder="Ex: 100"
              />
            </div>

            <div class="col-md-2">
              <Label for="produtoLote">
                Lote
                <span class="text-danger">*</span>
              </Label>
              <Input
                id="produtoLote"
                type="text"
                class="text-uppercase"
                maxlength="50"
                v-model="itemAtual.lote"
                placeholder="Ex: LOTE123"
              />
            </div>

            <div class="col-md-2">
              <Label for="produtoDataFabricacao"> Data fabricação </Label>
              <Input
                id="produtoDataFabricacao"
                type="date"
                v-model="itemAtual.data_fabricacao"
                :max="dataHoje"
              />
            </div>

            <div class="col-md-2">
              <Label for="produtoDataVencimento">
                Data vencimento
                <span class="text-danger">*</span>
              </Label>
              <Input
                id="produtoDataVencimento"
                type="date"
                v-model="itemAtual.data_vencimento"
                :min="dataAmanha"
              />
            </div>

            <div class="col-12 d-flex justify-content-end">
              <Button variant="default" type="button" @click="adicionarProduto">
                <i class="mdi mdi-cart-plus"></i>
                <span>Adicionar à lista</span>
              </Button>
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
              <Label for="novoProdutoNome">
                Nome do produto
                <span class="text-danger">*</span>
              </Label>
              <Input
                id="novoProdutoNome"
                v-model="novoProduto.nome"
                type="text"
                class="text-uppercase"
                placeholder="Ex: DIPIRONA 500MG"
              />
            </div>
            <div class="col-lg-4 col-md-6">
              <Label for="novoProdutoGrupo"> Grupo do produto </Label>
              <div class="flex gap-2">
                <div class="flex-1">
                  <Select v-model="novoProduto.grupo_produto_id">
                    <SelectTrigger id="novoProdutoGrupo">
                      <SelectValue placeholder="Selecionar grupo" />
                    </SelectTrigger>
                    <SelectContent class="z-[9999]">
                      <SelectItem
                        v-for="grupo in gruposDisponiveis"
                        :key="grupo.id"
                        :value="grupo.id"
                      >
                        {{ grupo.nome }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  @click="toggleGrupoProdutoForm"
                  title="Cadastrar novo grupo"
                >
                  <i class="mdi mdi-plus"></i>
                </Button>
              </div>
            </div>
            <div class="col-lg-4 col-md-6">
              <Label for="novoProdutoUnidade"> Unidade de medida </Label>
              <Select v-model="novoProduto.unidade_medida_id">
                <SelectTrigger id="novoProdutoUnidade" class="w-full">
                  <SelectValue placeholder="Selecionar unidade" />
                </SelectTrigger>
                <SelectContent class="z-[9999]">
                  <SelectItem
                    v-for="unidade in unidadesMedidaDisponiveis"
                    :key="unidade.id"
                    :value="unidade.id"
                  >
                    {{ unidade.nome }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="col-md-3">
              <Label for="novoProdutoStatus"> Status </Label>
              <Select v-model="novoProduto.status">
                <SelectTrigger id="novoProdutoStatus" class="w-full">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent class="z-[9999]">
                  <SelectItem value="A">Ativo</SelectItem>
                  <SelectItem value="I">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="col-md-3">
              <Label for="novoProdutoCodigoSimpras"> Código SIMPRAS </Label>
              <Input
                id="novoProdutoCodigoSimpras"
                v-model="novoProduto.codigo_simpras"
                type="text"
                class="text-uppercase"
                placeholder="Ex: 10301012"
              />
            </div>
            <div class="col-md-3">
              <Label for="novoProdutoCodigoBarras"> Código de barras </Label>
              <Input
                id="novoProdutoCodigoBarras"
                v-model="novoProduto.codigo_barras"
                type="text"
                placeholder="EAN (opcional)"
              />
            </div>
            <div class="col-md-3">
              <Label for="novoProdutoMarca"> Marca </Label>
              <Input
                id="novoProdutoMarca"
                v-model="novoProduto.marca"
                type="text"
                class="text-uppercase"
                placeholder="Ex: EMS"
              />
            </div>
            <div v-if="showGrupoProdutoForm" class="col-12">
              <div class="p-3 border rounded bg-white">
                <div class="row g-3 align-items-end">
                  <div class="col-md-6">
                    <Label class="text-sm" for="novoGrupoProdutoNome">
                      Nome do grupo
                      <span class="text-danger">*</span>
                    </Label>
                    <Input
                      id="novoGrupoProdutoNome"
                      v-model="novoGrupoProduto.nome"
                      type="text"
                      class="text-uppercase"
                      placeholder="Ex: ANALGÉSICOS"
                    />
                  </div>
                  <div class="col-md-3">
                    <Label class="text-sm" for="novoGrupoProdutoTipo">
                      Tipo
                    </Label>
                    <Select v-model="novoGrupoProduto.tipo">
                      <SelectTrigger id="novoGrupoProdutoTipo" class="w-full">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent class="z-[9999]">
                        <SelectItem value="Material">Material</SelectItem>
                        <SelectItem value="Medicamento">Medicamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div class="col-md-3 d-flex justify-content-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      type="button"
                      @click="cancelarGrupoProdutoForm"
                    >
                      <i class="mdi mdi-close"></i>
                      Cancelar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      type="button"
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
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                @click="cancelarProdutoForm"
              >
                <i class="mdi mdi-close"></i>
                Cancelar
              </Button>
              <Button
                variant="default"
                size="sm"
                type="button"
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
              </Button>
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
                  <div class="d-flex gap-1 justify-content-center">
                    <Button
                      variant="outline"
                      size="icon"
                      type="button"
                      @click="editarProduto(item)"
                      title="Editar produto"
                    >
                      <i class="mdi mdi-pencil"></i>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      type="button"
                      @click="removerProduto(item.localId)"
                      title="Remover produto"
                    >
                      <i class="mdi mdi-delete"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Alert v-else class="flex">
          <i class="mdi mdi-information-outline h-4 w-4"></i>
          <AlertDescription>
            Inclua ao menos um produto para registrar a entrada.
          </AlertDescription>
        </Alert>

        <div class="mt-4 d-flex justify-content-end gap-2">
          <Button
            variant="outline"
            type="button"
            @click="fecharModal"
            :disabled="loading"
          >
            <i class="mdi mdi-close-thick me-2"></i>
            Cancelar
          </Button>
          <Button
            variant="default"
            type="submit"
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
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script>
import cadFornecedores from "@/functions/cad_fornecedores.js";
import cadProdutos from "@/functions/cad_produtos.js";
import cadUnidadesMedida from "@/functions/cad_unidades_medida.js";
import cadGrupoProduto from "@/functions/cad_grupo_produto.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default {
  name: "ModalEntradaEstoque",
  components: {
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Alert,
    AlertDescription,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  },
  emits: ["registrado", "update:open"],
  props: {
    open: {
      type: Boolean,
      default: false,
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
  },
  beforeUnmount() {
    // Não necessário com Dialog do shadcn
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
      // Não necessário com Dialog do shadcn
    },
    removerEventosModal() {
      // Não necessário com Dialog do shadcn
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
    editarProduto(item) {
      // Preencher os campos do formulário com os dados do item para edição
      this.produtoSelecionadoId = item.produto_id;
      this.itemAtual = {
        quantidade: item.quantidade,
        lote: item.lote,
        data_fabricacao: item.data_fabricacao || "",
        data_vencimento: item.data_vencimento,
      };

      // Remover o item da lista (será adicionado novamente quando salvar)
      this.removerProduto(item.localId);

      // Scroll para o topo do formulário para facilitar a edição
      const formSection = document.querySelector(".bg-light");
      if (formSection) {
        formSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      this.notificar("Produto carregado para edição", "info");
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
      this.$emit("update:open", false);
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
