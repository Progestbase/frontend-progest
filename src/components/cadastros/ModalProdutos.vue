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

const modalDataStore = computed(() => store.state.modalData.modalData);
const modalFunction = computed(() => store.state.modalData.modalFunction);
const modalErrors = computed(() => store.state.modalErrors || {});
const isModalOpen = computed({
  get: () => store.state.modalData.isModalOpen,
  set: (value) => store.commit("setModalOpen", value),
});

const gruposProdutos = computed(() => store.state.gruposProdutos || []);
const unidadesMedidaAux = computed(() => store.state.unidadesMedidaAux || []);

// Marcas exclusivas para sugestão no datalist
const listaMarcasUnicas = computed(() => {
  const prods = store.state.listProdutos;
  if (!prods) return [];
  const items = Array.isArray(prods) ? prods : (prods.data || []);
  const marcas = items.map(p => p.marca).filter(m => m && m.trim() !== "");
  return [...new Set(marcas)].sort();
});

// Formulários inline
const showGrupoForm = ref(false);
const novoGrupo = ref({ nome: "", tipo: "Material" });
const showUnidadeForm = ref(false);
const novaUnidade = ref({ nome: "", quantidade_unidade_minima: 1 });

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
      if (!localData.value.status) localData.value.status = "A";
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
  proxy.$axios
    .post("/grupoProduto/list", { filters: [{}], per_page: 500 })
    .then((r) => {
      if (r.data?.status) {
        const data = r.data.data.data || r.data.data;
        store.commit("setGruposProdutos", Array.isArray(data) ? data : []);
      }
    });

  proxy.$axios
    .post("/unidadeMedida/list", { filters: [{}], per_page: 500 })
    .then((r) => {
      if (r.data?.status) {
        const data = r.data.data.data || r.data.data;
        store.commit("setUnidadesMedidaAux", Array.isArray(data) ? data : []);
      }
    });
};

const salvarGrupoInline = () => {
  if (!novoGrupo.value.nome) {
    proxy.$toastr?.e("Preencha o nome do grupo!");
    return;
  }
  const payload = {
    grupoProduto: {
      nome: novoGrupo.value.nome,
      tipo: novoGrupo.value.tipo,
      status: "A" // Status sempre "A"
    }
  };
  proxy.$axios.post("/grupoProduto/add", payload).then((r) => {
    if (r.data?.status) {
      const gList = store.state.gruposProdutos || [];
      store.commit("setGruposProdutos", [...gList, r.data.data]);
      localData.value.grupo_produto_id = r.data.data.id.toString();
      showGrupoForm.value = false;
      novoGrupo.value = { nome: "", tipo: "Material" };
      proxy.$toastr?.s("Grupo cadastrado com sucesso!");
    } else {
      proxy.$toastr?.e(r.data?.message || "Erro ao salvar Grupo");
    }
  });
};

const salvarUnidadeInline = () => {
  if (!novaUnidade.value.nome || !novaUnidade.value.quantidade_unidade_minima) {
    proxy.$toastr?.e("Preencha todos os campos da unidade!");
    return;
  }
  const payload = {
    unidadeMedida: {
      nome: novaUnidade.value.nome,
      quantidade_unidade_minima: parseFloat(novaUnidade.value.quantidade_unidade_minima),
      status: "A" // Status sempre "A"
    }
  };
  proxy.$axios.post("/unidadeMedida/add", payload).then((r) => {
    if (r.data?.status) {
      const uList = store.state.unidadesMedidaAux || [];
      store.commit("setUnidadesMedidaAux", [...uList, r.data.data]);
      localData.value.unidade_medida_id = r.data.data.id.toString();
      showUnidadeForm.value = false;
      novaUnidade.value = { nome: "", quantidade_unidade_minima: 1 };
      proxy.$toastr?.s("Unidade cadastrada com sucesso!");
    } else {
      proxy.$toastr?.e(r.data?.message || "Erro ao salvar Unidade");
    }
  });
};

