<template>
  <TemplateAdmin>
    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid">
          <div class="row">
            <div class="col-12">
              <!-- Loading -->
              <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Carregando...</span>
                </div>
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
                        <span class="d-none d-sm-block">Overview</span>
                      </a>
                    </li>
                    <li class="nav-item" v-if="setor.estoque">
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
                    <li class="nav-item">
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
                    <li class="nav-item">
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
                    <li class="nav-item">
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
                      <TabOverview :setor="setor" />
                    </div>

                    <!-- Estoque Tab -->
                    <div v-show="activeTab === 'estoque'">
                      <TabEstoque />
                    </div>

                    <!-- Movimentações Tab -->
                    <div v-show="activeTab === 'movimentacoes'">
                      <TabMovimentacoes :setorId="setor.id" />
                    </div>

                    <!-- Entrada Tab -->
                    <div v-show="activeTab === 'entrada'">
                      <TabEntrada :setorId="setor.id" />
                    </div>

                    <!-- Usuários Tab -->
                    <div v-show="activeTab === 'usuarios'">
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
  </TemplateAdmin>
</template>

<script setup>
import { ref, onMounted, provide } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import TabOverview from "@/components/setorAtual/TabOverview.vue";
import TabEstoque from "@/components/setorAtual/TabEstoque.vue";
import TabMovimentacoes from "@/components/setorAtual/TabMovimentacoes.vue";
import TabEntrada from "@/components/setorAtual/TabEntrada.vue";
import TabUsuarios from "@/components/setorAtual/TabUsuarios.vue";

// Importar functions para carregar dados
import functionsEstoque from "@/functions/cad_estoque";
import functionsMovimentacao from "@/functions/cad_movimentacao";
import functionsEntrada from "@/functions/cad_entradas";
import functionsUsuarioSetor from "@/functions/cad_usuario_setor";

import axios from "axios";

const route = useRoute();
const store = useStore();

const setor = ref({});
const loading = ref(true);
const activeTab = ref("overview");

// ✅ NOVO: Propriedades de dados que as funções vão preencher
const estoqueItems = ref([]);
const resumoEstoque = ref({});
const setorEstoque = ref({});
const movimentacoesItems = ref([]);
const entradasItems = ref([]);
const usuariosItems = ref([]);

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
