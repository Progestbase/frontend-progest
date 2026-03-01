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
import { Trash2Icon, PlusIcon } from "lucide-vue-next";
import Funcoes from "@/functions/cad_setores.js";
import cadPolos from "@/functions/cad_polos.js";

const props = defineProps(["idModal", "functions"]);
const store = useStore();
const { proxy } = getCurrentInstance();

const loading = ref(false);
const localData = ref({
  id: null,
  status: "A",
  nome: "",
  descricao: "",
  estoque: false,
  tipo: "Material",
  unidade_id: "",
});
const fornecedores = ref([]);
const selectedSetorId = ref("");

const modalDataStore = computed(() => store.state.modalData.modalData);
const modalFunction = computed(() => store.state.modalData.modalFunction);
const isModalOpen = computed({
  get: () => store.state.modalData.isModalOpen,
  set: (value) => store.commit("setModalOpen", value),
});

const unidadesList = computed(() => {
  const list = store.state.listUnidades || {};
  return Array.isArray(list.data) ? list.data : [];
});

const allSetores = computed(() => {
  const list = store.state.listSetoresGerais || {};
  const arr = Array.isArray(list.data) ? list.data : [];
  return arr.filter(
    (s) => s.estoque === true || s.estoque === 1 || s.estoque === "1",
  );
});

const setoresDisponiveis = computed(() => {
  const usados = fornecedores.value
    .map((f) => f.setor_fornecedor_id)
    .filter(Boolean);
  return allSetores.value.filter((s) => !usados.includes(s.id));
});

watch(
  modalDataStore,
  (newValue) => {
    if (newValue) {
      localData.value = JSON.parse(JSON.stringify(newValue));
      if (!localData.value.status) localData.value.status = "A";
      if (localData.value.unidade_id)
        localData.value.unidade_id = localData.value.unidade_id.toString();

      // Popular fornecedores
      const rel =
        newValue.fornecedores_relacionados || newValue.fornecedores || [];
      fornecedores.value = rel.map((r) => ({
        id: r.id,
        setor_fornecedor_id: r.setor_fornecedor_id || r.fornecedor?.id || null,
        nome:
          r.fornecedor?.nome ||
          r.fornecedor?.razao_social_nome ||
          "Setor Fornecedor",
      }));
    }
  },
  { deep: true, immediate: true },
);

onMounted(() => {
  ensureAuxData();
});

const ensureAuxData = () => {
  if (unidadesList.value.length === 0)
    cadPolos.listAll({ $axios: proxy.$axios, $store: store });
  if (allSetores.value.length === 0)
    Funcoes.listAll({ $axios: proxy.$axios, $store: store });
};

const handleSave = () => {
  store.commit("setModalErrors", {});
  loading.value = true;

  const modalCopy = JSON.parse(JSON.stringify(localData.value));
  modalCopy.fornecedores = fornecedores.value.map((f) => ({
    id: f.id,
    setor_fornecedor_id: f.setor_fornecedor_id,
  }));

  const content = {
    $axios: proxy.$axios,
    $store: store,
    modalData: modalCopy,
    $toastr: proxy.$toastr,
  };

  props.functions.ADD_UP(content, modalFunction.value);
  loading.value = false;
};

const adicionarFornecedor = () => {
  const setor = allSetores.value.find((s) => s.id == selectedSetorId.value);
  if (setor) {
    fornecedores.value.push({
      setor_fornecedor_id: setor.id,
      nome: setor.nome,
    });
    selectedSetorId.value = "";
  }
};

const removeFornecedor = (index) => {
  fornecedores.value.splice(index, 1);
};
</script>

<template>
  <CadastroDialog
    v-model:open="isModalOpen"
    :title="modalFunction === 'ADD' ? 'Cadastrar Setor' : 'Editar Setor'"
  >
    <div class="space-y-4 py-2">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label>Status</Label>
          <Select v-model="localData.status">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Ativo</SelectItem>
              <SelectItem value="I">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>Tipo</Label>
          <Select v-model="localData.tipo">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Material">Material</SelectItem>
              <SelectItem value="Medicamento">Medicamento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>Controla Estoque?</Label>
          <Select v-model="localData.estoque">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem :value="true">Sim, com controle</SelectItem>
              <SelectItem :value="false">Não, sem controle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>Unidade Administrativa</Label>
          <Select v-model="localData.unidade_id">
            <SelectTrigger
              ><SelectValue placeholder="Selecione a unidade"
            /></SelectTrigger>
            <SelectContent>
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

      <div class="space-y-2">
        <Label for="setor-nome"
          >Nome do Setor <span class="text-destructive">*</span></Label
        >
        <Input
          id="setor-nome"
          v-model="localData.nome"
          placeholder="Ex: Farmácia Central, Almoxarifado"
        />
      </div>

      <div class="space-y-2">
        <Label for="setor-desc">Descrição / Observações</Label>
        <textarea
          id="setor-desc"
          v-model="localData.descricao"
          class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Detalhes sobre o setor..."
        ></textarea>
      </div>

      <!-- Fornecedores Relacionados -->
      <div class="space-y-3 border rounded-lg p-4 bg-slate-50/50">
        <Label class="text-sm font-bold flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-primary"></span>
          Setores Fornecedores (Distribuidores)
        </Label>

        <div class="flex gap-2">
          <Select v-model="selectedSetorId">
            <SelectTrigger
              ><SelectValue placeholder="Selecione um fornecedor"
            /></SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="s in setoresDisponiveis"
                :key="s.id"
                :value="s.id.toString()"
              >
                {{ s.nome }} ({{ s.tipo }})
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            @click="adicionarFornecedor"
            :disabled="!selectedSetorId"
          >
            <PlusIcon class="h-4 w-4" />
          </Button>
        </div>

        <div class="space-y-2 max-h-[150px] overflow-y-auto pr-1">
          <div
            v-for="(f, idx) in fornecedores"
            :key="idx"
            class="flex items-center justify-between p-2 bg-white border rounded-md shadow-sm animate-in fade-in slide-in-from-left-2"
          >
            <span class="text-sm font-medium">{{ f.nome }}</span>
            <Button
              variant="ghost"
              size="icon"
              @click="removeFornecedor(idx)"
              class="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2Icon class="h-4 w-4" />
            </Button>
          </div>
          <p
            v-if="fornecedores.length === 0"
            class="text-xs text-muted-foreground italic text-center py-2"
          >
            Nenhum distribuidor vinculado.
          </p>
        </div>
      </div>
    </div>

    <template #footer="{ close }">
      <Button variant="outline" @click="close">Fechar</Button>
      <Button @click="handleSave" :disabled="loading">
        {{ modalFunction === "ADD" ? "Salvar" : "Atualizar" }}
      </Button>
    </template>
  </CadastroDialog>
</template>
