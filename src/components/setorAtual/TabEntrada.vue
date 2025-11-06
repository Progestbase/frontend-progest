<template>
  <div>
    <!-- Header com Botão -->
    <div
      class="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-3 mb-4"
    >
      <div>
        <h4 class="mb-1">
          <i class="mdi mdi-tray-arrow-down text-primary me-2"></i>
          Entradas de Estoque
        </h4>
        <small class="text-muted">
          Registros de entradas já lançadas para este setor.
        </small>
      </div>
      <Button @click="abrirModalEntrada" :disabled="!setorId" class="w-md">
        <i class="mdi mdi-plus me-2"></i>
        Registrar Entrada
      </Button>
    </div>

    <!-- Tabela de Entradas -->
    <div v-if="listEntradas.length > 0">
      <table class="table table-striped align-middle mb-0" role="table">
        <thead>
          <tr role="row">
            <th role="columnheader">ID</th>
            <th role="columnheader">Lançada em</th>
            <th role="columnheader">Nota Fiscal</th>
            <th role="columnheader" class="text-center">Itens</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entrada in listEntradas"
            :key="entrada.id"
            @click="visualizarEntrada(entrada)"
            role="row"
            class="cursor-pointer"
          >
            <td>
              <Badge variant="outline">{{ entrada.id }}</Badge>
            </td>
            <td>{{ formatarData(entrada.created_at) }}</td>
            <td class="fw-medium">{{ entrada.nota_fiscal || "-" }}</td>
            <td class="text-center">
              <Badge>{{ entrada.itens?.length || 0 }}</Badge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Estado Vazio -->
    <div v-else class="text-center py-5">
      <div class="mb-3">
        <i
          class="mdi mdi-tray-arrow-down"
          style="font-size: 3rem; color: var(--bs-secondary)"
        ></i>
      </div>
      <h5>Nenhuma entrada registrada</h5>
      <small class="text-muted">
        Ainda não há entradas de estoque para este setor.
      </small>
    </div>

    <!-- Modais -->
    <ModalEntradaEstoque
      ref="modalEntradaEstoque"
      idModal="modalEntradaEstoque"
      :unidade="{ id: setorId }"
      :setorTipo="setorAtual.tipo"
      @registrado="handleEntradaRegistrada"
    />

    <ModalVisualizarEntrada
      idModal="modalVisualizarEntrada"
      :entrada="entradaSelecionada"
    />
  </div>
</template>

<script setup>
import { defineProps, computed, inject, ref } from "vue";
import { useStore } from "vuex";
import { Modal } from "bootstrap";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ModalEntradaEstoque from "@/components/cadastros/ModalEntradaEstoque.vue";
import ModalVisualizarEntrada from "@/components/cadastros/ModalVisualizarEntrada.vue";

const props = defineProps({
  setorId: {
    type: Number,
    required: true,
  },
});

const store = useStore();

// Receber dados do componente pai (SetorAtualView) via provide/inject
const parentData = inject("setorAtualData", {
  entradasItems: [],
});

// Acessar o setor atual do store
const setorAtual = computed(() => store.state.setorDetails || {});

// Ref para armazenar a entrada selecionada
const entradaSelecionada = ref(null);

const listEntradas = computed(() => {
  const items = parentData.entradasItems;
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

const abrirModalEntrada = () => {
  // Abrir modal de entrada de estoque usando Bootstrap
  const modalElement = document.getElementById("modalEntradaEstoque");
  if (modalElement) {
    const modal = new Modal(modalElement);
    modal.show();
  } else {
    console.error("Modal element não encontrado");
  }
};

const visualizarEntrada = (entrada) => {
  console.log("Visualizar entrada:", entrada);
  entradaSelecionada.value = entrada;
  // Abrir modal de visualização
  const modalElement = document.getElementById("modalVisualizarEntrada");
  if (modalElement) {
    const modal = new Modal(modalElement);
    modal.show();
  }
};

const handleEntradaRegistrada = async () => {
  console.log("✅ Entrada registrada com sucesso!");
  // Recarregar a listagem de entradas
  const functionsEntrada = (await import("@/functions/cad_entradas")).default;
  const context = {
    $axios: axios,
    $store: store,
    entradasItems: parentData.entradasItems,
  };

  // Recarregar entradas do setor
  if (functionsEntrada.listByUnidade) {
    await functionsEntrada.listByUnidade(context, props.setorId);
  }
};
</script>
