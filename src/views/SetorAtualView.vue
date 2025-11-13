<template>
  <TemplateAdmin>
    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid">
          <div class="row">
            <div class="col-12">
              <!-- Loading -->
              <div
                v-if="loading"
                class="w-full min-h-[400px] flex items-center justify-center"
              >
                <LoadingSpinner size="lg" />
              </div>

              <!-- Conteúdo -->
              <div v-else-if="setor.id">
                <div>
                  <!-- Tabs Navigation -->
                  <ul
                    class="nav nav-tabs nav-tabs-custom nav-justified"
                    role="tablist"
                  >
                    <li class="nav-item">
                      <a
                        class="nav-link"
                        :class="{ active: activeTab === 'overview' }"
                        @click="changeTab('overview')"
                        href="#"
                      >
                        <span class="d-block d-sm-none"
                          ><i class="fas fa-info-circle"></i
                        ></span>
                        <span class="d-none d-sm-block"> Visão Geral</span>
                      </a>
                    </li>
                    <li class="nav-item" v-if="!isSolicitante && setor.estoque">
                      <a
                        class="nav-link"
                        :class="{ active: activeTab === 'estoque' }"
                        @click="changeTab('estoque')"
                        href="#"
                      >
                        <span class="d-block d-sm-none"
                          ><i class="fas fa-boxes"></i
                        ></span>
                        <span class="d-none d-sm-block">Estoque</span>
                      </a>
                    </li>
                    <li class="nav-item" v-if="!isSolicitante">
                      <a
                        class="nav-link"
                        :class="{ active: activeTab === 'movimentacoes' }"
                        @click="changeTab('movimentacoes')"
                        href="#"
                      >
                        <span class="d-block d-sm-none"
                          ><i class="mdi mdi-swap-horizontal"></i
                        ></span>
                        <span class="d-none d-sm-block">Movimentações</span>
                      </a>
                    </li>
                    <li
                      class="nav-item"
                      v-if="
                        !isSolicitante &&
                        (!setor.fornecedores_relacionados ||
                          setor.fornecedores_relacionados.length === 0)
                      "
                    >
                      <a
                        class="nav-link"
                        :class="{ active: activeTab === 'entrada' }"
                        @click="changeTab('entrada')"
                        href="#"
                      >
                        <span class="d-block d-sm-none"
                          ><i class="mdi mdi-tray-arrow-down"></i
                        ></span>
                        <span class="d-none d-sm-block">Entrada</span>
                      </a>
                    </li>
                    <li class="nav-item" v-if="!isSolicitante && isAdminUser">
                      <a
                        class="nav-link"
                        :class="{ active: activeTab === 'usuarios' }"
                        @click="changeTab('usuarios')"
                        href="#"
                      >
                        <span class="d-block d-sm-none"
                          ><i class="mdi mdi-account-multiple"></i
                        ></span>
                        <span class="d-none d-sm-block">Usuários</span>
                      </a>
                    </li>
                  </ul>

                  <!-- Tab Content -->
                  <div class="tab-content p-3 text-muted">
                    <!-- Overview Tab -->
                    <div v-show="activeTab === 'overview'">
                      <TabOverview
                        :setor="setor"
                        @navigate="changeTab"
                        @editar-setor="editarSetor"
                        @excluir-setor="excluirSetor"
                      />
                    </div>

                    <!-- Estoque Tab -->
                    <div v-show="activeTab === 'estoque'">
                      <TabEstoque @reload-estoque="carregarDadosEstoque" />
                    </div>

                    <!-- Movimentações Tab -->
                    <div v-show="activeTab === 'movimentacoes'">
                      <TabMovimentacoes :setorId="setor.id" />
                    </div>

                    <!-- Entrada Tab -->
                    <div
                      v-if="
                        !setor.fornecedores_relacionados ||
                        setor.fornecedores_relacionados.length === 0
                      "
                      v-show="activeTab === 'entrada'"
                    >
                      <TabEntrada
                        :setorId="setor.id"
                        @reload-estoque="carregarDadosEstoque"
                      />
                    </div>

                    <!-- Usuários Tab -->
                    <div v-if="isAdminUser" v-show="activeTab === 'usuarios'">
                      <TabUsuarios :setorId="setor.id" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Setor não encontrado -->
              <div v-else class="alert alert-warning">
                <i class="mdi mdi-alert-outline me-2"></i>
                Setor não encontrado. Por favor, selecione um setor válido.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Setor -->
    <ModalSetor
      :open="modalSetorOpen"
      @update:open="modalSetorOpen = $event"
      :functions="functionsSetor"
      title="Editar Setor"
      :initialData="setor"
    />

    <!-- Alert Dialog de Confirmação de Exclusão -->
    <AlertDialog
      :open="showDeleteDialog"
      @update:open="showDeleteDialog = $event"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o setor "{{ setor.nome }}"? Esta ação
            não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            @click="confirmarExclusaoSetor"
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </TemplateAdmin>
</template>

