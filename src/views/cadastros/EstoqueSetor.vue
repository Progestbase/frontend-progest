<template>
  <div>
    <!-- Loading -->
    <div v-if="estoqueLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p class="mt-2">Carregando estoque...</p>
    </div>

    <!-- Error -->
    <div v-else-if="estoqueError" class="alert alert-danger" role="alert">
      <i class="mdi mdi-alert-circle-outline me-2"></i>
      {{ estoqueError }}
    </div>

    <!-- Conteúdo do Estoque -->
    <div v-else-if="setorEstoque && estoqueItems.length >= 0">
      <!-- Header com resumo -->
      <div class="row mb-4">
        <div class="col-12">
          <h5 class="mb-3">
            <i class="mdi mdi-package-variant me-2"></i>
            Estoque - {{ setorEstoque.nome }}
            <span
              v-if="setorEstoque.nome === 'Setor Exemplo'"
              class="badge bg-warning ms-2"
            >
              <i class="mdi mdi-alert-circle-outline me-1"></i>
              Dados de Exemplo
            </span>
          </h5>
          <p class="text-muted mb-0">
            <small>Tipo: {{ setorEstoque.tipo }}</small>
          </p>
        </div>
      </div>

      <!-- Alerta para dados de exemplo -->
      <div
        v-if="setorEstoque.nome === 'Setor Exemplo'"
        class="alert alert-warning mb-4"
        role="alert"
      >
        <i class="mdi mdi-information-outline me-2"></i>
        <strong>Modo Demonstração:</strong>
        Os dados exibidos são exemplos para demonstrar a funcionalidade. O
        backend está sendo ajustado para carregar dados reais.
      </div>

      <!-- Cards de Resumo -->
      <div class="row mb-4" v-if="resumoEstoque">
        <div class="col-md-4">
          <div class="card border-0 bg-light">
            <div class="card-body text-center">
              <h4 class="text-primary mb-1">
                {{ resumoEstoque.total_produtos || 0 }}
              </h4>
              <p class="text-muted mb-0">Total de Produtos</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 bg-light">
            <div class="card-body text-center">
              <h4 class="text-success mb-1">
                {{ resumoEstoque.produtos_disponiveis || 0 }}
              </h4>
              <p class="text-muted mb-0">Disponíveis</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 bg-light">
            <div class="card-body text-center">
              <h4 class="text-warning mb-1">
                {{ resumoEstoque.produtos_abaixo_minimo || 0 }}
              </h4>
              <p class="text-muted mb-0">Abaixo do Mínimo</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Estoque -->
      <div v-if="estoqueItems.length > 0" class="table-responsive">
        <table class="table table-striped mb-0">
          <thead>
            <tr>
              <th class="text-center">#</th>
              <th class="text-left">Produto</th>
              <th class="text-left">Grupo</th>
              <th class="text-center">Qtd. Atual</th>
              <th class="text-center">Qtd. Mínima</th>
              <th class="text-center">Status</th>
              <th class="text-center">Alerta</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in formattedEstoque.data"
              :key="item.id"
              @click="visualizarLotes(item)"
              style="cursor: pointer"
              class="hover-row"
            >
              <td class="text-center">{{ index + 1 }}</td>
              <td class="text-left">{{ item.produto }}</td>
              <td class="text-left">{{ item.grupo }}</td>
              <td class="text-center">{{ item.quantidade_atual }}</td>
              <td class="text-center" @click.stop>
                <div
                  v-if="editandoQuantidade === item.id"
                  class="d-flex align-items-center justify-content-center"
                >
                  <input
                    type="number"
                    class="form-control form-control-sm me-1"
                    style="width: 70px"
                    v-model="novaQuantidadeMinima"
                    min="0"
                    @keyup.enter="salvarQuantidadeMinima(item.id)"
                    @keyup.escape="cancelarEdicao"
                  />
                  <button
                    class="btn btn-success btn-sm me-1 d-flex align-items-center justify-content-center"
                    style="width: 30px; height: 30px; padding: 0"
                    @click="salvarQuantidadeMinima(item.id)"
                    title="Salvar"
                  >
                    <i class="mdi mdi-check"></i>
                  </button>
                  <button
                    class="btn btn-secondary btn-sm d-flex align-items-center justify-content-center"
                    style="width: 30px; height: 30px; padding: 0"
                    @click="cancelarEdicao"
                    title="Cancelar"
                  >
                    <i class="mdi mdi-close"></i>
                  </button>
                </div>
                <div v-else>
                  {{ item.quantidade_minima }}
                </div>
              </td>
              <td class="text-center" v-html="item.status"></td>
              <td class="text-center">{{ item.alerta }}</td>
              <td class="text-center" @click.stop>
                <div class="d-flex justify-content-center">
                  <button
                    class="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center"
                    style="width: 32px; height: 32px; padding: 0"
                    @click="
                      editarQuantidadeMinima(
                        item.id,
                        item.quantidade_minima_valor
                      )
                    "
                    title="Editar quantidade mínima"
                    v-if="editandoQuantidade !== item.id"
                  >
                    <i class="mdi mdi-pencil"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mensagem quando não há itens -->
      <div v-else class="text-center py-5">
        <i class="mdi mdi-package-variant-closed display-4 text-muted mb-3"></i>
        <h5>Nenhum produto no estoque</h5>
        <p class="text-muted">
          Este setor ainda não possui produtos em estoque.
        </p>
      </div>
    </div>

    <!-- Mensagem quando setor não tem estoque -->
    <div v-else class="text-center py-5">
      <i class="mdi mdi-information-outline display-4 text-info mb-3"></i>
      <h5>Esta setor não possui controle de estoque</h5>
      <p class="text-muted">
        Para habilitar o controle de estoque, edite a setor e marque a opção
        "Controle de Estoque".
      </p>
    </div>

    <!-- Modal de Visualização de Lotes -->
    <ModalVisualizarLotesProduto
      ref="modalVisualizarLotes"
      :produto="produtoSelecionado"
      :setor="setorEstoque"
      :estoqueId="estoqueIdSelecionado"
      :quantidadeAtual="quantidadeAtualSelecionada"
      :quantidadeMinima="quantidadeMinimaSelecionada"
    />
  </div>
