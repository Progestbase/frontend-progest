<template>
  <TemplateAdmin>
    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid">
          <div class="row">
            <div class="col-12">
              <!-- Tabs Navigation -->
              <ul
                class="nav nav-tabs nav-tabs-custom nav-justified"
                role="tablist"
              >
                <li class="nav-item">
                  <a
                    class="nav-link"
                    :class="{ active: activeTab === 'itens' }"
                    @click="changeTab('itens')"
                    href="#"
                  >
                    <span class="d-block d-sm-none"
                      ><i class="fas fa-search"></i
                    ></span>
                    <span class="d-none d-sm-block">Buscar Itens</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a
                    class="nav-link"
                    :class="{ active: activeTab === 'historico' }"
                    @click="changeTab('historico')"
                    href="#"
                  >
                    <span class="d-block d-sm-none"
                      ><i class="fas fa-history"></i
                    ></span>
                    <span class="d-none d-sm-block">Histórico de Pedidos</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a
                    class="nav-link"
                    :class="{ active: activeTab === 'pedido' }"
                    @click="changeTab('pedido')"
                    href="#"
                  >
                    <span class="d-block d-sm-none"
                      ><i class="fas fa-shopping-cart"></i
                    ></span>
                    <span class="d-none d-sm-block">Finalizar Pedido</span>
                  </a>
                </li>
              </ul>

              <!-- Tab Content -->
              <div class="tab-content p-3 text-muted">
                <!-- Itens Tab -->
                <div v-show="activeTab === 'itens'">
                  <ProductSearch />
                </div>

                <!-- Histórico Tab -->
                <div v-if="activeTab === 'historico'">
                  <HistoricoPedidos />
                </div>

                <!-- Pedido Tab -->
                <div v-show="activeTab === 'pedido'">
                  <FinalizarPedidoTab />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </TemplateAdmin>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ProductSearch from "@/components/roleSolicitante/ProductSearch.vue";
import HistoricoPedidos from "@/components/roleSolicitante/HistoricoPedidos.vue";
import FinalizarPedidoTab from "@/components/roleSolicitante/FinalizarPedidoTab.vue";

export default {
  name: "ItensView",
  components: {
    TemplateAdmin,
    ProductSearch,
    HistoricoPedidos,
    FinalizarPedidoTab,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const activeTab = ref("itens");

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
      const allowed = ["itens", "historico", "pedido"];
      if (!tab || typeof tab !== "string") return "itens";
      return allowed.includes(tab) ? tab : "itens";
    };

    const initTabFromRoute = () => {
      const queryTab = route.query?.tab;
      activeTab.value = normalizeTab(queryTab);

      // garantir que a URL contenha o param
      try {
        window.history.replaceState(
          {},
          "",
          `${route.path}?tab=${activeTab.value}`
        );
      } catch (e) {
        /* ignore */
      }
    };

    onMounted(() => {
      initTabFromRoute();
    });

    // Watch para mudanças na query da rota
    watch(
      () => route.query.tab,
      (newTab) => {
        if (newTab && normalizeTab(newTab) !== activeTab.value) {
          activeTab.value = normalizeTab(newTab);
        }
      }
    );

    return {
      activeTab,
      changeTab,
    };
  },
};
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
