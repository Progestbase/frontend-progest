<template>
  <!-- Novo modal usando shadcn Dialog quando open prop é fornecida -->
  <Dialog
    v-if="open !== undefined"
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <DialogContent class="w-full max-w-4xl max-h-[90vh] overflow-hidden">
      <DialogHeader class="text-start">
        <DialogTitle class="flex gap-2">
          <i class="mdi mdi-office-building text-primary"></i>
          {{ mode === "ADD" ? "Criar novo Setor" : "Editar Setor" }}
        </DialogTitle>
        <DialogDescription>
          {{
            mode === "ADD"
              ? "Crie um novo setor."
              : "Edite as informações do setor."
          }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6 max-h-[70vh] overflow-y-auto p-6">
        <form autocomplete="off">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Status</Label>
              <Select v-model="modalData.status">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Ativo</SelectItem>
                  <SelectItem value="I">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label>Tipo</Label>
              <Select v-model="modalData.tipo">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Material">Material</SelectItem>
                  <SelectItem value="Medicamento">Medicamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label>Controla estoque</Label>
              <Select v-model="modalData.estoque">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione controle de estoque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="true">Com controle</SelectItem>
                  <SelectItem :value="false">Sem controle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label>Unidade</Label>
              <Select v-model="modalData.unidade_id">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="unidade in unidadesList"
                    :key="unidade.id"
                    :value="unidade.id"
                  >
                    {{ unidade.nome }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="space-y-4 mt-6">
            <div class="space-y-2">
              <Label>Nome</Label>
              <Input
                v-model="modalData.nome"
                placeholder="Digite o nome do setor"
              />
            </div>

            <div class="space-y-2">
              <Label>Descrição</Label>
              <textarea
                class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                v-model="modalData.descricao"
                placeholder="Digite a descrição do setor"
                rows="3"
              ></textarea>
            </div>
          </div>
        </form>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">
          Cancelar
        </Button>
        <Button @click="add_UP_Unidades" :disabled="loading">
          <i v-if="loading" class="mdi mdi-loading mdi-spin me-2"></i>
          {{ modalFunction === "UP" ? "Atualizar" : "Salvar" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Modal legado usando ModalBase01 para compatibilidade -->
  <span v-else>
    <ModalBase01
      :idModal="idModal"
      modalClass="modal-dialog modal-lg modal-dialog-centered"
    >
      <div class="col-md-12">
        <div
          class="tab-content text-muted mt-4 mt-md-0"
          id="v-pills-tabContent"
        >
          <div
            class="tab-pane fade show active"
            id="aba_dados"
            role="tabanel"
            aria-labelledby="aba_dados-tab"
          >
            <form autocomplete="off">
              <div class="row">
                <div class="col-md-3">
                  <div class="mb-3">
                    <div class="form-label">Status</div>
                    <select class="form-select" v-model="modalData.status">
                      <option value="A">Ativo</option>
                      <option value="I">Inativo</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="mb-3">
                    <div class="form-label">Tipo</div>
                    <select class="form-select" v-model="modalData.tipo">
                      <option :value="null">Selecionar tipo</option>
                      <option value="Material">Material</option>
                      <option value="Medicamento">Medicamento</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="mb-3">
                    <div class="form-label">Controla estoque</div>
                    <select class="form-select" v-model="modalData.estoque">
                      <option :value="null">
                        Selecionar controle de estoque
                      </option>
                      <option :value="true">Com controle</option>
                      <option :value="false">Sem controle</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="mb-3">
                    <label class="form-label">Unidade</label>
                    <select
                      class="form-select"
                      v-model="modalData.unidade_id"
                      :class="{ 'is-invalid': errors.unidade_id }"
                    >
                      <option value="">Selecionar Unidade</option>
                      <option
                        v-for="p in unidadesList"
                        :key="p.id"
                        :value="p.id"
                      >
                        {{ p.nome }}
                      </option>
                    </select>
                    <div v-if="errors.unidade_id" class="invalid-feedback">
                      {{ errors.unidade_id[0] }}
                    </div>
                  </div>
                </div>
                <div class="col-md-12 col-12">
                  <div class="mb-3">
                    <label class="form-label" for="UnidadeNome">Nome</label>
                    <input
                      type="text"
                      class="form-control"
                      id="UnidadeNome"
                      placeholder="Digite o nome"
                      v-model="modalData.nome"
                      :class="{ 'is-invalid': errors.nome }"
                    />
                    <div v-if="errors.nome" class="invalid-feedback">
                      {{ errors.nome[0] }}
                    </div>
                  </div>
                </div>

                <!-- duplicata de 'Polo' removida; campo mantido na primeira linha -->
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label" for="UnidadeDescricao"
                      >Descrição</label
                    >
                    <textarea
                      class="form-control"
                      id="UnidadeDescricao"
                      rows="3"
                      placeholder="Digite a descrição"
                      v-model="modalData.descricao"
                    ></textarea>
                  </div>
                </div>
                <!-- Setor Distribuidor - NOVO LAYOUT -->
                <div class="col-12 mt-3">
                  <div class="card border p-3">
                    <div class="mb-2">
                      <h6 class="mb-0">Setor Distribuidor</h6>
                    </div>
                    <div class="row g-2 align-items-end mb-2">
                      <div class="col-md-8">
                        <label class="form-label small"
                          >Selecionar setor fornecedor</label
                        >
                        <select
                          class="form-select form-select-sm"
                          v-model="selectedSetorId"
                        >
                          <option value="">
                            Selecione um setor fornecedor
                          </option>
                          <option
                            v-for="s in setoresDisponiveis"
                            :key="s.id"
                            :value="s.id"
                          >
                            {{ s.nome }} ({{ s.tipo }})
                          </option>
                        </select>
                      </div>
                      <div class="col-md-4 d-flex align-items-end">
                        <button
                          class="btn btn-sm btn-outline-primary w-100"
                          type="button"
                          @click="adicionarFornecedorSelecionado"
                          :disabled="!selectedSetorId"
                        >
                          <i class="mdi mdi-plus"></i> Adicionar
                        </button>
                      </div>
                    </div>
                    <div
                      v-if="fornecedores.length === 0"
                      class="text-muted small"
                    >
                      Nenhum fornecedor adicionado. Você pode adicionar múltiplos fornecedores.
                    </div>
                    <div
                      v-for="(f, idx) in fornecedores"
                      :key="f._localId"
                      class="d-flex align-items-center justify-content-between border rounded p-2 mb-2"
                    >
                      <div>
                        <!-- Preferir nome vindo do relacionamento 'fornecedor' quando disponível -->
                        <span class="fw-bold">
                          {{
                            (f.fornecedor &&
                              (f.fornecedor.nome ||
                                f.fornecedor.razao_social_nome ||
                                f.fornecedor.razao_social)) ||
                            getSetorById(f.setor_fornecedor_id)?.nome ||
                            "Setor não encontrado"
                          }}
                        </span>
                      </div>

                      <button
                        class="btn btn-sm btn-danger"
                        type="button"
                        @click="removeFornecedor(idx)"
                      >
                        <i class="mdi mdi-trash-can-outline"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="row mmt-2">
        <div class="col-12 text-end">
          <div class="d-flex gap-2 justify-content-end">
            <button
              type="button"
              class="btn btn-secondary btn-modal"
              data-bs-dismiss="modal"
            >
              <i class="mdi mdi-close-thick me-2"></i>Fechar
            </button>
            <button
              type="submit"
              class="btn btn-success btn-modal"
              data-bs-target="#success-btn"
              id="btn-save-event"
              v-on:click="add_UP_Unidades()"
              :disabled="loading"
            >
              <i class="mdi mdi-check-bold me-2"></i>
              {{ modalFunction == "ADD" ? "Salvar" : "Atualizar" }}
            </button>
          </div>
        </div>
      </div>
    </ModalBase01>
  </span>
</template>

<script>
import ModalBase01 from "@/components/layouts/ModalBase01.vue";
import Funcoes from "@/functions/cad_setores.js";
import cadPolos from "@/functions/cad_polos.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default {
  name: "ModalSetor",
  components: {
    ModalBase01,
    Funcoes,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  },
  props: ["idModal", "functions", "open", "title", "initialData"],
  data() {
    return {
      loading: false,
      fornecedores: [],
      selectedSetorId: "",
    };
  },
  mounted() {
    this.ensurePolosLoaded();
    this.ensureSetoresLoaded();
  },

  methods: {
    async ensureSetoresLoaded() {
      const storeSetores = this.$store.state.listSetores || {};
      const arr = Array.isArray(storeSetores.data) ? storeSetores.data : [];
      if (arr.length === 0) {
        try {
          // Usar listAll do módulo de setores se disponível
          const mod = this.functions || null;
          if (mod && mod.listAll) {
            mod.listAll(this);
          }
        } catch (e) {
          console.warn("Não foi possível carregar setores automaticamente:", e);
        }
      }
    },
    async ensurePolosLoaded() {
      // Garante que a lista de unidades (antigo polos) esteja carregada no store
      const storePolos =
        this.$store.state.listUnidades || this.$store.state.listPolos || {};
      const arr = Array.isArray(storePolos.data) ? storePolos.data : [];
      if (arr.length === 0) {
        try {
          // Tenta acionar o listAll do módulo polos (endpoints compatíveis)
          if (cadPolos && cadPolos.listAll) {
            cadPolos.listAll(this);
          }
        } catch (e) {
          console.warn(
            "Não foi possível carregar unidades automaticamente:",
            e
          );
        }
      }
    },
    showNotification(message, type = "success") {
      if (this.$toastr) {
        if (type === "success") {
          this.$toastr.success(message);
        } else {
          this.$toastr.error(message);
        }
      } else {
        alert(message);
      }
    },

    add_UP_Unidades() {
      // Início do salvamento (logs de depuração removidos em produção)

      // Limpar erros anteriores no store
      this.$store.commit("setModalErrors", {});
      this.loading = true;

      const self = this;
      // Antes de criar conteúdo, anexar fornecedores ao modalData copiado
      const modalCopy = JSON.parse(JSON.stringify(this.modalData || {}));
      // Normalizar fornecedores: remover entradas vazias
      modalCopy.fornecedores = (this.fornecedores || [])
        .filter((f) => f.setor_fornecedor_id)
        .map((f) => ({
          id: f.id || undefined,
          setor_fornecedor_id: f.setor_fornecedor_id,
        }));

      const content = {
        $axios: this.$axios,
        $store: this.$store,
        modalData: modalCopy,
        $toastr: {
          success: (msg) => {
            self.showNotification(msg, "success");
            self.loading = false;
          },
          error: (msg) => {
            self.showNotification(msg, "error");
            self.loading = false;
          },
        },
      };

      this.functions.ADD_UP(content, this.modalFunction);
    },
    // Fornecedores methods
    addFornecedor() {
      this.fornecedores.push({
        _localId: Date.now() + Math.random(),
        setor_fornecedor_id: null,
      });
    },
    removeFornecedor(idx) {
      this.fornecedores.splice(idx, 1);
    },
    onTipoChange(f) {
      // mantido para compatibilidade, não usado na nova UI
    },
    getSetorById(id) {
      if (!id) return null;
      return this.allSetores.find((s) => s.id === id) || null;
    },
    badgeClassForTipo(tipo) {
      if (!tipo) return "badge-secondary";
      return tipo === "Medicamento" ? "bg-info" : "bg-primary";
    },
    onSetorSelect(f, idx) {
      const setor = this.getSetorById(f.setor_fornecedor_id);
      if (!setor) return;
      // atribuir tipo automaticamente
      f.tipo_produto = setor.tipo || null;

      // se já existir outro fornecedor com o mesmo tipo (diferente índice), substituir
      const duplicateIndex = this.fornecedores.findIndex(
        (x, i) => i !== idx && x.tipo_produto === f.tipo_produto
      );
      if (duplicateIndex !== -1) {
        // substituir o fornecedor existente por este novo
        this.fornecedores.splice(duplicateIndex, 1);
      }
      // garantir limite de 2 (um por tipo)
      if (this.fornecedores.length > 2) {
        // remover extras do final
        this.fornecedores = this.fornecedores.slice(0, 2);
      }
    },
    adicionarFornecedorSelecionado() {
      const setor = this.getSetorById(this.selectedSetorId);
      if (!setor) return;
      // Adicionar novo fornecedor
      this.fornecedores.push({
        _localId: Date.now() + Math.random(),
        setor_fornecedor_id: setor.id,
      });
      this.selectedSetorId = "";
    },
  },
  computed: {
    modalTitle() {
      return this.$store.state.modalData.modalTitle;
    },
    modalData() {
      return this.initialData || this.$store.state.modalData.modalData;
    },
    modalFunction() {
      return this.$store.state.modalData.modalFunction;
    },
    errors() {
      return this.$store.state.modalErrors || {};
    },
    unidadesList() {
      const storeUnidades =
        this.$store.state.listUnidades || this.$store.state.listPolos || {};
      return Array.isArray(storeUnidades.data) ? storeUnidades.data : [];
    },
    allSetores() {
      // Corrige: usa listSetoresGerais.data, que é onde o listAll popula!
      const store = this.$store.state.listSetoresGerais || {};
      const arr = Array.isArray(store.data) ? store.data : [];
      // Listar apenas setores com estoque=true (fornecedores devem ser setores fornecedores)
      return arr.filter(
        (s) => s.estoque === true || s.estoque === 1 || s.estoque === "1"
      );
    },
    setoresDisponiveis() {
      // Setores com estoque, que ainda não foram selecionados
      const usados = (this.fornecedores || [])
        .map((f) => f.setor_fornecedor_id)
        .filter(Boolean);
      return this.allSetores.filter((s) => !usados.includes(s.id));
    },
    canAddFornecedor() {
      return true;
    },
  },
  watch: {
    modalData: {
      immediate: true,
      handler(newVal) {
        // Popular fornecedores a partir do objeto retornado (fornecedores_relacionados)
        try {
          const rel =
            newVal?.fornecedores_relacionados || newVal?.fornecedores || [];

          if (Array.isArray(rel) && rel.length > 0) {
            this.fornecedores = rel.map((r) => {
              // r pode ser um objeto de relacionamento (com fornecedor embutido)
              const fornecedorObj =
                r.fornecedor || r.fornecedor_relacionado || null;
              return {
                _localId: r.id || Date.now() + Math.random(),
                id: r.id || undefined,
                setor_fornecedor_id:
                  r.setor_fornecedor_id ||
                  fornecedorObj?.id ||
                  r.fornecedor?.id ||
                  null,
                fornecedor: fornecedorObj || r.fornecedor || null,
              };
            });
          } else {
            // resetar quando modalData não traz fornecedores
            this.fornecedores = [];
          }
        } catch (e) {
          // ignore erros de parsing
          this.fornecedores = [];
        }
      },
    },
  },
};
</script>

<style scoped>
.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}

/* Estilos para botões dos modais */
.btn-modal {
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.6rem 1.25rem;
  border-radius: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border: none;
  min-width: 100px;
}

.btn-modal.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-modal.btn-secondary:hover {
  background-color: #5a6268;
  color: white;
}

.btn-modal.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-modal.btn-success:hover {
  background-color: #218838;
  color: white;
}

.btn-modal i {
  font-size: 0.9rem;
}
</style>
