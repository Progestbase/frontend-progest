<template>
  <span>
    <ModalBase01
      :idModal="idModal"
      modalClass="modal-dialog modal-fullscreen-xxl-down modal-dialog-scrollable modal-dialog-centered"
    >
      <div class="row">
        <div class="col-12">
          <h4 class="mb-3 d-flex align-items-center gap-2">
            <i class="mdi mdi-file-document-outline text-primary"></i>
            Detalhes da Entrada #{{ entrada.id }}
          </h4>
          <p class="text-muted mb-4">
            Visualização completa dos dados da entrada de estoque.
          </p>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <label class="form-label text-muted small">Nota Fiscal</label>
          <p class="mb-0 fw-semibold">{{ entrada.nota_fiscal || "-" }}</p>
        </div>

        <div class="col-md-3">
          <label class="form-label text-muted small">Unidade</label>
          <p class="mb-0 fw-semibold">
            {{ entrada.unidade?.nome || "-" }}
          </p>
        </div>

        <div class="col-md-3">
          <label class="form-label text-muted small">Fornecedor</label>
          <p class="mb-0 fw-semibold">
            {{ entrada.fornecedor?.razao_social_nome || "-" }}
          </p>
        </div>

        <div class="col-md-3">
          <label class="form-label text-muted small">Data de Registro</label>
          <p class="mb-0 fw-semibold">
            {{ formatarDataHora(entrada.created_at) }}
          </p>
        </div>
      </div>

      <hr class="my-4" />

      <div class="mb-3">
        <h5 class="mb-3">
          <i class="mdi mdi-package-variant me-2"></i>
          Produtos da Entrada
        </h5>

        <div
          v-if="entrada.itens && entrada.itens.length > 0"
          class="table-responsive"
        >
          <table class="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th class="text-start">Produto</th>
                <th class="text-center">Quantidade</th>
                <th class="text-center">Unidade</th>
                <th class="text-center">Lote</th>
                <th class="text-center">Data Fabricação</th>
                <th class="text-center">Data Vencimento</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in entrada.itens" :key="item.id">
                <td class="text-start">
                  <strong>{{
                    item.produto?.nome || "Produto não encontrado"
                  }}</strong>
                  <div class="text-muted small" v-if="item.produto?.marca">
                    {{ item.produto.marca }}
                  </div>
                  <div
                    class="text-muted small"
                    v-if="item.produto?.grupo_produto"
                  >
                    <i class="mdi mdi-tag-outline"></i>
                    {{ item.produto.grupo_produto.nome }}
                  </div>
                </td>
                <td class="text-center">
                  <span class="badge bg-primary fs-6">{{
                    item.quantidade
                  }}</span>
                </td>
                <td class="text-center">
                  {{ item.produto?.unidade_medida?.nome || "-" }}
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
              </tr>
            </tbody>
            <tfoot>
              <tr class="table-light">
                <td colspan="1" class="text-end fw-bold">Total de itens:</td>
                <td class="text-center fw-bold">
                  {{ totalQuantidade }}
                </td>
                <td colspan="4" class="text-muted small">
                  {{ entrada.itens.length }} produto(s) diferente(s)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div v-else class="alert alert-info">
          <i class="mdi mdi-information-outline me-2"></i>
          Nenhum item registrado nesta entrada.
        </div>
      </div>

      <div class="mt-4 d-flex justify-content-end">
        <button
          type="button"
          class="btn btn-secondary btn-modal"
          data-bs-dismiss="modal"
        >
          <i class="mdi mdi-close-thick me-2"></i>
          Fechar
        </button>
      </div>
    </ModalBase01>
  </span>
</template>

<script>
import ModalBase01 from "@/components/layouts/ModalBase01.vue";

export default {
  name: "ModalVisualizarEntrada",
  components: {
    ModalBase01,
  },
  props: {
    idModal: {
      type: String,
      required: true,
    },
    entrada: {
      type: Object,
      default: () => ({
        id: null,
        nota_fiscal: null,
        created_at: null,
        unidade: {},
        fornecedor: {},
        itens: [],
      }),
    },
  },
  computed: {
    totalQuantidade() {
      if (!this.entrada.itens || this.entrada.itens.length === 0) {
        return 0;
      }
      return this.entrada.itens.reduce(
        (total, item) => total + (item.quantidade || 0),
        0
      );
    },
  },
  methods: {
    formatarData(data) {
      if (!data) return null;
      const [ano, mes, dia] = data.split("-");
      return `${dia}/${mes}/${ano}`;
    },
    formatarDataHora(dataString) {
      if (!dataString) return "-";
      const data = new Date(dataString);
      return (
        data.toLocaleDateString("pt-BR") +
        " às " +
        data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      );
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

.table tbody tr:hover {
  background-color: #f8f9fa;
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
