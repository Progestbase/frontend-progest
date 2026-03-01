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
  descricao: "",
  quantidade: 0,
  unidade_medida: "UN",
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
    :title="
      modalFunction === 'ADD'
        ? 'Novo Item em Estoque'
        : 'Editar Item em Estoque'
    "
  >
    <div class="space-y-4 py-2">
      <div class="space-y-2">
        <Label for="est-nome">Nome do Produto</Label>
        <Input
          id="est-nome"
          v-model="localData.nome"
          class="uppercase"
          placeholder="Nome do item"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="est-desc">Descrição</Label>
          <Input
            id="est-desc"
            v-model="localData.descricao"
            class="uppercase"
            placeholder="Observações"
          />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div class="space-y-2">
            <Label for="est-qtd">Quantidade</Label>
            <Input id="est-qtd" type="number" v-model="localData.quantidade" />
          </div>

          <div class="space-y-2">
            <Label>Unidade</Label>
            <Select v-model="localData.unidade_medida">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UN">UN</SelectItem>
                <SelectItem value="KG">KG</SelectItem>
                <SelectItem value="LT">LT</SelectItem>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="PC">PC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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
