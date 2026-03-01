<script setup>
import { computed, onMounted, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalGrupoProduto from "@/components/cadastros/ModalGrupoProduto.vue";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import { Badge } from "@/components/ui/badge";
import { LayersIcon, TagIcon, ShapesIcon } from "lucide-vue-next";
import functions from "@/functions/cad_grupo_produto.js";

const store = useStore();
const { proxy } = getCurrentInstance();

const titleModal = "Grupos de Produtos";
const varsModalData = { status: "A", nome: "", tipo: "Material" };

const columns = [
  { key: "id", label: "#", align: "center", sortable: true },
  { key: "nome", label: "Grupo / Categoria", sortable: true },
  { key: "tipo", label: "Classificação", sortable: true },
  { key: "status", label: "Status", align: "center" },
];

const listGrupoProdutos = computed(
  () => store.state.listGrupoProdutos?.data || [],
);
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

const formattedList = computed(() => {
  return listGrupoProdutos.value.map((g) => ({
    id: g.id,
    nome: g.nome,
    tipo: g.tipo || "Geral",
    status: g.status === "A" ? "Ativo" : "Inativo",
  }));
});

const listAll = (url = null) => {
  functions.listAll(
    { $axios: proxy.$axios, $store: store, $toastr: proxy.$toastr },
    url,
  );
};

const handleSearch = (query) => {
  store.state.searchFilters = query ? [{ nome: query }] : [{}];
  listAll();
};

const handlePaginate = (page) => {
  let url = typeof page === "number" ? `/grupoProduto/list?page=${page}` : page;
  listAll(url);
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

const handleDelete = (id) => {
  functions.deleteData(
    { $axios: proxy.$axios, $store: store, $toastr: proxy.$toastr },
    id,
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
            :data="formattedList"
            :loading="store.state.isSearching"
            :pagination="pagination"
            @search="handleSearch"
            @paginate="handlePaginate"
            @edit="handleEdit"
            @delete="handleDelete"
          >
            <!-- Actions Slot -->
            <template #actions>
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
                <span
                  class="font-bold text-slate-700 text-sm tracking-tight uppercase"
                  >{{ item.nome }}</span
                >
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
    </div>
  </TemplateAdmin>
</template>

<style scoped>
:deep(.data-table-container) {
  @apply border-none shadow-none p-0;
}
</style>
