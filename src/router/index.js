import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import HistoricoDePedidosView from "@/views/roleSolicitante/HistoricoDePedidosView.vue";

// cadastros
import Home from "@/views/Home.vue";
import About from "@/views/About.vue";
import Users from "../views/cadastros/Users.vue";
import Unidades from "../views/cadastros/Unidades.vue";
import UnidadeDetalhes from "../views/cadastros/UnidadeDetalhes.vue";
import Produtos from "../views/cadastros/Produtos.vue";
import UnidadesMedida from "../views/cadastros/UnidadesMedida.vue";
import Fornecedores from "../views/cadastros/Fornecedores.vue";
import GrupoProduto from "../views/cadastros/GrupoProduto.vue";
import Polos from "../views/cadastros/Polos.vue";
import Perfis from "../views/cadastros/Perfis.vue";
import CategoriasProdutos from "../views/cadastros/CategoriasProdutos.vue";
import Estoque from "@/views/cadastros/Estoque.vue";
import EstoqueUnidade from "@/views/cadastros/EstoqueUnidade.vue";

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
      meta: { requiresAuth: true },
    },
    {
      path: "/users",
      name: "users",
      component: Users,
      meta: { requiresAuth: true },
    },
    {
      path: "/unidades",
      name: "unidades",
      component: Unidades,
      meta: { requiresAuth: true },
    },
    {
      path: "/unidade/:id",
      name: "unidadeDetalhes",
      component: UnidadeDetalhes,
      meta: { requiresAuth: true },
      props: true,
    },
    {
      path: "/perfis",
      name: "perfis",
      component: Perfis,
      meta: { requiresAuth: true },
    },
    {
      path: "/produtos",
      name: "produtos",
      component: Produtos,
      meta: { requiresAuth: true },
    },
    /* categoriasProdutos removed in favor of grupoProduto */
    {
      path: "/grupoProduto",
      name: "grupoProduto",
      component: GrupoProduto,
      meta: { requiresAuth: true },
    },
    {
      path: "/unidadesMedida",
      name: "unidadesMedida",
      component: UnidadesMedida,
      meta: { requiresAuth: true },
    },
    {
      path: "/fornecedores",
      name: "fornecedores",
      component: Fornecedores,
      meta: { requiresAuth: true },
    },
    {
      path: "/polos",
      name: "polos",
      component: Polos,
      meta: { requiresAuth: true },
    },
    {
      path: "/historico",
      name: "historico",
      component: HistoricoDePedidosView,
      meta: { requiresAuth: true }, // Rota protegida
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

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("token");
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else if (
    isAuthenticated &&
    (to.path === "/login" || to.path === "/register")
  ) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
