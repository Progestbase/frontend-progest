<template>
  <div>
    <div
      class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3"
    >
      <div>
        <h5 class="mb-1">
          <i class="mdi mdi-swap-horizontal me-2"></i>
          Movimentações de Estoque
        </h5>
        <p class="text-muted mb-0">
          Histórico de movimentações (transferências) de estoque.
        </p>
      </div>
      <button
        class="btn btn-primary"
        @click="abrirModalMovimentacao"
        :disabled="!setorId"
      >
        <i class="mdi mdi-plus me-2"></i>
        Nova Movimentação
      </button>
    </div>

    <div v-if="listMovimentacoes.length > 0" class="table-responsive">
      <table class="table table-striped align-middle mb-0">
        <thead>
          <tr>
            <th class="text-start">ID</th>
            <th class="text-start">Criada em</th>
            <th class="text-start">Tipo</th>
            <th class="text-start">Status</th>
            <th class="text-center">Itens</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="mov in listMovimentacoes"
            :key="mov.id"
            style="cursor: pointer"
            class="hover-row"
          >
            <td class="text-start">{{ mov.id }}</td>
            <td class="text-start">{{ formatarData(mov.created_at) }}</td>
            <td class="text-start">{{ formatarTipo(mov.tipo) }}</td>
            <td class="text-start">
              {{ traduzStatus(mov.status_solicitacao) }}
            </td>
            <td class="text-center">{{ mov.itens?.length || 0 }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center py-5">
      <div class="d-flex flex-column align-items-center">
        <i class="mdi mdi-swap-horizontal display-4 text-muted mb-3"></i>
        <h5>Nenhuma movimentação registrada</h5>
        <p class="text-muted mb-0">
          Ainda não há movimentações para este setor.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed, inject } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  setorId: {
    type: Number,
    required: true,
  },
});

const store = useStore();

// Receber dados do componente pai (SetorAtualView) via provide/inject
const parentData = inject("setorAtualData", {
  movimentacoesItems: [],
});

const listMovimentacoes = computed(() => {
  const items = parentData.movimentacoesItems;
  // Se for uma ref (Composition API), usar .value
  return items?.value || items || [];
});

const formatarData = (data) => {
  if (!data) return null;

  let dataStr = String(data);
  if (dataStr.includes("T")) {
    dataStr = dataStr.split("T")[0];
  }

  const parts = dataStr.split("-");
  if (parts.length < 3) return null;
  const [ano, mes, dia] = parts;
  return `${dia}/${mes}/${ano}`;
};

const formatarTipo = (tipo) => {
  const tipoMap = {
    S: "Saída",
    E: "Entrada",
    T: "Transferência",
  };
  return tipoMap[tipo] || tipo;
};

const traduzStatus = (status) => {
  const statusMap = {
    A: "Aprovada",
    R: "Rejeitada",
    P: "Pendente",
    C: "Cancelada",
  };
  return statusMap[status] || status;
};

const abrirModalMovimentacao = () => {
  console.log("Abrir modal de movimentação (em desenvolvimento)");
};
</script>

<style scoped>
.table-responsive {
  border-radius: 0.25rem;
  border: 1px solid #e9ecef;
}

.table {
  margin-bottom: 0;
}

.hover-row:hover {
  background-color: #f8f9fa;
}
</style>
