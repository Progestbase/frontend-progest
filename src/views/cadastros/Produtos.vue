<script setup>
import { computed, ref, onMounted, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalProdutos from "@/components/cadastros/ModalProdutos.vue";
import ModalProdutosView from "@/components/cadastros/ModalProdutosView.vue";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  PackageIcon,
  LayersIcon,
  BoxSelectIcon,
  FilterIcon,
} from "lucide-vue-next";
import functions from "@/functions/cad_produtos.js";

const store = useStore();
const { proxy } = getCurrentInstance();

const titleModal = "Cadastro de Produtos";
const varsModalData = {
  status: "A",
  nome: "",
  marca: "",
  codigo_simpras: "",
  codigo_barras: "",
  grupo_produto_id: "",
  unidade_medida_id: "",
};

const columns = [
  { key: "id", label: "#", align: "center", sortable: true },
  { key: "nome", label: "Produto", sortable: true },
  { key: "marca", label: "Marca", sortable: true },
  { key: "grupo_produto", label: "Grupo", sortable: true },
  { key: "unidade_medida", label: "Unidade", align: "center", sortable: true },
  { key: "status", label: "Status", align: "center", sortable: true },
];

// Estado local
const searchQuery = ref("");
const sortBy = ref("nome");
const sortDir = ref("asc");
const filterGrupo = ref("");
const filterMarca = ref("");

// Listas auxiliares para os filtros
const gruposParaFiltro = computed(() => store.state.gruposProdutos || []);

// Lista unica de marcas extraídas dos produtos
const marcasParaFiltro = computed(() => {
  const data = listProdutos.value;
  const marcas = [...new Set(data.filter((p) => p.marca).map((p) => p.marca))];
  return marcas.sort();
});

const listProdutos = computed(() => {
  const data = store.state.listProdutos;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.data && Array.isArray(data.data) ? data.data : [];
});

const formattedProdutos = computed(() => {
  return listProdutos.value.map((produto) => ({
    id: produto.id,
    nome: produto.nome,
    marca: produto.marca || "N/A",
    grupo_produto: produto.grupo_produto?.nome || "—",
    unidade_medida:
      produto.unidade_medida?.sigla || produto.unidade_medida?.nome || "UN",
    status: produto.status === "A" ? "Ativo" : produto.status === "I" ? "Inativo" : produto.status,
    // dados brutos p/ view
    _raw: produto,
  }));
});

const listAllProdutos = (url = null) => {
  functions.listAll(
    {
      $axios: proxy.$axios,
      $store: store,
      $toastr: proxy.$toastr,
      search: searchQuery.value,
      sort_by: sortBy.value,
      sort_dir: sortDir.value,
      grupo_produto_id: filterGrupo.value,
      marca_filter: filterMarca.value,
    },
    url,
  );
};

const handleSearch = (query) => {
  searchQuery.value = query;
  listAllProdutos();
};

const handleSort = (key) => {
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = key;
    sortDir.value = "asc";
  }
  listAllProdutos();
};

const handleFilterGrupo = (value) => {
  filterGrupo.value = value === "all" ? "" : value;
  listAllProdutos();
};

const handleFilterMarca = (value) => {
  filterMarca.value = value === "all" ? "" : value;
  listAllProdutos();
};

// Visualização
const isViewModalOpen = ref(false);
const viewingItem = ref({});

const handleView = (item) => {
  functions.listData({
    idData: item.id,
    $axios: proxy.$axios,
    $store: store,
    $toastr: proxy.$toastr,
    callback: () => {
      viewingItem.value = store.state.modalData.modalData || {};
      isViewModalOpen.value = true;
    },
  });
};

const handleEdit = (item) => {
  functions.listData({
    idData: item.id,
    $axios: proxy.$axios,
    $store: store,
    $toastr: proxy.$toastr,
    callback: () => {
      store.commit("setModalFunction", "UP");
      store.commit("setModalOpen", true);
    },
  });
};

const handleToggleStatus = (item) => {
  functions.deleteData(
    { $axios: proxy.$axios, $store: store, $toastr: proxy.$toastr },
    item.id,
  );
};

onMounted(() => {
  listAllProdutos();

  // Carregar grupos para o filtro
  if (gruposParaFiltro.value.length === 0) {
    proxy.$axios
      .post("/grupoProduto/list", { filters: [{}], per_page: 500 })
      .then((r) => {
        if (r.data?.status) {
          const data = r.data.data.data || r.data.data;
          store.commit("setGruposProdutos", Array.isArray(data) ? data : []);
        }
      });
  }
});
</script>

