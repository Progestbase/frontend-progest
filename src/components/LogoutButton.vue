<template>
  <div class="dropdown-menu-container">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="icon" class="h-9 w-9">
          <i class="mdi mdi-dots-vertical text-xl"></i>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-64">
        <!-- Mini Header with User Info -->
        <div
          class="px-4 py-3 bg-slate-50 rounded-t-lg border-b border-slate-200"
        >
          <p class="font-semibold text-slate-900 text-sm m-0">{{ userName }}</p>

          <p class="text-xs text-slate-500 m-0">
            {{ userEmail }} | {{ userRoleLabel }}
          </p>
        </div>

        <DropdownMenuSeparator class="my-2" />

        <DropdownMenuItem @click="exitSetor" class="cursor-pointer">
          <i class="mdi mdi-door-open mr-2"></i>
          <span>Trocar de Setor</span>
        </DropdownMenuItem>

        <DropdownMenuItem @click="logout" class="cursor-pointer text-red-600">
          <i class="mdi mdi-logout mr-2"></i>
          <span>Sair da Conta</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { setorCookie } from "@/utils/setorCookie";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const router = useRouter();
const store = useStore();

const userName = computed(() => {
  return store.state.user?.name || "Usuário";
});

const userEmail = computed(() => {
  return store.state.user?.email || "email@exemplo.com";
});

const userRoleLabel = computed(() => {
  const role = store.state.user?.role || "user";
  const roleMap = {
    A: "Administrador",
    S: "Solicitante",
    admin: "Administrador",
    solicitante: "Solicitante",
  };
  return roleMap[role] || role;
});

const exitSetor = () => {
  // Limpar cookies do setor
  setorCookie.clearSector();

  // Limpar dados do setor no Vuex
  store.commit("clearSetorAtual");
  store.commit("clearSetorDetails");

  // Redirecionar para seleção de setor
  router.push("/setor-selection");
};

const logout = () => {
  // Remover autenticação
  store.commit("clearUserToken");
  store.commit("setUser", null);

  // Limpar dados do setor
  store.commit("clearSetorAtual");
  store.commit("clearSetorDetails");

  // Limpar cookies do setor
  setorCookie.clearSector();

  // Redirecionar para login
  router.push("/login");
};
</script>

<script>
export default {
  name: "LogoutButton",
};
</script>

<style scoped>
/* Estilos do shadcn/vue dropdown menu são aplicados automaticamente */
</style>
