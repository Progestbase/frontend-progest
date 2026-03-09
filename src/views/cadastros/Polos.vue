<script setup>
import { computed, ref, onMounted, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalPolos from "@/components/cadastros/ModalPolos.vue";
import ModalPolosView from "@/components/cadastros/ModalPolosView.vue";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import { Badge } from "@/components/ui/badge";
import { BuildingIcon, MapPinIcon, NetworkIcon } from "lucide-vue-next";
import functions from "@/functions/cad_unidades_polos.js";

const store = useStore();
const { proxy } = getCurrentInstance();

const titleModal = "Gestão de Unidades";
const varsModalData = {
  status: "A",
  nome: "",
};

const columns = [
  { key: "id", label: "#", align: "center", sortable: true },
  { key: "nome", label: "Unidade / Polo", sortable: true },
  { key: "status", label: "Status", align: "center", sortable: true },
];

// Estado de busca e ordenação
const searchQuery = ref("");
const sortBy = ref("nome");
const sortDir = ref("asc");

const listUnidades = computed(() => {
  const data = store.state.listUnidades;
  return data?.data || data || [];
});

const pagination = computed(() => {
  const list = store.state.listUnidades;
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

const handlePaginate = (page) => {
  let url = typeof page === "number" ? `/polo/list?page=${page}` : page;
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
      <div
        class="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden flex-1 flex flex-col"
      >
        <div class="p-8 flex-1 flex flex-col">
          <DataTable
            :columns="columns"
            :data="listUnidades"
            :loading="store.state.isSearching"
            :pagination="pagination"
            @search="handleSearch"
            @paginate="handlePaginate"
            @sort="handleSort"
            @view="handleView"
            @edit="handleEdit"
            @toggle-status="handleToggleStatus"
          >
            <template #actions>
              <LinkModal01
                label="CADASTRAR UNIDADE"
                :titleModal="titleModal"
                :varsModalData="varsModalData"
                class="shrink-0"
              />
            </template>

            <template #cell-status="{ item }">
              <Badge
                :variant="item.status === 'Ativo' ? 'default' : 'destructive'"
                class="font-black px-4 py-1 text-[10px] uppercase tracking-widest rounded-full shadow-sm"
              >
                {{ item.status }}
              </Badge>
            </template>

            <template #cell-nome="{ item }">
              <div class="flex items-center gap-4">
                <div
                  class="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 group-hover:text-primary transition-all"
                >
                  <BuildingIcon
                    class="w-5 h-5 transition-transform group-hover:scale-110"
                  />
                </div>
                <div class="flex flex-col">
                  <span
                    class="font-bold text-slate-800 text-sm tracking-tight leading-none"
                    >{{ item.nome }}</span
                  >
                  <div class="flex items-center gap-1.5 mt-1.5">
                    <MapPinIcon class="w-3 h-3 text-slate-300" />
                    <span
                      class="text-[9px] text-slate-400 font-black tracking-widest uppercase"
                      >Polo Estratégico</span
                    >
                  </div>
                </div>
              </div>
            </template>

            <template #empty>
              <div
                class="flex flex-col items-center justify-center py-24 gap-6"
              >
                <div class="relative">
                  <div
                    class="absolute -inset-8 bg-primary/5 blur-3xl rounded-full"
                  ></div>
                  <div
                    class="relative p-10 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200"
                  >
                    <NetworkIcon class="w-16 h-16 text-slate-300" />
                  </div>
                </div>
                <div class="text-center max-w-sm px-6">
                  <h3
                    class="text-slate-900 font-black text-xl tracking-tight leading-none"
                  >
                    Nenhuma unidade operacional
                  </h3>
                  <p
                    class="text-slate-500 text-sm mt-3 leading-relaxed font-medium"
                  >
                    Você ainda não definiu polos ou unidades centrais de
                    distribuição para sua rede.
                  </p>
                </div>
              </div>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Modals -->
      <ModalPolos :functions="functions" />
      <ModalPolosView
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