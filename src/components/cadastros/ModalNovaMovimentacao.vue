<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader class="text-start">
        <DialogTitle class="flex gap-2">
          <i class="mdi mdi-file-document-edit-outline text-primary"></i>
          Nova Requisição
        </DialogTitle>
        <DialogDescription>
          Preencha os dados e os itens. Você pode salvar como rascunho ou
          finalizar a solicitação.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="finalizarSolicitacao" novalidate>
        <!-- Setor Origem -->
        <div class="mb-4">
          <Label for="setorOrigem">
            Setor Origem (Destribuidor)
            <span class="text-danger">*</span>
          </Label>
          <Select
            v-model="form.setorOrigemId"
            @update:modelValue="onSetorOrigemChange"
          >
            <SelectTrigger
              id="setorOrigem"
              :class="{ 'border-red-500': erros.setorOrigem }"
            >
              <SelectValue placeholder="Selecione o setor fornecedor" />
            </SelectTrigger>
            <SelectContent class="z-[9999]">
              <SelectItem
                v-for="fornecedor in fornecedoresDisponiveis"
                :key="fornecedor.id"
                :value="String(fornecedor.id)"
              >
                {{ fornecedor.tipo }} — {{ fornecedor.nome }}
              </SelectItem>
            </SelectContent>
          </Select>
          <div v-if="erros.setorOrigem" class="text-red-500 text-sm mt-1">
            {{ erros.setorOrigem }}
          </div>
          <div
            v-if="fornecedoresDisponiveis.length === 0"
            class="text-amber-600 text-sm mt-1"
          >
            <i class="mdi mdi-alert-outline"></i>
            Nenhum fornecedor configurado para este setor.
          </div>
        </div>

        <!-- Observação -->
        <div class="mb-4">
          <Label for="observacao">
            Observação
            <span class="text-muted small">(opcional)</span>
          </Label>
          <Textarea
            id="observacao"
            v-model="form.observacao"
            placeholder="Adicione observações sobre a solicitação..."
            rows="3"
          />
        </div>

        <hr class="my-4" />

        <!-- Seção de Itens -->
        <div class="mb-3">
          <h5 class="mb-1">Itens</h5>
          <p class="text-muted mb-3">
            Selecione os produtos e quantidades para a solicitação.
          </p>

          <div class="row g-3 p-3 border rounded bg-light align-items-end">
            <div class="col-md-6">
              <Label for="produtoSelect">
                Produto
                <span class="text-danger">*</span>
              </Label>
              <Select
                v-model="itemAtual.produtoId"
                :disabled="!form.setorOrigemId"
              >
                <SelectTrigger
                  id="produtoSelect"
                  :class="{ 'opacity-50': !form.setorOrigemId }"
                >
                  <SelectValue
                    :placeholder="
                      form.setorOrigemId
                        ? 'Selecione um produto'
                        : 'Selecione o setor origem primeiro'
                    "
                  />
                </SelectTrigger>
                <SelectContent class="z-[9999]">
                  <SelectItem
                    v-for="produto in produtosDisponiveis"
                    :key="produto.id"
                    :value="String(produto.id)"
                  >
                    {{ produto.nome }}
                    <span v-if="produto.marca" class="text-muted">
                      - {{ produto.marca }}</span
                    >
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="col-md-3">
              <Label for="produtoQuantidade">
                Quantidade
                <span class="text-danger">*</span>
              </Label>
              <Input
                id="produtoQuantidade"
                type="number"
                min="1"
                v-model.number="itemAtual.quantidade"
                placeholder="Ex: 10"
              />
            </div>

            <div class="col-md-3">
              <Button
                variant="default"
                type="button"
                class="w-full"
                @click="adicionarItem"
                :disabled="!podeAdicionarItem"
              >
                <i class="mdi mdi-cart-plus me-1"></i>
                Adicionar
              </Button>
            </div>
          </div>
        </div>

        <!-- Lista de Itens Adicionados -->
        <div v-if="form.itens.length > 0" class="table-responsive mb-4">
          <table class="table table-striped table-hover align-middle mb-0">
            <thead>
              <tr>
                <th class="text-start">Produto</th>
                <th class="text-center">Quantidade</th>
                <th class="text-center" style="width: 80px">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in form.itens" :key="index">
                <td class="text-start">
                  <strong>{{ item.produtoNome }}</strong>
                  <div class="text-muted small" v-if="item.produtoMarca">
                    {{ item.produtoMarca }}
                  </div>
                </td>
                <td class="text-center">
                  <Badge>{{ item.quantidade }}</Badge>
                </td>
                <td class="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    @click="removerItem(index)"
                    title="Remover item"
                  >
                    <i class="mdi mdi-delete text-red-500"></i>
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-4 text-muted">
          <i
            class="mdi mdi-package-variant-closed-remove"
            style="font-size: 2rem"
          ></i>
          <p class="mb-0 mt-2">Nenhum item adicionado</p>
        </div>

        <!-- Footer Actions -->
        <div class="mt-4 d-flex justify-content-between">
          <Button
            variant="outline"
            type="button"
            @click="salvarRascunho"
            :disabled="loading || form.itens.length === 0"
            class="text-amber-600 border-amber-600 hover:bg-amber-50"
          >
            <template v-if="!loadingRascunho">
              <i class="mdi mdi-content-save-outline me-1"></i>
              Salvar rascunho
            </template>
            <template v-else>
              <span class="spinner-border spinner-border-sm me-1"></span>
              Salvando...
            </template>
          </Button>

          <div class="d-flex gap-2">
            <Button
              variant="outline"
              type="button"
              @click="fecharModal"
              :disabled="loading"
            >
              Fechar
            </Button>
            <Button
              variant="default"
              type="submit"
              :disabled="loading || !podeFinalizar"
            >
              <template v-if="!loadingFinalizar">
                <i class="mdi mdi-send me-1"></i>
                Finalizar e Solicitar
              </template>
              <template v-else>
                <span class="spinner-border spinner-border-sm me-1"></span>
                Enviando...
              </template>
            </Button>
          </div>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script>
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";

