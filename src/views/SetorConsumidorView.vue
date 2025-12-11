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
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Carregando...</span>
                </div>
              </div>

              <!-- Conteúdo -->
              <div v-else-if="setor.id">
                <div>
                  <div class="mb-4">
                    <h2 class="text-xl font-bold flex items-center gap-2">
                      <i class="mdi mdi-store-search text-primary"></i>
                      Visualizando: {{ setor.nome }}
                    </h2>
                    <p class="text-muted small mb-0">
                      Modo de visualização (Apenas Leitura)
                    </p>
                  </div>

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
                  </ul>

                  <!-- Tab Content -->
                  <div class="tab-content p-3 text-muted">
                    <!-- Overview Tab -->
                    <div v-show="activeTab === 'overview'">
                      <TabOverview
                        :setor="setor"
                        :readOnly="true"
                        @navigate="changeTab"
                      />
                    </div>

                    <!-- Estoque Tab -->
                    <div v-show="activeTab === 'estoque'">
                      <TabEstoque :readOnly="true" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Setor não encontrado -->
              <div v-else class="alert alert-warning">
                <i class="mdi mdi-alert-outline me-2"></i>
                Setor não encontrado.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </TemplateAdmin>
</template>

<script setup>
import { ref, onMounted, provide, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import TabOverview from "@/components/setorAtual/TabOverview.vue";
import TabEstoque from "@/components/setorAtual/TabEstoque.vue";

// Importar functions para carregar dados
import functionsEstoque from "@/functions/cad_estoque";
import functionsSetor from "@/functions/cad_setores";
import axios from "axios";

const route = useRoute();
const store = useStore();

const setor = ref({});
const loading = ref(true);
const activeTab = ref("overview");

// Dados compartilhados via provide
const estoqueItems = ref([]);
const resumoEstoque = ref({});
const setorEstoque = ref({});

provide("setorAtualData", {
  estoqueItems,
  resumoEstoque,
  setorEstoque,
  // Movimentações e entradas não são necessárias aqui, mas mantemos interface compatível se precisar
  movimentacoesItems: ref([]),
  entradasItems: ref([]),
  usuariosItems: ref([]),
});

// Contexto simplificado
const setorAtualContext = {
  $axios: axios,
  $store: store,
  $toastr: undefined,
};

provide("setorAtualContext", setorAtualContext);

const changeTab = (tab) => {
  if (tab === "overview" || tab === "estoque") {
    activeTab.value = tab;
  }
};

const carregarDadosDoSetor = async (setorId) => {
  try {
    loading.value = true;
    console.log(`📥 Carregando dados do setor consumidor ${setorId}...`);

    // 1. Buscar detalhes do setor
    const responseSetor = await functionsSetor.buscarSetorPorId(setorId);

    if (responseSetor.success) {
      setor.value = responseSetor.data;

      // 2. Carregar estoque se necessário
      if (setor.value.estoque) {
        const context = {
          $axios: axios,
          $store: store,
          $toastr: undefined,
          modalData: {},
          estoqueData: {},
          estoqueItems: estoqueItems, // ref
          resumoEstoque: resumoEstoque, // ref
          setorEstoque: setorEstoque, // ref
          loading: false,
          error: null,
        };

        try {
          // Usar a função de listar por unidade do cad_estoque
          // IMPORTANTE: Capturar o retorno pois functionsEstoque.listEstoqueUnidade sobrescreve a propriedade no contexto
          // em vez de atualizar o .value da ref, quebrando a reatividade se confiarmos apenas no context.
          const result = await functionsEstoque.listEstoqueUnidade(
            context,
            setorId
          );

          if (result && result.success && result.data) {
            const data = result.data;
            estoqueItems.value = data.estoque || [];
            resumoEstoque.value = data.resumo || {};
            setorEstoque.value = data.unidade || data.setor || {};
          }

          console.log(
            "Estoque carregado para setor consumidor (via retorno):",
            estoqueItems.value.length
          );
        } catch (e) {
          console.error("Erro ao carregar estoque do setor consumidor", e);
        }
      }
    } else {
      console.error("Erro ao buscar setor:", responseSetor.message);
    }
  } catch (error) {
    console.error("Erro geral ao carregar setor consumidor:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const setorId = route.params.id;
  if (setorId) {
    carregarDadosDoSetor(setorId);
  }
});

// Observar mudança de rota (caso navegue de um setor consumidor para outro)
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      carregarDadosDoSetor(newId);
      activeTab.value = "overview";
    }
  }
);
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
