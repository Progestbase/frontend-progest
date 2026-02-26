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
import { Textarea } from "@/components/ui/textarea";
import {
  TagIcon,
  BookmarkIcon,
  ShieldCheckIcon,
  FileTextIcon,
} from "lucide-vue-next";

const props = defineProps(["idModal", "functions"]);
const store = useStore();
const { proxy } = getCurrentInstance();

const loading = ref(false);
const localData = ref({
  id: null,
  status: "A",
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
      modalFunction === 'ADD' ? 'Novo Tipo de Produto' : 'Ajustar Classificação'
    "
  >
    <div class="space-y-6 py-4">
      <!-- Header Style within Dialog Content for context -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-2 space-y-3">
          <Label
            for="cat-nome"
            class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"
          >
            <TagIcon class="w-3 h-3" /> Identificação do Tipo
            <span class="text-destructive">*</span>
          </Label>
          <Input
            id="cat-nome"
            v-model="localData.nome"
            class="h-12 border-slate-200 rounded-2xl bg-white shadow-sm focus:ring-primary/20 text-sm font-bold uppercase"
            placeholder="Ex: PSICOTRÓPICOS, ANTIBIÓTICOS..."
          />
          <p
            v-if="modalErrors.nome"
            class="text-[10px] text-destructive font-black uppercase tracking-tight ml-1"
          >
            {{ modalErrors.nome[0] }}
          </p>
        </div>

        <div class="space-y-3">
          <Label
            for="cat-status"
            class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"
          >
            <ShieldCheckIcon class="w-3 h-3" /> Visibilidade
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
      </div>

      <div class="space-y-3">
        <Label
          for="cat-desc"
          class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"
        >
          <FileTextIcon class="w-3 h-3" /> Descritivo Técnico
        </Label>
        <Textarea
          id="cat-desc"
          v-model="localData.descricao"
          class="min-h-[100px] border-slate-200 rounded-2xl bg-white shadow-sm focus:ring-primary/20 text-sm font-medium p-4"
          placeholder="Descreva as características deste agrupamento de produtos..."
        />
      </div>
    </div>

    <template #footer="{ close }">
      <div class="flex gap-3 w-full sm:w-auto">
        <Button
          variant="ghost"
          @click="close"
          class="h-12 px-8 rounded-xl font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          Descartar
        </Button>
        <Button
          @click="handleSave"
          :disabled="loading"
          class="flex-1 sm:px-12 h-12 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          {{
            modalFunction === "ADD" ? "Salvar Categoria" : "Aplicar Mudanças"
          }}
        </Button>
      </div>
    </template>
  </CadastroDialog>
</template>