export default {
  name: "ModalNovaMovimentacao",
  components: {
    Button,
    Input,
    Label,
    Badge,
    Textarea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  },
  emits: ["registrado", "update:open"],
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    setorId: {
      type: [Number, String],
      required: true,
    },
    setorNome: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      loading: false,
      loadingRascunho: false,
      loadingFinalizar: false,
      loadingFornecedores: false,
      loadingProdutos: false,
      fornecedoresDisponiveis: [],
      produtosDisponiveis: [],
      form: {
        setorOrigemId: "",
        observacao: "",
        itens: [],
      },
      itemAtual: {
        produtoId: "",
        quantidade: 1,
      },
      erros: {},
      tipoSetorOrigem: null,
    };
  },
  computed: {
    setorDestinoNome() {
      return this.setorNome || "Setor atual";
    },
    podeAdicionarItem() {
      return (
        this.itemAtual.produtoId &&
        this.itemAtual.quantidade > 0 &&
        this.form.setorOrigemId
      );
    },
    podeFinalizar() {
      return (
        this.form.setorOrigemId && this.form.itens.length > 0 && !this.loading
      );
    },
  },
  watch: {
    open(newVal) {
      if (newVal) {
        this.carregarFornecedores();
        this.resetForm();
      }
    },
  },
  methods: {
    async carregarFornecedores() {
      if (!this.setorId) return;

      this.loadingFornecedores = true;
      try {
        const response = await axios.post(
          "/setores/listFornecedoresParaSetor",
          { setor_id: this.setorId },
          {
            headers: {
              Authorization: "Bearer " + this.$store.getters.getUserToken,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data?.status) {
          this.fornecedoresDisponiveis = response.data.data || [];
        } else {
          this.fornecedoresDisponiveis = [];
        }
      } catch (error) {
        console.error("Erro ao carregar fornecedores:", error);
        this.fornecedoresDisponiveis = [];
      } finally {
        this.loadingFornecedores = false;
      }
    },

    async carregarProdutosPorTipo(tipo) {
      if (!tipo) {
        this.produtosDisponiveis = [];
        return;
      }

      this.loadingProdutos = true;
      try {
        const response = await axios.post(
          "/produtos/listByTipo",
          { tipo },
          {
            headers: {
              Authorization: "Bearer " + this.$store.getters.getUserToken,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data?.status) {
          this.produtosDisponiveis = response.data.data || [];
        } else {
          this.produtosDisponiveis = [];
        }
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        this.produtosDisponiveis = [];
      } finally {
        this.loadingProdutos = false;
      }
    },

    onSetorOrigemChange(value) {
      // Limpar itens ao trocar fornecedor
      this.form.itens = [];
      this.itemAtual.produtoId = "";

      // Encontrar o tipo do setor selecionado
      const fornecedor = this.fornecedoresDisponiveis.find(
        (f) => String(f.id) === String(value)
      );

      if (fornecedor) {
        this.tipoSetorOrigem = fornecedor.tipo;
        this.carregarProdutosPorTipo(fornecedor.tipo);
      } else {
        this.tipoSetorOrigem = null;
        this.produtosDisponiveis = [];
      }
    },

    adicionarItem() {
      if (!this.podeAdicionarItem) return;

      const produto = this.produtosDisponiveis.find(
        (p) => String(p.id) === String(this.itemAtual.produtoId)
      );

      if (!produto) return;

      // Verificar se já existe
      const existente = this.form.itens.find(
        (item) => String(item.produtoId) === String(this.itemAtual.produtoId)
      );

      if (existente) {
        existente.quantidade += this.itemAtual.quantidade;
      } else {
        this.form.itens.push({
          produtoId: produto.id,
          produtoNome: produto.nome,
          produtoMarca: produto.marca,
          quantidade: this.itemAtual.quantidade,
        });
      }

      // Reset item atual
      this.itemAtual.produtoId = "";
      this.itemAtual.quantidade = 1;
    },

    removerItem(index) {
      this.form.itens.splice(index, 1);
    },

    async salvarRascunho() {
      await this.enviarMovimentacao("C"); // C = rascunho
    },

    async finalizarSolicitacao() {
      await this.enviarMovimentacao("P"); // P = pendente
    },

    async enviarMovimentacao(status) {
      if (!this.form.setorOrigemId || this.form.itens.length === 0) {
        return;
      }

      const isRascunho = status === "C";
      if (isRascunho) {
        this.loadingRascunho = true;
      } else {
        this.loadingFinalizar = true;
      }
      this.loading = true;

      try {
        const payload = {
          usuario_id: this.$store.state.user?.id,
          setor_origem_id: parseInt(this.form.setorOrigemId),
          setor_destino_id: parseInt(this.setorId),
          tipo: "T", // Transferência
          observacao: this.form.observacao || "",
          status_solicitacao: status,
          itens: this.form.itens.map((item) => ({
            produto_id: item.produtoId,
            quantidade_solicitada: item.quantidade,
          })),
        };

        const response = await axios.post("/movimentacao/add", payload, {
          headers: {
            Authorization: "Bearer " + this.$store.getters.getUserToken,
            "Content-Type": "application/json",
          },
        });

        if (response.data?.status) {
          this.$emit("registrado");
          this.fecharModal();

          // Mostrar toast de sucesso se disponível
          if (this.$toastr?.s) {
            const msg = isRascunho
              ? "Rascunho salvo com sucesso!"
              : "Solicitação enviada com sucesso!";
            this.$toastr.s(msg);
          }
        } else {
          const msg = response.data?.message || "Erro ao criar movimentação";
          if (this.$toastr?.e) {
            this.$toastr.e(msg);
          }
        }
      } catch (error) {
        console.error("Erro ao enviar movimentação:", error);
        const msg =
          error.response?.data?.message || "Erro ao criar movimentação";
        if (this.$toastr?.e) {
          this.$toastr.e(msg);
        }
      } finally {
        this.loading = false;
        this.loadingRascunho = false;
        this.loadingFinalizar = false;
      }
    },

    resetForm() {
      this.form = {
        setorOrigemId: "",
        observacao: "",
        itens: [],
      };
      this.itemAtual = {
        produtoId: "",
        quantidade: 1,
      };
      this.erros = {};
      this.tipoSetorOrigem = null;
      this.produtosDisponiveis = [];
    },

    fecharModal() {
      this.$emit("update:open", false);
    },
  },
};
</script>

<style scoped>
.table-responsive {
  border-radius: 0.25rem;
  border: 1px solid #e9ecef;
}

.table {
  margin-bottom: 0;
}
</style>