<template>
  <TemplateAdmin>
    <div class="px-6 py-6 w-full h-full flex flex-col gap-6">
      <div
        class="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden flex-1 flex flex-col"
      >
        <div class="p-8 flex-1 flex flex-col">
          <DataTable
            :columns="columns"
            :data="formattedProdutos"
            :loading="store.state.isSearching"
            @search="handleSearch"
            @sort="handleSort"
            @view="handleView"
            @edit="handleEdit"
            @toggle-status="handleToggleStatus"
          >
            <!-- Actions Slot -->
            <template #actions>
              <!-- Filtro por Grupo -->
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5 text-slate-400">
                  <FilterIcon class="w-3.5 h-3.5" />
                </div>
                <Select
                  :model-value="filterGrupo || 'all'"
                  @update:model-value="handleFilterGrupo"
                >
                  <SelectTrigger
                    class="h-10 w-[180px] text-sm bg-slate-50 border-slate-100 rounded-xl"
                  >
                    <SelectValue placeholder="Grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Grupos</SelectItem>
                    <SelectItem
                      v-for="g in gruposParaFiltro"
                      :key="g.id"
                      :value="g.id.toString()"
                    >
                      {{ g.nome }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- Filtro por Marca -->
              <div class="flex items-center gap-2" v-if="marcasParaFiltro.length > 0">
                <Select
                  :model-value="filterMarca || 'all'"
                  @update:model-value="handleFilterMarca"
                >
                  <SelectTrigger
                    class="h-10 w-[180px] text-sm bg-slate-50 border-slate-100 rounded-xl"
                  >
                    <SelectValue placeholder="Marca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Marcas</SelectItem>
                    <SelectItem
                      v-for="m in marcasParaFiltro"
                      :key="m"
                      :value="m"
                    >
                      {{ m }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <LinkModal01
                label="CADASTRAR PRODUTO"
                :titleModal="titleModal"
                :varsModalData="varsModalData"
                class="shrink-0"
              />
            </template>

            <!-- Custom Cell Templates -->
            <template #cell-status="{ item }">
              <Badge
                :variant="item.status === 'Ativo' ? 'default' : 'destructive'"
                class="font-black px-3.5 py-1 text-[10px] uppercase tracking-widest rounded-full"
              >
                {{ item.status }}
              </Badge>
            </template>

            <template #cell-nome="{ item }">
              <div class="flex flex-col">
                <span
                  class="font-bold text-slate-800 text-sm tracking-tight"
                  >{{ item.nome }}</span
                >
                <span
                  class="text-[10px] text-slate-400 font-medium uppercase tracking-tighter"
                  >{{ item.id }} • SKU IDENTIFIER</span
                >
              </div>
            </template>

            <template #cell-marca="{ item }">
              <Badge
                variant="outline"
                class="border-slate-200 text-slate-500 font-bold text-[10px] px-2 py-0"
              >
                {{ item.marca }}
              </Badge>
            </template>

            <template #cell-grupo_produto="{ item }">
              <div class="flex items-center gap-2">
                <LayersIcon class="w-3.5 h-3.5 text-slate-300" />
                <span class="text-xs font-semibold text-slate-600">{{
                  item.grupo_produto
                }}</span>
              </div>
            </template>

            <template #cell-unidade_medida="{ item }">
              <div
                class="inline-flex px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-black text-[10px]"
              >
                {{ item.unidade_medida }}
              </div>
            </template>

            <!-- Empty State -->
            <template #empty>
              <div
                class="flex flex-col items-center justify-center py-24 gap-6"
              >
                <div class="relative">
                  <div
                    class="absolute inset-0 bg-primary/20 blur-3xl rounded-full"
                  ></div>
                  <div class="relative p-8 bg-white rounded-full shadow-xl">
                    <BoxSelectIcon class="w-16 h-16 text-slate-300" />
                  </div>
                </div>
                <div class="text-center max-w-sm">
                  <h3 class="text-slate-900 font-black text-xl">
                    Nenhum produto em catálogo
                  </h3>
                  <p class="text-slate-500 text-sm mt-2 leading-relaxed">
                    Sua lista de produtos está vazia. Comece adicionando novos
                    itens clicando no botão de cadastro.
                  </p>
                </div>
              </div>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Modals -->
      <ModalProdutos :functions="functions" />
      <ModalProdutosView
        v-model:open="isViewModalOpen"
        :item="viewingItem"
      />
    </div>
  </TemplateAdmin>
</template>

<style scoped>
:deep(.data-table-container) {
  border: none;
  box-shadow: none;
  padding: 0;
}
</style>
