<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold flex items-center gap-2">
        <i class="mdi mdi-view-dashboard text-xl text-blue-600"></i>
        Visão Geral
      </h2>
      <p class="text-sm text-muted-foreground">
        Informações gerais e estatísticas do setor atual.
      </p>
    </div>

    <div class="row">
      <div class="col-md-8">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <i class="mdi mdi-information-outline"></i>
              Informações do Setor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <Label class="form-label">Nome:</Label>
                  <p class="form-control-plaintext">{{ setor.nome }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <Label class="form-label">Tipo:</Label>
                  <Badge
                    :variant="
                      setor.tipo === 'Medicamento' ? 'secondary' : 'default'
                    "
                  >
                    {{ setor.tipo }}
                  </Badge>
                </div>
                <div class="mb-3">
                  <Label class="form-label">Controla Estoque:</Label>
                  <Badge :variant="setor.estoque ? 'outline' : 'secondary'">
                    {{ setor.estoque ? "Sim" : "Não" }}
                  </Badge>
                </div>
              </div>
              <div class="col-12" v-if="setor.descricao">
                <div class="mb-3">
                  <Label class="form-label">Descrição:</Label>
                  <p class="form-control-plaintext">{{ setor.descricao }}</p>
                </div>
              </div>
              <div class="col-md-6" v-if="setor.unidade">
                <div class="mb-3">
                  <Label class="form-label">Unidade:</Label>
                  <p class="form-control-plaintext">{{ setor.unidade.nome }}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="col-md-4">
        <Card class="mb-4" v-if="!isSolicitante">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <i class="mdi mdi-cog-outline"></i>
              Ações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-col gap-2">
              <Button @click="editarSetor" class="w-full">
                <i class="mdi mdi-pencil me-2"></i>
                Editar Setor
              </Button>
              <Button
                v-if="isAdminUser"
                @click="excluirSetor"
                variant="destructive"
                class="w-full"
              >
                <i class="mdi mdi-delete me-2"></i>
                Excluir Setor
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          v-if="
            setor.fornecedores_relacionados &&
            setor.fornecedores_relacionados.length > 0
          "
          class="mb-4"
        >
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <i class="mdi mdi-truck-delivery-outline"></i>
              Setor Distribuidor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              v-for="rel in setor.fornecedores_relacionados.slice(0, 3)"
              :key="rel.id"
              class="mb-3 p-3 border rounded-lg"
            >
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-semibold">
                    {{
                      rel.fornecedor?.nome ||
                      rel.fornecedor?.razao_social ||
                      "Desconhecido"
                    }}
                  </div>
                  <div class="text-muted-foreground text-sm">
                    {{ rel.fornecedor?.descricao || "" }}
                  </div>
                </div>
                <div class="text-right">
                  <Badge
                    :variant="
                      rel.tipo_produto === 'Medicamento'
                        ? 'secondary'
                        : 'default'
                    "
                  >
                    {{ rel.tipo_produto || rel.fornecedor?.tipo || "-" }}
                  </Badge>
                </div>
              </div>
            </div>

            <div
              v-if="setor.fornecedores_relacionados.length > 3"
              class="text-center"
            >
              <p class="text-muted-foreground text-sm">
                +{{ setor.fornecedores_relacionados.length - 3 }} outros
                fornecedores
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from "vue";
import { useStore } from "vuex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const store = useStore();

defineProps({
  setor: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["navigate", "editar-setor", "excluir-setor"]);

// Verificar se o usuário é admin@admin.com
const isAdminUser = computed(() => {
  const user = store.state.user;
  return user && user.email === "admin@admin.com";
});

// Verificar se o usuário possui perfil 'solicitante' no setor atual
const isSolicitante = computed(() => {
  const user = store.state.user;
  if (!user) return false;

  try {
    const list = store.state.listUsuariosSetor || [];
    const found = list.find((u) => {
      const userId =
        u.usuario_id || u.user_id || u.id || (u.usuario && u.usuario.id);
      const perfil = (u.perfil || (u.pivot && u.pivot.perfil) || "")
        .toString()
        .toLowerCase();
      return (
        userId === user.id &&
        (perfil === "solicitante" || perfil.includes("solicitante"))
      );
    });
    if (found) return true;
  } catch (e) {
    console.warn("Erro ao avaliar isSolicitante (TabOverview):", e);
  }

  if (
    (user.roles && user.roles.includes && user.roles.includes("solicitante")) ||
    (user.perfil &&
      user.perfil.toString().toLowerCase().includes("solicitante"))
  )
    return true;

  return false;
});

// Função para formatar datas
const formatarData = (dataString) => {
  if (!dataString) return "N/A";
  const data = new Date(dataString);
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Funções de ação do setor
const editarSetor = () => {
  // Emitir evento para o componente pai editar o setor
  emit("editar-setor");
};

const excluirSetor = () => {
  // Emitir evento para o componente pai excluir o setor
  emit("excluir-setor");
};
</script>
