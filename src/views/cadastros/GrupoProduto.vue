<script setup>
import { computed, ref, onMounted, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalGrupoProduto from "@/components/cadastros/ModalGrupoProduto.vue";
import ModalGrupoProdutoView from "@/components/cadastros/ModalGrupoProdutoView.vue";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayersIcon, TagIcon, ShapesIcon, FilterIcon } from "lucide-vue-next";
import functions from "@/functions/cad_grupo_produto.js";

const store = useStore();
const { proxy } = getCurrentInstance();

const titleModal = "Grupos de Produtos";
const varsModalData = { status: "A", nome: "", tipo: "Material" };

const columns = [
  { key: "id", label: "#", align: "center", sortable: true },
  { key: "nome", label: "Grupo / Categoria", sortable: true },
  { key: "tipo", label: "Classificação", sortable: true },
  { key: "status", label: "Status", align: "center", sortable: true },
];

// Estado de busca, ordenação e filtros
const searchQuery = ref("");
const sortBy = ref("nome");
const sortDir = ref("asc");
const filterTipo = ref("");

const listGrupoProdutos = computed(() => {
  const data = store.state.listGrupoProdutos;
  return data?.data || data || [];
});

const pagination = computed(() => {
  const list = store.state.listGrupoProdutos;
  if (list && list.current_page) {
    return {
      current_page: list.current_page,
      last_page: list.last_page,
      per_page: list.per_page,
      total: list.total,
    };
  }
  return null;
});

const listAll = (url = null) => {
  functions.listAll(
    {
      $axios: proxy.$axios,
      $store: store,
      $toastr: proxy.$toastr,
      search: searchQuery.value,
      sort_by: sortBy.value,
      sort_dir: sortDir.value,
      tipo: filterTipo.value,
    },
    url,
  );
};

const handleSearch = (query) => {
  searchQuery.value = query;
  listAll();
};

const handleSort = (key) => {
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = key;
    sortDir.value = "asc";
  }
  listAll();
};

const handleFilterTipo = (value) => {
  filterTipo.value = value === "all" ? "" : value;
  listAll();
};

const handlePaginate = (page) => {
  let url = typeof page === "number" ? `/grupoProduto/list?page=${page}` : page;
  listAll(url);
};

// Modal de visualização
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

onMounted(listAll);
</script>

<template>
  <TemplateAdmin>
    <div class="px-6 py-6 w-full h-full flex flex-col gap-6">
      <!-- Content Table -->
      <div
        class="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden flex-1 flex flex-col"
      >
        <div class="p-8 flex-1 flex flex-col">
          <DataTable
            :columns="columns"
            :data="listGrupoProdutos"
            :loading="store.state.isSearching"
            :pagination="pagination"
            @search="handleSearch"
            @paginate="handlePaginate"
            @sort="handleSort"
            @view="handleView"
            @edit="handleEdit"
            @toggle-status="handleToggleStatus"
          >
            <!-- Actions Slot -->
            <template #actions>
              <!-- Filtro por Tipo -->
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5 text-slate-400">
                  <FilterIcon class="w-3.5 h-3.5" />
                </div>
                <Select
                  :model-value="filterTipo || 'all'"
                  @update:model-value="handleFilterTipo"
                >
                  <SelectTrigger
                    class="h-10 w-[180px] text-sm bg-slate-50 border-slate-100 rounded-xl"
                  >
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="Medicamento">Medicamento</SelectItem>
                    <SelectItem value="Material">Material</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <LinkModal01
                label="NOVA CATEGORIA"
                :titleModal="titleModal"
                :varsModalData="varsModalData"
                class="shrink-0"
              />
            </template>

            <template #cell-status="{ item }">
              <Badge
                :variant="item.status === 'Ativo' ? 'default' : 'destructive'"
                class="font-black px-4 py-1.5 text-[10px] uppercase tracking-widest rounded-full"
              >
                {{ item.status }}
              </Badge>
            </template>

            <template #cell-nome="{ item }">
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full bg-primary/40 shrink-0"></div>
                <span class="font-bold text-slate-700 text-sm tracking-tight">
                  {{ item.nome }}
                </span>
              </div>
            </template>

            <template #cell-tipo="{ item }">
              <div
                class="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg w-fit"
              >
                <ShapesIcon class="w-3.5 h-3.5 text-slate-400" />
                <span class="text-[11px] font-black text-slate-500 uppercase">{{
                  item.tipo
                }}</span>
              </div>
            </template>

            <!-- Empty State -->
            <template #empty>
              <div
                class="flex flex-col items-center justify-center py-24 gap-6"
              >
                <div
                  class="p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200"
                >
                  <TagIcon class="w-16 h-16 text-slate-300" />
                </div>
                <div class="text-center max-w-sm">
                  <h3 class="text-slate-900 font-black text-xl tracking-tight">
                    Sem categorias definidas
                  </h3>
                  <p
                    class="text-slate-500 text-sm mt-2 leading-relaxed font-medium"
                  >
                    Defina grupos para organizar seus medicamentos e materiais
                    de forma estruturada.
                  </p>
                </div>
              </div>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Modals -->
      <ModalGrupoProduto :functions="functions" />
      <ModalGrupoProdutoView
        v-model:open="isViewModalOpen"
        :item="viewingItem"
      />
    </div>
  </TemplateAdmin>
</template>

<style scoped>
:deep(.data-table-container) {
  @apply border-none shadow-none p-0;
}
</style>
