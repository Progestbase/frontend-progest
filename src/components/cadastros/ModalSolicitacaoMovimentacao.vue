<template>
  <span>
    <ModalBase01
      idModal="modalSolicitacaoMovimentacao"
      modalClass="modal-dialog modal-fullscreen-xxl-down modal-dialog-scrollable modal-dialog-centered"
    >
      <div class="row">
        <div class="col-12">
          <h4 class="mb-3 d-flex align-items-center gap-2">
            <i class="mdi mdi-file-plus text-primary"></i>
            Nova Requisição
          </h4>
          <p class="text-muted mb-4">
            Preencha os dados e os itens. Você pode salvar como rascunho ou
            finalizar a solicitação.
          </p>
        </div>
      </div>

      <form @submit.prevent="finalizarSolicitacao" novalidate>
        <div class="row mt-2">
          <div class="col-md-6">
            <label class="form-label">Setor Origem</label>
            <select
              v-model="selectedFornecedorRelId"
              class="form-select"
              @change="onFornecedorRelChange"
            >
              <option value="">Selecione um fornecedor</option>
              <option
                v-for="rel in fornecedoresLocal"
                :key="rel.id || rel.fornecedor?.id"
                :value="rel.id"
              >
                {{
                  (rel.tipo_produto || rel.fornecedor?.tipo || "-") +
                  " — " +
                  getRelSetorName(rel)
                }}
              </option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Setor Destino</label>
            <div class="mt-1">
              <span class="badge bg-light text-dark p-2">{{
                unidadeAtual?.nome ||
                (unidadeAtual && unidadeAtual.id
                  ? "Setor " + unidadeAtual.id
                  : "Não definido")
              }}</span>
            </div>
          </div>
        </div>

        <div class="row mt-3">
          <div class="col-12">
            <label class="form-label">Observação</label>
            <textarea
              v-model="form.observacao"
              class="form-control"
              rows="3"
            ></textarea>
          </div>
        </div>

        <hr class="my-4" />

        <div>
          <h5 class="mb-2">Itens</h5>

          <div class="row g-3 p-3 border rounded bg-light mb-3">
            <div class="col-md-6">
              <label class="form-label">Produto</label>
              <div class="input-group">
                <select
                  v-model="produtoSelecionadoId"
                  class="form-select"
                  :disabled="!(fornecedorTipoSelecionado || form.tipo_produto)"
                >
                  <option value="">
                    {{
                      fornecedorTipoSelecionado || form.tipo_produto
                        ? "Selecione um produto"
                        : "Selecione um fornecedor primeiro"
                    }}
                  </option>
                  <option
                    v-for="p in produtosFiltradosPorTipo"
                    :key="p.id"
                    :value="p.id"
                  >
                    {{ p.nome_completo || p.nome }}
                  </option>
                </select>
                <button
                  type="button"
                  class="btn btn-outline-primary"
                  title="Cadastrar novo produto"
                  @click="() => {}"
                >
                  <i class="mdi mdi-plus"></i>
                </button>
              </div>
            </div>
            <div class="col-md-3">
              <label class="form-label">Quantidade</label>
              <input
                type="number"
                min="1"
                v-model.number="itemAtual.quantidade_solicitada"
                class="form-control"
              />
            </div>
            <div class="col-md-3 d-flex align-items-end">
              <button
                type="button"
                class="btn btn-success"
                @click="adicionarItem"
              >
                <i class="mdi mdi-cart-plus"></i> Adicionar
              </button>
            </div>
          </div>

          <div v-if="form.itens.length > 0" class="table-responsive">
            <table class="table table-striped mb-0">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th class="text-center">Quantidade Solicitada</th>
                  <th class="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, idx) in form.itens" :key="idx">
                  <td>{{ it.produto_nome }}</td>
                  <td class="text-center">{{ it.quantidade_solicitada }}</td>
                  <td class="text-center">
                    <button
                      type="button"
                      class="btn btn-sm btn-danger"
                      @click="removerItem(idx)"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-4 text-muted">
            Nenhum item adicionado
          </div>
        </div>
      </form>

      <template #footer>
        <div
          class="d-flex justify-content-between w-100 flex-grow-1 align-items-center"
        >
          <div>
            <button
              type="button"
              class="btn btn-secondary"
              @click="salvarRascunho"
            >
              Salvar rascunho
            </button>
          </div>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-light" @click="fecharModal">
              Fechar
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="finalizarSolicitacao"
              :disabled="!canFinalize"
              :title="finalizeTitle"
            >
              Finalizar e Solicitar
            </button>
          </div>
        </div>
      </template>
    </ModalBase01>
  </span>
