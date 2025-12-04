<template>
  <div>
    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3"
    >
      <div>
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <i class="mdi mdi-swap-horizontal text-xl text-blue-600"></i>
          Movimentações de Estoque
        </h2>
        <p class="text-sm text-muted-foreground">
          Histórico de movimentações (transferências) de estoque.
        </p>
      </div>
      <Button @click="abrirModalMovimentacao" :disabled="!setorId">
        <i class="mdi mdi-plus me-2"></i>
        Nova Movimentação
      </Button>
    </div>

    <div v-if="listMovimentacoes.length > 0" class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th class="text-center" style="width: 50px"></th>
            <th class="text-start">Data</th>
            <th class="text-start">Origem</th>
            <th class="text-start">Destino</th>
            <th class="text-center">Itens</th>
            <th class="text-center">Status</th>
            <th class="text-center" style="width: 100px">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="mov in listMovimentacoes"
            :key="mov.id"
            :class="getRowClass(mov.status_solicitacao)"
          >
            <!-- Direction Icon -->
            <td class="text-center">
              <i
                v-if="isEntrada(mov)"
                class="mdi mdi-arrow-down-circle text-green-600"
                style="font-size: 1.25rem"
                title="Entrada"
              ></i>
              <i
                v-else
                class="mdi mdi-arrow-up-circle text-blue-600"
                style="font-size: 1.25rem"
                title="Saída"
              ></i>
            </td>

            <!-- Data -->
            <td class="text-start">
              <div>{{ formatarData(mov.created_at || mov.data_hora) }}</div>
              <small class="text-muted">{{
                formatarHora(mov.created_at || mov.data_hora)
              }}</small>
            </td>

            <!-- Origem -->
            <td class="text-start">
              <span :class="{ 'fw-bold': !isEntrada(mov) }">
                {{ mov.setor_origem?.nome || mov.setorOrigem?.nome || "-" }}
              </span>
            </td>

            <!-- Destino -->
            <td class="text-start">
              <span :class="{ 'fw-bold': isEntrada(mov) }">
                {{ mov.setor_destino?.nome || mov.setorDestino?.nome || "-" }}
              </span>
            </td>

            <!-- Itens -->
            <td class="text-center">
              <Badge variant="outline">
                {{ mov.itens?.length || mov.itens_diferentes_count || 0 }}
              </Badge>
            </td>

            <!-- Status -->
            <td class="text-center">
              <Badge :class="getStatusClass(mov.status_solicitacao)">
                {{ traduzStatus(mov.status_solicitacao) }}
              </Badge>
            </td>

            <!-- Ações -->
            <td class="text-center">
              <div class="d-flex gap-1 justify-content-center">
                <Button
                  variant="ghost"
                  size="icon"
                  @click="verDetalhes(mov)"
                  title="Ver detalhes"
                >
                  <i class="mdi mdi-eye text-blue-600"></i>
                </Button>

                <!-- Aprovar/Rejeitar apenas para SAÍDAS pendentes (setor atual é a ORIGEM) -->
                <template v-if="isSaida(mov) && mov.status_solicitacao === 'P'">
                  <Button
                    variant="ghost"
                    size="icon"
                    @click="abrirModalAprovacao(mov)"
                    title="Analisar solicitação"
                    class="text-green-600 hover:bg-green-50"
                  >
                    <i class="mdi mdi-check-decagram"></i>
                  </Button>
                </template>

                <!-- Cancelar pedido apenas para ENTRADAS pendentes (setor atual é o DESTINO/solicitante) -->
                <template
                  v-if="isEntrada(mov) && mov.status_solicitacao === 'P'"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    @click="confirmarCancelamento(mov)"
                    title="Cancelar solicitação"
                    class="text-red-600 hover:bg-red-50"
                  >
                    <i class="mdi mdi-cancel"></i>
                  </Button>
                </template>
              </div>
            </td>
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

    <!-- Modal de Nova Movimentação -->
    <ModalNovaMovimentacao
      v-model:open="dialogMovimentacaoOpen"
      :setorId="setorId"
      :setorNome="setorNome"
      @registrado="handleMovimentacaoRegistrada"
    />

    <!-- Modal de Detalhes (visualização) -->
    <Dialog
      :open="dialogDetalhesOpen"
      @update:open="dialogDetalhesOpen = $event"
    >
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle class="flex gap-2">
            <i class="mdi mdi-file-document-outline text-primary"></i>
            Detalhes da Movimentação #{{ movimentacaoSelecionada?.id }}
          </DialogTitle>
        </DialogHeader>

        <div v-if="movimentacaoSelecionada" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-muted">Status</Label>
              <div>
                <Badge
                  :class="
                    getStatusClass(movimentacaoSelecionada.status_solicitacao)
                  "
                >
                  {{ traduzStatus(movimentacaoSelecionada.status_solicitacao) }}
                </Badge>
              </div>
            </div>
            <div>
              <Label class="text-muted">Data</Label>
              <div>{{ formatarData(movimentacaoSelecionada.created_at) }}</div>
            </div>
            <div>
              <Label class="text-muted">Origem</Label>
              <div class="fw-medium">
                {{
                  movimentacaoSelecionada.setor_origem?.nome ||
                  movimentacaoSelecionada.setorOrigem?.nome ||
                  "-"
                }}
              </div>
            </div>
            <div>
              <Label class="text-muted">Destino</Label>
              <div class="fw-medium">
                {{
                  movimentacaoSelecionada.setor_destino?.nome ||
                  movimentacaoSelecionada.setorDestino?.nome ||
                  "-"
                }}
              </div>
            </div>
          </div>

          <div v-if="movimentacaoSelecionada.observacao">
            <Label class="text-muted">Observação</Label>
            <p class="mb-0">{{ movimentacaoSelecionada.observacao }}</p>
          </div>

          <div>
            <Label class="text-muted mb-2">Itens</Label>
            <div class="table-responsive">
              <table class="table table-sm table-striped mb-0">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th class="text-center">Qtd Solicitada</th>
                    <th class="text-center">Qtd Liberada</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in movimentacaoSelecionada.itens"
                    :key="item.id"
                  >
                    <td>{{ item.produto?.nome || "-" }}</td>
                    <td class="text-center">
                      {{ item.quantidade_solicitada }}
                    </td>
                    <td class="text-center">
                      {{ item.quantidade_liberada || "-" }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="mt-4 d-flex justify-content-end">
          <Button variant="outline" @click="dialogDetalhesOpen = false">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Modal de Aprovação (com edição de quantidades) -->
    <Dialog
      :open="dialogAprovacaoOpen"
      @update:open="dialogAprovacaoOpen = $event"
    >
      <DialogContent class="max-w-3xl">
        <DialogHeader>
          <DialogTitle class="flex gap-2">
            <i class="mdi mdi-clipboard-check-outline text-primary"></i>
            Analisar Solicitação #{{ movimentacaoParaAprovar?.id }}
          </DialogTitle>
          <DialogDescription>
            Revise os itens solicitados. Você pode ajustar as quantidades
            liberadas antes de aprovar.
          </DialogDescription>
        </DialogHeader>

        <div v-if="movimentacaoParaAprovar" class="space-y-4">
          <!-- Info do pedido -->
          <div class="grid grid-cols-2 gap-4 p-3 bg-light rounded">
            <div>
              <Label class="text-muted small">Solicitante (Destino)</Label>
              <div class="fw-medium">
                {{
                  movimentacaoParaAprovar.setor_destino?.nome ||
                  movimentacaoParaAprovar.setorDestino?.nome ||
                  "-"
                }}
              </div>
            </div>
            <div>
              <Label class="text-muted small">Data da Solicitação</Label>
              <div>{{ formatarData(movimentacaoParaAprovar.created_at) }}</div>
            </div>
          </div>

          <div
            v-if="movimentacaoParaAprovar.observacao"
            class="p-3 bg-amber-50 border border-amber-200 rounded"
          >
            <Label class="text-muted small">Observação do Solicitante</Label>
            <p class="mb-0">{{ movimentacaoParaAprovar.observacao }}</p>
          </div>

          <!-- Tabela de itens com quantidade editável -->
          <div>
            <Label class="text-muted mb-2">Itens da Solicitação</Label>
            <div class="table-responsive">
              <table class="table table-striped align-middle mb-0">
                <thead>
                  <tr>
                    <th class="text-start">Produto</th>
                    <th class="text-center">Qtd Solicitada</th>
                    <th class="text-center" style="width: 150px">
                      Qtd a Liberar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in itensParaAprovacao" :key="index">
                    <td class="text-start">
                      <strong>{{
                        item.produto?.nome || item.produtoNome || "-"
                      }}</strong>
                    </td>
                    <td class="text-center">
                      <Badge variant="outline">{{
                        item.quantidade_solicitada
                      }}</Badge>
                    </td>
                    <td class="text-center">
                      <Input
                        type="number"
                        min="0"
                        :max="item.quantidade_solicitada"
                        v-model.number="item.quantidade_liberada"
                        class="text-center"
                        style="width: 100px; margin: 0 auto"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Erros de estoque -->
          <div
            v-if="errosAprovacao.length > 0"
            class="mt-3 p-3 bg-red-50 border border-red-200 rounded"
          >
            <Label class="text-red-700 fw-bold mb-2">
              <i class="mdi mdi-alert-circle me-1"></i>
              Erro de Estoque
            </Label>
            <ul class="mb-0 ps-3 text-red-600 small">
              <li v-for="(erro, idx) in errosAprovacao" :key="idx">
                {{ erro }}
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-4 d-flex justify-content-between">
          <Button
            variant="destructive"
            @click="rejeitarMovimentacao"
            :disabled="loadingAprovacao"
          >
            <i class="mdi mdi-close-circle me-1"></i>
            Rejeitar Solicitação
          </Button>

          <div class="d-flex gap-2">
            <Button
              variant="outline"
              @click="dialogAprovacaoOpen = false"
              :disabled="loadingAprovacao"
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              @click="aprovarMovimentacao"
              :disabled="loadingAprovacao"
              class="bg-green-600 hover:bg-green-700"
            >
              <template v-if="!loadingAprovacao">
                <i class="mdi mdi-check-circle me-1"></i>
                Aprovar e Liberar
              </template>
              <template v-else>
                <span class="spinner-border spinner-border-sm me-1"></span>
                Processando...
              </template>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Modal de Confirmação de Cancelamento -->
    <Dialog
      :open="dialogCancelamentoOpen"
      @update:open="dialogCancelamentoOpen = $event"
    >
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="flex gap-2 text-red-600">
            <i class="mdi mdi-alert-circle"></i>
            Cancelar Solicitação
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja cancelar esta solicitação de movimentação?
          </DialogDescription>
        </DialogHeader>

        <div v-if="movimentacaoParaCancelar" class="py-3">
          <p class="mb-2">
            <strong>Movimentação #{{ movimentacaoParaCancelar.id }}</strong>
          </p>
          <p class="text-muted small mb-0">
            Origem:
            {{
              movimentacaoParaCancelar.setor_origem?.nome ||
              movimentacaoParaCancelar.setorOrigem?.nome ||
              "-"
            }}
          </p>
        </div>

        <div class="d-flex justify-content-end gap-2">
          <Button
            variant="outline"
            @click="dialogCancelamentoOpen = false"
            :disabled="loadingCancelamento"
          >
            Não, manter
          </Button>
          <Button
            variant="destructive"
            @click="cancelarMovimentacao"
            :disabled="loadingCancelamento"
          >
            <template v-if="!loadingCancelamento">
              <i class="mdi mdi-cancel me-1"></i>
              Sim, cancelar
            </template>
            <template v-else>
              <span class="spinner-border spinner-border-sm me-1"></span>
              Cancelando...
            </template>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, inject } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ModalNovaMovimentacao from "@/components/cadastros/ModalNovaMovimentacao.vue";