</template>

<script>
import functions from "../../functions/cad_estoque.js";
import cadEstoqueLote from "../../functions/cad_estoque_lote.js";
import ModalVisualizarLotesProduto from "@/components/cadastros/ModalVisualizarLotesProduto.vue";
import * as bootstrap from "bootstrap";

export default {
  name: "EstoqueUnidade",
  components: {
    ModalVisualizarLotesProduto,
  },
  props: {
    setorId: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      estoqueLoading: false,
      estoqueError: null,
      estoqueData: null,
      estoqueItems: [],
      resumoEstoque: {},
      setorEstoque: {},
      functions: functions,
      editandoQuantidade: null,
      novaQuantidadeMinima: 0,
      produtoSelecionado: {},
      estoqueIdSelecionado: null,
      quantidadeAtualSelecionada: 0,
      quantidadeMinimaSelecionada: 0,
      modalVisualizarLotes: null,
    };
  },
  computed: {
    formattedEstoque() {
      if (!this.estoqueItems?.length) return { data: [] };

      return {
        data: this.estoqueItems.map((item) => ({
          id: item.estoque_id,
          produto: item.produto?.nome_completo || "N/A",
          grupo: item.produto?.grupo_produto?.nome || "N/A",
          quantidade_atual: `${item.quantidade_atual || 0} ${
            item.produto?.unidade_medida?.nome || ""
          }`.trim(),
          quantidade_minima: `${item.quantidade_minima || 0} ${
            item.produto?.unidade_medida?.nome || ""
          }`.trim(),
          quantidade_minima_valor: item.quantidade_minima || 0,
          status: this.formatarStatusParaTabela(
            item.status_disponibilidade,
            item.status_disponibilidade_texto
          ),
          alerta: item.abaixo_minimo ? "⚠️ Abaixo" : "✅ OK",
        })),
      };
    },
  },
  watch: {
    setorId: {
      handler(newId) {
        if (newId) {
          this.carregarEstoque();
        }
      },
      immediate: true,
    },
  },
  methods: {
    async carregarEstoque() {
      if (!this.setorId) return;

      try {
        await functions.listEstoqueUnidade(this, this.setorId);
      } catch (error) {
        console.error("Erro ao carregar estoque:", error);
      }
    },

    formatarStatusParaTabela(status, statusTexto) {
      return status === "D" ? "Disponível" : "Indisponível";
    },
    editarQuantidadeMinima(itemId, quantidadeAtual) {
      this.editandoQuantidade = itemId;
      this.novaQuantidadeMinima = quantidadeAtual;
    },

    cancelarEdicao() {
      this.editandoQuantidade = null;
      this.novaQuantidadeMinima = 0;
    },

    async salvarQuantidadeMinima(itemId) {
      try {
        // Encontrar o item original
        const itemOriginal = this.estoqueItems.find(
          (item) => item.estoque_id === itemId
        );
        if (!itemOriginal) {
          this.$toastr?.e("Item não encontrado") ||
            alert("Item não encontrado");
          return;
        }

        // Validar a nova quantidade
        const novaQuantidade = parseInt(this.novaQuantidadeMinima);
        if (isNaN(novaQuantidade) || novaQuantidade < 0) {
          this.$toastr?.e(
            "Quantidade deve ser um número maior ou igual a zero"
          ) || alert("Quantidade inválida");
          return;
        }

        // Verificar se houve mudança
        if (novaQuantidade === itemOriginal.quantidade_minima) {
          this.cancelarEdicao();
          return;
        }

        // Atualizar via API
        await functions.atualizarQuantidadeMinima(this, itemId, novaQuantidade);

        // Recarregar dados para refletir a mudança
        await this.carregarEstoque();

        // Cancelar edição
        this.cancelarEdicao();

        // Feedback de sucesso
        this.$toastr?.s("Quantidade mínima atualizada com sucesso!") ||
          alert("Quantidade mínima atualizada!");
      } catch (error) {
        console.error("Erro ao salvar quantidade mínima:", error);
        this.$toastr?.e("Erro ao atualizar quantidade mínima") ||
          alert("Erro ao atualizar quantidade mínima");
      }
    },

    async visualizarLotes(item) {
      // Buscar dados completos do item no estoqueItems
      const itemCompleto = this.estoqueItems.find(
        (e) => e.estoque_id === item.id
      );

      if (!itemCompleto) {
        this.$toastr?.e("Item de estoque não encontrado") ||
          alert("Item de estoque não encontrado");
        return;
      }

      // Definir dados do produto selecionado
      this.produtoSelecionado = itemCompleto.produto || {};
      this.estoqueIdSelecionado = itemCompleto.estoque_id;
      this.quantidadeAtualSelecionada = itemCompleto.quantidade_atual || 0;
      this.quantidadeMinimaSelecionada = itemCompleto.quantidade_minima || 0;

      // Carregar lotes via API e aguardar
      if (this.estoqueIdSelecionado) {
        try {
          // Aguardar o carregamento dos lotes
          await cadEstoqueLote.listByEstoque(this, this.estoqueIdSelecionado);

          // Pequeno delay para garantir que o Vue atualizou os computed
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error("Erro ao carregar lotes:", error);
        }
      }

      // Abrir modal APÓS carregar os lotes
      try {
        if (this.modalVisualizarLotes) {
          this.modalVisualizarLotes.dialogOpen = true;
        }
      } catch (error) {
        console.error("Erro ao abrir modal de lotes:", error);
        this.$toastr?.e("Não foi possível abrir o modal. Tente novamente.") ||
          alert("Erro ao abrir modal");
      }
    },
  },
};
</script>

