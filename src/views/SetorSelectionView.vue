<template>
  <div
    class="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800"
  >
    <!-- Botão de logout flutuante sempre visível como fallback -->
    <button
      @click="logout"
      class="fixed top-4 right-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md shadow-lg transition-colors z-50"
      title="Fazer logout"
    >
      Sair
    </button>

    <Card class="w-full max-w-md shadow-2xl border-0">
      <!-- Loading State -->
      <template v-if="loading">
        <CardHeader class="text-center">
          <CardTitle class="text-xl">Carregando...</CardTitle>
        </CardHeader>
        <CardContent
          class="w-full min-h-[300px] flex items-center justify-center"
        >
          <LoadingSpinner size="lg" />
        </CardContent>
      </template>

      <!-- Error State -->
      <template v-else-if="errorMessage">
        <CardHeader>
          <CardTitle class="text-red-600">Erro</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
          >
            <span class="mr-2">⚠️</span>{{ errorMessage }}
          </div>
          <div class="space-y-2">
            <Button @click="carregarSetores" class="w-full h-10">
              Tentar Novamente
            </Button>
            <Button @click="logout" variant="destructive" class="w-full h-10">
              Fazer Logout
            </Button>
          </div>
        </CardContent>
      </template>

      <!-- No Sectors Available -->
      <template v-else-if="setores.length === 0">
        <CardHeader>
          <CardTitle class="text-yellow-600">Nenhum Setor</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div
            class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md text-sm"
          >
            <span class="mr-2">⚠️</span>Você não tem acesso a nenhum setor no
            momento. Fale com o administrador para vincular um setor à sua
            conta.
          </div>
          <Button @click="logout" variant="destructive" class="w-full h-10">
            Fazer Logout
          </Button>
        </CardContent>
      </template>

      <!-- Sector Selection Form -->
      <template v-else>
        <CardHeader class="space-y-2">
          <CardTitle class="text-2xl font-bold text-center">
            Acesso ao Sistema
          </CardTitle>
          <CardDescription class="text-center">
            Selecione a unidade e o setor para continuar
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form @submit.prevent="selecionarSetor" class="space-y-6">
            <!-- Unidade Select -->
            <div class="space-y-2">
              <label
                for="unidade-select"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Unidade <span class="text-red-600">*</span>
              </label>
              <Select
                v-model="unidadeSelecionada"
                @update:modelValue="onUnidadeChange"
              >
                <SelectTrigger id="unidade-select" class="h-10">
                  <SelectValue placeholder="-- Selecione uma unidade --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem
                      v-for="unidade in unidades"
                      :key="unidade.id"
                      :value="unidade.id.toString()"
                    >
                      {{ unidade.nome }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <!-- Setor Select -->
            <div class="space-y-2">
              <label
                for="setor-select"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Setor <span class="text-red-600">*</span>
              </label>
              <Select
                v-model="setorSelecionado"
                :disabled="!unidadeSelecionada"
              >
                <SelectTrigger id="setor-select" class="h-10">
                  <SelectValue
                    :placeholder="
                      unidadeSelecionada
                        ? '-- Selecione um setor --'
                        : 'Selecione primeiro a unidade'
                    "
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem
                      v-for="setor in setoresFiltrados"
                      :key="setor.id"
                      :value="setor.id.toString()"
                    >
                      {{ setor.nome }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div v-if="erroValidacao" class="text-red-500 text-xs mt-1">
                {{ erroValidacao }}
              </div>
            </div>

            <!-- Setor Info Card -->
            <div
              v-if="setorSelecionado && getSetorSelecionado"
              class="bg-blue-50 border border-blue-200 rounded-md p-4"
            >
              <p class="text-sm text-gray-700">
                <strong>Unidade:</strong> {{ getSetorSelecionado.unidade.nome }}
              </p>
              <p class="text-sm text-gray-700 mt-1">
                <strong>Setor:</strong> {{ getSetorSelecionado.nome }}
              </p>
              <p
                v-if="getSetorSelecionado.descricao"
                class="text-sm text-gray-700 mt-2"
              >
                <strong>Descrição:</strong> {{ getSetorSelecionado.descricao }}
              </p>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4">
              <Button
                type="submit"
                class="flex-1 h-10"
                :disabled="!setorSelecionado || loadingEntrada"
              >
                {{ loadingEntrada ? "Entrando..." : "Entrar" }}
              </Button>
              <Button
                type="button"
                @click="logout"
                variant="outline"
                class="flex-1 h-10"
              >
                Sair
              </Button>
            </div>
          </form>
        </CardContent>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import axios from "axios";
import { setorCookie } from "@/utils/setorCookie";
import functions from "@/functions/cad_setores";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const router = useRouter();
const store = useStore();

const setores = ref([]);
const unidadeSelecionada = ref("");
const setorSelecionado = ref("");
const loading = ref(true);
const loadingEntrada = ref(false);
const errorMessage = ref("");
const erroValidacao = ref("");

const unidades = computed(() => {
  const map = new Map();
  setores.value.forEach((s) => {
    if (s.unidade && !map.has(s.unidade.id)) {
      map.set(s.unidade.id, s.unidade);
    }
  });
  return Array.from(map.values()).sort((a, b) => a.nome.localeCompare(b.nome));
});

const setoresFiltrados = computed(() => {
  if (!unidadeSelecionada.value) return [];
  return setores.value
    .filter((s) => s.unidade_id == unidadeSelecionada.value)
    .sort((a, b) => a.nome.localeCompare(b.nome));
});

const onUnidadeChange = () => {
  setorSelecionado.value = "";
  erroValidacao.value = "";

  // Se houver apenas um setor para esta unidade, selecionar automaticamente
  if (setoresFiltrados.value.length === 1) {
    setorSelecionado.value = setoresFiltrados.value[0].id.toString();
  }
};

const getSetorSelecionado = computed(() => {
  if (!setorSelecionado.value) return null;
  return setores.value.find((s) => s.id == setorSelecionado.value);
});

const carregarSetores = async () => {
  try {
    loading.value = true;
    errorMessage.value = "";

    console.log("🔄 Iniciando carregamento de setores...");

    const context = {
      $axios: axios,
      $store: store,
      $toastr: undefined,
      modalData: {},
    };

    const resultado = await functions.getSetoresWithAccess(context);

    console.log("✅ Resultado da chamada getSetoresWithAccess:", resultado);

    if (resultado.success && resultado.data && resultado.data.length > 0) {
      console.log("✓ Setores carregados com sucesso:", resultado.data.length);
      setores.value = resultado.data;

      // Auto-selecionar unidade se houver apenas uma
      if (unidades.value.length === 1) {
        unidadeSelecionada.value = unidades.value[0].id.toString();
        // Disparar lógica de mudança de unidade (isso vai auto-selecionar o setor se houver apenas um também)
        onUnidadeChange();
      }
    } else if (!resultado.success) {
      console.warn("⚠️ Falha na API ao carregar setores");
      errorMessage.value =
        "Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.";
      setores.value = [];
    } else {
      console.warn(
        "⚠️ Usuário não tem acesso a nenhum setor (resultado vazio)",
      );
      errorMessage.value = "";
      setores.value = [];
    }
  } catch (error) {
    console.error("❌ Erro ao carregar setores:", error);
    errorMessage.value =
      "Erro inesperado ao carregar setores. Tente novamente.";
    setores.value = [];
  } finally {
    loading.value = false;
    console.log("🔽 Carregamento finalizado. Estado:", {
      loading: loading.value,
      setores: setores.value.length,
      errorMessage: errorMessage.value,
    });
  }
};

const selecionarSetor = async () => {
  if (!setorSelecionado.value) {
    erroValidacao.value = "Por favor, selecione um setor";
    return;
  }

  erroValidacao.value = "";
  loadingEntrada.value = true;

  try {
    const setor = getSetorSelecionado.value;
    if (!setor) {
      erroValidacao.value = "Setor não encontrado";
      return;
    }

    // Salvar setor nos cookies
    setorCookie.setSector(setor.id, setor.nome);

    // Atualizar estado do Vuex
    store.commit("setSetorAtual", {
      id: setor.id,
      nome: setor.nome,
    });

    // Carregar detalhes completos do setor
    const context = {
      $axios: axios,
      $store: store,
      $toastr: undefined,
      modalData: {},
    };

    const resultadoDetalhes = await functions.getSetorDetail(context, setor.id);

    if (!resultadoDetalhes.success) {
      // Não impede o acesso ao dashboard mesmo sem detalhes
    }

    // Redirecionar para dashboard
    router.push("/dashboard");
  } catch (error) {
    console.error("Erro ao selecionar setor:", error);
    erroValidacao.value = "Erro ao selecionar setor. Tente novamente.";
  } finally {
    loadingEntrada.value = false;
  }
};

const logout = () => {
  try {
    console.log("🚪 Iniciando logout...");

    // Limpar dados de autenticação
    try {
      store.commit("clearUserToken");
      console.log("✓ Token limpo");
    } catch (e) {
      console.warn("⚠️ Erro ao limpar token:", e);
    }

    try {
      store.commit("setUser", null);
      console.log("✓ Usuário limpo");
    } catch (e) {
      console.warn("⚠️ Erro ao limpar usuário:", e);
    }

    // Limpar dados do setor
    try {
      store.commit("clearSetorAtual");
      console.log("✓ Setor Atual limpo");
    } catch (e) {
      console.warn("⚠️ Erro ao limpar setor atual:", e);
    }

    try {
      store.commit("clearSetorDetails");
      console.log("✓ Detalhes do setor limpos");
    } catch (e) {
      console.warn("⚠️ Erro ao limpar detalhes do setor:", e);
    }

    try {
      setorCookie.clearSector();
      console.log("✓ Cookies do setor limpos");
    } catch (e) {
      console.warn("⚠️ Erro ao limpar cookies:", e);
    }

    // Limpar localStorage
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      console.log("✓ localStorage limpo");
    } catch (e) {
      console.warn("⚠️ Erro ao limpar localStorage:", e);
    }

    console.log(
      "✅ Logout concluído com sucesso, redirecionando para login...",
    );

    // Redirecionar para login
    router.push("/login").then(() => {
      console.log("✓ Redirecionado para /login");
    });
  } catch (error) {
    console.error("❌ Erro crítico durante logout:", error);
    // Fallback: redirecionar mesmo se houver erro
    window.location.href = "/login";
  }
};

onMounted(() => {
  console.log("📱 SetorSelectionView montado");
  // Verificar se está autenticado
  const token = store.getters.getUserToken;
  console.log("🔑 Token verificado:", token ? "✓ Presente" : "✗ Ausente");

  if (!token) {
    console.log("⚠️ Sem token de autenticação, redirecionando para login");
    router.push("/login");
    return;
  }

  console.log("✓ Usuário autenticado, carregando setores...");
  // Carregar setores disponíveis
  carregarSetores();
});
</script>
