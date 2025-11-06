<template>
  <header class="bg-white border-b border-slate-200 shadow-sm">
    <div class="flex justify-between items-center px-6 py-3">
      <!-- Left Side: Page Title -->
      <div class="flex items-center gap-4">
        <!-- Page Title -->
        <h2 class="text-2xl font-bold text-slate-900">
          <span v-if="$route.name === 'setorDetalhes'">
            <router-link
              to="/setores"
              class="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              <span class="material-icons text-xl">arrow_back</span>
              <span>Setores</span>
            </router-link>
            <span class="text-slate-400 mx-2">/</span>
            <span class="text-slate-700">{{ unidadeNomeAtual }}</span>
          </span>
          <span v-else>{{ headerTitle }}</span>
        </h2>
      </div>

      <!-- Right Side: User Info + Logout -->
      <div class="flex items-center gap-6">
        <!-- Current Setor Badge with Details -->
        <div
          v-if="setorAtual"
          class="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:shadow-md transition-shadow"
          :title="`Setor: ${setorDetalhes?.nome}\nUnidade: ${setorDetalhes?.unidade?.nome}\nDescrição: ${setorDetalhes?.descricao}`"
        >
          <span class="material-icons text-blue-600 text-lg">apartment</span>
          <div class="flex flex-col">
            <span
              class="text-xs text-blue-600 font-semibold uppercase tracking-wide"
            >
              {{ setorDetalhes?.unidade?.nome || "Unidade" }}
            </span>
            <span class="text-sm font-medium text-blue-900">
              {{ setorDetalhes?.nome }}
            </span>
          </div>
        </div>

        <!-- Logout Button (Dropdown) -->
        <LogoutButton />
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import LogoutButton from "../LogoutButton.vue";

const route = useRoute();
const store = useStore();

const setorAtual = computed(() => {
  return store.state.setorAtualNome || "Carregando...";
});

const headerTitle = computed(() => {
  const titleMap = {
    dashboard: "Dashboard",
    users: "Usuários",
    tiposUsuario: "Tipos de Usuário",
    setores: "Setores",
    setorDetalhes: "Detalhes do Setor",
    produtos: "Produtos",
    grupoProduto: "Grupos de Produtos",
    unidadesMedida: "Unidades de Medida",
    unidades: "Unidades",
    polos: "Unidades",
    estoques: "Estoques",
    fornecedores: "Fornecedores",
  };
  return titleMap[route.name] || "Sistema ProGest";
});

const unidadeNomeAtual = computed(() => {
  return store.state.setorAtualNome || "Carregando...";
});

const setorDetalhes = computed(() => {
  return store.state.setorDetails || null;
});
</script>

<style scoped>
.mdi {
  font-family: "Material Design Icons";
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
