<script setup>
import { ref, onMounted, computed, provide } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import axios from "axios";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  BoxesIcon,
  ClockIcon,
  LayoutDashboardIcon,
  PlusIcon,
  ShoppingCartIcon,
  TrendingDownIcon,
  TruckIcon,
  PackageIcon,
  ChevronRightIcon,
  ActivityIcon,
} from "lucide-vue-next";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Funções de carregamento
import functionsEstoque from "@/functions/cad_estoque";
import functionsMovimentacao from "@/functions/cad_movimentacao";
import functionsUsuarioSetor from "@/functions/cad_usuario_setor";

const store = useStore();
const router = useRouter();

const loading = ref(true);
const stats = ref({
  totalItens: 0,
  pendentesEntrada: 0,
  pendentesSaida: 0,
  abaixoMinimo: 0,
});

const alerts = ref([]);
const recentRequests = ref([]);

const user = computed(() => store.state.user || {});
const setorAtual = computed(() => store.state.setorDetails || {});

const isAdmin = computed(() => {
  if (user.value.email === "admin@admin.com") return true;
  return !!user.value.is_admin;
});

const isSolicitante = computed(() => {
  const list = store.state.listUsuariosSetor || [];
  const found = list.find((u) => {
    const userId = u.usuario_id || u.user_id || u.id || u.usuario?.id;
    const perfil = (u.perfil || u.pivot?.perfil || "").toString().toLowerCase();
    return userId === user.value.id && perfil.includes("solicitante");
  });
  return !!found;
});

const loadDashboardData = async () => {
  loading.value = true;
  const setorId = store.state.setorAtualId;

  if (!setorId) {
    router.push("/setor-selection");
    return;
  }

  const context = { $axios: axios, $store: store };

  // Paralelizar requests
  await Promise.all([
    functionsEstoque.listAll(context),
    functionsMovimentacao.listAll(context),
    functionsUsuarioSetor.listAll
      ? functionsUsuarioSetor.listAll(context)
      : Promise.resolve(),
  ]);

  // Processar dados do estoque
  const estoque = store.state.listEstoque || [];
  stats.value.totalItens = estoque.length;
  stats.value.abaixoMinimo = estoque.filter(
    (i) => i.abaixo_minimo || i.quantidade_atual <= i.quantidade_minima,
  ).length;

  alerts.value = estoque
    .filter((i) => i.abaixo_minimo || i.quantidade_atual <= i.quantidade_minima)
    .slice(0, 5);

  // Processar movimentações
  const movimentacoes = store.state.listMovimentacoes || [];

  // Pendentes de Entrada (Onde este setor é o destino e status é P)
  stats.value.pendentesEntrada = movimentacoes.filter(
    (m) => m.setor_destino_id == setorId && m.status_solicitacao === "P",
  ).length;

  // Pendentes de Saída (Onde este setor é a origem e status é P)
  stats.value.pendentesSaida = movimentacoes.filter(
    (m) => m.setor_origem_id == setorId && m.status_solicitacao === "P",
  ).length;

  recentRequests.value = movimentacoes
    .filter((m) => m.status_solicitacao === "P")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  store.commit("setPageHeader", {
    title: `Olá, ${user.value.name || "Usuário"}!`,
    subtitle: `Bem-vindo ao painel da unidade ${setorAtual.value.nome || "..."}`,
  });

  loading.value = false;
};

const formatarData = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
};

const navigateTo = (path, query = {}) => {
  router.push({ path, query });
};

onMounted(loadDashboardData);
</script>

