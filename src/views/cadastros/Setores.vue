<script setup>
import { computed, ref, onMounted, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalSetor from "@/components/cadastros/ModalSetor.vue";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Building2,
  SearchX,
  FilterIcon,
  NavigationIcon,
} from "lucide-vue-next";
import functions from "@/functions/cad_setores.js";

const store = useStore();
const router = useRouter();
const { proxy } = getCurrentInstance();

const titleModal = "Cadastro de Setores";
const varsModalData = {
  status: "A",
  nome: "",
  descricao: "",
  estoque: false,
  tipo: "Material",
  unidade_id: "",
};

const searchQuery = ref("");
const filtroStatus = ref("ALL");
const filtroTipo = ref("ALL");
const filtroEstoque = ref("ALL");
const filtroUnidade = ref("ALL");

const unidadesList = computed(() => {
  const list = store.state.listUnidades || {};
  return Array.isArray(list.data) ? list.data : [];
});

const setoresFiltrados = computed(() => {
  const storeList = store.state.listSetoresGerais || {};
  const arr = Array.isArray(storeList.data) ? storeList.data : [];

  return arr.filter((setor) => {
    const nome = setor.nome ? setor.nome.toLowerCase() : "";
    const query = searchQuery.value.toLowerCase();
    const searchMatch = !query || nome.includes(query);

    const statusMatch =
      filtroStatus.value === "ALL" || setor.status === filtroStatus.value;
    const tipoMatch =
      filtroTipo.value === "ALL" || setor.tipo === filtroTipo.value;
    const estoqueMatch =
      filtroEstoque.value === "ALL" ||
      (filtroEstoque.value === "true") === !!setor.estoque;
    const unidadeMatch =
      filtroUnidade.value === "ALL" ||
      setor.unidade?.id == filtroUnidade.value ||
      setor.unidade_id == filtroUnidade.value;

    return (
      searchMatch && statusMatch && tipoMatch && estoqueMatch && unidadeMatch
    );
  });
});

const carregarSetores = () => {
  functions.listAll({ $axios: proxy.$axios, $store: store });
};

const editarSetor = (setor) => {
  store.commit("setModalData", { ...setor });
  store.commit("setModalFunction", "UP");
  store.commit("setModalOpen", true);
};

const confirmarExclusao = async (setor) => {
  if (confirm(`Tem certeza que deseja excluir o setor "${setor.nome}"?`)) {
    const result = await functions.deleteSetor(
      { $axios: proxy.$axios, $store: store, $toastr: proxy.$toastr },
      setor.id,
    );
    if (result?.success) carregarSetores();
  }
};

onMounted(carregarSetores);
</script>

