<template>
  <header class="flex justify-between items-center bg-white p-4 shadow-md">
    <h2 class="text-xl font-semibold text-azul-eclipse ml-2">{{ headerTitle }}</h2>
    <div class="flex items-center space-x-4">
      <div class="text-right">
        <p class="font-bold text-azul-eclipse">{{ userName }}</p>
        <p class="text-sm text-azul-eclipse">{{ userRole }}</p>
      </div>
      <!-- Importa e usa o botão de logout -->
      <LogoutButton />
    </div>
  </header>
</template>

<script>
import LogoutButton from '../LogoutButton.vue';

export default {
  name: 'Header',
  components: {
    LogoutButton,
  },
  props: {
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
  },
  methods: {
    headerTitle() {
      return this.$route.meta.title || '';
    }
  },
  computed: {
    headerTitle() {
      switch (this.$route.name) {
        case 'dashboard':
          return 'Dashboard';
        case 'users':
          return 'Usuários';
        case 'tipos_usuario':
          return 'Tipos de Usuário';
        case 'unidades':
          return 'Unidades';
        case 'produtos':
          return 'Produtos';
        default:
          return '';
      }
    }
  }
};
</script>