<template>
  <TemplateAdmin>
    <div class="px-6 py-8 w-full h-full flex flex-col gap-8 bg-slate-50/30">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex-1 flex items-center justify-center min-h-[400px]"
      >
        <div class="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p class="text-slate-500 font-medium animate-pulse">
            Carregando informações...
          </p>
        </div>
      </div>

      <template v-else>
        <!-- Info Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            class="border-none shadow-sm bg-white hover:shadow-md transition-all group"
          >
            <CardContent class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-500 mb-1">
                    Total de Itens
                  </p>
                  <h3
                    class="text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors"
                  >
                    {{ stats.totalItens }}
                  </h3>
                </div>
                <div
                  class="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"
                >
                  <PackageIcon class="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            class="border-none shadow-sm bg-white hover:shadow-md transition-all group"
          >
            <CardContent class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-500 mb-1">
                    Abaixo do Mínimo
                  </p>
                  <h3
                    class="text-2xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors"
                  >
                    {{ stats.abaixoMinimo }}
                  </h3>
                </div>
                <div
                  class="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 pointer-events-none"
                >
                  <TrendingDownIcon class="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            class="border-none shadow-sm bg-white hover:shadow-md transition-all group"
          >
            <CardContent class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-500 mb-1">
                    Pedidos a Receber
                  </p>
                  <h3
                    class="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors"
                  >
                    {{ stats.pendentesEntrada }}
                  </h3>
                </div>
                <div
                  class="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300"
                >
                  <ArrowDownIcon class="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            class="border-none shadow-sm bg-white hover:shadow-md transition-all group"
          >
            <CardContent class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-500 mb-1">
                    Pedidos a Enviar
                  </p>
                  <h3
                    class="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors"
                  >
                    {{ stats.pendentesSaida }}
                  </h3>
                </div>
                <div
                  class="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300"
                >
                  <ArrowUpIcon class="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Quick Actions -->
          <div class="lg:col-span-1 flex flex-col gap-6">
            <Card class="border-none shadow-sm h-full overflow-hidden">
              <CardHeader class="border-b bg-slate-50/50">
                <CardTitle class="text-lg flex items-center gap-2">
                  <ActivityIcon class="w-5 h-5 text-primary" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent class="p-4 flex flex-col gap-3">
                <Button
                  @click="navigateTo('/itens')"
                  class="w-full justify-start h-14 gap-4 bg-white hover:bg-primary/5 text-slate-700 border-slate-200 shadow-none group"
                >
                  <div
                    class="p-2 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors"
                  >
                    <ShoppingCartIcon class="w-5 h-5" />
                  </div>
                  <div class="flex flex-col items-start">
                    <span class="font-bold text-sm">Realizar Pedido</span>
                    <span class="text-[10px] text-slate-400 font-normal"
                      >Solicitar insumos de outra unidade</span
                    >
                  </div>
                </Button>

                <Button
                  v-if="!isSolicitante"
                  @click="navigateTo('/setor-atual', { tab: 'entrada' })"
                  class="w-full justify-start h-14 gap-4 bg-white hover:bg-primary/5 text-slate-700 border-slate-200 shadow-none group"
                >
                  <div
                    class="p-2 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors"
                  >
                    <TruckIcon class="w-5 h-5" />
                  </div>
                  <div class="flex flex-col items-start">
                    <span class="font-bold text-sm">Registrar Entrada</span>
                    <span class="text-[10px] text-slate-400 font-normal"
                      >Lançar recebimento de nota fiscal</span
                    >
                  </div>
                </Button>

                <Button
                  v-if="!isSolicitante"
                  @click="navigateTo('/produtos')"
                  class="w-full justify-start h-14 gap-4 bg-white hover:bg-primary/5 text-slate-700 border-slate-200 shadow-none group"
                >
                  <div
                    class="p-2 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors"
                  >
                    <BoxesIcon class="w-5 h-5" />
                  </div>
                  <div class="flex flex-col items-start">
                    <span class="font-bold text-sm">Consultar Catálogo</span>
                    <span class="text-[10px] text-slate-400 font-normal"
                      >Ver lista completa de produtos</span
                    >
                  </div>
                </Button>

                <Button
                  @click="navigateTo('/historico')"
                  class="w-full justify-start h-14 gap-4 bg-white hover:bg-primary/5 text-slate-700 border-slate-200 shadow-none group"
                >
                  <div
                    class="p-2 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors"
                  >
                    <ClockIcon class="w-5 h-5" />
                  </div>
                  <div class="flex flex-col items-start">
                    <span class="font-bold text-sm">Histórico</span>
                    <span class="text-[10px] text-slate-400 font-normal"
                      >Ver movimentações anteriores</span
                    >
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>

          <!-- Main Dashboard Sections -->
          <div class="lg:col-span-2 flex flex-col gap-6">
            <!-- Alerts Section -->
            <Card class="border-none shadow-sm overflow-hidden">
              <CardHeader
                class="flex flex-row items-center justify-between border-b bg-slate-50/50 py-4"
              >
                <CardTitle class="text-lg flex items-center gap-2">
                  <AlertTriangleIcon class="w-5 h-5 text-amber-500" />
                  Alertas de Estoque
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  class="text-xs text-primary"
                  @click="navigateTo('/setor-atual', { tab: 'estoque' })"
                >
                  Ver tudo
                </Button>
              </CardHeader>
              <CardContent class="p-0">
                <div v-if="alerts.length > 0" class="divide-y divide-slate-100">
                  <div
                    v-for="item in alerts"
                    :key="item.id"
                    class="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between group"
                  >
                    <div class="flex items-center gap-4">
                      <div
                        class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xs"
                      >
                        {{ item.quantidade_atual }}
                      </div>
                      <div>
                        <p
                          class="font-semibold text-slate-800 text-sm leading-tight"
                        >
                          {{ item.produto?.nome }}
                        </p>
                        <p
                          class="text-[10px] text-slate-400 uppercase tracking-wider font-bold"
                        >
                          Mínimo: {{ item.quantidade_minima }}
                          {{ item.produto?.unidade_medida?.sigla }}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      class="border-amber-200 text-amber-600 bg-amber-50 h-5 text-[10px] font-bold"
                      >REPOR</Badge
                    >
                  </div>
                </div>
                <div
                  v-else
                  class="p-8 flex flex-col items-center justify-center text-center"
                >
                  <div
                    class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3"
                  >
                    <ActivityIcon class="w-6 h-6 text-emerald-500" />
                  </div>
                  <p class="text-slate-500 text-sm font-medium">
                    Tudo certo com seu estoque!
                  </p>
                  <p class="text-[10px] text-slate-400 mt-1">
                    Nenhum item abaixo do nível de segurança.
                  </p>
                </div>
              </CardContent>
            </Card>

            <!-- Requests Section -->
            <Card class="border-none shadow-sm overflow-hidden">
              <CardHeader
                class="flex flex-row items-center justify-between border-b bg-slate-50/50 py-4"
              >
                <CardTitle class="text-lg flex items-center gap-2">
                  <ClockIcon class="w-5 h-5 text-indigo-500" />
                  Solicitações Pendentes
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  class="text-xs text-primary"
                  @click="navigateTo('/setor-atual', { tab: 'movimentacoes' })"
                >
                  Ver tudo
                </Button>
              </CardHeader>
              <CardContent class="p-0">
                <div
                  v-if="recentRequests.length > 0"
                  class="divide-y divide-slate-100"
                >
                  <div
                    v-for="req in recentRequests"
                    :key="req.id"
                    class="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between"
                  >
                    <div class="flex items-center gap-4">
                      <div
                        :class="[
                          'w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold',
                          req.setor_destino_id == store.state.setorAtualId
                            ? 'bg-indigo-500'
                            : 'bg-emerald-500',
                        ]"
                      >
                        <ArrowDownIcon
                          v-if="
                            req.setor_destino_id == store.state.setorAtualId
                          "
                          class="w-5 h-5"
                        />
                        <ArrowUpIcon v-else class="w-5 h-5" />
                      </div>
                      <div>
                        <p
                          class="font-semibold text-slate-800 text-sm leading-tight"
                        >
                          #{{ req.id }} -
                          {{
                            req.setor_origem_id == store.state.setorAtualId
                              ? "Dest: " +
                                (req.setor_destino?.nome || "Unidade")
                              : "Orig: " + (req.setor_origem?.nome || "Unidade")
                          }}
                        </p>
                        <p class="text-[10px] text-slate-400 font-bold">
                          {{ req.itens?.length }} itens • Criado em
                          {{ formatarData(req.created_at) }}
                        </p>
                      </div>
                    </div>
                    <ChevronRightIcon class="w-5 h-5 text-slate-300" />
                  </div>
                </div>
                <div
                  v-else
                  class="p-8 flex flex-col items-center justify-center text-center"
                >
                  <div
                    class="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300"
                  >
                    <ClockIcon class="w-6 h-6" />
                  </div>
                  <p class="text-slate-500 text-sm font-medium">
                    Nenhuma solicitação pendente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </template>
    </div>
  </TemplateAdmin>
</template>

<style scoped>
.grid-cols-1,
.grid-cols-2,
.grid-cols-4 {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
