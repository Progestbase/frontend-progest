<script setup>
import { ref, onMounted, onUnmounted, provide, computed, watch } from "vue";
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
} from "lucide-vue-next";
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
const modalSetorOpen = ref(false);

// Refs de dados para as abas
const estoqueItems = ref([]);
const resumoEstoque = ref({});
const setorEstoque = ref({});
const movimentacoesItems = ref([]);
const entradasItems = ref([]);
const usuariosItems = ref([]);

// Provide para as abas filhas
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

// Computeds de permissão
const isAdminUser = computed(() => {
  const user = store.state.user;
  if (!user) return false;
  if (user.email?.toLowerCase() === "admin@admin.com") return true;

  const list = usuariosItems.value || [];
  const found = list.find((u) => {
    const userId = u.usuario_id || u.user_id || u.id || u.usuario?.id;
    const perfil = (u.perfil || u.pivot?.perfil || "").toString().toLowerCase();
    return (
      userId === user.id &&
      (perfil.includes("admin") || perfil.includes("gerente"))
    );
  });
  return !!found || !!user.is_admin;
});

const isSolicitante = computed(() => {
  const user = store.state.user;
  if (!user) return false;
  const list = usuariosItems.value || [];
  const found = list.find((u) => {
    const userId = u.usuario_id || u.user_id || u.id || u.usuario?.id;
    const perfil = (u.perfil || u.pivot?.perfil || "").toString().toLowerCase();
    return userId === user.id && perfil.includes("solicitante");
  });
  return !!found;
});

// Watchers
watch(isSolicitante, (val) => {
  if (val && !["overview"].includes(activeTab.value))
    activeTab.value = "overview";
});

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab) activeTab.value = newTab;
  },
);

const changeTab = (tab) => {
  activeTab.value = tab;
  router.replace({ query: { ...route.query, tab } });
};

const carregarDadosOperacionais = async () => {
  if (!setor.value.id) return;

  const ctx = { ...context, loading: false };

  if (setor.value.estoque) await functionsEstoque.listAll(ctx);
  await functionsMovimentacao.listAll(ctx);
  await functionsEntrada.listAll(ctx);
  if (functionsUsuarioSetor.listAll) await functionsUsuarioSetor.listAll(ctx);
};

const updateHeader = () => {
  const titles = {
    overview: {
      title: "Visão Geral da Unidade",
      subtitle:
        "Informações detalhadas sobre a unidade de atendimento e gestão.",
    },
    estoque: {
      title: "Gestão de Estoque Local",
      subtitle:
        "Controle as quantidades disponíveis e receba alertas de reposição.",
    },
    movimentacoes: {
      title: "Movimentações e Requisições",
      subtitle: "Histórico completo de entradas e saídas entre unidades.",
    },
    entrada: {
      title: "Protocolos de Entrada",
      subtitle: "Histórico de suprimentos recebidos de fornecedores externos.",
    },
    usuarios: {
      title: "Equipe e Permissões",
      subtitle:
        "Gerencie quem tem acesso e quais as permissões nesta unidade específica.",
    },
  };
  const headerInfo = titles[activeTab.value] || titles.overview;
  store.commit("setPageHeader", headerInfo);
};

watch(activeTab, () => {
  updateHeader();
});

const loadSetorDetails = async () => {
  loading.value = true;
  const details = store.state.setorDetails;
  if (details?.id) {
    const result = await functionsSetor.buscarSetorPorId(details.id);
    if (result.success) {
      store.commit("setSetorDetails", result.data);
      setor.value = result.data;
    } else {
      setor.value = details;
    }
    await carregarDadosOperacionais();
  }
  loading.value = false;
  if (route.query.tab) activeTab.value = route.query.tab;
  updateHeader();
};

const editarSetor = () => {
  store.commit("setModalData", { ...setor.value });
  store.commit("setModalFunction", "UP");
  store.commit("setModalOpen", true);
};

