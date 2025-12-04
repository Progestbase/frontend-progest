<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold flex items-center gap-2">
        <i class="mdi mdi-magnify text-xl text-blue-600"></i>
        Buscar Itens
      </h2>
      <p class="text-sm text-muted-foreground">
        Pesquise e adicione itens ao seu pedido.
      </p>
    </div>

    <!-- Search Bar -->
    <Card>
      <CardContent class="pt-6">
        <div class="relative">
          <i class="mdi mdi-magnify absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xl"></i>
          <Input
            type="text"
            v-model="searchQuery"
            @input="searchProducts"
            placeholder="Pesquise por um produto..."
            class="pl-10"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Products List -->
    <div class="space-y-4">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="transition-all duration-300 ease-in-out hover:scale-[1.02]"
      >
        <ProductTemplate
          ref="productTemplates"
          :productId="product.id"
          :productName="product.name"
          :unit="product.unit"
          :image="product.image_url"
          :brand="product.brand"
          @update-quantity="updateSelectedQuantities"
        />
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Add to Cart Button -->
    <div v-if="hasSelectedItems" class="fixed bottom-6 right-6 z-50">
      <Button
        size="lg"
        @click="addToCart"
        class="shadow-lg flex items-center gap-2"
      >
        <i class="mdi mdi-cart-plus"></i>
        Adicionar ao pedido
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import { API_URL } from '@/config';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/toast/use-toast';
import ProductTemplate from './ProductTemplate.vue';

const { toast } = useToast();

const searchQuery = ref('');
const products = ref([]);
const filteredProducts = ref([]);
const selectedQuantities = ref({});
const loading = ref(false);
const page = ref(1);
const hasMoreProducts = ref(true);
const productTemplates = ref([]);

const hasSelectedItems = computed(() => {
  return Object.keys(selectedQuantities.value).length > 0;
});

const resetProductQuantities = () => {
  console.log('Resetando quantidades');
  if (productTemplates.value && productTemplates.value.length > 0) {
    productTemplates.value.forEach((template) => {
      if (template && template.resetQuantity) {
        template.resetQuantity();
      }
    });
  }
};

const updateSelectedQuantities = ({ productId, quantity }) => {
  if (quantity > 0) {
    selectedQuantities.value[productId] = quantity;
  } else {
    delete selectedQuantities.value[productId];
  }
};

const addToCart = async () => {
  const itemsToAdd = Object.entries(selectedQuantities.value).map(
    ([productId, quantity]) => ({
      product_id: productId,
      quantity,
    })
  );

  if (itemsToAdd.length <= 0) {
    toast({
      title: 'Atenção',
      description: 'Selecione um produto para adicionar ao carrinho!',
      variant: 'destructive',
    });
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/cart/add`,
      { items: itemsToAdd },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    toast({
      title: 'Sucesso',
      description: response.data.message || 'Produtos adicionados ao carrinho!',
    });

    // Limpa o objeto de quantidades selecionadas após adicionar ao carrinho
    selectedQuantities.value = {};
    resetProductQuantities();
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    toast({
      title: 'Erro',
      description: 'Erro ao adicionar produto ao carrinho!',
      variant: 'destructive',
    });
  }
};

const searchProducts = () => {
  const normalizedSearchQuery = normalizeString(searchQuery.value);
  const localResults = products.value.filter((product) =>
    normalizeString(product.name).includes(normalizedSearchQuery)
  );

  if (localResults.length === 0 && searchQuery.value.length > 0) {
    loadProducts();
  } else {
    filteredProducts.value = localResults;
  }
};

const normalizeString = (str) => {
  const normalized = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return normalized.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase();
};

const loadProducts = async () => {
  if (loading.value || !hasMoreProducts.value) return;

  loading.value = true;
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/products?page=${page.value}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.data && response.data.data.length > 0) {
      products.value = [...products.value, ...response.data.data];
      page.value++;
      searchProducts();
    } else {
      hasMoreProducts.value = false;
    }
  } catch (error) {
    console.error(
      'Erro ao carregar produtos:',
      error.response ? error.response.data : error.message
    );
    toast({
      title: 'Erro',
      description: 'Não foi possível carregar os produtos.',
      variant: 'destructive',
    });
  } finally {
    loading.value = false;
  }
};

const handleScroll = () => {
  const scrollPosition = window.scrollY + window.innerHeight;
  const bottomPosition = document.documentElement.scrollHeight;

  if (scrollPosition >= bottomPosition - 100) {
    loadProducts();
  }
};

onMounted(() => {
  loadProducts();
  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* Estilos adicionais, se necessário */
</style>
