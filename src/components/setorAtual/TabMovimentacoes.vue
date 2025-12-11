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

    <!-- Filters Bar -->
    <div
      class="bg-gray-50 border p-3 rounded mb-3 flex flex-wrap items-center gap-3"
    >
      <!-- Tipo -->
      <div class="flex items-center gap-2">
        <Label class="whitespace-nowrap">Tipo:</Label>
        <select
          v-model="filterTipo"
          class="form-select form-select-sm w-auto border-gray-300 rounded shadow-sm"
        >
          <option value="todos">Todos</option>
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
      </div>

      <!-- Status -->
      <div class="flex items-center gap-2">
        <Label class="whitespace-nowrap">Status:</Label>
        <select
          v-model="filterStatus"
          class="form-select form-select-sm w-auto border-gray-300 rounded shadow-sm"
        >
          <option value="todos">Todos</option>
          <option value="A">Aprovada</option>
          <option value="P">Pendente</option>
          <option value="R">Rejeitada</option>
          <option value="C">Rascunho</option>
          <option value="X">Cancelada</option>
        </select>
      </div>

      <!-- Search -->
      <div class="flex items-center gap-2 flex-grow">
        <i class="mdi mdi-magnify text-gray-400"></i>
        <Input
          v-model="filterSearch"
          placeholder="Buscar por origem ou destino..."
          class="max-w-xs h-8 text-sm"
        />
      </div>

      <!-- Results Count -->
      <div class="ml-auto text-xs text-muted-foreground">
        Total:
        <span class="font-medium">{{ filteredMovimentacoes.length }}</span>
      </div>
    </div>

    <div v-if="filteredMovimentacoes.length > 0" class="table-responsive">
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
            v-for="mov in filteredMovimentacoes"
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
      <DialogContent class="max-w-4xl">
        <DialogHeader class="space-y-2 mb-2">
          <DialogTitle class="flex gap-2 items-center">
            <i class="mdi mdi-clipboard-check-outline text-primary text-xl"></i>
            Analisar Solicitação #{{ movimentacaoParaAprovar?.id }}
          </DialogTitle>
          <DialogDescription>
            Revise os itens solicitados. Você pode ajustar as quantidades
            liberadas antes de aprovar.
          </DialogDescription>
        </DialogHeader>

        <div v-if="movimentacaoParaAprovar" class="space-y-4">
          <!-- Flow Info: Distribuidor (Você) -> Solicitante -->
          <div
            class="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded border mb-4"
          >
            <!-- Source (Distributor - You) -->
            <div class="flex-shrink-0">
              <label class="text-xs text-muted-foreground block mb-1"
                >Setor Distribuidor (Você)</label
              >
              <div
                class="p-2 px-3 bg-white rounded-lg flex items-center gap-2 border h-10 shadow-sm"
              >
                <i class="mdi mdi-store text-primary"></i>
                <span class="font-medium text-sm">{{ setorNome }}</span>
              </div>
            </div>

            <!-- Arrow -->
            <div class="hidden md:flex items-center pt-4">
              <i class="mdi mdi-arrow-right text-2xl text-muted-foreground"></i>
            </div>

            <!-- Destination (Solicitante) -->
            <div class="flex-shrink-0">
              <label class="text-xs text-muted-foreground block mb-1"
                >Solicitante (Destino)</label
              >
              <div
                class="p-2 px-3 bg-blue-50 text-blue-700 rounded-lg flex items-center gap-2 border border-blue-100 h-10 shadow-sm"
              >
                <i class="mdi mdi-map-marker"></i>
                <span class="font-medium text-sm">{{
                  movimentacaoParaAprovar.setor_destino?.nome ||
                  movimentacaoParaAprovar.setorDestino?.nome ||
                  "-"
                }}</span>
              </div>
            </div>

            <!-- Date -->
            <div class="ml-auto border-l pl-4">
              <label class="text-xs text-muted-foreground block mb-1"
                >Data da Solicitação</label
              >
              <div class="font-medium flex items-center gap-2">
                <i class="mdi mdi-calendar text-muted-foreground"></i>
                {{ formatarData(movimentacaoParaAprovar.created_at) }}
              </div>
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
                    <th class="text-center">Qtd Estoque</th>
                    <th class="text-center" style="width: 150px">
                      Qtd a Liberar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in itensParaAprovacao" :key="index">
                    <td class="text-start">
                      <div class="d-flex align-items-center">
                        <i
                          v-if="item.quantidade_liberada > item.estoque_atual"
                          class="mdi mdi-alert-circle text-red-600 me-2"
                          title="Quantidade a liberar excede o estoque!"
                        ></i>
                        <strong>{{
                          item.produto?.nome || item.produtoNome || "-"
                        }}</strong>
                      </div>
                    </td>
                    <td class="text-center">
                      <Badge variant="outline">{{
                        item.quantidade_solicitada
                      }}</Badge>
                    </td>
                    <td class="text-center">
                      <Badge
                        :variant="
                          item.estoque_atual > 0 ? 'secondary' : 'destructive'
                        "
                      >
                        {{ item.estoque_atual }}
                      </Badge>
                    </td>
                    <td class="text-center">
                      <Input
                        type="number"
                        min="0"
                        v-model.number="item.quantidade_liberada"
                        class="text-center"
                        style="width: 100px; margin: 0 auto"
                        :class="{
                          'border-red-500 ring-red-500':
                            item.quantidade_liberada > item.estoque_atual,
                        }"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Erros de estoque -->
          <div
            v-if="temErroEstoque || errosAprovacao.length > 0 || isTotalZerado"
            class="mt-3 p-3 bg-red-50 border border-red-200 rounded"
          >
            <Label class="text-red-700 fw-bold mb-2">
              <i class="mdi mdi-alert-circle me-1"></i>
              Atenção
            </Label>
            <ul class="mb-0 ps-3 text-red-600 small">
              <li v-if="temErroEstoque">
                A quantidade a liberar não pode ser maior que a quantidade em
                estoque.
              </li>
              <li v-if="isTotalZerado">
                Defina uma quantidade maior que zero para pelo menos um item.
              </li>
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
              :disabled="loadingAprovacao || temErroEstoque || isTotalZerado"
              class="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

