<script setup>
import { computed, ref, onMounted, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2Icon,
  HandshakeIcon,
  GlobeIcon,
  FilterIcon,
  UserIcon,
} from "lucide-vue-next";
import functions from "@/functions/cad_fornecedores.js";
import ModalFornecedores from "@/components/cadastros/ModalFornecedores.vue";
import ModalFornecedoresView from "@/components/cadastros/ModalFornecedoresView.vue";

const store = useStore();
const { proxy } = getCurrentInstance();

const titleModal = "Cadastro de Fornecedor";
const varsModalData = {
  status: "A",
  cnpj: "",
  cpf: "",
  razao_social_nome: "",
  tipo_pessoa: "J",
};

const columns = [
  { key: "id", label: "#", align: "center", sortable: true },
  { key: "razao_social_nome", label: "Fornecedor / Instituição", sortable: true },
  { key: "documento", label: "Identificação Fiscal", sortable: false },
  { key: "tipo_pessoa", label: "Tipo Pessoa", align: "center", sortable: true },
  { key: "status", label: "Status", align: "center", sortable: true },
];

// Estado local
const searchQuery = ref("");
const sortBy = ref("razao_social_nome");
const sortDir = ref("asc");
const filterTipoPessoa = ref("");

const listFornecedores = computed(() => {
  const data = store.state.listFornecedores;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.data && Array.isArray(data.data) ? data.data : [];
});

const pagination = computed(() => {
  const list = store.state.listFornecedores;
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

const listAllFornecedores = (url = null) => {
  functions.listAll(
    {
      $axios: proxy.$axios,
      $store: store,
      $toastr: proxy.$toastr,
      search: searchQuery.value,
      sort_by: sortBy.value,
      sort_dir: sortDir.value,
      tipo_pessoa: filterTipoPessoa.value,
    },
    url,
  );
};

const handleSearch = (query) => {
  searchQuery.value = query;
  listAllFornecedores();
};

const handleSort = (key) => {
  // Documento não é ordenável no backend
  if (key === "documento") return;
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = key;
    sortDir.value = "asc";
  }
  listAllFornecedores();
};

const handleFilterTipoPessoa = (value) => {
  filterTipoPessoa.value = value === "all" ? "" : value;
  listAllFornecedores();
};

const handlePaginate = (page) => {
  let url =
    typeof page === "number" ? `/fornecedores/list?page=${page}` : page;
  listAllFornecedores(url);
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

const formatDoc = (item) => {
  if (item.tipo_pessoa === "J" && item.cnpj) {
    const d = (item.cnpj || "").replace(/\D/g, "");
    if (d.length === 14)
      return d.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    return item.cnpj;
  }
  if (item.tipo_pessoa === "F" && item.cpf) {
    const d = (item.cpf || "").replace(/\D/g, "");
    if (d.length === 11)
      return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    return item.cpf;
  }
  return "---";
};

onMounted(listAllFornecedores);
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
            :data="listFornecedores"
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
              <!-- Filtro por Tipo Pessoa -->
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5 text-slate-400">
                  <FilterIcon class="w-3.5 h-3.5" />
                </div>
                <Select
                  :model-value="filterTipoPessoa || 'all'"
                  @update:model-value="handleFilterTipoPessoa"
                >
                  <SelectTrigger
                    class="h-10 w-[200px] text-sm bg-slate-50 border-slate-100 rounded-xl"
                  >
                    <SelectValue placeholder="Tipo Pessoa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="J">Pessoa Jurídica</SelectItem>
                    <SelectItem value="F">Pessoa Física</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <LinkModal01
                label="NOVO FORNECEDOR"
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

            <template #cell-razao_social_nome="{ item }">
              <div class="flex items-center gap-4">
                <div
                  class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm"
                >
                  <Building2Icon class="w-5 h-5" />
                </div>
                <div class="flex flex-col">
                  <span
                    class="font-bold text-slate-800 text-sm tracking-tight leading-tight"
                    >{{ item.razao_social_nome }}</span
                  >
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <GlobeIcon class="w-3 h-3 text-slate-300" />
                    <span
                      class="text-[10px] text-slate-400 font-black uppercase tracking-tighter"
                      >Parceiro Homologado</span
                    >
                  </div>
                </div>
              </div>
            </template>

            <template #cell-documento="{ item }">
              <div class="flex flex-col">
                <span
                  class="text-xs font-mono text-slate-600 font-bold tabular-nums"
                >
                  {{ formatDoc(item) }}
                </span>
                <span
                  class="text-[9px] text-slate-400 font-black uppercase mt-1"
                >
                  {{ item.tipo_pessoa === "J" ? "CNPJ" : "CPF" }}
                </span>
              </div>
            </template>

            <template #cell-tipo_pessoa="{ item }">
              <div
                class="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg w-fit mx-auto"
              >
                <UserIcon class="w-3.5 h-3.5 text-slate-400" />
                <span
                  class="text-[11px] font-black text-slate-500 uppercase"
                >
                  {{ item.tipo_pessoa === "J" ? "Jurídica" : "Física" }}
                </span>
              </div>
            </template>

            <!-- Empty State -->
            <template #empty>
              <div
                class="flex flex-col items-center justify-center py-24 gap-6"
              >
                <div class="relative">
                  <div
                    class="absolute -inset-6 bg-primary/10 blur-3xl rounded-full animate-pulse"
                  ></div>
                  <div
                    class="relative p-8 bg-white rounded-[2rem] border-2 border-dashed border-slate-200"
                  >
                    <HandshakeIcon class="w-16 h-16 text-slate-300" />
                  </div>
                </div>
                <div class="text-center max-w-sm px-4">
                  <h3
                    class="text-slate-900 font-black text-xl tracking-tight leading-none"
                  >
                    Rede de fornecedores vazia
                  </h3>
                  <p
                    class="text-slate-500 text-sm mt-3 leading-relaxed font-medium"
                  >
                    Você ainda não cadastrou parceiros de suprimentos. Registre
                    seus fornecedores para habilitar a entrada de notas fiscais.
                  </p>
                </div>
              </div>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Modals -->
      <ModalFornecedores :functions="functions" />
      <ModalFornecedoresView
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
