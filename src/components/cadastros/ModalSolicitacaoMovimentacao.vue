<script setup>
import { computed, ref, watch, onMounted, getCurrentInstance } from "vue";
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusIcon,
  Trash2Icon,
  ShoppingCartIcon,
  FilePlusIcon,
  SearchIcon,
} from "lucide-vue-next";
import functionsProdutos from "@/functions/cad_produtos.js";
import functionsMovimentacao from "@/functions/cad_movimentacao.js";

const props = defineProps({
  unidadeAtual: { type: Object, default: () => ({}) },
  fornecedoresRelacionados: { type: Array, default: () => [] },
});

const store = useStore();
const { proxy } = getCurrentInstance();

const isOpen = computed({
  get: () =>
    store.state.modalData.isModalOpen &&
    store.state.modalData.id === "modalSolicitacaoMovimentacao",
  set: (val) => {
    store.commit("setModalOpen", val);
    if (val) store.commit("setModalId", "modalSolicitacaoMovimentacao");
  },
});

const form = ref({
  usuario_id: null,
  setor_origem_id: null,
  setor_destino_id: null,
  tipo_produto: "",
  observacao: "",
  status_solicitacao: "P",
  itens: [],
});

const selectedFornecedorRelId = ref("");
const produtoSelecionadoId = ref("");
const quantidadeSolicitada = ref(1);
const loading = ref(false);

const pesquisaFornecedorRel = ref("");
const pesquisaProdutoRel = ref("");

const user = computed(() => store.state.user);
const produtosDisponiveis = computed(() => {
  const storeList = store.state.listProdutos;
  return Array.isArray(storeList) ? storeList : storeList?.data || [];
});

const fornecedoresRelacionadosFiltrados = computed(() => {
  const term = pesquisaFornecedorRel.value.toLowerCase();
  if (!term) return props.fornecedoresRelacionados;
  return props.fornecedoresRelacionados.filter((rel) => {
    const nome = rel.fornecedor?.nome || rel.id.toString();
    const tipo = rel.tipo_produto || "";
    return (
      nome.toLowerCase().includes(term) || tipo.toLowerCase().includes(term)
    );
  });
});

const produtosFiltrados = computed(() => {
  let result = produtosDisponiveis.value;
  if (form.value.tipo_produto) {
    result = result.filter((p) => {
      const pTipo = p.grupo_produto?.tipo || p.tipo;
      return pTipo === form.value.tipo_produto;
    });
  }

  const term = pesquisaProdutoRel.value.toLowerCase();
  if (term) {
    result = result.filter((p) => {
      const nome = p.nome_completo || p.nome || "";
      return nome.toLowerCase().includes(term);
    });
  }

  return result;
});

const canFinalize = computed(() => {
  return form.value.setor_origem_id && form.value.itens.length > 0;
});

onMounted(() => {
  if (produtosDisponiveis.value.length === 0) {
    functionsProdutos.listAll({ $axios: proxy.$axios, $store: store });
  }
});

watch(isOpen, (newVal) => {
  if (newVal) {
    resetForm();
    if (props.unidadeAtual?.id)
      form.value.setor_destino_id = props.unidadeAtual.id;

    // Auto-selecionar se houver apenas um fornecedor
    if (props.fornecedoresRelacionados.length === 1) {
      const f = props.fornecedoresRelacionados[0];
      selectedFornecedorRelId.value = f.id.toString();
      onFornecedorChange(f.id.toString());
    }
  }
});

const resetForm = () => {
  form.value = {
    usuario_id: user.value?.id || null,
    setor_origem_id: null,
    setor_destino_id: props.unidadeAtual?.id || null,
    tipo_produto: "",
    observacao: "",
    status_solicitacao: "P",
    itens: [],
  };
  selectedFornecedorRelId.value = "";
  produtoSelecionadoId.value = "";
  quantidadeSolicitada.value = 1;
};

const onFornecedorChange = (id) => {
  const rel = props.fornecedoresRelacionados.find(
    (r) => r.id.toString() === id,
  );
  if (rel) {
    form.value.setor_origem_id = rel.setor_fornecedor_id;
    form.value.tipo_produto = rel.tipo_produto;
  } else {
    form.value.setor_origem_id = null;
    form.value.tipo_produto = "";
  }
};

const adicionarItem = () => {
  if (!produtoSelecionadoId.value || quantidadeSolicitada.value <= 0) return;

  const produto = produtosDisponiveis.value.find(
    (p) => p.id.toString() === produtoSelecionadoId.value,
  );
  if (produto) {
    // Evitar duplicados
    const existing = form.value.itens.find(
      (it) => it.produto_id === produto.id,
    );
    if (existing) {
      existing.quantidade_solicitada += quantidadeSolicitada.value;
    } else {
      form.value.itens.push({
        produto_id: produto.id,
        produto_nome: produto.nome_completo || produto.nome,
        quantidade_solicitada: quantidadeSolicitada.value,
      });
    }
    produtoSelecionadoId.value = "";
    quantidadeSolicitada.value = 1;
  }
};

const removerItem = (index) => {
  form.value.itens.splice(index, 1);
};

