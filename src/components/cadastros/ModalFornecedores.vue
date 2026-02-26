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
  razao_social_nome: "",
  tipo_pessoa: "J",
  cnpj: "",
  cpf: "",
  status: "A",
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
      if (!localData.value.tipo_pessoa) localData.value.tipo_pessoa = "J";
      if (!localData.value.status) localData.value.status = "A";
    }
  },
  { deep: true, immediate: true },
);

const fieldError = (field) => {
  const v = modalErrors.value[field];
  if (!v) return null;
  return Array.isArray(v) ? v[0] : v;
};

const handleSave = () => {
  // limpa erros anteriores
  store.commit("setModalErrors", {});

  const tipo = localData.value.tipo_pessoa || "J";
  const onlyDigits = (s) => (s || "").toString().replace(/\D/g, "");

  const payloadData = JSON.parse(JSON.stringify(localData.value));
  if (payloadData.cnpj) payloadData.cnpj = onlyDigits(payloadData.cnpj);
  if (payloadData.cpf) payloadData.cpf = onlyDigits(payloadData.cpf);

  if (tipo === "J") {
    if (!payloadData.cnpj || payloadData.cnpj.length !== 14) {
      store.commit("setModalErrors", { cnpj: ["CNPJ deve ter 14 dígitos"] });
      proxy.$toastr?.e("Informe um CNPJ válido.");
      return;
    }
    payloadData.cpf = null;
  } else {
    if (!payloadData.cpf || payloadData.cpf.length !== 11) {
      store.commit("setModalErrors", { cpf: ["CPF deve ter 11 dígitos"] });
      proxy.$toastr?.e("Informe um CPF válido.");
      return;
    }
    payloadData.cnpj = null;
  }

  const content = {
    $axios: proxy.$axios,
    $store: store,
    $toastr: proxy.$toastr,
    modalData: payloadData,
  };

  props.functions.ADD_UP(content, modalFunction.value);
};
</script>

<template>
  <CadastroDialog
    v-model:open="isModalOpen"
    :title="
      modalFunction === 'ADD' ? 'Cadastrar Fornecedor' : 'Editar Fornecedor'
    "
  >
    <div class="grid grid-cols-1 gap-4 py-2">
      <div class="space-y-2">
        <Label for="razao"
          >Razão Social / Nome <span class="text-destructive">*</span></Label
        >
        <Input
          id="razao"
          v-model="localData.razao_social_nome"
          placeholder="Digite o nome completo"
          class="uppercase"
        />
        <p
          v-if="fieldError('razao_social_nome')"
          class="text-xs text-destructive"
        >
          {{ fieldError("razao_social_nome") }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="space-y-2">
          <Label for="tipo">Tipo Pessoa</Label>
          <Select v-model="localData.tipo_pessoa">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="J">Pessoa Jurídica</SelectItem>
              <SelectItem value="F">Pessoa Física</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <template v-if="localData.tipo_pessoa === 'J'">
            <Label for="cnpj"
              >CNPJ <span class="text-destructive">*</span></Label
            >
            <Input
              id="cnpj"
              v-model="localData.cnpj"
              v-mask="'##.###.###/####-##'"
              placeholder="00.000.000/0000-00"
            />
            <p v-if="fieldError('cnpj')" class="text-xs text-destructive">
              {{ fieldError("cnpj") }}
            </p>
          </template>
          <template v-else>
            <Label for="cpf">CPF <span class="text-destructive">*</span></Label>
            <Input
              id="cpf"
              v-model="localData.cpf"
              v-mask="'###.###.###-##'"
              placeholder="000.000.000-00"
            />
            <p v-if="fieldError('cpf')" class="text-xs text-destructive">
              {{ fieldError("cpf") }}
            </p>
          </template>
        </div>

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
      </div>
    </div>

    <template #footer="{ close }">
      <Button variant="outline" @click="close"> Fechar </Button>
      <Button @click="handleSave">
        {{ modalFunction === "ADD" ? "Salvar" : "Atualizar" }}
      </Button>
    </template>
  </CadastroDialog>
</template>
