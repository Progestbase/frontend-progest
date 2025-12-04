<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold flex items-center gap-2">
        <i class="mdi mdi-cart-check text-xl text-blue-600"></i>
        Finalizar Pedido
        <span v-if="qtdItensCarrinho > 0" class="text-base font-normal text-muted-foreground">
          ({{ qtdItensCarrinho }} {{ qtdItensCarrinho === 1 ? 'item' : 'itens' }})
        </span>
      </h2>
      <p class="text-sm text-muted-foreground">
        Revise e finalize seu pedido.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="w-full min-h-[400px] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Cart Items -->
      <Card v-if="cart.length > 0">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <i class="mdi mdi-cart"></i>
            Itens do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="item in cart"
              :key="item.id"
              class="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <ProductCartTemplate
                :productId="item.id"
                :productName="item.product.name"
                :unit="item.product.unit"
                :image="item.product.image_url"
                :brand="item.product.brand"
                :quantity="item.quantity"
                @update-quantity="updateCartQuantity"
                @remove-product="removeFromCart"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Justification -->
      <Card v-if="cart.length > 0" class="mt-4">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <i class="mdi mdi-text-box-outline"></i>
            Justificativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            v-model="justificativa"
            placeholder="Descreva resumidamente o motivo para qual deseja os itens..."
            class="min-h-[120px]"
          />
        </CardContent>
      </Card>

      <!-- Actions -->
      <div v-if="cart.length > 0" class="flex justify-between gap-4 mt-6">
        <Button variant="outline" @click="adicionarItem" class="flex items-center gap-2">
          <i class="mdi mdi-plus"></i>
          Adicionar mais itens
        </Button>
        <Button @click="finalizarPedido" class="flex items-center gap-2">
          <i class="mdi mdi-check"></i>
          Finalizar Pedido
        </Button>
      </div>

      <!-- Empty State -->
      <MensagemCarrinhoVazio v-if="cart.length === 0" @goToShop="navigateToShop" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API_URL } from '@/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/toast/use-toast';
import ProductCartTemplate from './ProductCartTemplate.vue';
import MensagemCarrinhoVazio from './MensagemCarrinhoVazio.vue';

const router = useRouter();
const { toast } = useToast();

const loading = ref(true);
const cart = ref([]);
const justificativa = ref('');

const qtdItensCarrinho = computed(() => {
  return cart.value.reduce((acc, item) => acc + item.quantity, 0);
});

const loadCart = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/cart/items`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    cart.value = response.data;
  } catch (error) {
    console.error('Erro ao carregar o carrinho:', error);
    toast({
      title: 'Erro',
      description: 'Não foi possível carregar o carrinho.',
      variant: 'destructive',
    });
  } finally {
    loading.value = false;
  }
};

const updateCartQuantity = async (productId, newQuantity) => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(
      `${API_URL}/cart/update/${productId}`,
      { quantity: newQuantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const product = cart.value.find((p) => p.id === productId);
    if (product) {
      product.quantity = newQuantity;
    }
  } catch (error) {
    console.error('Erro ao atualizar a quantidade:', error);
    toast({
      title: 'Erro',
      description: 'Não foi possível atualizar a quantidade.',
      variant: 'destructive',
    });
  }
};

const removeFromCart = async (productId) => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/cart/remove/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    cart.value = cart.value.filter((p) => p.id !== productId);
    toast({
      title: 'Sucesso',
      description: 'Item removido do carrinho.',
    });
  } catch (error) {
    console.error('Erro ao remover item:', error);
    toast({
      title: 'Erro',
      description: 'Não foi possível remover o item.',
      variant: 'destructive',
    });
  }
};

const finalizarPedido = async () => {
  if (!justificativa.value.trim()) {
    toast({
      title: 'Atenção',
      description: 'Por favor, preencha a justificativa do pedido.',
      variant: 'destructive',
    });
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/orders`,
      {
        justification: justificativa.value,
        items: cart.value.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await clearCart();
    cart.value = [];
    justificativa.value = '';

    toast({
      title: 'Sucesso',
      description: response.data.message || 'Pedido finalizado com sucesso!',
    });

    // Navegar para histórico após 2 segundos
    setTimeout(() => {
      router.push('/itens?tab=historico');
    }, 2000);
  } catch (error) {
    console.error('Erro ao finalizar o pedido:', error);
    toast({
      title: 'Erro',
      description: 'Não foi possível finalizar o pedido.',
      variant: 'destructive',
    });
  }
};

const clearCart = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/cart/items`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Erro ao limpar o carrinho:', error);
  }
};

const adicionarItem = () => {
  router.push('/itens?tab=itens');
};

const navigateToShop = () => {
  router.push('/itens?tab=itens');
};

onMounted(() => {
  loadCart();
});
</script>

<style scoped>
/* Estilos adicionais, se necessário */
</style>
