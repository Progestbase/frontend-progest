import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import SetorSelectionView from "../views/SetorSelectionView.vue";
import HistoricoDePedidosView from "@/views/roleSolicitante/HistoricoDePedidosView.vue";
import SetorAtualView from "@/views/SetorAtualView.vue";
import { setorCookie } from "@/utils/setorCookie";
import axios from "axios";
import store from "@/vuex/store";

// cadastros
import Home from "@/views/Home.vue";
import About from "@/views/About.vue";
import Users from "../views/cadastros/Users.vue";
import Setores from "../views/cadastros/Setores.vue";
import SetorDetalhes from "../views/cadastros/SetorDetalhes.vue";
import Produtos from "../views/cadastros/Produtos.vue";
import UnidadesMedida from "../views/cadastros/UnidadesMedida.vue";
import Fornecedores from "../views/cadastros/Fornecedores.vue";
import GrupoProduto from "../views/cadastros/GrupoProduto.vue";
import Polos from "../views/cadastros/Polos.vue";
import Perfis from "../views/cadastros/Perfis.vue";
import CategoriasProdutos from "../views/cadastros/CategoriasProdutos.vue";
import Estoque from "@/views/cadastros/Estoque.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/register",
      name: "register",
      component: Register,
    },
    {
      path: "/setor-selection",
      name: "setorSelection",
      component: SetorSelectionView,
      meta: { requiresAuth: true, requiresSector: false },
    },
    {
      path: "/home",
      name: "home",
      component: Home,
    },
    {
      path: "/about",
      name: "about",
      component: About,
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardView,
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/setor-atual",
      name: "setorAtual",
      component: SetorAtualView,
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/users",
      name: "users",
      component: Users,
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/setores",
      name: "setores",
      component: Setores,
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/setor/:id",
      name: "setorDetalhes",
      component: SetorDetalhes,
      meta: { requiresAuth: true, requiresSector: true },
      props: true,
    },
    {
      path: "/perfis",
      name: "perfis",
      component: Perfis,
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/produtos",
      name: "produtos",
      component: Produtos,
      meta: { requiresAuth: true, requiresSector: true },
    },
    /* categoriasProdutos removed in favor of grupoProduto */
    {
      path: "/grupoProduto",
      name: "grupoProduto",
      component: GrupoProduto,
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/unidadesMedida",
      name: "unidadesMedida",
      component: UnidadesMedida,
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/fornecedores",
      name: "fornecedores",
      component: Fornecedores,
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/unidades",
      name: "unidades",
      component: Polos,
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/historico",
      name: "historico",
      component: HistoricoDePedidosView,
      meta: { requiresAuth: true, requiresSector: true },
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: (to) => {
        const isAuthenticated = localStorage.getItem("token");
        return isAuthenticated ? "/dashboard" : "/login";
      },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const isAuthenticated = localStorage.getItem("token");
  const hasSector = setorCookie.hasSector();

  // Se a rota requer autenticação e não está autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    setorCookie.clearSector();
    next("/login");
    return;
  }

  // Se está autenticado e tenta acessar login/register, redirecionar para seleção de setor ou dashboard
  if (isAuthenticated && (to.path === "/login" || to.path === "/register")) {
    next(hasSector ? "/dashboard" : "/setor-selection");
    return;
  }

  // Se a rota requer setor selecionado e não tem
  if (to.meta.requiresSector && !hasSector) {
    next("/setor-selection");
    return;
  }

  // Se não está autenticado e tenta fazer logout (limpar cookies)
  if (!isAuthenticated && hasSector) {
    setorCookie.clearSector();
  }

  // ✅ Carregar detalhes do setor se necessário
  if (to.meta.requiresSector && hasSector && isAuthenticated) {
    try {
      const setorId = setorCookie.getSectorId();
      const setorNome = setorCookie.getSectorName();

      // Restaurar estado do setor a partir dos cookies
      if (setorId && setorNome) {
        store.commit("setSetorAtual", {
          id: setorId,
          nome: setorNome,
        });
      }

      // Só carrega detalhes se não tem ou se é um setor diferente
      if (
        setorId &&
        (!store.state.setorDetails || store.state.setorDetails.id != setorId)
      ) {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "/setores/getDetail",
          { id: setorId },
          {
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.status) {
          store.commit("setSetorDetails", response.data.data);
        }
      }
    } catch (error) {
      console.warn("Aviso: não foi possível carregar detalhes do setor");
    }
  }

  next();
});

export default router;
