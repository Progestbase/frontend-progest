<script setup>
import { computed, ref, onMounted, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalUser01 from "@/components/cadastros/ModalUser01.vue";
import ModalUserView from "@/components/cadastros/ModalUserView.vue";
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
  UserPlusIcon,
  UserCircleIcon,
  MailIcon,
  PhoneIcon,
  FingerprintIcon,
  FilterIcon,
  BriefcaseIcon,
} from "lucide-vue-next";
import functions from "@/functions/cad_usuarios.js";

const store = useStore();
const { proxy } = getCurrentInstance();

const titleModal = "Cadastro de Usuário";
const varsModalData = {
  status: "A",
  name: "",
  cpf: "",
  email: "",
  telefone: "",
  data_nascimento: "",
  tipo_vinculo: "",
  password: "",
};

const columns = [
  { key: "id", label: "#", align: "center", sortable: true },
  { key: "name", label: "Colaborador", sortable: true },
  { key: "email", label: "Contato", sortable: true },
  { key: "cpf", label: "CPF" },
  { key: "tipo_vinculo", label: "Vínculo", align: "center", sortable: true },
  { key: "status", label: "Status", align: "center", sortable: true },
];

// Estado de busca, ordenação e filtros
const searchQuery = ref("");
const sortBy = ref("name");
const sortDir = ref("asc");
const filterTipoVinculo = ref("");

const listUsers = computed(() => {
  const usersData = store.state.listUsers;
  return usersData?.data || usersData || [];
});

