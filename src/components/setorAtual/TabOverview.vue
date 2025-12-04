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

        <Card class="mb-4">
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle class="flex items-center gap-2">
                <i class="mdi mdi-truck-delivery-outline"></i>
                Setor Distribuidor
              </CardTitle>
              <Dialog v-if="!isSolicitante" :open="isAddModalOpen" @update:open="isAddModalOpen = $event">
                <DialogTrigger as-child>
                  <Button variant="outline" size="sm" @click="openAddModal">
                    <i class="mdi mdi-plus"></i>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Fornecedor</DialogTitle>
                  </DialogHeader>
                  <div class="py-4">
                    <Label class="mb-2 block">Selecione o Setor Fornecedor</Label>
                    <Select v-model="selectedFornecedorId">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um setor..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          v-for="s in availableSetores"
                          :key="s.id"
                          :value="String(s.id)"
                        >
                          {{ s.nome }} ({{ s.tipo }})
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div class="flex justify-end gap-2">
                    <Button variant="ghost" @click="isAddModalOpen = false">Cancelar</Button>
                    <Button @click="handleAddFornecedor" :disabled="!selectedFornecedorId || loadingAdd">
                      {{ loadingAdd ? 'Adicionando...' : 'Adicionar' }}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div
              v-if="setor.fornecedores_relacionados && setor.fornecedores_relacionados.length > 0"
            >
              <div
                v-for="rel in setor.fornecedores_relacionados"
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
                  <div class="flex items-center gap-2">
                    <Badge variant="outline">
                      {{ rel.fornecedor?.tipo || "-" }}
                    </Badge>
                    <Button
                      v-if="!isSolicitante"
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6 text-destructive hover:text-destructive/90"
                      @click="handleRemoveFornecedor(rel.id)"
                      title="Remover fornecedor"
                    >
                      <i class="mdi mdi-trash-can-outline"></i>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-muted-foreground py-4">
              Nenhum fornecedor vinculado.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref } from "vue";
import { useStore } from "vuex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listarSetores,
  addFornecedor,
  removeFornecedor,
  buscarSetorPorId,
} from "@/functions/cad_setores";
import { useToast } from "@/components/ui/toast/use-toast";

const store = useStore();
const { toast } = useToast();

const props = defineProps({
  setor: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["navigate", "editar-setor", "excluir-setor"]);

// State for Add Modal
const isAddModalOpen = ref(false);
const availableSetores = ref([]);
const selectedFornecedorId = ref("");
const loadingAdd = ref(false);

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

// Funções de ação do setor
const editarSetor = () => {
  emit("editar-setor");
};

const excluirSetor = () => {
  emit("excluir-setor");
};

// Supplier Management Functions
const openAddModal = async () => {
  isAddModalOpen.value = true;
  selectedFornecedorId.value = "";
  loadingAdd.value = false;

  // Fetch available sectors
  const result = await listarSetores();
  if (result.success) {
    // Filter out current sector and already added suppliers
    const currentId = props.setor.id;
    const existingIds = (props.setor.fornecedores_relacionados || []).map(
      (r) => r.setor_fornecedor_id
    );

    availableSetores.value = result.data.filter(
      (s) => s.id !== currentId && !existingIds.includes(s.id) && s.estoque
    );
  } else {
    toast({
      title: "Erro",
      description: "Não foi possível carregar os setores disponíveis.",
      variant: "destructive",
    });
  }
};

const handleAddFornecedor = async () => {
  if (!selectedFornecedorId.value) return;

  loadingAdd.value = true;
  const result = await addFornecedor(props.setor.id, selectedFornecedorId.value);

  if (result.success) {
    toast({
      title: "Sucesso",
      description: "Fornecedor adicionado com sucesso.",
    });
    isAddModalOpen.value = false;
    // Reload sector details to update the list
    await reloadSetorDetails();
  } else {
    toast({
      title: "Erro",
      description: result.message,
      variant: "destructive",
    });
  }
  loadingAdd.value = false;
};

const handleRemoveFornecedor = async (relationId) => {
  if (!confirm("Tem certeza que deseja remover este fornecedor?")) return;

  const result = await removeFornecedor(relationId);

  if (result.success) {
    toast({
      title: "Sucesso",
      description: "Fornecedor removido com sucesso.",
    });
    // Reload sector details to update the list
    await reloadSetorDetails();
  } else {
    toast({
      title: "Erro",
      description: result.message,
      variant: "destructive",
    });
  }
};

const reloadSetorDetails = async () => {
  const result = await buscarSetorPorId(props.setor.id);
  
  if (result.success) {
     store.commit("setSetorDetails", result.data);
  }
};
</script>
