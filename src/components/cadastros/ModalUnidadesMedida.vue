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
  RulerIcon,
  ShieldCheckIcon,
  BoxSelectIcon,
} from "lucide-vue-next";

const props = defineProps(["idModal", "functions"]);
const store = useStore();
const { proxy } = getCurrentInstance();

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

// Função auxiliar para verificar se um campo tem erro
const hasError = (campo) => !!modalErrors.value[campo];
const getError = (campo) =>
  modalErrors.value[campo] ? modalErrors.value[campo][0] : "";

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
  // Limpa erros antes de submeter
  store.commit("setModalErrors", {});

  if (!localData.value.nome) {
    proxy.$toastr?.e("Por favor, preencha o nome da unidade de medida.");
    return;
  }

  const content = {
    $axios: proxy.$axios,
    $store: store,
    $toastr: proxy.$toastr,
    modalData: localData.value,
    // Callback chamado após salvar com sucesso — fecha o modal
    onSuccess: () => {
      store.commit("setModalOpen", false);
    },
  };

  props.functions.ADD_UP(content, modalFunction.value);
};
</script>

<template>
  <CadastroDialog
    v-model:open="isModalOpen"
    :title="
      modalFunction === 'ADD' ? 'Nova Unidade de Medida' : 'Editar Unidade de Medida'
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
            class="h-12 border-slate-200 rounded-2xl bg-white shadow-sm focus:ring-primary/20 text-sm font-bold"
            :class="{ 'border-red-500 focus-visible:ring-red-500': hasError('nome') }"
            placeholder="Ex: KG, UN, FRA, CX..."
          />
          <p
            v-if="hasError('nome')"
            class="text-[10px] text-destructive font-black uppercase tracking-tight ml-1"
          >
            {{ getError("nome") }}
          </p>
        </div>

        <!-- Status -->
        <div class="space-y-3">
          <Label
            for="uni-status"
            class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"
          >
            <ShieldCheckIcon class="w-3 h-3" /> Status
          </Label>
          <Select v-model="localData.status">
            <SelectTrigger
              class="h-12 border-slate-200 rounded-2xl bg-slate-50/30"
              :class="{ 'border-red-500': hasError('status') }"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="rounded-xl border-slate-200">
              <SelectItem value="A">Ativo</SelectItem>
              <SelectItem value="I">Inativo</SelectItem>
            </SelectContent>
          </Select>
          <p
            v-if="hasError('status')"
            class="text-[10px] text-destructive font-black uppercase tracking-tight ml-1"
          >
            {{ getError("status") }}
          </p>
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
          :class="{ 'border-red-500 focus-visible:ring-red-500': hasError('quantidade_unidade_minima') }"
          placeholder="Ex: 1"
        />
        <p
          v-if="hasError('quantidade_unidade_minima')"
          class="text-[10px] text-destructive font-black uppercase tracking-tight ml-1"
        >
          {{ getError("quantidade_unidade_minima") }}
        </p>
        <p v-else class="text-[10px] text-slate-400 font-medium ml-1">
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
          class="flex-1 sm:px-12 h-12 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          {{ modalFunction === "ADD" ? "Criar" : "Salvar Alterações" }}
        </Button>
      </div>
    </template>
  </CadastroDialog>
</template>
