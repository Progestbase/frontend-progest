<script setup>
import { computed, ref, watch, getCurrentInstance } from "vue";
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
import {
  ScaleIcon,
  RulerIcon,
  ShieldCheckIcon,
  BoxSelectIcon,
} from "lucide-vue-next";

const props = defineProps(["idModal", "functions"]);
const store = useStore();
const { proxy } = getCurrentInstance();

const loading = ref(false);
const localData = ref({
  id: null,
  status: "A",
  nome: "",
  quantidade_unidade_minima: 1,
});

const modalDataStore = computed(() => store.state.modalData.modalData);
const modalFunction = computed(() => store.state.modalData.modalFunction);
const modalErrors = computed(() => store.state.modalErrors || {});
const isModalOpen = computed({
  get: () => store.state.modalData.isModalOpen,
  set: (value) => store.commit("setModalOpen", value),
});

watch(
  modalDataStore,
  (newValue) => {
    if (newValue) {
      localData.value = JSON.parse(JSON.stringify(newValue));
      if (!localData.value.status) localData.value.status = "A";
    }
  },
  { deep: true, immediate: true },
);

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
      modalFunction === 'ADD' ? 'Nova Unidade de Medida' : 'Ajustar Métrica'
    "
  >
    <div class="space-y-6 py-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Name -->
        <div class="space-y-3">
          <Label
            for="uni-nome"
            class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"
          >
            <RulerIcon class="w-3 h-3" /> Sigla / Nome
            <span class="text-destructive">*</span>
          </Label>
          <Input
            id="uni-nome"
            v-model="localData.nome"
            class="h-12 border-slate-200 rounded-2xl bg-white shadow-sm focus:ring-primary/20 text-sm font-bold uppercase"
            placeholder="Ex: KG, UN, FRA, CX..."
          />
          <p
            v-if="modalErrors.nome"
            class="text-[10px] text-destructive font-black uppercase tracking-tight ml-1"
          >
            {{ modalErrors.nome[0] }}
          </p>
        </div>

        <!-- Status -->
        <div class="space-y-3">
          <Label
            for="uni-status"
            class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"
          >
            <ShieldCheckIcon class="w-3 h-3" /> Estado da Métrica
          </Label>
          <Select v-model="localData.status">
            <SelectTrigger
              class="h-12 border-slate-200 rounded-2xl bg-slate-50/30"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="rounded-xl border-slate-200">
              <SelectItem value="A">Ativa para uso</SelectItem>
              <SelectItem value="I">Inativa / Obsoleta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Quantity -->
      <div class="space-y-3">
        <Label
          for="uni-qtd"
          class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"
        >
          <BoxSelectIcon class="w-3 h-3" /> Quantidade Unidade Mínima
        </Label>
        <Input
          id="uni-qtd"
          type="number"
          v-model="localData.quantidade_unidade_minima"
          class="h-12 border-slate-200 rounded-2xl bg-white shadow-sm focus:ring-primary/20 text-sm font-bold"
          placeholder="Ex: 1"
        />
        <p class="text-[10px] text-slate-400 font-medium ml-1">
          Define o multiplicador base para fracionamento de itens.
        </p>
      </div>
    </div>

    <template #footer="{ close }">
      <div class="flex gap-3 w-full sm:w-auto">
        <Button
          variant="ghost"
          @click="close"
          class="h-12 px-8 rounded-xl font-bold text-slate-400 hover:text-slate-600"
        >
          Cancelar
        </Button>
        <Button
          @click="handleSave"
          :disabled="loading"
          class="flex-1 sm:px-12 h-12 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          {{ modalFunction === "ADD" ? "Criar Métrica" : "Salvar Mudanças" }}
        </Button>
      </div>
    </template>
  </CadastroDialog>
</template>
