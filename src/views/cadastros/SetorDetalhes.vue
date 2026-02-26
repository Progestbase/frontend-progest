<script setup>
import { ref, onMounted, provide, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import axios from "axios";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import TabOverview from "@/components/setorAtual/TabOverview.vue";
import TabEstoque from "@/components/setorAtual/TabEstoque.vue";
import TabMovimentacoes from "@/components/setorAtual/TabMovimentacoes.vue";
import TabEntrada from "@/components/setorAtual/TabEntrada.vue";
import TabUsuarios from "@/components/setorAtual/TabUsuarios.vue";
import ModalSetor from "@/components/cadastros/ModalSetor.vue";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InfoIcon,
  BoxesIcon,
  ArrowLeftRightIcon,
  DownloadIcon,
  UsersIcon,
  AlertTriangleIcon,
  ChevronLeftIcon,
  LayoutDashboardIcon,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Funções de carregamento
import functionsEstoque from "@/functions/cad_estoque";
import functionsMovimentacao from "@/functions/cad_movimentacao";
import functionsEntrada from "@/functions/cad_entradas";
import functionsSetor from "@/functions/cad_setores";
import functionsUsuarioSetor from "@/functions/cad_usuario_setor";

const route = useRoute();
const router = useRouter();
const store = useStore();

const setor = ref({});
const loading = ref(true);
const activeTab = ref("overview");
const showDeleteDialog = ref(false);

// Refs de dados para as abas (mesma estrutura de provide/inject da SetorAtualView)
const estoqueItems = ref([]);
const resumoEstoque = ref({});
const setorEstoque = ref({});
const movimentacoesItems = ref([]);
const entradasItems = ref([]);
const usuariosItems = ref([]);

// Provide para as abas filhas (completando compatibilidade)
provide("setorAtualData", {
  estoqueItems,
  resumoEstoque,
  setorEstoque,
  movimentacoesItems,
  entradasItems,
  usuariosItems,
});

const context = {
  $axios: axios,
  $store: store,
  $toastr: undefined,
  estoqueItems,
  resumoEstoque,
  setorEstoque,
  movimentacoesItems,
  entradasItems,
  usuariosItems,
};
provide("setorAtualContext", context);

const carregarDadosOperacionais = async () => {
  if (!setor.value.id) return;
  const ctx = { ...context, loading: false };

  if (setor.value.estoque) await functionsEstoque.listAll(ctx);
  // Backend esperado: listBySetor ou listAll que use o store.state.setorDetails
  await functionsMovimentacao.listAll(ctx); // Assume que usa o setor carregado
  await functionsEntrada.listAll(ctx);
  if (functionsUsuarioSetor.listAll) await functionsUsuarioSetor.listAll(ctx);
};

const carregarSetor = async () => {
  try {
    loading.value = true;
    const setorId = route.params.id;
    const response = await axios.post(
      `/setores/listData`,
      { id: setorId },
      {
        headers: { Authorization: "Bearer " + store.getters.getUserToken },
      },
    );

    setor.value = response.data.data;
    store.commit("setSetorDetails", setor.value);

    await carregarDadosOperacionais();

    if (route.query.tab) activeTab.value = route.query.tab;
  } catch (error) {
    console.error("Erro ao carregar setor:", error);
  } finally {
    loading.value = false;
  }
};

const changeTab = (tab) => {
  activeTab.value = tab;
  router.replace({ query: { ...route.query, tab } });
};

const editarSetor = () => {
  store.commit("setModalData", { ...setor.value });
  store.commit("setModalFunction", "UP");
  store.commit("setModalOpen", true);
};

const confirmarExclusaoSetor = async () => {
  try {
    // Lógica real de exclusão via API
    await axios.delete(`/setores/${setor.value.id}`, {
      headers: { Authorization: "Bearer " + store.getters.getUserToken },
    });
    router.push("/setores");
  } catch (e) {
    console.error("Erro ao excluir:", e);
  }
  showDeleteDialog.value = false;
};

onMounted(carregarSetor);
</script>

<template>
  <TemplateAdmin>
    <div class="px-6 py-6 w-full h-full flex flex-col gap-6">
      <!-- Premium Header Section -->
      <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div class="flex items-center gap-5">
          <div
            class="p-4 bg-primary/10 rounded-[2rem] text-primary shadow-sm border border-primary/20"
          >
            <LayoutDashboardIcon class="w-10 h-10" />
          </div>
          <div>
            <h1
              class="text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase"
            >
              {{ setor.nome }}
            </h1>
            <div class="flex items-center gap-2 text-slate-500 font-medium">
              <span
                class="text-xs font-black uppercase tracking-widest text-primary/70"
                >Gestão de Unidade</span
              >
              <div class="w-1 h-1 rounded-full bg-slate-300"></div>
              <p class="text-xs">
                Acompanhe as informações fundamentais e gerencie as
                configurações do setor.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          @click="router.push('/setores')"
          class="rounded-full px-6 border-slate-200 h-11 font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-primary transition-all"
        >
          <ChevronLeftIcon class="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex-1 flex items-center justify-center min-h-[400px]"
      >
        <div class="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p class="text-slate-500 font-medium">
            Carregando dados da unidade...
          </p>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else-if="setor.id" class="flex-1 flex flex-col gap-6">
        <Tabs v-model="activeTab" class="w-full flex flex-col gap-6">
          <div
            class="bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex self-start"
          >
            <TabsList class="bg-transparent border-none">
              <TabsTrigger
                value="overview"
                class="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 rounded-lg"
              >
                <InfoIcon class="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>

              <TabsTrigger
                v-if="setor.estoque"
                value="estoque"
                class="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 rounded-lg"
              >
                <BoxesIcon class="w-4 h-4" />
                <span>Estoque</span>
              </TabsTrigger>

              <TabsTrigger
                value="movimentacoes"
                class="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 rounded-lg"
              >
                <ArrowLeftRightIcon class="w-4 h-4" />
                <span>Movimentações</span>
              </TabsTrigger>

              <TabsTrigger
                value="entrada"
                class="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 rounded-lg"
              >
                <DownloadIcon class="w-4 h-4" />
                <span>Entrada</span>
              </TabsTrigger>

              <TabsTrigger
                value="usuarios"
                class="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 rounded-lg"
              >
                <UsersIcon class="w-4 h-4" />
                <span>Equipe</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div
            class="flex-1 translate-y-0 opacity-100 transition-all duration-300"
          >
            <TabsContent value="overview" class="mt-0 outline-none">
              <TabOverview
                :setor="setor"
                @editar-setor="editarSetor"
                @excluir-setor="showDeleteDialog = true"
              />
            </TabsContent>

            <TabsContent value="estoque" class="mt-0 outline-none">
              <TabEstoque @reload-estoque="carregarDadosOperacionais" />
            </TabsContent>

            <TabsContent value="movimentacoes" class="mt-0 outline-none">
              <TabMovimentacoes :setorId="setor.id" />
            </TabsContent>

            <TabsContent value="entrada" class="mt-0 outline-none">
              <TabEntrada
                :setorId="setor.id"
                @reload-estoque="carregarDadosOperacionais"
              />
            </TabsContent>

            <TabsContent value="usuarios" class="mt-0 outline-none">
              <TabUsuarios :setorId="setor.id" />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <!-- Sector Not Found -->
      <div
        v-else
        class="flex-1 flex flex-col items-center justify-center py-20 bg-slate-50/50 border border-slate-200 border-dashed rounded-3xl"
      >
        <div class="p-6 bg-white rounded-full shadow-sm mb-4">
          <AlertTriangleIcon class="w-12 h-12 text-amber-500" />
        </div>
        <h5 class="text-slate-800 font-bold text-lg">Unidade não encontrada</h5>
        <p class="text-slate-500 text-sm max-w-xs text-center mt-2">
          Não foi possível carregar os detalhes do setor informado. Verifique o
          ID ou se ele ainda existe no sistema.
        </p>
        <Button @click="router.push('/setores')" variant="outline" class="mt-6">
          Voltar para Lista de Setores
        </Button>
      </div>

      <!-- Unified Modals -->
      <ModalSetor :functions="functionsSetor" />

      <AlertDialog
        :open="showDeleteDialog"
        @update:open="showDeleteDialog = $event"
      >
        <AlertDialogContent class="rounded-3xl p-8 border-none shadow-2xl">
          <AlertDialogHeader>
            <div
              class="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-4"
            >
              <AlertTriangleIcon class="w-8 h-8" />
            </div>
            <AlertDialogTitle
              class="text-2xl font-black text-slate-900 tracking-tight"
              >Confirmar Exclusão Definitiva?</AlertDialogTitle
            >
            <AlertDialogDescription
              class="text-slate-500 text-base leading-relaxed"
            >
              Você está prestes a remover o setor
              <span class="font-bold text-slate-900">"{{ setor.nome }}"</span>.
              Esta ação apagará permanentemente o registro e poderá afetar o
              histórico de movimentações vinculadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter class="mt-8 gap-3">
            <AlertDialogCancel
              class="font-bold border-slate-200 text-slate-500 h-12 rounded-xl"
              >Não, Cancelar</AlertDialogCancel
            >
            <AlertDialogAction
              @click="confirmarExclusaoSetor"
              class="bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl px-8 shadow-lg shadow-red-200"
            >
              Sim, Excluir Unidade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </TemplateAdmin>
</template>