// Filters State
const filterTipo = ref("todos");
const filterStatus = ref("todos");
const filterSearch = ref("");

// Computed
const listMovimentacoes = computed(() => {
  const items = parentData.movimentacoesItems;
  return items?.value || items || [];
});

const filteredMovimentacoes = computed(() => {
  let items = listMovimentacoes.value;

  // 1. Filter by Tipo
  if (filterTipo.value !== "todos") {
    if (filterTipo.value === "entrada") {
      items = items.filter((mov) => isEntrada(mov));
    } else if (filterTipo.value === "saida") {
      items = items.filter((mov) => isSaida(mov));
    }
  }

  // 2. Filter by Status
  if (filterStatus.value !== "todos") {
    items = items.filter(
      (mov) => mov.status_solicitacao === filterStatus.value
    );
  }

  // 3. Filter by Search (Origem/Destino)
  if (filterSearch.value.trim()) {
    const term = filterSearch.value.toLowerCase();
    items = items.filter((mov) => {
      const origem = (
        mov.setor_origem?.nome ||
        mov.setorOrigem?.nome ||
        ""
      ).toLowerCase();
      const destino = (
        mov.setor_destino?.nome ||
        mov.setorDestino?.nome ||
        ""
      ).toLowerCase();
      return origem.includes(term) || destino.includes(term);
    });
  }

  return items;
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

const temErroEstoque = computed(() => {
  return itensParaAprovacao.value.some(
    (item) => (item.quantidade_liberada || 0) > (item.estoque_atual || 0)
  );
});

const isTotalZerado = computed(() => {
  return itensParaAprovacao.value.every(
    (item) => (item.quantidade_liberada || 0) === 0
  );
});

const abrirModalAprovacao = async (mov) => {
  movimentacaoParaAprovar.value = mov;
  loadingAprovacao.value = true;

  try {
    // Buscar estoque atual do setor (origem da movimentação)
    let estoqueMap = {};
    if (store.getters.getUserToken) {
      try {
        const response = await axios.get(`/estoque/setor/${props.setorId}`, {
          headers: {
            Authorization: "Bearer " + store.getters.getUserToken,
          },
        });
        if (response.data.success && response.data.data.estoque) {
          response.data.data.estoque.forEach((e) => {
            const prodId = e.produto?.id || e.produto_id;
            estoqueMap[prodId] = e.quantidade_atual;
          });
        }
      } catch (e) {
        console.error("Erro ao buscar estoque para validação", e);
      }
    }

    // Criar cópia dos itens com quantidade_liberada inicializada e estoque_atual
    itensParaAprovacao.value = (mov.itens || []).map((item) => {
      const prodId = item.produto?.id || item.produto_id;
      return {
        ...item,
        quantidade_liberada:
          item.quantidade_liberada !== undefined
            ? item.quantidade_liberada
            : item.quantidade_solicitada,
        estoque_atual:
          estoqueMap[prodId] !== undefined ? estoqueMap[prodId] : 0,
      };
    });
  } finally {
    loadingAprovacao.value = false;
    dialogAprovacaoOpen.value = true;
  }
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
