<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
      ></div>
      <p class="mt-4 text-muted-foreground">Carregando estoque...</p>
    </div>

    <!-- Conteúdo do Estoque -->
    <div v-else class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <i class="mdi mdi-package-variant text-xl"></i>
          Estoque - {{ setorEstoque.nome || "Setor" }}
        </h2>
      </div>

      <!-- Cards de Resumo -->
      <div
        class="grid grid-cols-1 md:grid-cols-3 gap-4"
        v-if="resumoEstoque && Object.keys(resumoEstoque).length > 0"
      >
        <Card>
          <CardContent class="pt-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600 mb-2">
                {{ resumoEstoque.total_produtos || 0 }}
              </div>
              <p class="text-sm text-muted-foreground">Total de Produtos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600 mb-2">
                {{ resumoEstoque.produtos_disponiveis || 0 }}
              </div>
              <p class="text-sm text-muted-foreground">Disponíveis</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-amber-600 mb-2">
                {{ resumoEstoque.produtos_abaixo_minimo || 0 }}
              </div>
              <p class="text-sm text-muted-foreground">Abaixo do Mínimo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Tabela de Estoque -->
      <div v-if="estoqueItems.length > 0">
        <div class="table-responsive">
          <table class="table table-striped align-middle mb-0">
            <thead>
              <tr>
                <th class="text-center">#</th>
                <th class="text-start">Produto</th>
                <th class="text-start">Grupo</th>
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
                @click="visualizarDetalhes(item)"
                style="cursor: pointer"
                class="hover:bg-accent/50"
              >
                <td class="text-center">
                  <strong>#{{ index + 1 }}</strong>
                </td>
                <td class="text-start">
                  <small>{{ item.produto }}</small>
                </td>
                <td class="text-start">
                  <small>{{ item.grupo }}</small>
                </td>
                <td class="text-center">
                  <Badge variant="outline">{{ item.quantidade_atual }}</Badge>
                </td>
                <td class="text-center" @click.stop>
                  <div
                    v-if="editandoQuantidade === item.id"
                    class="d-flex align-items-center justify-content-center gap-2"
                  >
                    <input
                      type="number"
                      class="form-control form-control-sm"
                      style="width: 70px"
                      v-model.number="novaQuantidadeMinima"
                      min="0"
                      @keyup.enter="
                        salvarQuantidadeMinima(
                          item.id,
                          item.quantidade_minima_valor
                        )
                      "
                      @keyup.escape="cancelarEdicao"
                      autofocus
                    />
                    <Button
                      size="icon-sm"
                      variant="confirm"
                      @click="
                        salvarQuantidadeMinima(
                          item.id,
                          item.quantidade_minima_valor
                        )
                      "
                      title="Salvar"
                    >
                      <i class="mdi mdi-check"></i>
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="outline"
                      @click="cancelarEdicao"
                      title="Cancelar"
                    >
                      <i class="mdi mdi-close"></i>
                    </Button>
                  </div>
                  <div v-else>
                    <Badge variant="outline">{{
                      item.quantidade_minima
                    }}</Badge>
                  </div>
                </td>
                <td class="text-center">
                  <Badge
                    :variant="
                      item.status === 'Disponível' ? 'default' : 'secondary'
                    "
                  >
                    {{ item.status }}
                  </Badge>
                </td>
                <td class="text-center">
                  {{ item.alerta }}
                </td>
                <td class="text-center" @click.stop>
                  <div class="d-flex align-items-center justify-content-center">
                    <Button
                      v-if="editandoQuantidade !== item.id"
                      variant="edit"
                      size="icon-sm"
                      @click="
                        editarQuantidadeMinima(
                          item.id,
                          item.quantidade_minima_valor
                        )
                      "
                      title="Editar quantidade mínima"
                    >
                      <i class="mdi mdi-pencil"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-12">
        <i class="mdi mdi-box-multiple text-5xl text-muted-foreground mb-4"></i>
        <h3 class="text-lg font-semibold mb-2">Nenhum item em estoque</h3>
        <p class="text-muted-foreground">
          Não há produtos em estoque para este setor.
        </p>
      </div>
    </div>

    <!-- Modal de Visualização de Detalhes -->
    <ModalVisualizarEstoque ref="modalVisualizarEstoque" />
  </div>