</template>

<script>
import ModalBase01 from "@/components/layouts/ModalBase01.vue";
import functionsSetores from "@/functions/cad_setores.js";
import functionsProdutos from "@/functions/cad_produtos.js";
import * as bootstrap from "bootstrap";
import functionsMovimentacao from "@/functions/cad_movimentacao.js";
export default {
  name: "ModalSolicitacaoMovimentacao",
  components: { ModalBase01 },
  props: {
    unidadeAtual: {
      type: Object,
      default: () => ({}),
    },
    destinoReadonly: {
      type: Boolean,
      default: false,
    },
    fornecedoresRelacionados: {
      type: Array,
      default: () => [],
    },
    unidades: {
      type: Array,
      default: () => [],
    },
    produtos: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      form: {
        usuario_id: null,
        setor_origem_id: null,
        setor_destino_id: null,
        tipo_produto: "",
        observacao: "",
        status_solicitacao: "P",
        itens: [],
      },
      produtoSelecionadoId: null,
      itemAtual: {
        produto_id: null,
        quantidade_solicitada: 1,
      },
      fornecedoresLocal: [],
      fornecedorTipoSelecionado: "",
      produtosDisponiveis: [],
      selectedFornecedorRelId: null,
    };
  },
  computed: {
    setoresFiltraveis() {
      // removido: não usamos lista de setores para definir setor origem
      return [];
    },
    modalErrors() {
      return this.$store.state.modalErrors || {};
    },
    userId() {
      // tentar obter usuário do state se disponível
      return this.$store.state.user?.id || null;
    },
    tiposFornecedores() {
      // extrai tipos únicos a partir de fornecedoresRelacionados (campo tipo_produto ou tipo)
      const tipos = new Set();
      (this.fornecedoresLocal || []).forEach((f) => {
        const t = f.tipo_produto || f.tipo || null;
        if (t) tipos.add(t);
      });
      return Array.from(tipos);
    },
    produtosFiltradosPorTipo() {
      const tipoFiltro =
        this.fornecedorTipoSelecionado || this.form.tipo_produto || "";
      const lista =
        this.produtosDisponiveis && this.produtosDisponiveis.length > 0
          ? this.produtosDisponiveis
          : this.produtos || [];
      if (!tipoFiltro) return lista || [];
      // assume que produto.grupo_produto?.tipo indica Material/Medicamento
      return (lista || []).filter((p) => {
        const grupoTipo = p.grupo_produto?.tipo || p.tipo || null;
        return grupoTipo === tipoFiltro;
      });
    },
    originSetor() {
      // Mantido para compatibilidade com template, mas apenas retorna
      // o setor derivado diretamente do fornecedor selecionado quando existir.
      const rel = (this.fornecedoresLocal || []).find(
        (r) => (r.id || r.fornecedor?.id) == this.selectedFornecedorRelId
      );
      if (!rel) return null;
      const setorId =
        rel.setor_id || rel.setor?.id || rel.fornecedor?.setor_id || null;
      return setorId
        ? {
            id: setorId,
            nome: rel.setor?.nome || rel.nome || rel.fornecedor?.nome,
          }
        : null;
    },
    canFinalize() {
      // permite finalizar se houver setor de origem definido ou ao menos um fornecedor selecionado,
      // desde que haja pelo menos um item
      const hasSetor = !!this.form.setor_origem_id;
      const hasRelSelected = !!this.selectedFornecedorRelId;
      return (
        (hasSetor || hasRelSelected) &&
        Array.isArray(this.form.itens) &&
        this.form.itens.length > 0
      );
    },
    finalizeTitle() {
      if (!this.selectedFornecedorRelId)
        return "Selecione um fornecedor com setor definido para habilitar";
      if (!this.form.setor_origem_id)
        return "Fornecedor selecionado sem setor cadastrado — a solicitação pode falhar ao enviar";
      if (!Array.isArray(this.form.itens) || this.form.itens.length === 0)
        return "Adicione ao menos um item para finalizar a solicitação";
      return "Finalizar e Solicitar";
    },
  },
  methods: {
    // Nota: carregamento de setores removido — setor origem virá do fornecedor selecionado
    carregarProdutos() {
      try {
        functionsProdutos.listAll(this);
      } catch (e) {
        console.warn("Erro ao chamar functionsProdutos.listAll:", e);
      }

      const storeList = this.$store.state.listProdutos || [];
      // store.commit setListProdutos armazena array simples
      this.produtosDisponiveis = Array.isArray(storeList)
        ? storeList
        : storeList.data || [];
    },
    setFornecedoresRelacionados(lista, unidade) {
      this.fornecedoresLocal = Array.isArray(lista) ? lista : [];
      // se só existir um fornecedor por tipo, selecionar automaticamente
      const tiposMap = {};
      this.fornecedoresLocal.forEach((f) => {
        const tipo = f.tipo_produto || f.tipo || "Outro";
        tiposMap[tipo] = tiposMap[tipo] || [];
        tiposMap[tipo].push(f);
      });
      // se houver um único tipo e um único fornecedor -> definir setor_origem
      const tipos = Object.keys(tiposMap);
      if (tipos.length === 1 && tiposMap[tipos[0]].length === 1) {
        // fornecedoresRelacionados deve expor o id do setor fornecedor como setor_id ou setor.id
        const f0 = tiposMap[tipos[0]][0];
        // agora definimos setor_origem diretamente a partir do fornecedor
        this.form.setor_origem_id =
          f0.setor_id || f0.setor?.id || f0.fornecedor?.setor_id || null;
        this.fornecedorTipoSelecionado = tipos[0];
        // marcar seleção do fornecedor relacionado
        this.selectedFornecedorRelId = f0.id;
      }
      // definir setor_destino como a unidade (setor) atual quando fornecida
      if (unidade && unidade.id) this.form.setor_destino_id = unidade.id;
    },
    abrirModal() {
      // reset básico
      this.resetForm();
      // carregar produtos para popular select
      this.carregarProdutos();
      // reaplicar fornecedores locais caso props existam
      if ((this.fornecedoresRelacionados || []).length > 0) {
        this.setFornecedoresRelacionados(
          this.fornecedoresRelacionados,
          this.unidadeAtual
        );
      }
      // preencher setor destino automaticamente quando possível
      if (this.unidadeAtual && this.unidadeAtual.id) {
        this.form.setor_destino_id = this.unidadeAtual.id;
      }

      // Garantir que o setor_origem_id seja atribuído ao abrir o modal
      if (this.selectedFornecedorRelId) {
        this.onFornecedorRelChange();
      }

      const modalEl = document.getElementById("modalSolicitacaoMovimentacao");
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
    },
    onFornecedorRelChange() {
      console.debug("ID selecionado no select:", this.selectedFornecedorRelId);

      // Obter o valor do ID selecionado diretamente do select
      const selectedRel = this.fornecedoresLocal.find(
        (rel) => rel.id === this.selectedFornecedorRelId
      );

      if (selectedRel) {
        console.debug("Fornecedor correspondente encontrado:", selectedRel);
        this.form.setor_origem_id = selectedRel.setor_fornecedor_id;
        console.debug("Setor origem ID atualizado:", this.form.setor_origem_id);
      } else {
        console.warn(
          "Nenhum fornecedor correspondente encontrado para o ID selecionado:",
          this.selectedFornecedorRelId
        );
        this.form.setor_origem_id = null;
      }
    },
    getRelSetorName(rel) {
      // Retorna o nome do setor/fornecedor a partir da relação sem buscar lista de setores
      const setorNome =
        rel.setor?.nome ||
        rel.setor_nome ||
        rel.fornecedor?.setor?.nome ||
        null;
      if (setorNome) return setorNome;
      return (
        rel.fornecedor?.nome ||
        rel.fornecedor?.razao_social ||
        "Fornecedor desconhecido"
      );
    },
    fecharModal() {
      const modalEl = document.getElementById("modalSolicitacaoMovimentacao");
      if (modalEl) {
        const modalInst = bootstrap.Modal.getInstance(modalEl);
        if (modalInst) modalInst.hide();
      }
    },
    adicionarItem() {
      if (!this.produtoSelecionadoId) return;
      const produto =
        (this.produtosFiltradosPorTipo || []).find(
          (p) => p.id === this.produtoSelecionadoId
        ) || this.produtos.find((p) => p.id === this.produtoSelecionadoId);
      if (!produto) return;
      this.form.itens.push({
        produto_id: produto.id,
        produto_nome: produto.nome_completo || produto.nome,
        quantidade_solicitada: this.itemAtual.quantidade_solicitada,
      });
      this.produtoSelecionadoId = "";
      this.itemAtual.quantidade_solicitada = 1;
    },
    removerItem(idx) {
      this.form.itens.splice(idx, 1);
    },
    salvarRascunho() {
      this.form.status_solicitacao = "C"; // rascunho
      this.enviarForm(true);
    },
    finalizarSolicitacao() {
      this.form.status_solicitacao = "P"; // pendente
      this.enviarForm(false);
    },
    enviarForm(isDraft = false) {
      // preencher usuario_id se possível
      this.form.usuario_id = this.$store.state.user?.id || this.userId || null;
      // definir tipo padrão de movimentação (T = Transferência) se não informado
      if (!this.form.tipo) this.form.tipo = "T";

      // debug: mostrar no console o form e o preview do payload enviado
      try {
        console.log(
          "[ModalSolicitacaoMovimentacao] this.form:",
          JSON.parse(JSON.stringify(this.form))
        );
      } catch (e) {
        console.log(
          "[ModalSolicitacaoMovimentacao] this.form (raw):",
          this.form
        );
      }

      const payloadPreview = {
        usuario_id: this.form.usuario_id,
        user_id: this.form.usuario_id,
        setor_origem_id: this.form.setor_origem_id,
        tipo: this.form.tipo || "T",
        setor_destino_id: this.form.setor_destino_id,
        tipo_produto: this.form.tipo_produto,
        observacao: this.form.observacao,
        status_solicitacao: this.form.status_solicitacao,
        itens: (this.form.itens || []).map((it) => ({
          produto_id: it.produto_id,
          quantidade_solicitada: it.quantidade_solicitada,
          lote: it.lote || null,
        })),
      };
      console.log(
        "[ModalSolicitacaoMovimentacao] payload preview:",
        payloadPreview
      );

      // usar função centralizada para criar movimentação e retornar promise
      functionsMovimentacao
        .ADD_UP(this)
        .then((res) => {
          if (res && res.status) {
            const mensagem = res.message || "Movimentação criada com sucesso!";
            this.$toastr?.s(mensagem) || alert(mensagem);
            this.fecharModal();
          } else {
            const erro = "Erro ao criar movimentação. Tente novamente.";
            this.$toastr?.e(erro) || alert(erro);
          }
        })
        .catch((err) => {
          const erro =
            err.message ||
            "Erro ao salvar movimentação. Verifique os dados e tente novamente.";
          console.error("Erro ao salvar movimentação:", err);
          this.$toastr?.e(erro) || alert(erro);
        });
    },
    resetForm() {
      this.form = {
        usuario_id: null,
        setor_origem_id: null,
        setor_destino_id: null,
        tipo_produto: "",
        observacao: "",
        status_solicitacao: "P",
        itens: [],
      };
      this.produtoSelecionadoId = "";
      this.itemAtual.quantidade_solicitada = 1;
      this.$store.commit("setModalErrors", {});
    },
    // watcher impl em methods para ligação no mounted via $watch
    _updateSetoresFromStore() {
      // removido: não mais atualizamos setores a partir do store
    },
  },
  mounted() {
    // observar alterações na lista de setores do Vuex
    this.$watch(
      () => this.$store.state.listSetoresGerais,
      () => {
        this._updateSetoresFromStore();
      },
      { immediate: true, deep: true }
    );
    // quando o tipo mudar, atualizar automaticamente o setor origem
    this.$watch(
      () => this.form.tipo_produto,
      () => {
        if (this.originSetor && this.originSetor.id) {
          this.form.setor_origem_id = this.originSetor.id;
        } else {
          this.form.setor_origem_id = null;
        }
      }
    );
    // quando originSetor mudar (por exemplo após setoresDisponiveis ser carregado), atualizar setor_origem_id
    this.$watch(
      () => this.originSetor,
      (val) => {
        if (val && val.id) this.form.setor_origem_id = val.id;
      },
      { immediate: true, deep: true }
    );

    // observar alterações na lista global de produtos e sincronizar
    this.$watch(
      () => this.$store.state.listProdutos,
      (newVal) => {
        if (Array.isArray(newVal)) {
          this.produtosDisponiveis = newVal;
        } else if (newVal && Array.isArray(newVal.data)) {
          this.produtosDisponiveis = newVal.data;
        } else {
          this.produtosDisponiveis = [];
        }
      },
      { immediate: true, deep: true }
    );
  },
};
</script>

<style scoped></style>
