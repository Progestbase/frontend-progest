<script setup>
import { computed, ref, watch, getCurrentInstance, onMounted } from "vue";
import { useStore } from "vuex";
import CadastroDialog from "@/components/layouts/CadastroDialog.vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  BuildingIcon,
  InfoIcon,
  ShieldCheckIcon,
  PackageCheckIcon,
} from "lucide-vue-next";
import Funcoes from "@/functions/cad_setores.js";
import cadPolos from "@/functions/cad_polos.js";

const props = defineProps(["idModal", "functions"]);
const store = useStore();
const { proxy } = getCurrentInstance();

const loading = ref(false);
const localData = ref({
  id: null,
  status: "A",
  tipo: "Material",
  estoque: false,
  unidade_id: "",
  nome: "",
  descricao: "",
});

const modalDataStore = computed(() => store.state.modalData.modalData);
const modalFunction = computed(() => store.state.modalData.modalFunction);
const modalErrors = computed(() => store.state.modalErrors || {});
const isModalOpen = computed({
  get: () => store.state.modalData.isModalOpen,
  set: (value) => store.commit("setModalOpen", value),
});

const unidadesList = computed(() => {
  const list = store.state.listUnidades || {};
  return Array.isArray(list.data) ? list.data : [];
});

watch(
  modalDataStore,
  (newValue) => {
    if (newValue) {
      localData.value = JSON.parse(JSON.stringify(newValue));
      if (!localData.value.status) localData.value.status = "A";
      if (!localData.value.tipo) localData.value.tipo = "Material";
      if (localData.value.unidade_id)
        localData.value.unidade_id = localData.value.unidade_id.toString();
    }
  },
  { deep: true, immediate: true },
);

onMounted(() => {
  if (unidadesList.value.length === 0) {
    cadPolos.listAll({ $axios: proxy.$axios, $store: store });
  }
});

const handleSave = () => {
  store.commit("setModalErrors", {});
  loading.value = true;
  const content = {
    $axios: proxy.$axios,
    $store: store,
    $toastr: proxy.$toastr,
    modalData: localData.value,
  };
  props.functions.ADD_UP(content, modalFunction.value);
  loading.value = false;
};
</script>

<template>
  <CadastroDialog
    v-model:open="isModalOpen"
    :title="
      modalFunction === 'ADD'
        ? 'Cadastrar Unidade Interna'
        : 'Editar Unidade Interna'
    "
  >
    <div class="space-y-6 py-4">
      <!-- Row 1: Status and Classification -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-3">
          <Label
            class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"
          >
            <ShieldCheckIcon class="w-3 h-3" /> Status Operacional
          </Label>
          <Select v-model="localData.status">
            <SelectTrigger
              class="h-12 border-slate-200 rounded-2xl bg-slate-50/30"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="rounded-xl border-slate-200">
              <SelectItem value="A">Ativo</SelectItem>
              <SelectItem value="I">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-3">
          <Label
            class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"
          >
            <InfoIcon class="w-3 h-3" /> Tipo de Gestão
          </Label>
          <Select v-model="localData.tipo">
            <SelectTrigger
              class="h-12 border-slate-200 rounded-2xl bg-slate-50/30"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="rounded-xl border-slate-200">
              <SelectItem value="Material">Material de Consumo</SelectItem>
              <SelectItem value="Medicamento"
                >Medicamento / Farmácia</SelectItem
              >
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Row 2: Inventory Control and Regional Unit -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-3">
          <Label
            class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"
          >
            <PackageCheckIcon class="w-3 h-3" /> Controle de Estoque
          </Label>
          <Select v-model="localData.estoque">
            <SelectTrigger
              class="h-12 border-slate-200 rounded-2xl bg-slate-50/30"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="rounded-xl border-slate-200">
              <SelectItem :value="true">Sim, monitorar saldo</SelectItem>
              <SelectItem :value="false">Não, apenas fluxo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-3">
          <Label
            class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"
          >
            <BuildingIcon class="w-3 h-3" /> Polo / Unidade Superior
          </Label>
          <Select v-model="localData.unidade_id">
            <SelectTrigger
              class="h-12 border-slate-200 rounded-2xl bg-slate-50/30"
            >
              <SelectValue placeholder="Selecione o polo" />
            </SelectTrigger>
            <SelectContent class="rounded-xl border-slate-200">
              <SelectItem
                v-for="u in unidadesList"
                :key="u.id"
                :value="u.id.toString()"
              >
                {{ u.nome }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Row 3: Name -->
      <div class="space-y-3">
        <Label
          for="uni-nome"
          class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"
        >
          Nome da Unidade <span class="text-destructive">*</span>
        </Label>
        <Input
          id="uni-nome"
          v-model="localData.nome"
          class="h-12 border-slate-200 rounded-2xl bg-white shadow-sm focus:ring-primary/20 transition-all text-sm font-bold"
          placeholder="Ex: Farmácia do PS, Setor de Limpeza..."
        />
        <p
          v-if="modalErrors.nome"
          class="text-[10px] text-destructive font-black uppercase tracking-tight ml-1"
        >
          {{ modalErrors.nome[0] }}
        </p>
      </div>

      <!-- Row 4: Description -->
      <div class="space-y-3">
        <Label
          for="uni-desc"
          class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1"
        >
          Descrição e Notas Adicionais
        </Label>
        <Textarea
          id="uni-desc"
          v-model="localData.descricao"
          class="min-h-[100px] border-slate-200 rounded-2xl bg-white shadow-sm focus:ring-primary/20 text-sm font-medium p-4"
          placeholder="Descreva a finalidade desta unidade ou observações internas..."
        />
      </div>
    </div>

    <template #footer="{ close }">
      <div class="flex gap-3 w-full sm:w-auto">
        <Button
          variant="ghost"
          @click="close"
          class="flex-1 sm:px-8 h-12 rounded-xl font-bold text-slate-400 hover:text-slate-600"
        >
          Cancelar
        </Button>
        <Button
          @click="handleSave"
          :disabled="loading"
          class="flex-1 sm:px-12 h-12 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          {{ modalFunction === "ADD" ? "Criar Unidade" : "Salvar Alterações" }}
        </Button>
      </div>
    </template>
  </CadastroDialog>
</template>