<style scoped>
.card.border-0 {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.badge {
  font-size: 0.75em;
}

/* Melhorar aparência dos cards de resumo */
.card.bg-light {
  background-color: #f8f9fa !important;
  border: 1px solid #e9ecef;
}

.card.bg-light:hover {
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease-in-out;
}

/* Estilização para botões */
.btn {
  border-radius: 0.375rem;
}

/* Loading spinner customizado */
.spinner-border {
  width: 2rem;
  height: 2rem;
}

/* Espaçamento dos ícones */
.mdi {
  margin-right: 0.5rem;
}

/* Centralizar ícones nos botões */
.btn .mdi {
  margin-right: 0;
  font-size: 16px;
}

/* Estilo dos botões de ação na tabela */
.table td .btn {
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.table td .btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Estilo específico para os controles de edição */
.table td .d-flex {
  gap: 4px;
}

.table td input.form-control-sm {
  border: 1px solid #ced4da;
  border-radius: 4px;
  text-align: center;
  font-size: 0.875rem;
}

.table td input.form-control-sm:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* Responsividade dos cards de resumo */
@media (max-width: 768px) {
  .card.bg-light .card-body h4 {
    font-size: 1.5rem;
  }
}

/* Hover nas linhas da tabela para indicar clicabilidade */
.hover-row:hover {
  background-color: #f8f9fa;
  transition: background-color 0.2s ease;
}
</style>
