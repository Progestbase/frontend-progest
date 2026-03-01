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
  status: "A",
  nome: "",
  descricao: "",
});

const modalDataStore = computed(() => store.state.modalData.modalData);
const modalFunction = computed(() => store.state.modalData.modalFunction);
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
  const content = {
    $axios: proxy.$axios,
    $store: store,
    $toastr: proxy.$toastr,
    modalData: localData.value,
  };
  props.functions.ADD_UP(content, modalFunction.value);
};
</script>

<template>
  <CadastroDialog
    v-model:open="isModalOpen"
    :title="modalFunction === 'ADD' ? 'Cadastrar Perfil' : 'Editar Perfil'"
  >
    <div class="space-y-4 py-2">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="md:col-span-2 space-y-2">
          <Label for="perfil-nome"
            >Nome <span class="text-destructive">*</span></Label
          >
          <Input
            id="perfil-nome"
            v-model="localData.nome"
            class="uppercase"
            placeholder="Nome do perfil"
          />
        </div>

        <div class="space-y-2">
          <Label for="perfil-status">Status</Label>
          <Select v-model="localData.status">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Ativo</SelectItem>
              <SelectItem value="I">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="space-y-2">
        <Label for="perfil-desc">Descrição</Label>
        <Input
          id="perfil-desc"
          v-model="localData.descricao"
          placeholder="Breve descrição das permissões"
        />
      </div>
    </div>

    <template #footer="{ close }">
      <Button variant="outline" @click="close">Fechar</Button>
      <Button @click="handleSave">
        {{ modalFunction === "ADD" ? "Salvar" : "Atualizar" }}
      </Button>
    </template>
  </CadastroDialog>
</template>
