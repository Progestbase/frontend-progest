<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Card Principal - Informações do Setor -->
    <Card class="lg:col-span-2">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <i class="mdi mdi-information-outline text-lg"></i>
          Informações do Setor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-6">
          <!-- Nome -->
          <div>
            <label
              class="text-sm font-semibold text-muted-foreground mb-1 block"
            >
              Nome
            </label>
            <p class="text-base font-medium">{{ setor.nome }}</p>
          </div>

          <!-- Tipo e Status em uma linha -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="text-sm font-semibold text-muted-foreground mb-2 block"
              >
                Tipo
              </label>
              <Badge
                :variant="setor.tipo === 'Medicamento' ? 'outline' : 'default'"
              >
                <i class="mdi mdi-package me-1"></i>
                {{ setor.tipo }}
              </Badge>
            </div>
            <div>
              <label
                class="text-sm font-semibold text-muted-foreground mb-2 block"
              >
                Status
              </label>
              <Badge :variant="setor.status === 'A' ? 'default' : 'secondary'">
                <i
                  :class="
                    setor.status === 'A'
                      ? 'mdi mdi-check-circle me-1'
                      : 'mdi mdi-close-circle me-1'
                  "
                ></i>
                {{ setor.status === "A" ? "Ativo" : "Inativo" }}
              </Badge>
            </div>
          </div>

          <!-- Controla Estoque -->
          <div>
            <label
              class="text-sm font-semibold text-muted-foreground mb-2 block"
            >
              Controla Estoque
            </label>
            <Badge :variant="setor.estoque ? 'default' : 'outline'">
              <i
                :class="
                  setor.estoque ? 'mdi mdi-check me-1' : 'mdi mdi-close me-1'
                "
              ></i>
              {{ setor.estoque ? "Sim" : "Não" }}
            </Badge>
          </div>

          <!-- Descrição -->
          <div>
            <label
              class="text-sm font-semibold text-muted-foreground mb-1 block"
            >
              Descrição
            </label>
            <p class="text-sm text-foreground">
              {{ setor.descricao || "Nenhuma descrição" }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Card Secundário - Unidade -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <i class="mdi mdi-map-marker-outline text-lg"></i>
          Unidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div>
            <label
              class="text-sm font-semibold text-muted-foreground mb-1 block"
            >
              Nome
            </label>
            <p class="text-base font-medium">
              {{ setor.unidade?.nome || "N/A" }}
            </p>
          </div>
          <div>
            <label
              class="text-sm font-semibold text-muted-foreground mb-2 block"
            >
              Status
            </label>
            <Badge
              :variant="setor.unidade?.status === 'A' ? 'default' : 'secondary'"
            >
              <i
                :class="
                  setor.unidade?.status === 'A'
                    ? 'mdi mdi-check-circle me-1'
                    : 'mdi mdi-close-circle me-1'
                "
              ></i>
              {{ setor.unidade?.status === "A" ? "Ativo" : "Inativo" }}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

defineProps({
  setor: {
    type: Object,
    required: true,
  },
});
</script>
