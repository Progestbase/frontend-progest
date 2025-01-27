import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '@/views/DashboardView.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';

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
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }, // Rota protegida
    },
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