const enviar = async (status) => {
  loading.value = true;
  form.value.status_solicitacao = status;
  form.value.usuario_id = user.value?.id;
  if (!form.value.tipo) form.value.tipo = "T";

  try {
    const res = await functionsMovimentacao.ADD_UP({
      $axios: proxy.$axios,
      $store: store,
      $toastr: proxy.$toastr,
      modalData: form.value,
    });

    if (res?.status) {
      store.commit("setModalOpen", false);
    }
  } catch (error) {
    console.error("Erro ao enviar solicitação:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <CadastroDialog
    v-model:open="isOpen"
    title="Nova Requisição de Material/Medicamento"
    class="max-w-4xl"
  >
    <div class="space-y-6 py-2">
      <!-- Header Info -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100"
      >
        <div class="space-y-2">
          <Label>Setor de Origem (Quem fornece)</Label>
          <Select
            v-model="selectedFornecedorRelId"
            @update:modelValue="onFornecedorChange"
          >
            <SelectTrigger
              ><SelectValue placeholder="Selecione o fornecedor"
            /></SelectTrigger>
            <SelectContent>
              <div
                class="px-2 py-2 sticky top-0 bg-white border-b z-10"
                @keydown.stop
              >
                <Input
                  v-model="pesquisaFornecedorRel"
                  placeholder="Pesquisar fornecedor..."
                  class="h-8 shadow-sm text-sm"
                />
              </div>
              <SelectItem
                v-for="rel in fornecedoresRelacionadosFiltrados"
                :key="rel.id"
                :value="rel.id.toString()"
              >
                {{ rel.tipo_produto }} — {{ rel.fornecedor?.nome || rel.id }}
              </SelectItem>
              <div
                v-if="fornecedoresRelacionadosFiltrados.length === 0"
                class="py-6 text-center text-sm text-muted-foreground"
              >
                Nenhum fornecedor encontrado.
              </div>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>Setor de Destino (Sua Unidade)</Label>
          <div
            class="flex items-center h-10 px-3 rounded-md bg-white border border-slate-200 text-sm font-medium text-slate-700"
          >
            {{ unidadeAtual?.nome || "Unidade não identificada" }}
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <Label>Observações da Requisição</Label>
        <Textarea
          v-model="form.observacao"
          placeholder="Ex: Urgente, Reposição Semanal..."
          rows="2"
        />
      </div>

      <!-- Itens Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b pb-2">
          <h5 class="text-sm font-bold flex items-center gap-2">
            <ShoppingCartIcon class="w-4 h-4 text-primary" />
            Itens da Solicitação
          </h5>
          <Badge
            variant="outline"
            class="text-[10px] uppercase font-bold px-2 py-0"
          >
            {{ form.itens.length }} item(ns)
          </Badge>
        </div>

        <!-- Add Item Form -->
        <div
          class="flex flex-col md:flex-row gap-3 items-end bg-slate-50/50 p-3 rounded-lg border border-dashed border-slate-200"
        >
          <div class="flex-1 space-y-1.5 w-full">
            <Label class="text-[10px] font-bold uppercase text-slate-500"
              >Produto</Label
            >
            <Select
              v-model="produtoSelecionadoId"
              :disabled="!form.tipo_produto"
            >
              <SelectTrigger
                ><SelectValue
                  :placeholder="
                    form.tipo_produto
                      ? 'Buscar produto...'
                      : 'Selecione a origem primeiro'
                  "
              /></SelectTrigger>
              <SelectContent>
                <div
                  class="px-2 py-2 sticky top-0 bg-white border-b z-10"
                  @keydown.stop
                >
                  <Input
                    v-model="pesquisaProdutoRel"
                    placeholder="Pesquisar produto..."
                    class="h-8 shadow-sm text-sm"
                  />
                </div>
                <SelectItem
                  v-for="p in produtosFiltrados"
                  :key="p.id"
                  :value="p.id.toString()"
                >
                  {{ p.nome_completo || p.nome }}
                </SelectItem>
                <div
                  v-if="produtosFiltrados.length === 0"
                  class="py-6 text-center text-sm text-muted-foreground"
                >
                  Nenhum produto encontrado.
                </div>
              </SelectContent>
            </Select>
          </div>

          <div class="w-full md:w-32 space-y-1.5">
            <Label class="text-[10px] font-bold uppercase text-slate-500"
              >Qtd</Label
            >
            <Input type="number" v-model="quantidadeSolicitada" min="1" />
          </div>

          <Button
            type="button"
            variant="default"
            @click="adicionarItem"
            :disabled="!produtoSelecionadoId"
            class="gap-2"
          >
            <PlusIcon class="w-4 h-4" /> Adicionar
          </Button>
        </div>

        <!-- Items Table -->
        <div class="border rounded-xl overflow-hidden bg-white">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b">
              <tr>
                <th class="text-left py-3 px-4 font-semibold text-slate-600">
                  Produto
                </th>
                <th
                  class="text-center py-3 px-4 font-semibold text-slate-600 w-32"
                >
                  Solicitado
                </th>
                <th
                  class="text-right py-3 px-4 font-semibold text-slate-600 w-24"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr
                v-for="(it, idx) in form.itens"
                :key="idx"
                class="hover:bg-slate-50/50 transition-colors"
              >
                <td class="py-3 px-4 text-slate-800 font-medium">
                  {{ it.produto_nome }}
                </td>
                <td class="py-3 px-4 text-center font-bold text-primary">
                  {{ it.quantidade_solicitada }}
                </td>
                <td class="py-3 px-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    @click="removerItem(idx)"
                    class="h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2Icon class="w-4 h-4" />
                  </Button>
                </td>
              </tr>
              <tr v-if="form.itens.length === 0">
                <td colspan="3" class="py-8 text-center text-slate-400 italic">
                  Nenhum produto adicionado à lista.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <template #footer="{ close }">
      <div class="flex justify-between w-full">
        <Button
          variant="ghost"
          @click="enviar('C')"
          :disabled="loading || form.itens.length === 0"
        >
          Salvar como Rascunho
        </Button>
        <div class="flex gap-2">
          <Button variant="outline" @click="close">Cancelar</Button>
          <Button @click="enviar('P')" :disabled="loading || !canFinalize">
            Finalizar e Solicitar
          </Button>
        </div>
      </div>
    </template>
  </CadastroDialog>
</template>
