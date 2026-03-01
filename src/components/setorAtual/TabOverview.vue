<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import {
  PencilIcon,
  Trash2Icon,
  InfoIcon,
  Settings2Icon,
  TruckIcon,
  PlusIcon,
  LayoutDashboardIcon,
  CalendarIcon,
} from "lucide-vue-next";

const store = useStore();
const { toast } = useToast();

const props = defineProps({
  setor: { type: Object, required: true },
  readOnly: { type: Boolean, default: false },
});

const emit = defineEmits(["navigate", "editar-setor", "excluir-setor"]);

// State for Add Modal
const isAddModalOpen = ref(false);
const availableSetores = ref([]);
const selectedFornecedorId = ref("");
const loadingAdd = ref(false);

const isAdminUser = computed(() => {
  const user = store.state.user;
  return user && (user.email === "admin@admin.com" || user.is_admin);
});

const isSolicitante = computed(() => {
  const user = store.state.user;
  if (!user) return false;
  const list = store.state.listUsuariosSetor || [];
  const found = list.find((u) => {
    const userId = u.usuario_id || u.user_id || u.id || u.usuario?.id;
    const perfil = (u.perfil || u.pivot?.perfil || "").toString().toLowerCase();
    return userId === user.id && perfil.includes("solicitante");
  });
  return !!found;
});

