<template>
  <header class="flex justify-between items-center bg-white p-4 shadow-md">
    <div class="flex items-center">
      <!-- Botão de toggle do menu -->
      <button
        class="menu-toggle-btn me-3"
        @click="$emit('toggleSidebar')"
        title="Expandir/Recolher Menu"
      >
        <span class="material-icons">menu</span>
      </button>

      <h2 class="text-xl font-semibold text-azul-eclipse">
        <span v-if="$route.name === 'setorDetalhes'">
          <router-link to="/setores" class="text-muted">
            <i class="mdi mdi-arrow-left me-1"></i>Setores
          </router-link>
          <span class="mx-2">/</span>
          {{ unidadeNomeAtual }}
        </span>
        <span v-else>{{ headerTitle }}</span>
      </h2>
    </div>
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
import LogoutButton from "../LogoutButton.vue";

export default {
  name: "Header",
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
  computed: {
    headerTitle() {
      switch (this.$route.name) {
        case "dashboard":
          return "Dashboard";
        case "users":
          return "Usuários";
        case "tiposUsuario":
          return "Tipos de Usuário";
        case "setores":
          return "Setores";
        case "setorDetalhes":
          return "Detalhes do Setor";
        case "produtos":
          return "Produtos";
        case "grupoProduto":
          return "Grupos de Produtos";
        case "unidadesMedida":
          return "Unidades de Medida";
        case "polos":
          return "Polos";
        case "estoques":
          return "Estoques";
        case "fornecedores":
          return "Fornecedores";

        default:
          return "";
      }
    },
    unidadeNomeAtual() {
      // Tenta buscar do store primeiro, senão usa um valor padrão
      return this.$store.state.setorAtual?.nome || "Carregando...";
    },
  },
};
</script>