const props = defineProps({
  setorId: {
    type: Number,
    required: true,
  },
});

const store = useStore();

// Inject data from parent
const parentData = inject("setorAtualData", {
  movimentacoesItems: [],
});

// State
const dialogMovimentacaoOpen = ref(false);
const dialogDetalhesOpen = ref(false);
const dialogAprovacaoOpen = ref(false);
const movimentacaoSelecionada = ref(null);
const movimentacaoParaAprovar = ref(null);
const itensParaAprovacao = ref([]);
const loadingAprovacao = ref(false);
const errosAprovacao = ref([]);
const dialogCancelamentoOpen = ref(false);
const movimentacaoParaCancelar = ref(null);
const loadingCancelamento = ref(false);

// Computed
const listMovimentacoes = computed(() => {
  const items = parentData.movimentacoesItems;
  return items?.value || items || [];
});

const setorNome = computed(() => {
  return store.state.setorDetails?.nome || "";
});

// Methods
const isEntrada = (mov) => {
  // É entrada se o setor atual é o destino
  return (
    mov.setor_destino_id === props.setorId ||
    mov.setorDestino?.id === props.setorId
  );
};

const isSaida = (mov) => {
  // É saída se o setor atual é a origem
  return (
    mov.setor_origem_id === props.setorId ||
    mov.setorOrigem?.id === props.setorId
  );
};

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

