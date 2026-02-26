<script setup>
import {
  computed,
  ref,
  watch,
  getCurrentInstance,
  onMounted,
  nextTick,
} from "vue";
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
import { PlusIcon, XIcon, CheckIcon } from "lucide-vue-next";
import Funcoes from "@/functions/cad_produtos.js";

const props = defineProps(["idModal", "functions"]);
const store = useStore();
const { proxy } = getCurrentInstance();

const localData = ref({
  id: null,
  nome: "",
  marca: "",
  status: "A",
  grupo_produto_id: "",
  unidade_medida_id: "",
  codigo_simpras: "",
  codigo_barras: "",
});

// Controle dos formulários inline
const showGrupoForm = ref(false);
const showUnidadeForm = ref(false);
const novoGrupo = ref({ nome: "" });
const novaUnidade = ref({ nome: "" });

const modalDataStore = computed(() => store.state.modalData.modalData);
const modalFunction = computed(() => store.state.modalData.modalFunction);
const modalErrors = computed(() => store.state.modalErrors || {});
const isModalOpen = computed({
  get: () => store.state.modalData.isModalOpen,
  set: (value) => store.commit("setModalOpen", value),
});

const gruposProdutos = computed(() => store.state.gruposProdutos || []);
const unidadesMedidaAux = computed(() => store.state.unidadesMedidaAux || []);

watch(
  modalDataStore,
  (newValue) => {
    if (newValue) {
      localData.value = JSON.parse(JSON.stringify(newValue));
      if (!localData.value.status) localData.value.status = "A";
      // Garantir que IDs sejam strings para o Select do Shadcn
      if (localData.value.grupo_produto_id)
        localData.value.grupo_produto_id =
          localData.value.grupo_produto_id.toString();
      if (localData.value.unidade_medida_id)
        localData.value.unidade_medida_id =
          localData.value.unidade_medida_id.toString();
    }
  },
  { deep: true, immediate: true },
);

onMounted(() => {
  carregarDadosAuxiliares();
});

const carregarDadosAuxiliares = () => {
  carregarGruposProdutos();
  carregarUnidadesMedida();
};

const carregarGruposProdutos = () => {
  proxy.$axios
    .post("/grupoProduto/list", { filters: [{}], per_page: 100 })
    .then((r) => {
      if (r.data?.status) {
        store.commit("setGruposProdutos", r.data.data.data || r.data.data);
      }
    });
};

const carregarUnidadesMedida = () => {
  proxy.$axios
    .post("/unidadeMedida/list", { filters: [{}], per_page: 100 })
    .then((r) => {
      if (r.data?.status) {
        store.commit("setUnidadesMedidaAux", r.data.data.data || r.data.data);
      }
    });
};

const handleSave = () => {
  store.commit("setModalErrors", {});
  const content = {
    $axios: proxy.$axios,
    $store: store,
    $toastr: proxy.$toastr,
    modalData: localData.value,
  };
  props.functions.ADD_UP(content, modalFunction.value);
};

// Métodos Inline
const salvarGrupoInline = () => {
  if (!novoGrupo.value.nome) return;
  const data = {
    grupoProduto: {
      nome: novoGrupo.value.nome.toUpperCase(),
      tipo: "Material",
      status: "A",
    },
  };
  proxy.$axios.post("/grupoProduto/add", data).then((r) => {
    if (r.data.status) {
      carregarGruposProdutos();
      localData.value.grupo_produto_id = r.data.data.id.toString();
      showGrupoForm.value = false;
      proxy.$toastr?.s("Grupo cadastrado com sucesso!");
    }
  });
};

const salvarUnidadeInline = () => {
  if (!novaUnidade.value.nome) return;
  const data = {
    unidadeMedida: {
      nome: novaUnidade.value.nome.toUpperCase(),
      quantidade_unidade_minima: 1,
      status: "A",
    },
  };
  proxy.$axios.post("/unidadeMedida/add", data).then((r) => {
    if (r.data.status) {
      carregarUnidadesMedida();
      localData.value.unidade_medida_id = r.data.data.id.toString();
      showUnidadeForm.value = false;
      proxy.$toastr?.s("Unidade cadastrada com sucesso!");
    }
  });
};
</script>

