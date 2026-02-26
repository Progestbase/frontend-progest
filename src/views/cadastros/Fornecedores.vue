<script setup>
import { computed, onMounted, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import { Badge } from "@/components/ui/badge";
import { Building2Icon, HandshakeIcon, GlobeIcon } from "lucide-vue-next";
import functions from "@/functions/cad_fornecedores.js";
import ModalFornecedores from "@/components/cadastros/ModalFornecedores.vue";

const store = useStore();
const { proxy } = getCurrentInstance();

const titleModal = "Cadastro de Fornecedor";
const varsModalData = {
  status: "A",
  cnpj: "",
  razao_social_nome: "",
  tipo_pessoa: "J",
};

const columns = [
  { key: "id", label: "#", align: "center", sortable: true },
  { key: "razao_social", label: "Fornecedor / Instituição", sortable: true },
  { key: "cnpj", label: "Identificação Fiscal", sortable: true },
  { key: "status", label: "Status", align: "center" },
];

const listFornecedores = computed(() => {
  const lf = store.state.listFornecedores;
  if (!lf) return [];
  if (Array.isArray(lf)) return lf;
  return lf.data && Array.isArray(lf.data) ? lf.data : [];
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

const formattedFornecedores = computed(() => {
  return listFornecedores.value.map((f) => ({
    id: f.id,
    cnpj: f.cnpj || f.cpf || "---",
    razao_social:
      f.razao_social_nome || f.razao_social || f.nome || "Não identificado",
    status: f.statusFormatted || (f.status === "A" ? "Ativo" : "Inativo"),
  }));
});

const listAllFornecedores = (url = null) => {
  functions.listAll(
    { $axios: proxy.$axios, $store: store, $toastr: proxy.$toastr },
    url,
  );
};

const handleSearch = (query) => {
  store.state.searchFilters = query ? [{ razao_social_nome: query }] : [{}];
  listAllFornecedores();
};

const handlePaginate = (page) => {
  let url = typeof page === "number" ? `/fornecedor/list?page=${page}` : page;
  listAllFornecedores(url);
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

onMounted(listAllFornecedores);
</script>

<template>
  <TemplateAdmin>
    <div class="px-6 py-6 w-full h-full flex flex-col gap-6">
      <!-- Main Content Card -->
      <div
        class="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden flex-1 flex flex-col"
      >
        <div class="p-8 flex-1 flex flex-col">
          <DataTable
            :columns="columns"
            :data="formattedFornecedores"
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

            <template #cell-razao_social="{ item }">
              <div class="flex items-center gap-4">
                <div
                  class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm"
                >
                  <Building2Icon class="w-5 h-5" />
                </div>
                <div class="flex flex-col">
                  <span
                    class="font-bold text-slate-800 text-sm tracking-tight capitalize leading-tight"
                    >{{ item.razao_social.toLowerCase() }}</span
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

            <template #cell-cnpj="{ item }">
              <div class="flex flex-col">
                <span
                  class="text-xs font-mono text-slate-600 font-bold tabular-nums"
                >
                  {{ item.cnpj }}
                </span>
                <span
                  class="text-[9px] text-slate-400 font-black uppercase mt-1"
                  >Registo Federal</span
                >
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
    </div>
  </TemplateAdmin>
</template>

<style scoped>
:deep(.data-table-container) {
  @apply border-none shadow-none p-0;
}
</style>