<script setup>
import { ref, onMounted, provide, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import TabOverview from "@/components/setorAtual/TabOverview.vue";
import TabEstoque from "@/components/setorAtual/TabEstoque.vue";
import TabMovimentacoes from "@/components/setorAtual/TabMovimentacoes.vue";
import TabEntrada from "@/components/setorAtual/TabEntrada.vue";
import TabUsuarios from "@/components/setorAtual/TabUsuarios.vue";
import ModalSetor from "@/components/cadastros/ModalSetor.vue";

// Importar functions para carregar dados
import functionsEstoque from "@/functions/cad_estoque";
import functionsMovimentacao from "@/functions/cad_movimentacao";
import functionsEntrada from "@/functions/cad_entradas";
import functionsSetor from "@/functions/cad_setores";

// Importar Bootstrap para usar o Modal
import "bootstrap/dist/js/bootstrap.bundle.min";
import functionsUsuarioSetor from "@/functions/cad_usuario_setor";

import axios from "axios";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const route = useRoute();
const store = useStore();

const setor = ref({});
const loading = ref(true);
const activeTab = ref("overview");
const showDeleteDialog = ref(false);

// Verificar se o usuário logado é admin deste setor (verifica vínculo usuario_setor carregado em usuariosItems)
// E não é almoxarife
const isAdminUser = computed(() => {
  const user = store.state.user;
  if (!user) return false;

  // Super-admin por email sempre tem acesso
  try {
    if (user.email && user.email.toLowerCase() === "admin@admin.com")
      return true;
  } catch (e) {
    /* ignore */
  }

  try {
    // usuariosItems é um ref preenchido por cad_usuario_setor.listAll
    const list = usuariosItems?.value || [];
    const found = list.find((u) => {
      // Vários formatos possíveis retornados pela API
      const userId =
        u.usuario_id || u.user_id || u.id || (u.usuario && u.usuario.id);
      const perfil = (u.perfil || (u.pivot && u.pivot.perfil) || "")
        .toString()
        .toLowerCase();
      return (
        userId === user.id &&
        (perfil === "admin" ||
          perfil.includes("admin") ||
          perfil === "administrador")
      );
    });

    if (found) {
      // Verificar se também não é almoxarife
      const perfilAlmoxarife = list.find((u) => {
        const userId =
          u.usuario_id || u.user_id || u.id || (u.usuario && u.usuario.id);
        const perfil = (u.perfil || (u.pivot && u.pivot.perfil) || "")
          .toString()
          .toLowerCase();
        return userId === user.id && perfil === "almoxarife";
      });
      return !perfilAlmoxarife; // Só é admin se não for almoxarife
    }
  } catch (e) {
    console.warn("Erro ao avaliar isAdminUser:", e);
  }

  // Fallback: se o objeto user tiver flag is_admin ou role global
  if (
    user.is_admin ||
    (user.roles && user.roles.includes && user.roles.includes("admin"))
  )
    return true;

  return false;
});

// Verificar se o usuário possui perfil 'solicitante' no setor atual
const isSolicitante = computed(() => {
  const user = store.state.user;
  if (!user) return false;

  try {
    const list = usuariosItems?.value || [];
    const found = list.find((u) => {
      const userId =
        u.usuario_id || u.user_id || u.id || (u.usuario && u.usuario.id);
      const perfil = (u.perfil || (u.pivot && u.pivot.perfil) || "")
        .toString()
        .toLowerCase();
      return (
        userId === user.id &&
        (perfil === "solicitante" || perfil.includes("solicitante"))
      );
    });
    if (found) return true;
  } catch (e) {
    console.warn("Erro ao avaliar isSolicitante:", e);
  }

  if (
    (user.roles && user.roles.includes && user.roles.includes("solicitante")) ||
    (user.perfil &&
      user.perfil.toString().toLowerCase().includes("solicitante"))
  )
    return true;

  return false;
});

// Se o usuário se tornar solicitante garantir que a tab ativa volte para overview
import { watch } from "vue";
watch(isSolicitante, (val) => {
  if (val) activeTab.value = "overview";
});

// ✅ NOVO: Propriedades de dados que as funções vão preencher
const estoqueItems = ref([]);
const resumoEstoque = ref({});
const setorEstoque = ref({});
const movimentacoesItems = ref([]);
const entradasItems = ref([]);
const usuariosItems = ref([]);

// Modal do setor
const modalSetorOpen = ref(false);

// ✅ NOVO: Provide esses dados para as abas filhas
provide("setorAtualData", {
  estoqueItems,
  resumoEstoque,
  setorEstoque,
  movimentacoesItems,
  entradasItems,
  usuariosItems,
});

// ✅ NOVO: Provide o contexto para uso nas tabs (especialmente para operações como delete)
const setorAtualContext = {
  $axios: axios,
  $store: store,
  $toastr: undefined,
};

provide("setorAtualContext", setorAtualContext);

const changeTab = (tab) => {
  const normalized = normalizeTab(tab);
  activeTab.value = normalized;

  // Atualizar URL mantendo outros query params
  try {
    window.history.replaceState({}, "", `${route.path}?tab=${normalized}`);
  } catch (e) {
    console.warn("Não foi possível atualizar a URL com a tab:", e);
  }
};

const normalizeTab = (tab) => {
  const allowed = [
    "overview",
    "estoque",
    "movimentacoes",
    "entrada",
    "usuarios",
  ];
  if (!tab || typeof tab !== "string") return "overview";
  return allowed.includes(tab) ? tab : "overview";
};

const initTabFromRoute = () => {
  const queryTab = route.query?.tab;
  activeTab.value = normalizeTab(queryTab);

  // garantir que a URL contenha o param
  try {
    window.history.replaceState({}, "", `${route.path}?tab=${activeTab.value}`);
  } catch (e) {
    /* ignore */
  }
};

// Função para editar setor
const editarSetor = () => {
  console.log("🔄 Abrindo modal de edição do setor");

  // Preparar dados do modal
  store.commit("setModalData", {
    modalTitle: "Editar Setor",
    modalData: { ...setor.value },
    modalFunction: "UP",
  });

  console.log("📝 Título definido no store:", store.state.modalData.modalTitle);

  // Abrir modal usando variável reativa
  modalSetorOpen.value = true;
  console.log("✅ Modal aberto via variável reativa");
};

// Função para excluir setor
const excluirSetor = () => {
  showDeleteDialog.value = true;
};

// Função para confirmar e executar a exclusão
const confirmarExclusaoSetor = async () => {
  try {
    console.log("Excluindo setor:", setor.value.id);
    // Implementar lógica de exclusão
    // Aqui você pode chamar a função de exclusão do setor
    showDeleteDialog.value = false;
  } catch (error) {
    console.error("Erro ao excluir setor:", error);
  }
};

/**
 * Carrega os dados do setor (estoque, movimentações, entradas, usuários)
 */
const carregarDadosDoSetor = async () => {
  try {
    console.log("📥 Iniciando carregamento dos dados do setor...");

    if (!setor.value.id) {
      console.warn("⚠️ Setor sem ID, não é possível carregar dados");
      return;
    }

    // ✅ NOVO: Contexto com as propriedades ref que as funções vão preencher
    const context = {
      $axios: axios,
      $store: store,
      $toastr: undefined,
      modalData: {},
      // ✅ Adicionar as refs para que as funções preencham
      estoqueData: {},
      estoqueItems: estoqueItems,
      resumoEstoque: resumoEstoque,
      setorEstoque: setorEstoque,
      movimentacoesItems: movimentacoesItems,
      entradasItems: entradasItems,
      usuariosItems: usuariosItems,
      loading: false,
      error: null,
    };

    // Carregar estoque do setor
    if (setor.value.estoque) {
      console.log("📦 Carregando estoque...");
      try {
        await functionsEstoque.listAll(context);
        console.log("✓ Estoque carregado:", estoqueItems.value.length, "itens");
      } catch (err) {
        console.error("❌ Erro ao carregar estoque:", err);
      }
    }

    // Delay para evitar rate limiting
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Carregar movimentações do setor
    console.log("🔄 Carregando movimentações...");
    try {
      await functionsMovimentacao.listAll(context);
      console.log(
        "✓ Movimentações carregadas:",
        movimentacoesItems.value.length,
        "itens"
      );
    } catch (err) {
      console.error("❌ Erro ao carregar movimentações:", err);
    }

    // Delay para evitar rate limiting
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Carregar entradas do setor
    console.log("📥 Carregando entradas...");
    try {
      await functionsEntrada.listAll(context);
      console.log(
        "✓ Entradas carregadas:",
        entradasItems.value.length,
        "itens"
      );
    } catch (err) {
      console.error("❌ Erro ao carregar entradas:", err);
    }

    // Delay para evitar rate limiting
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Carregar usuários do setor (se função existir)
    console.log("👥 Carregando usuários do setor...");
    try {
      if (functionsUsuarioSetor && functionsUsuarioSetor.listAll) {
        await functionsUsuarioSetor.listAll(context);
        console.log(
          "✓ Usuários carregados:",
          usuariosItems.value.length,
          "itens"
        );
      }
    } catch (err) {
      console.warn("⚠️ Erro ao carregar usuários do setor:", err);
    }

    console.log("✅ Todos os dados do setor foram carregados!");
  } catch (error) {
    console.error("❌ Erro geral ao carregar dados do setor:", error);
  }
};

const carregarDadosEstoque = async () => {
  try {
    console.log("🔄 Recarregando dados do estoque...");

    if (!setor.value.id || !setor.value.estoque) {
      console.warn("⚠️ Setor sem ID ou sem permissão de estoque");
      return;
    }

    // Contexto para carregar apenas o estoque
    const context = {
      $axios: axios,
      $store: store,
      $toastr: undefined,
      modalData: {},
      estoqueData: {},
      estoqueItems: estoqueItems,
      resumoEstoque: resumoEstoque,
      setorEstoque: setorEstoque,
      loading: false,
      error: null,
    };

    // Recarregar apenas o estoque
    await functionsEstoque.listAll(context);
    console.log("✓ Estoque recarregado:", estoqueItems.value.length, "itens");
  } catch (error) {
    console.error("❌ Erro ao recarregar estoque:", error);
  }
};

const loadSetorDetails = async () => {
  try {
    // Obter setor dos detalhes do store
    const details = store.state.setorDetails;

    if (details && details.id) {
      setor.value = details;
      console.log("✓ Detalhes do setor carregados:", details.nome);

      // Após carregar detalhes, carregar dados operacionais
      await carregarDadosDoSetor();
    } else {
      console.warn("Detalhes do setor não encontrados no store");
    }

    loading.value = false;
    initTabFromRoute();
  } catch (error) {
    console.error("Erro ao carregar detalhes do setor:", error);
    loading.value = false;
  }
};

onMounted(() => {
  console.log("📱 SetorAtualView montado");
  loadSetorDetails();
});
</script>

<style scoped>
.nav-tabs-custom {
  border-bottom: 2px solid #e9ecef;
}

.nav-tabs-custom .nav-link {
  color: #495057;
  border: none;
  border-bottom: 3px solid transparent;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-tabs-custom .nav-link:hover {
  color: #007bff;
  border-bottom-color: #e9ecef;
}

.nav-tabs-custom .nav-link.active {
  color: #007bff;
  background-color: transparent;
  border-bottom-color: #007bff;
}

.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
