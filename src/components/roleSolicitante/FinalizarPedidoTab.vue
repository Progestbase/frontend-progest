<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold flex items-center gap-2">
        <i class="mdi mdi-cart-check text-xl text-blue-600"></i>
        Finalizar Pedido
        <span
          v-if="quantidadeProdutos > 0"
          class="text-base font-normal text-muted-foreground"
        >
          ({{ quantidadeProdutos }}
          {{ quantidadeProdutos === 1 ? "item" : "itens" }})
        </span>
      </h2>
      <p class="text-sm text-muted-foreground">Revise e finalize seu pedido.</p>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="w-full min-h-[400px] flex items-center justify-center"
    >
      <LoadingSpinner size="lg" />
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Empty State -->
      <Card v-if="itens.length === 0">
        <CardContent class="py-12 text-center">
          <i
            class="mdi mdi-cart-outline text-6xl text-muted-foreground mb-4"
          ></i>
          <h3 class="text-lg font-medium mb-2">Seu pedido está vazio</h3>
          <p class="text-muted-foreground mb-4">
            Adicione itens ao seu pedido para continuar.
          </p>
          <Button @click="adicionarMaisItens">
            <i class="mdi mdi-magnify mr-2"></i>
            Buscar Itens
          </Button>
        </CardContent>
      </Card>

      <!-- Detalhes do Pedido - Layout Horizontal (PRIMEIRO) -->
      <Card v-if="itens.length > 0">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <i class="mdi mdi-clipboard-text-outline"></i>
            Detalhes do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <!-- Linha 1: Tipo de Produto + Setor Fornecedor → Setor Destino -->
          <div class="flex flex-wrap items-center gap-4 mb-4">
            <!-- Tipo de Produto -->
            <div class="flex items-center gap-2">
              <i class="mdi mdi-tag-check text-green-600"></i>
              <span class="text-sm font-medium">Tipo de Produto:</span>
              <Badge variant="secondary">
                <i
                  :class="[
                    'mdi mr-1',
                    tipo === 'Medicamento' ? 'mdi-pill' : 'mdi-package-variant',
                  ]"
                ></i>
                {{ tipo || "Não selecionado" }}
              </Badge>
            </div>

            <div
              class="h-6 border-l border-muted-foreground/30 hidden md:block"
            ></div>

            <!-- Setor Fornecedor (primeiro) -->
            <div class="flex-shrink-0 w-[220px]">
              <label class="text-xs text-muted-foreground block mb-1"
                >Setor Distribuidor</label
              >
              <Select
                v-model="fornecedorLocal"
                @update:modelValue="handleFornecedorChange"
              >
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Selecione o setor distribuidor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="forn in fornecedoresDisponiveis"
                    :key="forn.id"
                    :value="String(forn.id)"
                  >
                    {{ forn.nome }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p
                v-if="fornecedoresDisponiveis.length === 0"
                class="text-xs text-muted-foreground mt-1"
              >
                <i class="mdi mdi-alert-circle text-yellow-500 mr-1"></i>
                Nenhum fornecedor configurado.
              </p>
            </div>

            <!-- Seta -->
            <div class="flex items-center">
              <i class="mdi mdi-arrow-right text-2xl text-muted-foreground"></i>
            </div>

            <!-- Setor Destino (segundo) -->
            <div class="flex-shrink-0">
              <label class="text-xs text-muted-foreground block mb-1"
                >Setor de Destino (Você)</label
              >
              <div class="p-2 px-3 bg-muted rounded-lg flex items-center gap-2">
                <i class="mdi mdi-map-marker text-primary"></i>
                <span class="font-medium text-sm">{{
                  setorAtual?.nome || "Setor não identificado"
                }}</span>
              </div>
            </div>
          </div>

          <!-- Linha 2: Observação -->
          <div class="mt-4">
            <label class="text-xs text-muted-foreground block mb-1"
              >Observação (opcional)</label
            >
            <Textarea
              v-model="observacao"
              placeholder="Descreva resumidamente o motivo para qual deseja os itens..."
              class="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Cart Items (SEGUNDO) -->
      <Card v-if="itens.length > 0" class="mt-4">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="flex items-center gap-2">
              <i class="mdi mdi-cart"></i>
              Itens do Pedido
            </CardTitle>
            <div class="flex items-center gap-6 text-sm">
              <div class="text-center">
                <span class="text-muted-foreground">Itens:</span>
                <span class="font-bold ml-1">{{ quantidadeProdutos }}</span>
              </div>
              <div class="text-center">
                <span class="text-muted-foreground">Qtd Total:</span>
                <span class="font-bold ml-1">{{ totalItens }}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div
              v-for="item in itens"
              :key="item.produtoId"
              class="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div class="flex-1">
                <div class="font-medium">{{ item.nome }}</div>
                <div class="text-sm text-muted-foreground">
                  <span v-if="item.marca">{{ item.marca }} • </span>
                  <span v-if="item.unidade">{{ item.unidade }}</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    class="h-8 w-8"
                    @click="decrementarQuantidade(item.produtoId)"
                  >
                    <i class="mdi mdi-minus"></i>
                  </Button>
                  <Input
                    type="number"
                    :modelValue="item.quantidade"
                    @update:modelValue="
                      (val) => updateQuantidade(item.produtoId, Number(val))
                    "
                    class="w-16 text-center h-8"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    class="h-8 w-8"
                    @click="incrementarQuantidade(item.produtoId)"
                  >
                    <i class="mdi mdi-plus"></i>
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-destructive hover:text-destructive"
                  @click="removeItem(item.produtoId)"
                >
                  <i class="mdi mdi-delete"></i>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Actions -->
      <div v-if="itens.length > 0" class="flex justify-between gap-4 mt-6">
        <Button
          variant="outline"
          @click="adicionarMaisItens"
          class="flex items-center gap-2"
        >
          <i class="mdi mdi-plus"></i>
          Adicionar mais itens
        </Button>
        <Button
          @click="finalizarPedido"
          :disabled="submitting || fornecedoresDisponiveis.length === 0"
          class="flex items-center gap-2"
        >
          <LoadingSpinner v-if="submitting" size="sm" class="mr-2" />
          <i v-else class="mdi mdi-check"></i>
          {{ submitting ? "Enviando..." : "Finalizar Pedido" }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingSpinner from "@/components/ui/loading-spinner/LoadingSpinner.vue";
import { useToast } from "@/components/ui/toast";
import { useSolicitacao } from "@/composables/useSolicitacao";
const router = useRouter();
const { toast } = useToast();

const {
  tipo,
  itens,
  fornecedor,
  quantidadeProdutos,
  totalItens,
  setorAtual,
  fornecedoresDisponiveis,
  updateQuantidade,
  removeItem,
  setFornecedor,
  limparPedido,
  getPedidoParaEnvio,
} = useSolicitacao();

const loading = ref(false);
const submitting = ref(false);
const observacao = ref("");
const fornecedorLocal = ref(fornecedor.value ? String(fornecedor.value) : null);

// Sync com composable
watch(fornecedor, (newVal) => {
  fornecedorLocal.value = newVal ? String(newVal) : null;
});

const handleFornecedorChange = (value) => {
  setFornecedor(value ? Number(value) : null);
};

const incrementarQuantidade = (produtoId) => {
  const item = itens.value.find((i) => i.produtoId === produtoId);
  if (item) {
    updateQuantidade(produtoId, item.quantidade + 1);
  }
};

const decrementarQuantidade = (produtoId) => {
  const item = itens.value.find((i) => i.produtoId === produtoId);
  if (item && item.quantidade > 1) {
    updateQuantidade(produtoId, item.quantidade - 1);
  }
};

const adicionarMaisItens = () => {
  router.push("/itens?tab=itens");
};

const finalizarPedido = async () => {
  if (!fornecedorLocal.value) {
    toast({
      title: "Atenção",
      description: "Por favor, selecione o setor fornecedor.",
      variant: "destructive",
    });
    return;
  }

  if (itens.value.length === 0) {
    toast({
      title: "Atenção",
      description: "Adicione pelo menos um item ao pedido.",
      variant: "destructive",
    });
    return;
  }

  // Garantir que fornecedor está setado
  setFornecedor(Number(fornecedorLocal.value));

  const pedidoData = getPedidoParaEnvio(observacao.value);

  console.log("🚀 Finalizando pedido...");
  console.log("📋 fornecedorLocal.value:", fornecedorLocal.value);
  console.log("📦 pedidoData:", pedidoData);

  if (!pedidoData) {
    toast({
      title: "Erro",
      description: "Não foi possível preparar o pedido. Verifique os dados.",
      variant: "destructive",
    });
    return;
  }

  try {
    submitting.value = true;
    const token = localStorage.getItem("token");

    const response = await axios.post("/movimentacao/add", pedidoData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.status) {
      toast({
        title: "Sucesso",
        description: "Pedido enviado com sucesso! Aguarde a aprovação.",
      });

      // Limpar pedido após sucesso
      limparPedido();
      observacao.value = "";
      fornecedorLocal.value = null;

      // Navegar para histórico após 1.5 segundos
      setTimeout(() => {
        router.push("/itens?tab=historico");
      }, 1500);
    } else {
      throw new Error(response.data.message || "Erro ao enviar pedido");
    }
  } catch (error) {
    console.error("Erro ao finalizar o pedido:", error);
    toast({
      title: "Erro",
      description:
        error.response?.data?.message || "Não foi possível finalizar o pedido.",
      variant: "destructive",
    });
  } finally {
    submitting.value = false;
  }
};
</script>
