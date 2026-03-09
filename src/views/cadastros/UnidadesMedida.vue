<script setup>
import { computed, ref, onMounted, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalUnidadesMedida from "@/components/cadastros/ModalUnidadesMedida.vue";
import ModalUnidadesMedidaView from "@/components/cadastros/ModalUnidadesMedidaView.vue";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import { Badge } from "@/components/ui/badge";
import { RulerIcon, CheckCircle2Icon, BoxIcon } from "lucide-vue-next";
import functions from "@/functions/cad_unidades_medida.js";

const store = useStore();
const { proxy } = getCurrentInstance();

const titleModal = "Unidades de Medida";
const varsModalData = {
  status: "A",
  nome: "",
  quantidade_unidade_minima: 1,
};

const columns = [
  { key: "id", label: "#", align: "center", sortable: true },
  { key: "nome", label: "Identificação", sortable: true },
  { key: "quantidade_unidade_minima", label: "Qtde Mínima", align: "center", sortable: true },
  { key: "status", label: "Status", align: "center", sortable: true },
];

// Estado de busca e ordenação
const searchQuery = ref("");
const sortBy = ref("nome");
const sortDir = ref("asc");

const listUnidadesMedida = computed(() => {
  const data = store.state.listUnidadesMedida;
  return data?.data || data || [];
});

const pagination = computed(() => {
  const list = store.state.listUnidadesMedida;
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

const listAllUnidadesMedida = (url = null) => {
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
  listAllUnidadesMedida();
};

const handleSort = (key) => {
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = key;
    sortDir.value = "asc";
  }
  listAllUnidadesMedida();
};

const handlePaginate = (page) => {
  let url =
    typeof page === "number" ? `/unidadeMedida/list?page=${page}` : page;
  listAllUnidadesMedida(url);
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

onMounted(listAllUnidadesMedida);
</script>

<template>
  <TemplateAdmin>
    <div class="px-6 py-6 w-full h-full flex flex-col gap-6">
      <!-- Content Container -->
      <div
        class="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden flex-1 flex flex-col"
      >
        <div class="p-8 flex-1 flex flex-col">
          <DataTable
            :columns="columns"
            :data="listUnidadesMedida"
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
              <LinkModal01
                label="NOVA UNIDADE"
                :titleModal="titleModal"
                :varsModalData="varsModalData"
                class="shrink-0"
              />
            </template>

            <!-- Custom Cell Templates -->
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
                <div
                  class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 italic font-black text-[10px] tracking-tight"
                >
                  {{ item.nome.substring(0, 2).toUpperCase() }}
                </div>
                <span class="font-bold text-slate-700 text-sm tracking-tight">
                  {{ item.nome }}
                </span>
              </div>
            </template>

            <template #cell-quantidade_unidade_minima="{ item }">
              <div
                class="flex items-center justify-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10 w-fit mx-auto"
              >
                <BoxIcon class="w-3.5 h-3.5 text-primary" />
                <span class="text-xs font-black text-primary">{{
                  item.quantidade_unidade_minima
                }}</span>
              </div>
            </template>

            <!-- Empty State -->
            <template #empty>
              <div
                class="flex flex-col items-center justify-center py-24 gap-6"
              >
                <div
                  class="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 relative"
                >
                  <RulerIcon class="w-16 h-16 text-slate-200" />
                  <div class="absolute -top-2 -right-2">
                    <CheckCircle2Icon
                      class="w-8 h-8 text-primary shadow-lg rounded-full bg-white"
                    />
                  </div>
                </div>
                <div class="text-center max-w-sm">
                  <h3
                    class="text-slate-900 font-black text-xl tracking-tight leading-none"
                  >
                    Configurações de Medida
                  </h3>
                  <p
                    class="text-slate-500 text-sm mt-3 leading-relaxed font-medium"
                  >
                    Nenhuma unidade de medida foi configurada ainda. Elas são
                    essenciais para o controle preciso do estoque.
                  </p>
                </div>
              </div>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Modals -->
      <ModalUnidadesMedida :functions="functions" />
      <ModalUnidadesMedidaView
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