<template>
  <TemplateAdmin>
    <div class="px-6 py-6 w-full h-full flex flex-col gap-6">
      <!-- Enhanced Filters Card -->
      <div
        class="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden"
      >
        <!-- Toolbar Row (Search + Action) -->
        <div
          class="flex flex-col md:flex-row items-center justify-between gap-4 mb-8"
        >
          <div class="relative w-full max-w-md">
            <Input
              v-model="searchQuery"
              placeholder="Pesquisar unidade por nome..."
              class="px-5 h-12 bg-slate-50 border-none rounded-2xl font-medium focus:ring-primary/20 transition-all shadow-inner"
            />
          </div>

          <LinkModal01
            label="NOVO SETOR"
            :titleModal="titleModal"
            :varsModalData="varsModalData"
            class="shrink-0 w-full md:w-auto"
          />
        </div>

        <!-- Secondary Filters Row -->
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end relative z-10"
        >
          <div class="space-y-2">
            <label
              class="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-1"
            >
              <div class="w-1 h-3 bg-primary/40 rounded-full"></div>
              Status Operacional
            </label>
            <Select v-model="filtroStatus">
              <SelectTrigger class="bg-slate-50 border-none h-11 rounded-xl"
                ><SelectValue
              /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Status</SelectItem>
                <SelectItem value="A">Ativo</SelectItem>
                <SelectItem value="I">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <label
              class="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-1"
            >
              <div class="w-1 h-3 bg-primary/40 rounded-full"></div>
              Tipo de Insumo
            </label>
            <Select v-model="filtroTipo">
              <SelectTrigger class="bg-slate-50 border-none h-11 rounded-xl"
                ><SelectValue
              /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Tipos</SelectItem>
                <SelectItem value="Material">Material</SelectItem>
                <SelectItem value="Medicamento">Medicamento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <label
              class="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-1"
            >
              <div class="w-1 h-3 bg-primary/40 rounded-full"></div>
              Visibilidade Estoque
            </label>
            <Select v-model="filtroEstoque">
              <SelectTrigger class="bg-slate-50 border-none h-11 rounded-xl"
                ><SelectValue
              /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Qualquer Controle</SelectItem>
                <SelectItem value="true">Com Controle</SelectItem>
                <SelectItem value="false">Sem Controle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <label
              class="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-1"
            >
              <div class="w-1 h-3 bg-primary/40 rounded-full"></div>
              Polo / Unidade Regional
            </label>
            <Select v-model="filtroUnidade">
              <SelectTrigger
                class="bg-slate-50 border-none h-11 text-xs truncate rounded-xl"
                ><SelectValue
              /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as Unidades</SelectItem>
                <SelectItem
                  v-for="u in unidadesList"
                  :key="u.id"
                  :value="u.id.toString()"
                >
                  {{ u.nome }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <!-- Interactive Grid -->
      <div
        v-if="setoresFiltrados.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="setor in setoresFiltrados"
          :key="setor.id"
          class="group relative bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
          @click="router.push(`/setor/${setor.id}?tab=overview`)"
        >
          <!-- Status Line Indicator -->
          <div
            class="absolute top-0 left-0 w-2 h-full transition-all duration-500 group-hover:w-3"
            :class="
              setor.status === 'A'
                ? 'bg-emerald-500/80 shadow-[2px_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-slate-200'
            "
          ></div>

          <div class="flex justify-between items-start mb-6">
            <div
              class="p-4 bg-slate-50 rounded-2xl group-hover:bg-primary/5 transition-all duration-500 shadow-sm border border-slate-100/50"
            >
              <Building2
                class="w-7 h-7 text-slate-400 group-hover:text-primary transition-all duration-500 group-hover:scale-110"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  @click.stop
                  class="hover:bg-slate-100 rounded-full h-8 w-8"
                >
                  <MoreVertical class="w-5 h-5 text-slate-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                class="rounded-xl p-2 border-slate-200"
              >
                <DropdownMenuItem
                  @click.stop="editarSetor(setor)"
                  class="rounded-lg py-2"
                >
                  <Pencil class="w-4 h-4 mr-3 text-slate-400" />
                  <span class="font-bold text-xs uppercase tracking-tight"
                    >Editar</span
                  >
                </DropdownMenuItem>
                <DropdownMenuItem
                  @click.stop="confirmarExclusao(setor)"
                  class="text-destructive rounded-lg py-2"
                >
                  <Trash2 class="w-4 h-4 mr-3" />
                  <span class="font-bold text-xs uppercase tracking-tight"
                    >Excluir</span
                  >
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div class="space-y-1 pr-2">
            <h5
              class="text-xl font-black text-slate-900 line-clamp-1 capitalize tracking-tight"
            >
              {{ setor.nome.toLowerCase() }}
            </h5>
            <div class="flex items-center gap-2">
              <NavigationIcon class="w-3 h-3 text-primary animate-pulse" />
              <p
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate"
              >
                {{ setor.unidade?.nome || "Sem Polo Definido" }}
              </p>
            </div>
          </div>

          <div class="mt-8 flex flex-wrap gap-2">
            <Badge
              variant="outline"
              class="bg-indigo-50/40 text-indigo-700 border-indigo-100/50 text-[9px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-lg"
            >
              {{ setor.tipo }}
            </Badge>
            <Badge
              variant="outline"
              :class="
                setor.estoque
                  ? 'bg-amber-50/40 text-amber-700 border-amber-100/50'
                  : 'bg-slate-50 text-slate-400 border-slate-100'
              "
              class="text-[9px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-lg"
            >
              {{ setor.estoque ? "Estoque Ativo" : "Controle Externo" }}
            </Badge>
          </div>

          <div
            v-if="setor.descricao"
            class="mt-6 pt-5 border-t border-slate-50 flex-1"
          >
            <p
              class="text-[11px] text-slate-400 italic font-medium leading-relaxed line-clamp-3"
            >
              "{{ setor.descricao }}"
            </p>
          </div>
        </div>
      </div>

      <!-- Enhanced Empty State -->
      <div
        v-else
        class="flex-1 flex flex-col items-center justify-center py-28 bg-slate-50/50 border-2 border-slate-200 border-dashed rounded-[3rem] shadow-inner"
      >
        <div class="relative mb-8">
          <div
            class="absolute -inset-4 bg-primary/10 blur-2xl rounded-full"
          ></div>
          <div
            class="relative p-8 bg-white rounded-full shadow-xl border border-slate-100"
          >
            <SearchX class="w-16 h-16 text-slate-200" />
          </div>
        </div>
        <h5 class="text-slate-900 font-black text-2xl tracking-tight">
          Setor não localizado
        </h5>
        <p
          class="text-slate-500 font-medium max-w-sm text-center mt-3 leading-relaxed"
        >
          Não encontramos nenhuma unidade correspondente aos filtros. Tente
          expandir sua busca ou cadastrar um novo local operacional.
        </p>
        <Button
          @click="
            searchQuery = '';
            filtroStatus = 'ALL';
            filtroTipo = 'ALL';
            filtroEstoque = 'ALL';
            filtroUnidade = 'ALL';
          "
          variant="outline"
          class="mt-10 rounded-full px-8 py-6 border-slate-200 hover:bg-slate-50 font-black text-xs uppercase tracking-widest"
        >
          Resetar Todos os Filtros
        </Button>
      </div>

      <ModalSetor :functions="functions" />
    </div>
  </TemplateAdmin>
</template>

<style scoped>
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}
</style>
