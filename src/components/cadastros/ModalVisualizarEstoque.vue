<template>
  <Dialog :open="isOpen" @update:open="isOpen = $event">
    <DialogContent class="w-full max-w-4xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <i class="mdi mdi-package-multiple text-lg"></i>
          Detalhes do Estoque
        </DialogTitle>
      </DialogHeader>

      <div v-if="item" class="space-y-6 max-h-[70vh] overflow-y-auto">
        <!-- Card Único: Informações do Produto + Quantidades + Status -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Informações do Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-6">
              <!-- Informações Básicas -->
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <p
                    class="text-xs text-muted-foreground mb-1 font-semibold uppercase"
                  >
                    Produto
                  </p>
                  <p class="font-semibold text-foreground text-sm">
                    {{ item.produto }}
                  </p>
                </div>
                <div>
                  <p
                    class="text-xs text-muted-foreground mb-1 font-semibold uppercase"
                  >
                    Grupo
                  </p>
                  <p class="font-semibold text-foreground text-sm">
                    {{ item.grupo }}
                  </p>
                </div>
                <div>
                  <p
                    class="text-xs text-muted-foreground mb-1 font-semibold uppercase"
                  >
                    Status
                  </p>
                  <p class="font-semibold text-foreground text-sm">
                    {{ item.status }}
                  </p>
                </div>
              </div>

              <div class="border-t border-border pt-4">
                <!-- Quantidades -->
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p
                      class="text-xs text-muted-foreground mb-2 font-semibold uppercase"
                    >
                      Qtd. Atual
                    </p>
                    <p class="text-lg font-bold text-blue-600">
                      {{ item.quantidade_atual }}
                    </p>
                  </div>
                  <div>
                    <p
                      class="text-xs text-muted-foreground mb-2 font-semibold uppercase"
                    >
                      Qtd. Mínima
                    </p>
                    <p class="text-lg font-bold text-slate-600">
                      {{ item.quantidade_minima }}
                    </p>
                  </div>
                </div>

                <!-- Alerta -->
                <div
                  v-if="item.alerta && item.alerta.toLowerCase() !== '✅ ok'"
                  class="text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded border border-orange-200"
                >
                  <i class="mdi mdi-alert-circle me-2"></i>
                  {{ item.alerta }}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Card 2: Lotes -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">
              <i class="mdi mdi-package me-2"></i>
              Lotes Disponíveis
              <span class="text-muted-foreground text-sm font-normal ml-2">
                ({{
                  item.lotes && item.lotes.length > 0 ? item.lotes.length : 0
                }}
                lotes)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              v-if="item.lotes && item.lotes.length > 0"
              class="overflow-x-auto"
            >
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-border">
                    <th
                      class="text-left py-3 px-3 font-semibold text-muted-foreground text-xs uppercase"
                    >
                      Número do Lote
                    </th>
                    <th
                      class="text-left py-3 px-3 font-semibold text-muted-foreground text-xs uppercase"
                    >
                      Data de Vencimento
                    </th>
                    <th
                      class="text-center py-3 px-3 font-semibold text-muted-foreground text-xs uppercase"
                    >
                      Quantidade
                    </th>
                    <th
                      class="text-center py-3 px-3 font-semibold text-muted-foreground text-xs uppercase"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(lote, idx) in item.lotes"
                    :key="idx"
                    class="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td class="text-left py-3 px-3">
                      <p class="font-semibold text-foreground">
                        {{ lote.numero_lote }}
                      </p>
                    </td>
                    <td class="text-left py-3 px-3">
                      <p
                        class="text-sm"
                        :class="
                          isVencido(lote.data_vencimento)
                            ? 'text-red-600 font-semibold'
                            : 'text-foreground'
                        "
                      >
                        {{ formatarData(lote.data_vencimento) }}
                      </p>
                    </td>
                    <td class="text-center py-3 px-3">
                      <p class="font-semibold text-slate-700">
                        {{ lote.quantidade }} un
                      </p>
                    </td>
                    <td class="text-center py-3 px-3">
                      <p
                        class="text-sm font-semibold"
                        :class="
                          isVencido(lote.data_vencimento)
                            ? 'text-red-600'
                            : 'text-green-600'
                        "
                      >
                        <i
                          :class="
                            isVencido(lote.data_vencimento)
                              ? 'mdi mdi-alert-circle me-1'
                              : 'mdi mdi-check-circle me-1'
                          "
                        ></i>
                        {{
                          isVencido(lote.data_vencimento) ? "Vencido" : "Válido"
                        }}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-center py-8">
              <i
                class="mdi mdi-package-variant text-5xl text-muted-foreground mb-3 block"
              ></i>
              <p class="text-muted-foreground">
                Nenhum lote registrado para este item
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="isOpen = false"> Fechar </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, inject } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const isOpen = ref(false);
const item = ref(null);

// Formatar data
const formatarData = (data) => {
  if (!data) return "N/A";
  try {
    return new Date(data).toLocaleDateString("pt-BR");
  } catch (e) {
    return data;
  }
};

// Verificar se lote está vencido
const isVencido = (dataVencimento) => {
  if (!dataVencimento) return false;
  try {
    const vencimento = new Date(dataVencimento);
    const hoje = new Date();
    return vencimento < hoje;
  } catch (e) {
    return false;
  }
};

// Métodos públicos
const openModal = (itemData) => {
  item.value = itemData;
  isOpen.value = true;
};

const closeModal = () => {
  isOpen.value = false;
  item.value = null;
};

defineExpose({
  openModal,
  closeModal,
});
</script>
