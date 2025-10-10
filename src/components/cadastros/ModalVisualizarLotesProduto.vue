<template>
  <ModalBase01
    :idModal="idModal"
    :modalTitle="modalTitle"
    size="xl"
    width="95vw"
    style="max-width: 1800px"
  >
    <!-- Slot default (body) -->
    <div>
      <div v-if="temProduto">
        <!-- Header com informações do produto -->
        <div class="card border-0 bg-light mb-4">
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h5 class="mb-3">
                  <i class="mdi mdi-package-variant me-2"></i>
                  {{ produto.nome }}
                </h5>
                <div class="mb-2">
                  <strong>Marca:</strong>
                  <span class="ms-2">{{ produto.marca || "-" }}</span>
                </div>
                <div class="mb-2">
                  <strong>Grupo:</strong>
                  <span class="ms-2">{{
                    produto.grupoProduto?.nome || "-"
                  }}</span>
                </div>
                <div class="mb-2">
                  <strong>Unidade de Medida:</strong>
                  <span class="ms-2">
                    {{ produto.unidadeMedida?.nome }}
                    ({{ produto.unidadeMedida?.abreviacao }})
                  </span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-2">
                  <strong>Unidade:</strong>
                  <span class="ms-2">{{ unidade?.nome || "-" }}</span>
                </div>
                <div class="mb-2">
                  <strong>Estoque ID:</strong>
                  <span class="ms-2">#{{ estoqueId }}</span>
                </div>
                <div class="mb-2">
                  <strong>Quantidade Atual:</strong>
                  <span class="ms-2">
                    {{ quantidadeAtual }}
                    {{ produto.unidadeMedida?.abreviacao }}
                  </span>
                </div>
                <div class="mb-2">
                  <strong>Quantidade Mínima:</strong>
                  <span class="ms-2">
                    {{ quantidadeMinima }}
                    {{ produto.unidadeMedida?.abreviacao }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading de Lotes -->
        <div v-if="loadingLotes" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Carregando lotes...</span>
          </div>
          <p class="mt-2 text-muted">Carregando lotes...</p>
        </div>

        <!-- Tabela de Lotes -->
        <div v-else-if="lotes.length > 0">
          <h6 class="mb-3">
            <i class="mdi mdi-format-list-bulleted me-2"></i>
            Lotes Disponíveis ({{ lotes.length }})
          </h6>
          <div class="table-responsive">
            <table class="table table-hover table-striped mb-0">
              <thead class="table-light">
                <tr>
                  <th class="text-center">#</th>
                  <th class="text-start">Lote</th>
                  <th class="text-center">Quantidade Disponível</th>
                  <th class="text-center">Data de Fabricação</th>
                  <th class="text-center">Data de Vencimento</th>
                  <th class="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(lote, index) in lotes" :key="lote.id">
                  <td class="text-center">{{ index + 1 }}</td>
                  <td class="text-start">
                    {{ lote.lote }}
                  </td>
                  <td class="text-center">
                    {{ formatarQuantidade(lote.quantidade_disponivel) }}
                    {{ produto.unidadeMedida?.abreviacao }}
                  </td>
                  <td class="text-center">
                    {{ formatarData(lote.data_fabricacao) }}
                  </td>
                  <td class="text-center">
                    {{ formatarData(lote.data_vencimento) }}
                  </td>
                  <td class="text-center">
                    <span
                      :class="getStatusVencimentoClass(lote.data_vencimento)"
                    >
                      {{ getStatusVencimentoTexto(lote.data_vencimento) }}
                    </span>
                  </td>
                </tr>
              </tbody>
              <tfoot class="table-light">
                <tr>
                  <td colspan="2" class="text-end">
                    <strong>Total:</strong>
                  </td>
                  <td class="text-center">
                    <strong class="text-primary">
                      {{ totalQuantidade }}
                      {{ produto.unidadeMedida?.abreviacao }}
                    </strong>
                  </td>
                  <td colspan="3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Mensagem quando não há lotes -->
        <div v-else class="text-center py-5">
          <i
            class="mdi mdi-package-variant-closed display-4 text-muted mb-3"
          ></i>
          <h5>Nenhum lote encontrado</h5>
          <p class="text-muted">
            Este produto não possui lotes registrados nesta unidade.
          </p>
        </div>
      </div>

      <!-- Mensagem quando não há produto -->
      <div v-else class="text-center py-5">
        <i class="mdi mdi-alert-circle-outline display-4 text-warning mb-3"></i>
        <h5>Produto não selecionado</h5>
        <p class="text-muted">Selecione um produto para visualizar os lotes.</p>
      </div>
    </div>
    <!-- Fim slot default (body) -->

    <template #footer>
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
        <i class="mdi mdi-close me-1"></i>
        Fechar
      </button>
    </template>
  </ModalBase01>
</template>

<script>
import ModalBase01 from "@/components/layouts/ModalBase01.vue";

export default {
  name: "ModalVisualizarLotesProduto",
  components: {
    ModalBase01,
  },
  props: {
    idModal: {
      type: String,
      default: "modalVisualizarLotesProduto",
    },
    produto: {
      type: Object,
      default: () => ({}),
    },
    unidade: {
      type: Object,
      default: () => ({}),
    },
    estoqueId: {
      type: [Number, String],
      default: null,
    },
    quantidadeAtual: {
      type: [Number, String],
      default: 0,
    },
    quantidadeMinima: {
      type: [Number, String],
      default: 0,
    },
  },
  data() {
    return {
      loadingLotes: false,
    };
  },
  computed: {
    modalTitle() {
      return this.produto?.nome
        ? `Lotes - ${this.produto.nome}`
        : "Lotes do Produto";
    },
    lotes() {
      return this.$store.state.listEstoqueLote || [];
    },
    totalQuantidade() {
      return this.lotes
        .reduce((total, lote) => {
          const qtd = parseFloat(lote.quantidade_disponivel) || 0;
          return total + qtd;
        }, 0)
        .toFixed(3);
    },
    temProduto() {
      return !!(this.produto && this.produto.id);
    },
  },
  methods: {
    formatarData(data) {
      if (!data) return "-";

      // Extrair apenas a parte da data (YYYY-MM-DD) ignorando o timestamp
      const dataLimpa = data.split("T")[0]; // Remove tudo após o 'T'
      const [ano, mes, dia] = dataLimpa.split("-");

      return `${dia}/${mes}/${ano}`;
    },
    formatarQuantidade(quantidade) {
      const qtd = parseFloat(quantidade) || 0;
      return qtd.toFixed(3);
    },
    getStatusVencimentoTexto(dataVencimento) {
      if (!dataVencimento) return "-";

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      // Extrair apenas a parte da data (YYYY-MM-DD)
      const dataLimpa = dataVencimento.split("T")[0];
      const vencimento = new Date(dataLimpa + "T00:00:00");
      vencimento.setHours(0, 0, 0, 0);

      const diffTime = vencimento - hoje;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return "Vencido";
      } else if (diffDays === 0) {
        return "Vence Hoje";
      } else if (diffDays <= 30) {
        return `Vence em ${diffDays} dia(s)`;
      } else if (diffDays <= 90) {
        return "Vence em breve";
      } else {
        return "Dentro da validade";
      }
    },
    getStatusVencimentoClass(dataVencimento) {
      if (!dataVencimento) return "badge bg-secondary";

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      // Extrair apenas a parte da data (YYYY-MM-DD)
      const dataLimpa = dataVencimento.split("T")[0];
      const vencimento = new Date(dataLimpa + "T00:00:00");
      vencimento.setHours(0, 0, 0, 0);

      const diffTime = vencimento - hoje;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return "badge bg-danger"; // Vencido
      } else if (diffDays === 0) {
        return "badge bg-danger"; // Vence hoje
      } else if (diffDays <= 30) {
        return "badge bg-warning text-dark"; // Vence em até 30 dias
      } else if (diffDays <= 90) {
        return "badge bg-info"; // Vence em até 90 dias
      } else {
        return "badge bg-success"; // Dentro da validade
      }
    },
  },
};
</script>

<style scoped>
.table-hover tbody tr:hover {
  background-color: #f8f9fa;
  transition: background-color 0.2s ease;
}
</style>
