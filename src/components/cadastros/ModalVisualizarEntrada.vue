<template>
  <Dialog v-model:open="dialogOpen">
    <DialogContent class="max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader class="text-start">
        <DialogTitle class="flex items-center gap-2">
          <i class="mdi mdi-file-document-outline text-xl text-blue-600"></i>
          Detalhes da Entrada #{{ entrada?.id || "N/A" }}
        </DialogTitle>
        <DialogDescription>
          Visualização completa dos dados da entrada de estoque.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="text-sm font-medium text-muted-foreground"
              >Nota Fiscal</label
            >
            <p class="font-semibold">{{ entrada?.nota_fiscal || "-" }}</p>
          </div>

          <div>
            <label class="text-sm font-medium text-muted-foreground"
              >Setor</label
            >
            <p class="font-semibold">
              {{ entrada?.setor?.nome || entrada?.unidade?.nome || "-" }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-muted-foreground"
              >Fornecedor</label
            >
            <p class="font-semibold">
              {{ entrada?.fornecedor?.razao_social_nome || "-" }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-muted-foreground"
              >Data de Registro</label
            >
            <p class="font-semibold">
              {{ formatarDataHora(entrada?.created_at) }}
            </p>
          </div>
        </div>

        <hr />

        <div>
          <h5 class="mb-3 flex items-center gap-2">
            <i class="mdi mdi-package-variant text-blue-600"></i>
            Produtos da Entrada
          </h5>

          <div
            v-if="entrada?.itens && entrada.itens.length > 0"
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
                <tr v-for="item in entrada?.itens || []" :key="item.id">
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
                    <small>{{
                      formatarData(item.data_fabricacao) || "-"
                    }}</small>
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
                    {{ entrada?.itens?.length || 0 }} produto(s) diferente(s)
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
      </div>

      <div class="flex justify-end space-x-2 mt-4">
        <button type="button" class="btn btn-secondary" @click="fecharModal">
          <i class="mdi mdi-close-thick me-2"></i>
          Fechar
        </button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script>
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default {
  name: "ModalVisualizarEntrada",
  components: {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  },
  props: {
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
  data() {
    return {
      dialogOpen: false,
    };
  },
  computed: {
    totalQuantidade() {
      if (!this.entrada?.itens || this.entrada.itens.length === 0) {
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

      try {
        // Se for ISO string (com T), converter para Date e formatar
        if (typeof data === "string" && data.includes("T")) {
          const dataObj = new Date(data);
          return dataObj.toLocaleDateString("pt-BR");
        }

        // Se for formato YYYY-MM-DD
        if (typeof data === "string" && data.includes("-")) {
          const [ano, mes, dia] = data.split("-");
          return `${dia}/${mes}/${ano}`;
        }

        return data;
      } catch (e) {
        return data;
      }
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
    fecharModal() {
      this.dialogOpen = false;
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
</style>
