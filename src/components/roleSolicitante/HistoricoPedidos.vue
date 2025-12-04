<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold flex items-center gap-2">
        <i class="mdi mdi-history text-xl text-blue-600"></i>
        Histórico de Pedidos
      </h2>
      <p class="text-sm text-muted-foreground">
        Visualize todos os seus pedidos anteriores.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="w-full min-h-[400px] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Content -->
    <div v-else>
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <i class="mdi mdi-package-variant"></i>
            Meus Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="pedidos && pedidos.length > 0" class="space-y-4">
            <div
              v-for="pedido in pedidos"
              :key="pedido.id"
              class="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-semibold text-lg">Pedido #{{ pedido.id }}</div>
                  <div class="text-sm text-muted-foreground">
                    {{ formatDate(pedido.created_at) }}
                  </div>
                  <div class="mt-2">
                    <Badge :variant="getStatusVariant(pedido.status)">
                      {{ pedido.status }}
                    </Badge>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm text-muted-foreground">Total de itens</div>
                  <div class="text-xl font-bold">{{ pedido.items?.length || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-muted-foreground py-8">
            <i class="mdi mdi-package-variant-closed text-4xl mb-2"></i>
            <p>Nenhum pedido encontrado.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { API_URL } from '@/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const loading = ref(true);
const pedidos = ref([]);

const loadPedidos = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/pedidos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    pedidos.value = response.data.data || response.data || [];
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusVariant = (status) => {
  const statusMap = {
    'pendente': 'secondary',
    'aprovado': 'default',
    'em_andamento': 'outline',
    'concluido': 'outline',
    'cancelado': 'destructive',
  };
  return statusMap[status?.toLowerCase()] || 'default';
};

onMounted(() => {
  loadPedidos();
});
</script>

<style scoped>
/* Estilos adicionais, se necessário */
</style>
