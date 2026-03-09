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

const hasError = (campo) => !!modalErrors.value[campo];
const getError = (campo) =>
  modalErrors.value[campo]
    ? Array.isArray(modalErrors.value[campo])
      ? modalErrors.value[campo][0]
      : modalErrors.value[campo]
    : "";

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

// Limitar CPF a exatamente 14 caracteres (com máscara: 000.000.000-00)
const handleCpfInput = (event) => {
  const raw = event.target.value.replace(/\D/g, "");
  if (raw.length > 11) {
    // Reaplica a máscara com apenas 11 dígitos
    const trimmed = raw.substring(0, 11);
    localData.value.cpf = trimmed.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4"
    );
  }
};

// Limitar CNPJ a exatamente 18 caracteres (com máscara: 00.000.000/0000-00)
const handleCnpjInput = (event) => {
  const raw = event.target.value.replace(/\D/g, "");
  if (raw.length > 14) {
    const trimmed = raw.substring(0, 14);
    localData.value.cnpj = trimmed.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }
};

const handleSave = () => {
  store.commit("setModalErrors", {});

  const tipo = localData.value.tipo_pessoa || "J";
  const onlyDigits = (s) => (s || "").toString().replace(/\D/g, "");

  const payloadData = JSON.parse(JSON.stringify(localData.value));
  if (payloadData.cnpj) payloadData.cnpj = onlyDigits(payloadData.cnpj);
  if (payloadData.cpf) payloadData.cpf = onlyDigits(payloadData.cpf);

  // Validação local antes de enviar
  if (!payloadData.razao_social_nome || payloadData.razao_social_nome.trim().length < 3) {
    store.commit("setModalErrors", {
      razao_social_nome: ["O nome/razão social é obrigatório (mín. 3 caracteres)."],
    });
    return;
  }

  if (tipo === "J") {
    if (!payloadData.cnpj || payloadData.cnpj.length !== 14) {
      store.commit("setModalErrors", { cnpj: ["CNPJ deve ter 14 dígitos."] });
      return;
    }
    payloadData.cpf = null;
  } else {
    if (!payloadData.cpf || payloadData.cpf.length !== 11) {
      store.commit("setModalErrors", { cpf: ["CPF deve ter 11 dígitos."] });
      return;
    }
    payloadData.cnpj = null;
  }

  const content = {
    $axios: proxy.$axios,
    $store: store,
    $toastr: proxy.$toastr,
    modalData: payloadData,
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
      modalFunction === 'ADD' ? 'Cadastrar Fornecedor' : 'Editar Fornecedor'
    "
  >
    <div class="grid grid-cols-1 gap-4 py-2">
      <!-- Razão Social / Nome -->
      <div class="space-y-2">
        <Label for="razao">
          Razão Social / Nome <span class="text-destructive">*</span>
        </Label>
        <Input
          id="razao"
          v-model="localData.razao_social_nome"
          placeholder="Digite o nome completo"
          :class="{
            'border-red-500 focus-visible:ring-red-500':
              hasError('razao_social_nome'),
          }"
        />
        <p
          v-if="hasError('razao_social_nome')"
          class="text-xs text-destructive mt-1"
        >
          {{ getError("razao_social_nome") }}
        </p>
      </div>

      <!-- Tipo Pessoa, CPF/CNPJ, Status -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="space-y-2">
          <Label for="tipo">
            Tipo Pessoa <span class="text-destructive">*</span>
          </Label>
          <Select v-model="localData.tipo_pessoa">
            <SelectTrigger
              :class="{ 'border-red-500': hasError('tipo_pessoa') }"
            >
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="J">Pessoa Jurídica</SelectItem>
              <SelectItem value="F">Pessoa Física</SelectItem>
            </SelectContent>
          </Select>
          <p
            v-if="hasError('tipo_pessoa')"
            class="text-xs text-destructive mt-1"
          >
            {{ getError("tipo_pessoa") }}
          </p>
        </div>

        <div class="space-y-2">
          <template v-if="localData.tipo_pessoa === 'J'">
            <Label for="cnpj">
              CNPJ <span class="text-destructive">*</span>
            </Label>
            <Input
              id="cnpj"
              v-model="localData.cnpj"
              v-mask="'##.###.###/####-##'"
              maxlength="18"
              placeholder="00.000.000/0000-00"
              :class="{
                'border-red-500 focus-visible:ring-red-500': hasError('cnpj'),
              }"
              @input="handleCnpjInput"
            />
            <p v-if="hasError('cnpj')" class="text-xs text-destructive mt-1">
              {{ getError("cnpj") }}
            </p>
          </template>
          <template v-else>
            <Label for="cpf">
              CPF <span class="text-destructive">*</span>
            </Label>
            <Input
              id="cpf"
              v-model="localData.cpf"
              v-mask="'###.###.###-##'"
              maxlength="14"
              placeholder="000.000.000-00"
              :class="{
                'border-red-500 focus-visible:ring-red-500': hasError('cpf'),
              }"
              @input="handleCpfInput"
            />
            <p v-if="hasError('cpf')" class="text-xs text-destructive mt-1">
              {{ getError("cpf") }}
            </p>
          </template>
        </div>

        <div class="space-y-2">
          <Label for="status">Status</Label>
          <Select v-model="localData.status">
            <SelectTrigger
              :class="{ 'border-red-500': hasError('status') }"
            >
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
    </div>

    <template #footer="{ close }">
      <Button variant="outline" @click="close"> Fechar </Button>
      <Button @click="handleSave" class="min-w-[100px]">
        {{ modalFunction === "ADD" ? "Salvar" : "Atualizar" }}
      </Button>
    </template>
  </CadastroDialog>
</template>