const pagination = computed(() => {
  const list = store.state.listUsers;
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

const listTiposVinculo = computed(() => store.state.listTiposVinculo || []);

const tipoVinculoMap = computed(() => {
  const map = {};
  listTiposVinculo.value.forEach((tipo) => {
    map[tipo.id] = tipo.nome;
    map[String(tipo.id)] = tipo.nome;
  });
  console.log("🗺️ Mapa de tipos de vínculo criado:", map);
  console.log("📋 Lista de tipos disponíveis:", listTiposVinculo.value);
  return map;
});

const getTipoVinculoColor = (tipoId) => {
  const id = typeof tipoId === 'string' ? parseInt(tipoId) : tipoId;
  const colors = {
    1: "bg-blue-50 text-blue-700 border-blue-200", 
    2: "bg-green-50 text-green-700 border-green-200", 
    3: "bg-amber-50 text-amber-700 border-amber-200", 
    4: "bg-purple-50 text-purple-700 border-purple-200", 
    5: "bg-orange-50 text-orange-700 border-orange-200", 
    6: "bg-cyan-50 text-cyan-700 border-cyan-200", 
    7: "bg-pink-50 text-pink-700 border-pink-200", 
  };
  return colors[id] || "bg-slate-50 text-slate-700 border-slate-200";
};

const formatCPF = (cpf) => {
  if (!cpf) return "---.---.------";
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return cpf;
};

// Nota: a conversão de status (A → "Ativo", I → "Inativo") já é feita
// no listALL do cad_usuarios.js (enrichedUsers). Não reconverter aqui.

const listAllUsers = async (url = null) => {
  await functions.listTiposVinculo({ $axios: proxy.$axios, $store: store });
  
  functions.listALL(
    {
      $axios: proxy.$axios,
      $store: store,
      $toastr: proxy.$toastr,
      search: searchQuery.value,
      sort_by: sortBy.value,
      sort_dir: sortDir.value,
      tipo_vinculo: filterTipoVinculo.value,
    },
    url,
  );
};

const handleSearch = (query) => {
  searchQuery.value = query;
  listAllUsers();
};

const handleSort = (key) => {
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = key;
    sortDir.value = "asc";
  }
  listAllUsers();
};

const handleFilterTipoVinculo = (value) => {
  filterTipoVinculo.value = value === "all" ? "" : value;
  listAllUsers();
};

const handlePaginate = (page) => {
  let url = typeof page === "number" ? `/user/list?page=${page}` : page;
  listAllUsers(url);
};

// Modal de visualização
const isViewModalOpen = ref(false);
const viewingUser = ref({});

const handleView = (item) => {
  functions.listData({
    idData: item.id,
    $axios: proxy.$axios,
    $store: store,
    $toastr: proxy.$toastr,
    callback: () => {
      viewingUser.value = store.state.modalData.modalData || {};
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

onMounted(listAllUsers);
</script>

<template>
  <TemplateAdmin>
    <div class="px-4 py-6 w-full h-full flex flex-col gap-6 max-w-[1800px] mx-auto">
      <!-- Main Database Card -->
      <div
        class="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/30 overflow-hidden flex-1 flex flex-col"
      >
        <div class="p-10 flex-1 flex flex-col">
          <DataTable
            :columns="columns"
            :data="listUsers"
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
              <!-- Filtro por Tipo de Vínculo -->
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5 text-slate-400">
                  <FilterIcon class="w-3.5 h-3.5" />
                </div>
                <Select
                  :model-value="filterTipoVinculo || 'all'"
                  @update:model-value="handleFilterTipoVinculo"
                >
                  <SelectTrigger
                    class="h-10 w-[180px] text-sm bg-slate-50 border-slate-100 rounded-xl"
                  >
                    <SelectValue placeholder="Tipo de Vínculo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Vínculos</SelectItem>
                    <SelectItem
                      v-for="tipo in listTiposVinculo"
                      :key="tipo.id"
                      :value="tipo.id.toString()"
                    >
                      {{ tipo.nome }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <LinkModal01
                label="NOVO COLABORADOR"
                :titleModal="titleModal"
                :varsModalData="varsModalData"
                class="shrink-0"
              />
            </template>

            <!-- Status Column -->
            <template #cell-status="{ item }">
              <Badge
                :variant="item.status === 'Ativo' || 'A' ? 'default' : 'destructive'"
                class="font-black px-4 py-1.5 text-[10px] uppercase tracking-widest rounded-full"
              >
                {{ item.status }}
              </Badge>
            </template>

            <!-- User Name Column -->
            <template #cell-name="{ item }">
              <div class="flex items-center gap-4">
                <div
                  class="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-sm border border-slate-100"
                >
                  <UserCircleIcon class="w-6 h-6" />
                </div>
                <div class="flex flex-col">
                  <span
                    class="font-bold text-slate-800 text-sm tracking-tight capitalize leading-tight"
                    >{{ item.name.toLowerCase() }}</span
                  >
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <FingerprintIcon class="w-3 h-3 text-slate-300" />
                    <span
                      class="text-[10px] text-slate-400 font-black uppercase tracking-tighter"
                      >{{ item.id }} • ID INTERNO</span
                    >
                  </div>
                </div>
              </div>
            </template>

            <!-- Email/Contact Column -->
            <template #cell-email="{ item }">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <MailIcon class="w-3 h-3 text-slate-300" />
                  <span
                    class="text-xs font-semibold text-slate-600 truncate max-w-[150px]"
                    >{{ item.email }}</span
                  >
                </div>
                <div v-if="item.telefone" class="flex items-center gap-2">
                  <PhoneIcon class="w-2.5 h-2.5 text-slate-300" />
                  <span class="text-[10px] text-slate-400 font-medium">{{
                    item.telefone
                  }}</span>
                </div>
              </div>
            </template>

            <!-- CPF Column -->
            <template #cell-cpf="{ item }">
              <span
                class="text-xs font-mono text-slate-500 tabular-nums bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100"
              >
                {{ formatCPF(item.cpf) }}
              </span>
            </template>

            <!-- Tipo de Vínculo Column -->
            <template #cell-tipo_vinculo="{ item }">
              <div class="flex items-center justify-center gap-2">
                <div
                  :class="[
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2',
                    getTipoVinculoColor(item.tipo_vinculo),
                  ]"
                >
                  <BriefcaseIcon class="w-3 h-3" />
                  <span class="font-bold text-[10px] uppercase tracking-wider">
                    {{ tipoVinculoMap[item.tipo_vinculo] || `${item.tipo_vinculo}` }}
                  </span>
                </div>
              </div>
            </template>

            <!-- Empty State -->
            <template #empty>
              <div
                class="flex flex-col items-center justify-center py-24 gap-6"
              >
                <div class="relative">
                  <div
                    class="absolute -inset-4 bg-primary/5 blur-3xl rounded-full"
                  ></div>
                  <div
                    class="relative p-8 bg-white rounded-[2rem] border-2 border-dashed border-slate-200"
                  >
                    <UserPlusIcon class="w-16 h-16 text-slate-300" />
                  </div>
                </div>
                <div class="text-center max-w-sm">
                  <h3 class="text-slate-900 font-black text-xl tracking-tight">
                    Nenhuma conta cadastrada
                  </h3>
                  <p
                    class="text-slate-500 text-sm mt-2 leading-relaxed font-medium"
                  >
                    Você ainda não possui colaboradores vinculados. Comece
                    criando um novo perfil de acesso.
                  </p>
                </div>
              </div>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Modals -->
      <ModalUser01 :functions="functions" />
      <ModalUserView
        v-model:open="isViewModalOpen"
        :user="viewingUser"
      />
    </div>
  </TemplateAdmin>
</template>

<style scoped>
:deep(.data-table-container) {
  @apply border-none shadow-none p-0 bg-transparent;
}
</style>