const confirmarExclusaoSetor = async () => {
  // Lógica de exclusão aqui
  showDeleteDialog.value = false;
};

// Watch para recarregar dados após atualização do setor
const isModalOpen = computed(() => store.state.modalData.isModalOpen);
const modalFunction = computed(() => store.state.modalData.modalFunction);
let modalWasOpen = false;

watch(isModalOpen, async (newValue, oldValue) => {
  
  if (oldValue === true && newValue === false && modalFunction.value === "UP") {
    console.log("🔄 Recarregando dados do setor após atualização...");
    await loadSetorDetails();
  }
});

onMounted(loadSetorDetails);

onUnmounted(() => {
  store.commit("clearPageHeader");
});
</script>

<template>
  <TemplateAdmin>
    <div class="px-6 py-6 w-full h-full flex flex-col gap-6">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex-1 flex items-center justify-center min-h-[400px]"
      >
        <div class="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p class="text-slate-500 font-medium animate-pulse">
            Carregando unidade...
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
                <span class="hidden sm:inline">Visão Geral</span>
              </TabsTrigger>

              <TabsTrigger
                v-if="!isSolicitante && setor.estoque"
                value="estoque"
                class="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 rounded-lg"
              >
                <BoxesIcon class="w-4 h-4" />
                <span class="hidden sm:inline">Estoque</span>
              </TabsTrigger>

              <TabsTrigger
                v-if="!isSolicitante"
                value="movimentacoes"
                class="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 rounded-lg"
              >
                <ArrowLeftRightIcon class="w-4 h-4" />
                <span class="hidden sm:inline">Movimentações</span>
              </TabsTrigger>

              <TabsTrigger
                v-if="
                  !isSolicitante &&
                  (!setor.fornecedores_relacionados ||
                    setor.fornecedores_relacionados.length === 0)
                "
                value="entrada"
                class="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 rounded-lg"
              >
                <DownloadIcon class="w-4 h-4" />
                <span class="hidden sm:inline">Entrada</span>
              </TabsTrigger>

              <TabsTrigger
                v-if="!isSolicitante && isAdminUser"
                value="usuarios"
                class="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 rounded-lg"
              >
                <UsersIcon class="w-4 h-4" />
                <span class="hidden sm:inline">Usuários</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div class="flex-1">
            <TabsContent value="overview" class="mt-0">
              <TabOverview
                :setor="setor"
                @navigate="changeTab"
                @editar-setor="editarSetor"
                @excluir-setor="showDeleteDialog = true"
              />
            </TabsContent>

            <TabsContent value="estoque" class="mt-0">
              <TabEstoque @reload-estoque="carregarDadosOperacionais" />
            </TabsContent>

            <TabsContent value="movimentacoes" class="mt-0">
              <TabMovimentacoes :setorId="setor.id" />
            </TabsContent>

            <TabsContent value="entrada" class="mt-0">
              <TabEntrada
                :setorId="setor.id"
                @reload-estoque="carregarDadosOperacionais"
              />
            </TabsContent>

            <TabsContent value="usuarios" class="mt-0">
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
          Não foi possível carregar os detalhes desta unidade. Por favor,
          verifique se você tem permissão de acesso.
        </p>
        <Button @click="router.push('/setores')" variant="outline" class="mt-6">
          Voltar para Lista de Setores
        </Button>
      </div>

      <!-- Modals -->
      <ModalSetor :functions="functionsSetor" />

      <AlertDialog
        :open="showDeleteDialog"
        @update:open="showDeleteDialog = $event"
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o setor "{{ setor.nome }}"? Esta
              ação não pode ser desfeita e removerá todos os dados vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              @click="confirmarExclusaoSetor"
              class="bg-destructive text-white hover:bg-destructive/90"
            >
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </TemplateAdmin>
</template>

<style scoped>
/* Transições de conteúdo das abas */
.tabs-content {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
