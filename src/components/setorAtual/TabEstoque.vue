<script setup>
import { computed, ref, inject } from "vue";
import { useStore } from "vuex";
import functionsEstoque from "@/functions/cad_estoque";
import cadEstoqueLote from "@/functions/cad_estoque_lote";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModalVisualizarLotesProduto from "@/components/cadastros/ModalVisualizarLotesProduto.vue";
import { useToast } from "@/components/ui/toast/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  PackageIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  BoxesIcon,
  PencilIcon,
  CheckIcon,
  XIcon,
  SearchIcon,
  ShoppingBagIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-vue-next";

// Emits para comunicar com o componente pai
const emit = defineEmits(["reloadEstoque"]);

const props = defineProps({
  readOnly: { type: Boolean, default: false },
});

const store = useStore();
const { toast } = useToast();

const parentData = inject("setorAtualData", {
  estoqueItems: [],
  resumoEstoque: {},
  setorEstoque: {},
});

const produtoSelecionado = ref({});
const estoqueIdSelecionado = ref(null);
const quantidadeAtualSelecionada = ref(0);
const quantidadeMinimaSelecionada = ref(0);
const modalVisualizarLotes = ref(null);
const editandoQuantidade = ref(null);
const novaQuantidadeMinima = ref(0);

// Pagination & Search
const searchQuery = ref("");
const currentPage = ref(1);
const perPage = ref(10);

const loading = computed(() => {
  const parentItems = parentData.estoqueItems?.value || parentData.estoqueItems;
  return !Array.isArray(parentItems) || store.state.isSearching;
});

const estoqueItems = computed(
  () => parentData.estoqueItems?.value || parentData.estoqueItems || [],
);
const resumoEstoque = computed(
  () => parentData.resumoEstoque?.value || parentData.resumoEstoque || {},
);
const setorEstoque = computed(
  () => parentData.setorEstoque?.value || parentData.setorEstoque || {},
);

const visualizarDetalhes = async (item) => {
  const itemCompleto = estoqueItems.value.find((e) => e.estoque_id === item.id);
  if (!itemCompleto) return;

  produtoSelecionado.value = itemCompleto.produto || {};
  estoqueIdSelecionado.value = itemCompleto.estoque_id;
  quantidadeAtualSelecionada.value = itemCompleto.quantidade_atual || 0;
  quantidadeMinimaSelecionada.value = itemCompleto.quantidade_minima || 0;

  if (estoqueIdSelecionado.value) {
    try {
      await cadEstoqueLote.listByEstoque(
        { $axios: axios, $store: store },
        estoqueIdSelecionado.value,
      );
    } catch (msg) {
      console.error("Erro ao carregar lotes:", msg);
    }
  }

  if (modalVisualizarLotes.value) {
    modalVisualizarLotes.value.dialogOpen = true;
  }
};

const editarQuantidadeMinima = (itemId, quantidadeAtual) => {
  editandoQuantidade.value = itemId;
  novaQuantidadeMinima.value = quantidadeAtual;
};

const cancelarEdicao = () => {
  editandoQuantidade.value = null;
  novaQuantidadeMinima.value = 0;
};

const salvarQuantidadeMinima = async (itemId) => {
  try {
    const itemOriginal = estoqueItems.value.find(
      (item) => item.estoque_id === itemId,
    );
    const novaVal = parseInt(novaQuantidadeMinima.value);

    if (isNaN(novaVal) || novaVal < 0) {
      toast({
        title: "Erro",
        description: "Quantidade deve ser maior ou igual a zero.",
        variant: "destructive",
      });
      return;
    }

    if (novaVal === itemOriginal.quantidade_minima) {
      cancelarEdicao();
      return;
    }

    await functionsEstoque.atualizarQuantidadeMinima(
      { $axios: axios, $store: store },
      itemId,
      novaVal,
    );
    emit("reloadEstoque");
    cancelarEdicao();
    toast({ title: "Sucesso", description: "Quantidade mínima atualizada." });
  } catch (err) {
    toast({
      title: "Erro",
      description: "Falha ao atualizar.",
      variant: "destructive",
    });
  }
};

const formattedEstoque = computed(() => {
  return estoqueItems.value.map((item) => ({
    id: item.estoque_id,
    produto: item.produto?.nome_completo || item.produto?.nome || "N/A",
    grupo: item.produto?.grupo_produto?.nome || "N/A",
    quantidade_atual: item.quantidade_atual || 0,
    quantidade_minima: item.quantidade_minima || 0,
    unidade: item.produto?.unidade_medida?.nome || "",
    abaixo_minimo: item.abaixo_minimo,
  }));
});

const filteredEstoque = computed(() => {
  let result = formattedEstoque.value;
  if (searchQuery.value) {
    const term = searchQuery.value.toLowerCase();
    result = result.filter(
      (item) =>
        item.produto.toLowerCase().includes(term) ||
        item.grupo.toLowerCase().includes(term),
    );
  }
  return result;
});