const openAddModal = async () => {
  isAddModalOpen.value = true;
  selectedFornecedorId.value = "";
  loadingAdd.value = false;

  const result = await listarSetores();
  if (result.success) {
    const currentId = props.setor.id;
    const existingIds = (props.setor.fornecedores_relacionados || []).map(
      (r) => r.setor_fornecedor_id,
    );
    availableSetores.value = result.data.filter(
      (s) => s.id !== currentId && !existingIds.includes(s.id) && s.estoque,
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
  const result = await addFornecedor(
    props.setor.id,
    selectedFornecedorId.value,
  );
  if (result.success) {
    toast({
      title: "Sucesso",
      description: "Distribuidor adicionado com sucesso.",
    });
    isAddModalOpen.value = false;
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
  const result = await removeFornecedor(relationId);
  if (result.success) {
    toast({
      title: "Sucesso",
      description: "Distribuidor removido com sucesso.",
    });
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
  if (result.success) store.commit("setSetorDetails", result.data);
};

const formatarData = (date) => {
  if (!date) return "--/--/----";
  return new Date(date).toLocaleString("pt-BR");
};
</script>

<template>
  <div class="flex flex-col gap-8 pb-10">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <!-- Info Section -->
      <div class="lg:col-span-2 space-y-6">
        <Card
          class="overflow-hidden border-slate-200 shadow-sm transition-all hover:shadow-md"
        >
          <CardHeader class="border-b bg-slate-50/50 py-4">
            <CardTitle class="flex items-center gap-2 text-lg">
              <InfoIcon class="w-5 h-5 text-primary" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-1">
                <Label class="text-xs uppercase font-bold text-slate-400"
                  >Nome da Unidade</Label
                >
                <p class="text-lg font-semibold text-slate-900">
                  {{ setor.nome }}
                </p>
              </div>

              <div class="flex gap-8">
                <div class="space-y-2">
                  <Label class="text-xs uppercase font-bold text-slate-400"
                    >Tipo de Insumos</Label
                  >
                  <div>
                    <Badge
                      :variant="
                        setor.tipo === 'Medicamento' ? 'secondary' : 'default'
                      "
                      class="px-3 py-1 text-xs"
                    >
                      {{ setor.tipo }}
                    </Badge>
                  </div>
                </div>
                <div class="space-y-2">
                  <Label class="text-xs uppercase font-bold text-slate-400"
                    >Controle de Estoque</Label
                  >
                  <div>
                    <Badge
                      :variant="setor.estoque ? 'outline' : 'secondary'"
                      class="px-3 py-1 text-xs"
                    >
                      {{ setor.estoque ? "Ativado" : "Desativado" }}
                    </Badge>
                  </div>
                </div>
              </div>

              <div
                class="md:col-span-2 space-y-1 pt-4 border-t border-slate-100"
              >
                <Label class="text-xs uppercase font-bold text-slate-400"
                  >Descrição / Observações</Label
                >
                <p class="text-slate-600 leading-relaxed">
                  {{
                    setor.descricao ||
                    "Nenhuma descrição informada para este setor."
                  }}
                </p>
              </div>

              <div
                v-if="setor.unidade"
                class="md:col-span-2 space-y-1 pt-4 border-t border-slate-100"
              >
                <Label class="text-xs uppercase font-bold text-slate-400"
                  >Unidade Central / Polo</Label
                >
                <div class="flex items-center gap-2 text-slate-700 font-medium">
                  <div
                    class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                  >
                    <LayoutDashboardIcon class="w-4 h-4 text-slate-500" />
                  </div>
                  {{ setor.unidade.nome }}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Timeline / Traceability Card -->
        <Card class="border-slate-200 shadow-sm">
          <CardHeader class="border-b bg-slate-50/50 py-4">
            <CardTitle class="flex items-center gap-2 text-lg">
              <CalendarIcon class="w-5 h-5 text-primary" />
              Datas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent class="p-6">
            <div class="flex flex-col md:flex-row gap-12">
              <div class="flex items-center gap-4">
                <div class="p-3 bg-blue-50 rounded-xl">
                  <PlusIcon class="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p class="text-xs uppercase font-bold text-slate-400">
                    Data de Criação
                  </p>
                  <p class="font-semibold text-slate-800">
                    {{ formatarData(setor.created_at) }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="p-3 bg-slate-100 rounded-xl">
                  <PencilIcon class="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <p class="text-xs uppercase font-bold text-slate-400">
                    Última Atualização
                  </p>
                  <p class="font-semibold text-slate-800">
                    {{ formatarData(setor.updated_at) }}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Actions & Relations Section -->
      <div class="space-y-6">
        <!-- Shortcut Actions Card -->
        <Card
          v-if="!isSolicitante && !readOnly"
          class="border-slate-200 shadow-sm border-l-4 border-l-primary/50"
        >
          <CardHeader class="pb-3">
            <CardTitle class="flex items-center gap-2 text-lg">
              <Settings2Icon class="w-5 h-5 text-primary" />
              Gestão
            </CardTitle>
            <CardDescription
              >Gerencie as configurações e o ciclo de vida deste
              setor.</CardDescription
            >
          </CardHeader>
          <CardContent class="space-y-3 pb-6">
            <Button
              @click="emit('editar-setor')"
              class="w-full justify-start h-12 gap-3 bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-none"
            >
              <div class="bg-primary/10 p-2 rounded-lg text-primary">
                <PencilIcon class="w-4 h-4" />
              </div>
              <span class="font-semibold">Editar Detalhes</span>
            </Button>

            <Button
              v-if="isAdminUser"
              @click="emit('excluir-setor')"
              variant="outline"
              class="w-full justify-start h-12 gap-3 text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive transition-colors shadow-none"
            >
              <div class="bg-destructive/10 p-2 rounded-lg">
                <Trash2Icon class="w-4 h-4" />
              </div>
              <span class="font-semibold">Excluir Unidade</span>
            </Button>
          </CardContent>
        </Card>

        <!-- Suppliers / Distributors Card -->
        <Card class="border-slate-200 shadow-sm">
          <CardHeader class="pb-3">
            <div class="flex items-center justify-between">
              <CardTitle class="flex items-center gap-2 text-lg">
                <TruckIcon class="w-5 h-5 text-primary" />
                Distribuidor
              </CardTitle>

              <Dialog
                v-if="!isSolicitante && !readOnly"
                :open="isAddModalOpen"
                @update:open="isAddModalOpen = $event"
              >
                <DialogTrigger as-child>
                  <Button
                    variant="ghost"
                    size="icon"
                    @click="openAddModal"
                    class="h-8 w-8 rounded-full bg-slate-100 hover:bg-primary hover:text-white transition-all text-slate-600"
                  >
                    <PlusIcon class="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent class="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Vincular Distribuidor</DialogTitle>
                    <CardDescription
                      >Escolha o setor que servirá como fonte de suprimentos
                      para este setor.</CardDescription
                    >
                  </DialogHeader>
                  <div class="py-6 space-y-4">
                    <div class="space-y-2">
                      <Label>Setor Distribuidor</Label>
                      <Select v-model="selectedFornecedorId">
                        <SelectTrigger
                          ><SelectValue placeholder="Selecione um setor..."
                        /></SelectTrigger>
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
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" @click="isAddModalOpen = false"
                      >Cancelar</Button
                    >
                    <Button
                      @click="handleAddFornecedor"
                      :disabled="!selectedFornecedorId || loadingAdd"
                      class="gap-2"
                    >
                      <PlusIcon v-if="!loadingAdd" class="w-4 h-4" />
                      {{ loadingAdd ? "Processando..." : "Confirmar Vínculo" }}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription
              >Unidades centrais que fornecem itens.</CardDescription
            >
          </CardHeader>
          <CardContent class="pb-6">
            <div
              v-if="
                setor.fornecedores_relacionados &&
                setor.fornecedores_relacionados.length > 0
              "
              class="space-y-3"
            >
              <div
                v-for="rel in setor.fornecedores_relacionados"
                :key="rel.id"
                class="group p-4 bg-white border rounded-xl hover:border-primary/30 transition-all hover:bg-slate-50/50"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                    >
                      <TruckIcon class="w-5 h-5" />
                    </div>
                    <div>
                      <div class="font-bold text-slate-800 text-sm">
                        {{
                          rel.fornecedor?.nome ||
                          rel.fornecedor?.razao_social ||
                          "Distribuidor"
                        }}
                      </div>
                      <div class="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="outline"
                          class="text-[10px] h-4 px-1.5 uppercase font-bold tracking-wider"
                        >
                          {{ rel.tipo_produto || rel.fornecedor?.tipo || "-" }}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    v-if="!isSolicitante && !readOnly"
                    variant="ghost"
                    size="icon"
                    class="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive hover:bg-destructive/10 transition-all"
                    @click="handleRemoveFornecedor(rel.id)"
                    title="Remover distribuidor"
                  >
                    <Trash2Icon class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div
              v-else
              class="flex flex-col items-center justify-center py-10 bg-slate-50 border border-dashed rounded-2xl"
            >
              <TruckIcon class="w-10 h-10 text-slate-300 mb-2" />
              <p class="text-slate-400 text-xs text-center px-4">
                Esta unidade não recebe suprimentos de sub-centros específicos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
