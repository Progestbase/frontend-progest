<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold flex items-center gap-2">
        <i class="mdi mdi-history text-xl text-blue-600"></i>
        Histórico de Pedidos
      </h2>
      <p class="text-sm text-muted-foreground">
        Acompanhe o status dos seus pedidos anteriores.
      </p>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="w-full min-h-[400px] flex items-center justify-center"
    >
      <LoadingSpinner size="lg" />
    </div>

    <!-- Empty State -->
    <Card v-else-if="pedidos.length === 0">
      <CardContent class="py-12 text-center">
        <i
          class="mdi mdi-package-variant text-6xl text-muted-foreground mb-4"
        ></i>
        <h3 class="text-lg font-medium mb-2">Nenhum pedido encontrado</h3>
        <p class="text-muted-foreground mb-4">
          Você ainda não fez nenhum pedido.
        </p>
        <Button @click="irParaBuscar">
          <i class="mdi mdi-magnify mr-2"></i>
          Buscar Itens
        </Button>
      </CardContent>
    </Card>

    <!-- Pedidos List -->
    <div v-else class="space-y-4">
      <Card v-for="pedido in pedidos" :key="pedido.id" class="overflow-hidden">
        <CardHeader class="pb-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <CardTitle class="text-lg">Pedido #{{ pedido.id }}</CardTitle>
              <Badge :variant="getStatusVariant(pedido.status_solicitacao)">
                {{ getStatusLabel(pedido.status_solicitacao) }}
              </Badge>
            </div>
            <div class="text-sm text-muted-foreground">
              {{ formatDate(pedido.data_hora) }}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <!-- Info do pedido e Ações -->
            <div class="flex items-center justify-between">
              <div class="flex flex-wrap gap-4 text-sm">
                <div class="flex items-center gap-2">
                  <i class="mdi mdi-store text-muted-foreground"></i>
                  <span class="text-muted-foreground">Fornecedor:</span>
                  <span class="font-medium">
                    {{ pedido.setor_origem?.nome || "N/A" }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <i class="mdi mdi-package-variant text-muted-foreground"></i>
                  <span class="text-muted-foreground">Itens:</span>
                  <span class="font-medium">
                    {{ pedido.itens?.length || 0 }}
                  </span>
                </div>
              </div>

              <!-- Botão de Cancelar -->
              <Button
                v-if="pedido.status_solicitacao === 'P'"
                variant="ghost"
                size="icon"
                @click.stop="cancelarPedido(pedido)"
                :disabled="canceling === pedido.id"
                class="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                title="Cancelar Pedido"
              >
                <LoadingSpinner v-if="canceling === pedido.id" size="sm" />
                <i v-else class="mdi mdi-close-circle-outline text-xl"></i>
              </Button>
            </div>

            <!-- Observação -->
            <div v-if="pedido.observacao" class="text-sm">
              <span class="text-muted-foreground">Observação:</span>
              <span class="ml-2">{{ pedido.observacao }}</span>
            </div>

            <!-- Expandir detalhes -->
            <div class="pt-2">
              <Button
                variant="ghost"
                size="sm"
                @click="toggleExpand(pedido.id)"
                class="text-xs"
              >
                <i
                  :class="[
                    'mdi mr-1',
                    expanded[pedido.id] ? 'mdi-chevron-up' : 'mdi-chevron-down',
                  ]"
                ></i>
                {{ expanded[pedido.id] ? "Ocultar itens" : "Ver itens" }}
              </Button>
            </div>

            <!-- Itens expandidos -->
            <div
              v-if="expanded[pedido.id] && pedido.itens"
              class="border-t pt-3 mt-2"
            >
              <div class="space-y-2">
                <div
                  v-for="item in pedido.itens"
                  :key="item.id"
                  class="flex items-center justify-between text-sm p-2 bg-muted rounded"
                >
                  <div>
                    <span class="font-medium">
                      {{ item.produto?.nome || `Produto #${item.produto_id}` }}
                    </span>
                  </div>
                  <div class="flex items-center gap-4">
                    <span class="text-muted-foreground">
                      Solicitado: {{ item.quantidade_solicitada }}
                    </span>
                    <span
                      v-if="item.quantidade_liberada > 0"
                      class="text-green-600"
                    >
                      Liberado: {{ item.quantidade_liberada }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ações -->
            <!-- Ações: Botão movido para cima -->
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Alert Dialog para confirmar cancelamento -->
    <AlertDialog v-model:open="showCancelDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar Pedido</AlertDialogTitle>
          <AlertDialogDescription>
            Deseja realmente cancelar o Pedido #{{ pedidoParaCancelar?.id }}?
            Esta ação não poderá ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div class="flex flex-row justify-end gap-2 mt-2">
          <AlertDialogCancel class="mt-0">Não, manter pedido</AlertDialogCancel>
          <AlertDialogAction
            @click="confirmarCancelamento"
            class="bg-red-600 hover:bg-red-700 text-white border-0"
          >
            Sim, cancelar pedido
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/loading-spinner/LoadingSpinner.vue";
import { useToast } from "@/components/ui/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
const router = useRouter();
const store = useStore();
const { toast } = useToast();

const pedidos = ref([]);
const loading = ref(true);
const expanded = ref({});
const canceling = ref(null);
const showCancelDialog = ref(false);
const pedidoParaCancelar = ref(null);

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusLabel = (status) => {
  const labels = {
    P: "Pendente",
    A: "Aprovado",
    R: "Rejeitado",
    C: "Rascunho",
    X: "Cancelado",
  };
  return labels[status] || status;
};

const getStatusVariant = (status) => {
  const variants = {
    P: "secondary",
    A: "default",
    R: "destructive",
    C: "outline",
    X: "destructive",
  };
  return variants[status] || "secondary";
};

const toggleExpand = (pedidoId) => {
  expanded.value[pedidoId] = !expanded.value[pedidoId];
};

const fetchPedidos = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem("token");
    const setorId = store.state.setorAtualId;

    const response = await axios.post(
      "/movimentacao/listBySetor",
      { setor_id: setorId, per_page: 50 },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.status) {
      // Filtrar apenas solicitações onde o setor atual é o destino
      const data = response.data.data?.data || response.data.data || [];
      pedidos.value = data.filter(
        (mov) => mov.tipo === "S" && mov.setor_destino_id === Number(setorId)
      );
    }
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    toast({
      title: "Erro",
      description: "Não foi possível carregar o histórico.",
      variant: "destructive",
    });
  } finally {
    loading.value = false;
  }
};

const cancelarPedido = (pedido) => {
  pedidoParaCancelar.value = pedido;
  showCancelDialog.value = true;
};

const confirmarCancelamento = async () => {
  const pedido = pedidoParaCancelar.value;
  if (!pedido) return;

  showCancelDialog.value = false;
  canceling.value = pedido.id;

  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `/movimentacao/${pedido.id}/process`,
      { action: "cancel" },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.status) {
      toast({
        title: "Sucesso",
        description: "Pedido cancelado com sucesso.",
      });
      await fetchPedidos();
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error("Erro ao cancelar pedido:", error);
    toast({
      title: "Erro",
      description:
        error.response?.data?.message || "Não foi possível cancelar o pedido.",
      variant: "destructive",
    });
  } finally {
    canceling.value = null;
    pedidoParaCancelar.value = null;
  }
};

const irParaBuscar = () => {
  router.push("/itens?tab=itens");
};

onMounted(() => {
  fetchPedidos();
});
</script>
