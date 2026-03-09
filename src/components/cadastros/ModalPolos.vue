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

const props = defineProps(["idModal", "functions"]);
const store = useStore();
const { proxy } = getCurrentInstance();

const localData = ref({
  id: null,
  nome: "",
  status: "A",
});

const modalDataStore = computed(() => store.state.modalData.modalData);
const modalFunction = computed(() => store.state.modalData.modalFunction);
const modalErrors = computed(() => store.state.modalErrors || {});
const isModalOpen = computed({
  get: () => store.state.modalData.isModalOpen,
  set: (value) => store.commit("setModalOpen", value),
});

// Funções auxiliares para erros inline
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
  store.commit("setModalErrors", {});

  if (!localData.value.nome) {
    proxy.$toastr?.e("Por favor, preencha o nome da unidade.");
    return;
  }

  const content = {
    $axios: proxy.$axios,
    $store: store,
    $toastr: proxy.$toastr,
    modalData: localData.value,
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
      modalFunction === 'ADD' ? 'Cadastrar Unidade' : 'Editar Unidade'
    "
  >
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
      <div class="space-y-2 md:col-span-2">
        <Label for="nome">Nome <span class="text-destructive">*</span></Label>
        <Input
          id="nome"
          v-model="localData.nome"
          placeholder="Digite o nome da unidade"
          :class="{ 'border-red-500 focus-visible:ring-red-500': hasError('nome') }"
        />
        <p v-if="hasError('nome')" class="text-xs text-destructive mt-1">
          {{ getError("nome") }}
        </p>
      </div>

      <div class="space-y-2 md:col-span-1">
        <Label for="status">Status</Label>
        <Select v-model="localData.status">
          <SelectTrigger :class="{ 'border-red-500': hasError('status') }">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">Ativo</SelectItem>
            <SelectItem value="I">Inativo</SelectItem>
          </SelectContent>
        </Select>
        <p v-if="hasError('status')" class="text-xs text-destructive mt-1">
          {{ getError("status") }}
        </p>
      </div>
    </div>

    <template #footer="{ close }">
      <Button variant="outline" @click="close"> Fechar </Button>
      <Button @click="handleSave" class="min-w-[100px]">
        {{ modalFunction === "ADD" ? "Salvar" : "Atualizar" }}
      </Button>
    </template>
  </CadastroDialog>
</template>
