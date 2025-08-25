import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '@/views/DashboardView.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import HistoricoDePedidosView from '@/views/roleSolicitante/HistoricoDePedidosView.vue';

// cadastros
import Home from '@/views/Home.vue';
import About from '@/views/About.vue';
import Users from '../views/cadastros/Users.vue';
import TiposUsuario from '../views/cadastros/TiposUsuario.vue';
import Unidades from '../views/cadastros/Unidades.vue';
import Produtos from '../views/cadastros/Produtos.vue';
import CategoriasProdutos from '../views/cadastros/CategoriasProdutos.vue';
import UnidadesMedida from '../views/cadastros/UnidadesMedida.vue';
import Fornecedores from '../views/cadastros/Fornecedores.vue';
import Estoque from '../views/cadastros/Estoque.vue';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }, // Rota protegida
    },
    {
      path: '/users',
      name: 'users',
      component: Users,
      meta: { requiresAuth: true},
    },
    {
      path: '/tiposUsuario',
      name: 'tiposUsuario',
      component: TiposUsuario,
      meta: {requiresAuth: true},
    },
    {
      path: '/unidades',
      name: 'unidades',
      component: Unidades,
      meta: { requireAuth: true },
    },    
    {
      path: '/produtos',
      name: 'produtos',
      component: Produtos,
      meta: { requiresAuth: true }, // Rota protegida
    },
    {
      path: '/categoriasProdutos',
      name: 'categoriasProdutos',
      component: CategoriasProdutos,
      meta: { requiresAuth: true }, // Rota protegida
    },
    {
      path: '/unidadesMedida',
      name: 'unidadesMedida',
      component: UnidadesMedida,
      meta: { requiresAuth: true }, // Rota protegida
    },
    {
      path: '/fornecedores',
      name: 'fornecedores',
      component: Fornecedores,
      meta: { requiresAuth: true }, // Rota protegida
    },
    {
      path: '/historico',
      name: 'historico',
      component: HistoricoDePedidosView,
      meta: { requiresAuth: true }, // Rota protegida
    },
    {
      path: '/estoque',
      name: 'estoque',
      component: Estoque,
      meta: { requiresAuth: true }, // Rota protegida
    },
    /*
    {
      path: '/users',
      name: 'users',
      component: Users,
      meta: { requiresAuth: true }, // Rota protegida
    },
    */
    {
      path: '/:pathMatch(.*)*', // Rota genérica para qualquer caminho não definido
      redirect: (to) => {
        const isAuthenticated = localStorage.getItem('token'); // Verifica se há um token
        return isAuthenticated ? '/dashboard' : '/login'; // Decide para onde redirecionar
      },
    },
  ],
});

// Verificação antes de cada navegação
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token'); // Verifica se há um token no localStorage

  // Se o usuário não está autenticado e tenta acessar uma rota protegida
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login'); // Redireciona para login
  } else if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    next('/dashboard'); // Redireciona para dashboard se já estiver autenticado
  } else {
    next(); // Permite a navegação
  }
});

export default router;