</template>

<script setup>
import { computed, ref, inject } from "vue";
import { useStore } from "vuex";
import functionsEstoque from "@/functions/cad_estoque";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ModalVisualizarEstoque from "@/components/cadastros/ModalVisualizarEstoque.vue";

const store = useStore();

// Receber dados do componente pai (SetorAtualView) via provide/inject
const parentData = inject("setorAtualData", {
  estoqueItems: [],
  resumoEstoque: {},
  setorEstoque: {},
  loading: false,
});

// Ref do modal
const modalVisualizarEstoque = ref(null);

const loading = computed(() => store.state.isSearching || false);
const estoqueItems = computed(() => {
  const items = parentData.estoqueItems;
  // Se for uma ref (Composition API), usar .value
  return items?.value || items || [];
});
const resumoEstoque = computed(() => {
  const resumo = parentData.resumoEstoque;
  return resumo?.value || resumo || {};
});
const setorEstoque = computed(() => {
  const setor = parentData.setorEstoque;
  return setor?.value || setor || {};
});

// Função para visualizar detalhes do item
const visualizarDetalhes = (item) => {
  if (modalVisualizarEstoque.value) {
    modalVisualizarEstoque.value.openModal(item);
  }
};

// Estados para edição de quantidade mínima
const editandoQuantidade = ref(null);
const novaQuantidadeMinima = ref(0);

// Função para iniciar edição
const editarQuantidadeMinima = (itemId, quantidadeAtual) => {
  editandoQuantidade.value = itemId;
  novaQuantidadeMinima.value = quantidadeAtual;
};

// Função para cancelar edição
const cancelarEdicao = () => {
  editandoQuantidade.value = null;
  novaQuantidadeMinima.value = 0;
};

// Função para salvar quantidade mínima
const salvarQuantidadeMinima = async (itemId, quantidadeAtual) => {
  try {
    // Encontrar o item original
    const itemOriginal = estoqueItems.value.find(
      (item) => item.estoque_id === itemId
    );
    if (!itemOriginal) {
      alert("Item não encontrado");
      return;
    }

    // Validar a nova quantidade
    const novaQuantidade = parseInt(novaQuantidadeMinima.value);
    if (isNaN(novaQuantidade) || novaQuantidade < 0) {
      alert("Quantidade deve ser um número maior ou igual a zero");
      return;
    }

    // Verificar se houve mudança
    if (novaQuantidade === itemOriginal.quantidade_minima) {
      cancelarEdicao();
      return;
    }

    // Atualizar via API
    const context = {
      $axios: axios,
      $store: store,
      $toastr: undefined,
      modalData: {},
    };

    await functionsEstoque.atualizarQuantidadeMinima(
      context,
      itemId,
      novaQuantidade
    );

    // Recarregar dados para refletir a mudança
    const setorId = store.state.setorAtualId;
    if (setorId) {
      await functionsEstoque.listAll(context);
    }

    // Cancelar edição
    cancelarEdicao();

    // Feedback de sucesso
    alert("Quantidade mínima atualizada com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar quantidade mínima:", error);
    alert("Erro ao atualizar quantidade mínima");
  }
};

const formattedEstoque = computed(() => {
  if (!estoqueItems.value?.length) return { data: [] };

  return {
    data: estoqueItems.value.map((item) => ({
      id: item.estoque_id,
      produto: item.produto?.nome_completo || "N/A",
      grupo: item.produto?.grupo_produto?.nome || "N/A",
      quantidade_atual:
        `${item.quantidade_atual || 0} ${item.produto?.unidade_medida?.nome || ""}`.trim(),
      quantidade_minima:
        `${item.quantidade_minima || 0} ${item.produto?.unidade_medida?.nome || ""}`.trim(),
      quantidade_minima_valor: item.quantidade_minima || 0,
      status:
        item.status_disponibilidade === "D" ? "Disponível" : "Indisponível",
      alerta: item.abaixo_minimo ? "⚠️ Abaixo" : "✅ OK",
    })),
  };
});
</script>

<style scoped>
.card.border-0 {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.badge {
  font-size: 0.75em;
}

.table-responsive {
  border-radius: 0.25rem;
  border: 1px solid #e9ecef;
}

.table {
  margin-bottom: 0;
}
</style>
