<script setup>
import { computed, onMounted, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalPerfis from "@/components/cadastros/ModalPerfis.vue";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import { Badge } from "@/components/ui/badge";
import { SearchXIcon } from "lucide-vue-next";
import functions from "@/functions/cad_perfis.js";

const store = useStore();
const { proxy } = getCurrentInstance();

const titleModal = "Cadastro de Perfis";
const varsModalData = {
  status: "A",
  nome: "",
  descricao: "",
};

const columns = [
  { key: "id", label: "#", align: "center", sortable: true },
  { key: "nome", label: "Perfil", sortable: true },
  { key: "descricao", label: "Descrição" },
  { key: "status", label: "Status", align: "center" },
];

const listPerfis = computed(() => store.state.listPerfis?.data || []);
const pagination = computed(() => {
  const list = store.state.listPerfis;
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

const formattedPerfis = computed(() => {
  return listPerfis.value.map((p) => ({
    id: p.id,
    nome: p.nome,
    descricao: p.descricao || "Sem descrição",
    status: p.status === "A" ? "Ativo" : "Inativo",
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
  let url = typeof page === "number" ? `/perfil/list?page=${page}` : page;
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

onMounted(() => {
  listAll();
});
</script>

<template>
  <TemplateAdmin>
    <div class="px-6 py-6 w-full h-full flex flex-col gap-6">
      <!-- Main Table Card -->
      <div
        class="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden"
      >
        <div class="p-8">
          <DataTable
            :columns="columns"
            :data="formattedPerfis"
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
                label="NOVO PERFIL"
                :titleModal="titleModal"
                :varsModalData="varsModalData"
                class="shrink-0"
              />
            </template>

            <template #cell-status="{ item }">
              <Badge
                :variant="item.status === 'Ativo' ? 'default' : 'destructive'"
                class="font-black px-3 py-1 text-[10px] uppercase tracking-wider"
              >
                {{ item.status }}
              </Badge>
            </template>

            <template #cell-nome="{ item }">
              <span class="font-bold text-slate-700">{{ item.nome }}</span>
            </template>

            <template #cell-descricao="{ item }">
              <span class="text-slate-400 text-xs italic">{{
                item.descricao
              }}</span>
            </template>

            <!-- empty state personalizado -->
            <template #empty>
              <div
                class="flex flex-col items-center justify-center py-20 gap-4"
              >
                <div class="p-6 bg-slate-50 rounded-full">
                  <SearchXIcon class="w-12 h-12 text-slate-300" />
                </div>
                <div class="text-center">
                  <h3 class="text-slate-800 font-bold text-lg">
                    Nenhum perfil encontrado
                  </h3>
                  <p class="text-slate-500 text-sm max-w-xs">
                    Tente ajustar seus filtros de busca ou crie um novo perfil.
                  </p>
                </div>
              </div>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Modals -->
      <ModalPerfis :functions="functions" />
    </div>
  </TemplateAdmin>
</template>

<style scoped>
:deep(.data-table-container) {
  @apply border-none shadow-none;
}
</style>
