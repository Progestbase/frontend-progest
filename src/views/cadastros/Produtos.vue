<script setup>
import { computed, onMounted, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalProdutos from "@/components/cadastros/ModalProdutos.vue";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import { Badge } from "@/components/ui/badge";
import { PackageIcon, LayersIcon, BoxSelectIcon } from "lucide-vue-next";
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
  { key: "grupo_produto", label: "Grupo" },
  { key: "unidade_medida", label: "Unidade", align: "center" },
  { key: "status", label: "Status", align: "center" },
];

const listProdutos = computed(() => store.state.listProdutos?.data || []);
const pagination = computed(() => {
  const list = store.state.listProdutos;
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

const formattedProdutos = computed(() => {
  return listProdutos.value.map((produto) => ({
    id: produto.id,
    nome: produto.nome,
    marca: produto.marca || "N/A",
    grupo_produto: produto.grupo_produto?.nome || "Material",
    unidade_medida:
      produto.unidade_medida?.sigla || produto.unidade_medida?.nome || "UN",
    status: produto.status === "A" ? "Ativo" : "Inativo",
  }));
});

const listAllProdutos = (url = null) => {
  functions.listAll(
    { $axios: proxy.$axios, $store: store, $toastr: proxy.$toastr },
    url,
  );
};

const handleSearch = (query) => {
  store.state.searchFilters = query ? [{ nome: query }] : [{}];
  listAllProdutos();
};

const handlePaginate = (page) => {
  let url = typeof page === "number" ? `/produtos/list?page=${page}` : page;
  listAllProdutos(url);
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
  listAllProdutos();
  // Ensure aux data is loaded
  const grupos =
    store.state.listGrupoProdutos?.data || store.state.listGrupoProdutos || [];
  if (grupos.length === 0) {
    proxy.$axios
      .post("/grupoProduto/list", { filters: [{}], per_page: 500 })
      .then(
        (r) =>
          r.data?.status && store.commit("setListGrupoProdutos", r.data.data),
      );
  }
});
</script>

<template>
  <TemplateAdmin>
    <div class="px-6 py-6 w-full h-full flex flex-col gap-6">
      <!-- Inventory Table Card -->
      <div
        class="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden flex-1 flex flex-col"
      >
        <div class="p-8 flex-1 flex flex-col">
          <DataTable
            :columns="columns"
            :data="formattedProdutos"
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
                  class="font-bold text-slate-800 text-sm tracking-tight capitalize"
                  >{{ item.nome.toLowerCase() }}</span
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
    </div>
  </TemplateAdmin>
</template>

<style scoped>
:deep(.data-table-container) {
  @apply border-none shadow-none p-0;
}
:deep(table biological-table-row) {
  @apply transition-colors duration-200;
}
</style>