<template>
  <CadastroDialog
    v-model:open="isModalOpen"
    :title="modalFunction === 'ADD' ? 'Cadastrar Produto' : 'Editar Produto'"
  >
    <div class="space-y-4 py-2">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2 md:col-span-2">
          <Label for="prod-nome"
            >Nome <span class="text-destructive">*</span></Label
          >
          <Input
            id="prod-nome"
            v-model="localData.nome"
            class="uppercase"
            placeholder="Nome do produto"
          />
          <p v-if="modalErrors.nome" class="text-xs text-destructive">
            {{ modalErrors.nome[0] }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="prod-marca">Marca</Label>
          <Input
            id="prod-marca"
            v-model="localData.marca"
            class="uppercase"
            placeholder="Ex: Samsung, Nestlé"
          />
        </div>

        <div class="space-y-2">
          <Label for="prod-status">Status</Label>
          <Select v-model="localData.status">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Ativo</SelectItem>
              <SelectItem value="I">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Grupo -->
        <div class="space-y-2">
          <Label
            >Grupo do Produto <span class="text-destructive">*</span></Label
          >
          <div class="flex gap-2">
            <Select v-model="localData.grupo_produto_id">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Selecione um grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="g in gruposProdutos"
                  :key="g.id"
                  :value="g.id.toString()"
                >
                  {{ g.nome }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              @click="showGrupoForm = !showGrupoForm"
            >
              <PlusIcon class="h-4 w-4" />
            </Button>
          </div>

          <div
            v-if="showGrupoForm"
            class="p-3 border rounded-md bg-slate-50 space-y-2 animate-in fade-in slide-in-from-top-2"
          >
            <Label class="text-xs">Novo Grupo</Label>
            <div class="flex gap-2">
              <Input
                v-model="novoGrupo.nome"
                class="h-8 text-xs uppercase"
                placeholder="Nome do grupo"
              />
              <Button
                size="sm"
                variant="ghost"
                @click="showGrupoForm = false"
                class="h-8 w-8 p-0"
                ><XIcon class="h-3 w-3"
              /></Button>
              <Button size="sm" @click="salvarGrupoInline" class="h-8 px-2"
                ><CheckIcon class="h-3 w-3 mr-1" /> OK</Button
              >
            </div>
          </div>
        </div>

        <!-- Unidade -->
        <div class="space-y-2">
          <Label
            >Unidade de Medida <span class="text-destructive">*</span></Label
          >
          <div class="flex gap-2">
            <Select v-model="localData.unidade_medida_id">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="u in unidadesMedidaAux"
                  :key="u.id"
                  :value="u.id.toString()"
                >
                  {{ u.nome }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              @click="showUnidadeForm = !showUnidadeForm"
            >
              <PlusIcon class="h-4 w-4" />
            </Button>
          </div>

          <div
            v-if="showUnidadeForm"
            class="p-3 border rounded-md bg-slate-50 space-y-2 animate-in fade-in slide-in-from-top-2"
          >
            <Label class="text-xs">Nova Unidade</Label>
            <div class="flex gap-2">
              <Input
                v-model="novaUnidade.nome"
                class="h-8 text-xs uppercase"
                placeholder="Ex: KG, UN"
              />
              <Button
                size="sm"
                variant="ghost"
                @click="showUnidadeForm = false"
                class="h-8 w-8 p-0"
                ><XIcon class="h-3 w-3"
              /></Button>
              <Button size="sm" @click="salvarUnidadeInline" class="h-8 px-2"
                ><CheckIcon class="h-3 w-3 mr-1" /> OK</Button
              >
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="simpras">Código SIMPRAS</Label>
          <Input
            id="simpras"
            v-model="localData.codigo_simpras"
            placeholder="Opcional"
          />
        </div>
        <div class="space-y-2">
          <Label for="barras">Código de Barras</Label>
          <Input
            id="barras"
            v-model="localData.codigo_barras"
            placeholder="Opcional"
          />
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