const totalItems = computed(() => filteredEstoque.value.length);
const totalPages = computed(
  () => Math.ceil(totalItems.value / perPage.value) || 1,
);

const paginatedEstoque = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredEstoque.value.slice(start, end);
});

const onPaginate = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

import { watch } from "vue";
watch(searchQuery, () => {
  currentPage.value = 1;
});
</script>

<template>
  <div class="flex flex-col gap-8 pb-10">
    <!-- Loading -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center min-h-[400px] gap-4"
    >
      <LoadingSpinner size="lg" />
      <p class="text-slate-500 font-medium">Sincronizando estoque...</p>
    </div>

    <template v-else>
      <!-- Dashboard Summary -->
      <div
        class="grid grid-cols-1 sm:grid-cols-3 gap-4"
        v-if="Object.keys(resumoEstoque).length > 0"
      >
        <Card
          class="bg-blue-50/30 border-blue-100 shadow-none overflow-hidden relative group"
        >
          <div
            class="absolute -right-4 -top-4 w-24 h-24 bg-blue-100/50 rounded-full blur-2xl transition-all group-hover:scale-110"
          ></div>
          <CardContent class="p-6 relative">
            <div class="flex items-center gap-4">
              <div
                class="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200"
              >
                <BoxesIcon class="w-6 h-6" />
              </div>
              <div>
                <p
                  class="text-[10px] font-bold uppercase tracking-wider text-blue-600/70"
                >
                  Itens em Estoque
                </p>
                <p class="text-3xl font-black text-blue-800">
                  {{ resumoEstoque.total_produtos || 0 }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          class="bg-emerald-50/30 border-emerald-100 shadow-none overflow-hidden relative group"
        >
          <div
            class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100/50 rounded-full blur-2xl transition-all group-hover:scale-110"
          ></div>
          <CardContent class="p-6 relative">
            <div class="flex items-center gap-4">
              <div
                class="p-3 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-200"
              >
                <CheckCircle2Icon class="w-6 h-6" />
              </div>
              <div>
                <p
                  class="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70"
                >
                  Disponíveis
                </p>
                <p class="text-3xl font-black text-emerald-800">
                  {{ resumoEstoque.produtos_disponiveis || 0 }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          class="bg-amber-50/30 border-amber-100 shadow-none overflow-hidden relative group"
        >
          <div
            class="absolute -right-4 -top-4 w-24 h-24 bg-amber-100/50 rounded-full blur-2xl transition-all group-hover:scale-110"
          ></div>
          <CardContent class="p-6 relative">
            <div class="flex items-center gap-4">
              <div
                class="p-3 bg-amber-600 rounded-xl text-white shadow-lg shadow-amber-200"
              >
                <AlertTriangleIcon class="w-6 h-6" />
              </div>
              <div>
                <p
                  class="text-[10px] font-bold uppercase tracking-wider text-amber-600/70"
                >
                  Abaixo do Mínimo
                </p>
                <p class="text-3xl font-black text-amber-800">
                  {{ resumoEstoque.produtos_abaixo_minimo || 0 }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Main Inventory Table -->
      <div v-if="estoqueItems.length > 0" class="space-y-4">
        <!-- Toolbar: search -->
        <div class="flex items-center justify-between gap-3 mt-4">
          <div class="relative w-full max-w-xs">
            <Input
              v-model="searchQuery"
              placeholder="Pesquisar produto..."
              class="h-10 px-4 text-sm bg-slate-50 border-slate-100 rounded-xl focus-visible:ring-primary/20 transition-all shadow-inner"
            />
          </div>
        </div>

        <Card class="border-slate-200 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 border-b">
                <tr>
                  <th
                    class="text-left font-bold text-slate-500 uppercase tracking-wider py-4 px-6 text-[10px]"
                  >
                    Produto
                  </th>
                  <th
                    class="text-left font-bold text-slate-500 uppercase tracking-wider py-4 px-6 text-[10px] hidden md:table-cell"
                  >
                    Grupo
                  </th>
                  <th
                    class="text-center font-bold text-slate-500 uppercase tracking-wider py-4 px-6 text-[10px]"
                  >
                    Qtd. Atual
                  </th>
                  <th
                    class="text-center font-bold text-slate-500 uppercase tracking-wider py-4 px-6 text-[10px]"
                  >
                    Mínimo
                  </th>
                  <th
                    class="text-center font-bold text-slate-500 uppercase tracking-wider py-4 px-6 text-[10px]"
                  >
                    Status
                  </th>
                  <th
                    v-if="!readOnly"
                    class="text-right font-bold text-slate-500 uppercase tracking-wider py-4 px-6 text-[10px]"
                  >
                    Gestão
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <template v-if="paginatedEstoque.length > 0">
                  <tr
                    v-for="item in paginatedEstoque"
                    :key="item.id"
                    @click="visualizarDetalhes(item)"
                    class="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  >
                    <td class="py-4 px-6">
                      <div class="flex flex-col">
                        <span class="font-bold text-slate-800">{{
                          item.produto
                        }}</span>
                        <span
                          class="text-[10px] text-slate-400 font-medium md:hidden"
                          >{{ item.grupo }}</span
                        >
                      </div>
                    </td>
                    <td class="py-4 px-6 hidden md:table-cell">
                      <Badge
                        variant="outline"
                        class="font-medium bg-white text-[10px]"
                        >{{ item.grupo }}</Badge
                      >
                    </td>
                    <td class="py-4 px-6 text-center">
                      <div
                        class="inline-flex items-center justify-center font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg"
                      >
                        {{ item.quantidade_atual }}
                        <span
                          class="text-[9px] ml-1 text-slate-400 font-medium"
                          >{{ item.unidade }}</span
                        >
                      </div>
                    </td>
                    <td class="py-4 px-6 text-center" @click.stop>
                      <div
                        v-if="editandoQuantidade === item.id && !readOnly"
                        class="flex items-center gap-1 justify-center"
                      >
                        <Input
                          type="number"
                          v-model.number="novaQuantidadeMinima"
                          class="h-8 w-20 text-center font-bold"
                          @keyup.enter="salvarQuantidadeMinima(item.id)"
                          @keyup.escape="cancelarEdicao"
                          autofocus
                        />
                        <Button
                          size="icon"
                          variant="default"
                          class="h-8 w-8 bg-emerald-600 hover:bg-emerald-700"
                          @click="salvarQuantidadeMinima(item.id)"
                        >
                          <CheckIcon class="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          class="h-8 w-8 text-slate-400"
                          @click="cancelarEdicao"
                        >
                          <XIcon class="w-4 h-4" />
                        </Button>
                      </div>
                      <div
                        v-else
                        class="flex items-center justify-center gap-1"
                      >
                        <span class="font-bold text-slate-600">{{
                          item.quantidade_minima
                        }}</span>
                        <span class="text-[9px] text-slate-400 font-medium">{{
                          item.unidade
                        }}</span>
                      </div>
                    </td>
                    <td class="py-4 px-6 text-center">
                      <Badge
                        :variant="
                          item.abaixo_minimo ? 'destructive' : 'secondary'
                        "
                        class="px-2 py-0.5 text-[10px] uppercase font-black"
                      >
                        {{ item.abaixo_minimo ? "Crítico" : "Seguro" }}
                      </Badge>
                    </td>
                    <td
                      v-if="!readOnly"
                      class="py-4 px-6 text-right"
                      @click.stop
                    >
                      <Button
                        v-if="editandoQuantidade !== item.id"
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8 text-slate-400 hover:text-primary transition-colors"
                        @click="
                          editarQuantidadeMinima(
                            item.id,
                            item.quantidade_minima,
                          )
                        "
                      >
                        <PencilIcon class="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                </template>
                <tr v-else>
                  <td :colspan="readOnly ? 5 : 6" class="py-12 text-center">
                    <div
                      class="flex flex-col items-center justify-center gap-2"
                    >
                      <span class="text-sm text-slate-500"
                        >Nenhum produto encontrado.</span
                      >
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <!-- Pagination -->
        <div
          class="flex items-center justify-between px-1 pt-1"
          v-if="totalItems > 0"
        >
          <p class="text-xs text-muted-foreground">
            Mostrando
            <span class="font-medium">{{
              (currentPage - 1) * perPage + 1
            }}</span
            >–<span class="font-medium">{{
              Math.min(currentPage * perPage, totalItems)
            }}</span>
            de <span class="font-medium">{{ totalItems }}</span> registros
          </p>
          <div class="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              class="hidden lg:flex w-8 h-8 p-0"
              :disabled="currentPage === 1"
              @click="onPaginate(1)"
            >
              <ChevronsLeft class="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              class="w-8 h-8 p-0"
              :disabled="currentPage === 1"
              @click="onPaginate(currentPage - 1)"
            >
              <ChevronLeft class="h-3.5 w-3.5" />
            </Button>
            <span class="text-xs font-medium px-2 text-slate-600">
              {{ currentPage }} / {{ totalPages }}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              class="w-8 h-8 p-0"
              :disabled="currentPage === totalPages"
              @click="onPaginate(currentPage + 1)"
            >
              <ChevronRight class="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              class="hidden lg:flex w-8 h-8 p-0"
              :disabled="currentPage === totalPages"
              @click="onPaginate(totalPages)"
            >
              <ChevronsRight class="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl"
      >
        <div class="p-6 bg-white rounded-full shadow-sm mb-4">
          <ShoppingBagIcon class="w-12 h-12 text-slate-300" />
        </div>
        <h3 class="text-slate-800 font-bold text-lg">Prateleiras Vazias</h3>
        <p class="text-slate-500 text-sm max-w-xs text-center mt-2">
          Não há itens registrados neste setor ou os filtros atuais não
          encontraram correspondências.
        </p>
      </div>
    </template>

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
