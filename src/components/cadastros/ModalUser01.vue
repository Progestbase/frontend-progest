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
import Funcoes from "@/functions/cad_usuarios.js";

const props = defineProps(["idModal", "functions"]);
const store = useStore();
const { proxy } = getCurrentInstance();

const localData = ref({
  id: null,
  status: "A",
  tipo_vinculo: "",
  name: "",
  cpf: "",
  email: "",
  telefone: "",
  data_nascimento: "",
  password: "",
});

const modalDataStore = computed(() => store.state.modalData.modalData);
const modalFunction = computed(() => store.state.modalData.modalFunction);
const listTiposVinculoStore = computed(
  () => store.state.listTiposVinculo || [],
);
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

onMounted(() => {
  Funcoes.listTiposVinculo({ $axios: proxy.$axios, $store: store })?.catch(
    (e) => {
      console.warn("Erro ao carregar tipos de vínculo:", e);
    },
  );
});

const handleSave = () => {
  if (
    !localData.value.name ||
    !localData.value.email ||
    !localData.value.cpf ||
    !localData.value.tipo_vinculo
  ) {
    proxy.$toastr?.e("Por favor, preencha todos os campos obrigatórios (*)");
    return;
  }

  if (modalFunction.value === "ADD" && !localData.value.password) {
    proxy.$toastr?.e("Senha é obrigatória para novos usuários");
    return;
  }

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
    :title="modalFunction === 'ADD' ? 'Cadastrar Usuário' : 'Editar Usuário'"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
      <div class="space-y-2">
        <Label for="status">Status</Label>
        <Select v-model="localData.status">
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">Ativo</SelectItem>
            <SelectItem value="I">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <Label for="vinculo"
          >Tipo de Vínculo <span class="text-destructive">*</span></Label
        >
        <Select v-model="localData.tipo_vinculo">
          <SelectTrigger>
            <SelectValue placeholder="Selecione o vínculo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="tipo in listTiposVinculoStore"
              :key="tipo.id"
              :value="tipo.id.toString()"
            >
              {{ tipo.nome }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2 md:col-span-1">
        <Label for="name">Nome <span class="text-destructive">*</span></Label>
        <Input id="name" v-model="localData.name" placeholder="Nome completo" />
      </div>

      <div class="space-y-2 md:col-span-1">
        <Label for="cpf">CPF <span class="text-destructive">*</span></Label>
        <Input
          id="cpf"
          v-model="localData.cpf"
          v-mask="'###.###.###-##'"
          placeholder="000.000.000-00"
        />
      </div>

      <div class="space-y-2 md:col-span-2">
        <Label for="email"
          >E-mail <span class="text-destructive">*</span></Label
        >
        <Input
          id="email"
          type="email"
          v-model="localData.email"
          placeholder="usuario@exemplo.com"
        />
      </div>

      <div class="space-y-2">
        <Label for="telefone">Telefone</Label>
        <Input
          id="telefone"
          v-model="localData.telefone"
          v-mask="'(##) #####-####'"
          placeholder="(00) 00000-0000"
        />
      </div>

      <div class="space-y-2">
        <Label for="nascimento">Data de Nascimento</Label>
        <Input
          id="nascimento"
          type="date"
          v-model="localData.data_nascimento"
        />
      </div>

      <div class="space-y-2 md:col-span-2">
        <Label for="password"
          >Senha
          <span v-if="modalFunction === 'ADD'" class="text-destructive"
            >*</span
          ></Label
        >
        <Input
          id="password"
          type="password"
          v-model="localData.password"
          placeholder="Digite a senha"
        />
        <p
          v-if="modalFunction === 'UP'"
          class="text-[11px] text-muted-foreground italic"
        >
          Deixe em branco para manter a senha atual.
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