// Limitar código de barras a 13 dígitos numéricos
const handleCodigoBarrasInput = (event) => {
  const raw = event.target.value.replace(/\D/g, "");
  if (raw.length > 13) {
    localData.value.codigo_barras = raw.substring(0, 13);
  } else {
    localData.value.codigo_barras = raw;
  }
};

// Limitar código SIMPRAS a 20 caracteres alfanuméricos
const handleCodigoSimprasInput = (event) => {
  const raw = event.target.value.replace(/[^A-Za-z0-9\-\.]/g, "");
  if (raw.length > 20) {
    localData.value.codigo_simpras = raw.substring(0, 20);
  } else {
    localData.value.codigo_simpras = raw;
  }
};

const handleSave = () => {
  store.commit("setModalErrors", {});

  // Validação local
  if (
    !localData.value.nome ||
    localData.value.nome.trim().length < 3
  ) {
    store.commit("setModalErrors", {
      nome: ["O nome do produto é obrigatório (mín. 3 caracteres)."],
    });
    return;
  }

  if (!localData.value.grupo_produto_id) {
    store.commit("setModalErrors", {
      grupo_produto_id: ["O grupo do produto é obrigatório."],
    });
    return;
  }

  if (!localData.value.unidade_medida_id) {
    store.commit("setModalErrors", {
      unidade_medida_id: ["A unidade de medida é obrigatória."],
    });
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
    :title="modalFunction === 'ADD' ? 'Cadastrar Produto' : 'Editar Produto'"
  >
    <div class="space-y-4 py-2">
      <!-- Nome (full width) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2 md:col-span-2">
          <Label for="prod-nome">
            Nome <span class="text-destructive">*</span>
          </Label>
          <Input
            id="prod-nome"
            v-model="localData.nome"
            placeholder="Nome do produto"
            :class="{
              'border-red-500 focus-visible:ring-red-500': hasError('nome'),
            }"
          />
          <p v-if="hasError('nome')" class="text-xs text-destructive mt-1">
            {{ getError("nome") }}
          </p>
        </div>

        <!-- Marca e Status -->
        <div class="space-y-2">
          <Label for="prod-marca">Marca</Label>
          <Input
            id="prod-marca"
            v-model="localData.marca"
            list="lista-marcas"
            placeholder="Ex: Samsung, Nestlé"
            :class="{
              'border-red-500 focus-visible:ring-red-500': hasError('marca'),
            }"
          />
          <datalist id="lista-marcas">
            <option v-for="m in listaMarcasUnicas" :key="m" :value="m">{{m}}</option>
          </datalist>
          <p v-if="hasError('marca')" class="text-xs text-destructive mt-1">
            {{ getError("marca") }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="prod-status">Status</Label>
          <Select v-model="localData.status">
            <SelectTrigger
              :class="{ 'border-red-500': hasError('status') }"
            >
              <SelectValue />
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

      <!-- Grupo e Unidade -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label>
            Grupo do Produto <span class="text-destructive">*</span>
          </Label>
          <div class="flex gap-2">
            <Select v-model="localData.grupo_produto_id">
              <SelectTrigger
                class="w-full"
                :class="{ 'border-red-500': hasError('grupo_produto_id') }"
              >
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
              class="shrink-0 text-slate-500 hover:text-primary"
              title="Cadastrar Novo Grupo"
              @click="showGrupoForm = !showGrupoForm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </Button>
          </div>
          <p
            v-if="hasError('grupo_produto_id')"
            class="text-xs text-destructive mt-1"
          >
            {{ getError("grupo_produto_id") }}
          </p>
          
          <!-- Formulário Inline Grupo Produto -->
          <div v-if="showGrupoForm" class="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3 relative animate-in fade-in slide-in-from-top-2">
            <button class="absolute top-2 right-2 text-slate-400 hover:text-red-500" @click="showGrupoForm = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <h4 class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Novo Grupo Rápido</h4>
            <div class="grid gap-2">
              <Input v-model="novoGrupo.nome" placeholder="Nome do Grupo" class="h-8 text-xs" />
              <Select v-model="novoGrupo.tipo">
                <SelectTrigger class="h-8 text-xs bg-white">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medicamento">Medicamento</SelectItem>
                  <SelectItem value="Material">Material</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button @click="salvarGrupoInline" class="w-full h-8 text-xs" variant="secondary">Adicionar</Button>
          </div>
        </div>

        <div class="space-y-2">
          <Label>
            Unidade de Medida <span class="text-destructive">*</span>
          </Label>
          <div class="flex gap-2">
            <Select v-model="localData.unidade_medida_id">
              <SelectTrigger
                class="w-full"
                :class="{ 'border-red-500': hasError('unidade_medida_id') }"
              >
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
              class="shrink-0 text-slate-500 hover:text-primary"
              title="Cadastrar Nova Unidade"
              @click="showUnidadeForm = !showUnidadeForm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </Button>
          </div>
          <p
            v-if="hasError('unidade_medida_id')"
            class="text-xs text-destructive mt-1"
          >
            {{ getError("unidade_medida_id") }}
          </p>

          <!-- Formulário Inline Unidade Medida -->
          <div v-if="showUnidadeForm" class="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3 relative animate-in fade-in slide-in-from-top-2">
            <button class="absolute top-2 right-2 text-slate-400 hover:text-red-500" @click="showUnidadeForm = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <h4 class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Nova Unidade Rápida</h4>
            <div class="grid grid-cols-3 gap-2">
              <Input v-model="novaUnidade.nome" placeholder="Nome/Sigla" class="col-span-2 h-8 text-xs" />
              <Input v-model="novaUnidade.quantidade_unidade_minima" type="number" step="0.01" class="col-span-1 h-8 text-xs px-2" placeholder="Qtd" />
            </div>
            <p class="text-[9px] text-slate-400 leading-tight">A Quantidade define o multiplicador base para cálculo matemático de fracionamento de itens.</p>
            <Button @click="salvarUnidadeInline" class="w-full h-8 text-xs" variant="secondary">Adicionar</Button>
          </div>
        </div>
      </div>

      <!-- Códigos -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="simpras">
            Código SIMPRAS
            <span class="text-[10px] text-slate-400 ml-1">(máx. 20, alfanumérico)</span>
          </Label>
          <Input
            id="simpras"
            v-model="localData.codigo_simpras"
            maxlength="20"
            placeholder="Ex: ABC-123.45"
            :class="{
              'border-red-500 focus-visible:ring-red-500':
                hasError('codigo_simpras'),
            }"
            @input="handleCodigoSimprasInput"
          />
          <p
            v-if="hasError('codigo_simpras')"
            class="text-xs text-destructive mt-1"
          >
            {{ getError("codigo_simpras") }}
          </p>
        </div>
        <div class="space-y-2">
          <Label for="barras">
            Código de Barras
            <span class="text-[10px] text-slate-400 ml-1">(máx. 13 dígitos)</span>
          </Label>
          <Input
            id="barras"
            v-model="localData.codigo_barras"
            maxlength="13"
            placeholder="Ex: 7891234567890"
            :class="{
              'border-red-500 focus-visible:ring-red-500':
                hasError('codigo_barras'),
            }"
            @input="handleCodigoBarrasInput"
          />
          <p
            v-if="hasError('codigo_barras')"
            class="text-xs text-destructive mt-1"
          >
            {{ getError("codigo_barras") }}
          </p>
        </div>
      </div>
    </div>

    <template #footer="{ close }">
      <Button variant="outline" @click="close">Fechar</Button>
      <Button @click="handleSave" class="min-w-[100px]">
        {{ modalFunction === "ADD" ? "Salvar" : "Atualizar" }}
      </Button>
    </template>
  </CadastroDialog>
</template>