const formatarHora = (data) => {
  if (!data) return "";
  const d = new Date(data);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const traduzStatus = (status) => {
  const statusMap = {
    A: "Aprovada",
    R: "Rejeitada",
    P: "Pendente",
    C: "Rascunho",
    X: "Cancelada",
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  const classes = {
    A: "bg-emerald-100 text-emerald-800 border-emerald-200",
    R: "bg-red-100 text-red-800 border-red-200",
    P: "bg-amber-100 text-amber-800 border-amber-200",
    C: "bg-gray-100 text-gray-800 border-gray-200",
    X: "bg-orange-100 text-orange-800 border-orange-200",
  };
  return classes[status] || "";
};

const getRowClass = (status) => {
  const classes = {
    A: "bg-emerald-50/50",
    R: "bg-red-50/50",
    P: "bg-amber-50/50",
    C: "bg-gray-50/50",
  };
  return classes[status] || "";
};

const abrirModalMovimentacao = () => {
  dialogMovimentacaoOpen.value = true;
};

const verDetalhes = (mov) => {
  movimentacaoSelecionada.value = mov;
  dialogDetalhesOpen.value = true;
};

const abrirModalAprovacao = (mov) => {
  movimentacaoParaAprovar.value = mov;
  // Criar cópia dos itens com quantidade_liberada inicializada
  itensParaAprovacao.value = (mov.itens || []).map((item) => ({
    ...item,
    quantidade_liberada: item.quantidade_liberada || item.quantidade_solicitada,
  }));
  dialogAprovacaoOpen.value = true;
};

const aprovarMovimentacao = async () => {
  if (!movimentacaoParaAprovar.value) return;

  loadingAprovacao.value = true;
  errosAprovacao.value = []; // Limpar erros anteriores

  try {
    const response = await axios.post(
      `/movimentacao/${movimentacaoParaAprovar.value.id}/process`,
      {
        action: "approve",
        aprovador_usuario_id: store.state.user?.id,
        itens: itensParaAprovacao.value.map((item) => ({
          id: item.id,
          quantidade_liberada: item.quantidade_liberada,
        })),
      },
      {
        headers: {
          Authorization: "Bearer " + store.getters.getUserToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data?.status) {
      dialogAprovacaoOpen.value = false;
      await recarregarMovimentacoes();
    } else {
      // Mostrar mensagem de erro
      const msg = response.data?.message || "Erro ao aprovar movimentação";
      errosAprovacao.value = response.data?.erros || [msg];
    }
  } catch (error) {
    console.error("Erro ao aprovar movimentação:", error);
    const errorData = error.response?.data;
    const msg = errorData?.message || "Erro ao aprovar movimentação";
    errosAprovacao.value = errorData?.erros || [msg];
  } finally {
    loadingAprovacao.value = false;
  }
};

const rejeitarMovimentacao = async () => {
  if (!movimentacaoParaAprovar.value) return;

  loadingAprovacao.value = true;
  try {
    const response = await axios.post(
      `/movimentacao/${movimentacaoParaAprovar.value.id}/process`,
      {
        action: "reject",
        aprovador_usuario_id: store.state.user?.id,
      },
      {
        headers: {
          Authorization: "Bearer " + store.getters.getUserToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data?.status) {
      dialogAprovacaoOpen.value = false;
      await recarregarMovimentacoes();
    }
  } catch (error) {
    console.error("Erro ao rejeitar movimentação:", error);
  } finally {
    loadingAprovacao.value = false;
  }
};

const handleMovimentacaoRegistrada = async () => {
  console.log("✅ Movimentação registrada com sucesso!");
  await recarregarMovimentacoes();
};

const recarregarMovimentacoes = async () => {
  try {
    const functionsMovimentacao = (await import("@/functions/cad_movimentacao"))
      .default;
    const context = {
      $axios: axios,
      $store: store,
      movimentacoesItems: parentData.movimentacoesItems,
    };

    if (functionsMovimentacao.listAll) {
      await functionsMovimentacao.listAll(context);
    }
  } catch (error) {
    console.error("Erro ao recarregar movimentações:", error);
  }
};

const confirmarCancelamento = (mov) => {
  movimentacaoParaCancelar.value = mov;
  dialogCancelamentoOpen.value = true;
};

const cancelarMovimentacao = async () => {
  if (!movimentacaoParaCancelar.value) return;

  loadingCancelamento.value = true;
  try {
    const response = await axios.post(
      `/movimentacao/${movimentacaoParaCancelar.value.id}/process`,
      {
        action: "cancel",
      },
      {
        headers: {
          Authorization: "Bearer " + store.getters.getUserToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data?.status) {
      dialogCancelamentoOpen.value = false;
      await recarregarMovimentacoes();
    }
  } catch (error) {
    console.error("Erro ao cancelar movimentação:", error);
  } finally {
    loadingCancelamento.value = false;
  }
};

const getNomeProduto = (item) => {
  return item?.produto?.nome || item?.produtoNome || "-";
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

.table tbody tr {
  transition: background-color 0.15s ease;
}

.table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.02) !important;
}
</style>
