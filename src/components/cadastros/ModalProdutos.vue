<template>
  <span>
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
                <!-- Nome do Produto (Obrigatório) -->
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label" for="produtoNome">
                      Nome <span class="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control text-uppercase"
                      :class="{ 'is-invalid': modalErrors.nome }"
                      id="produtoNome"
                      placeholder="Digite o nome do produto"
                      v-model="modalData.nome"
                    />
                    <div v-if="modalErrors.nome" class="invalid-feedback">
                      {{ modalErrors.nome[0] }}
                    </div>
                  </div>
                </div>

                <!-- Marca (Opcional) -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label" for="produtoMarca">Marca</label>
                    <input
                      type="text"
                      class="form-control text-uppercase"
                      id="produtoMarca"
                      placeholder="Digite a marca do produto"
                      v-model="modalData.marca"
                    />
                  </div>
                </div>

                <!-- Status -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label" for="produtoStatus">Status</label>
                    <select
                      class="form-select"
                      id="produtoStatus"
                      v-model="modalData.status"
                    >
                      <option value="A">Ativo</option>
                      <option value="I">Inativo</option>
                    </select>
                  </div>
                </div>

                <!-- Grupo do Produto (Obrigatório) -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label" for="produtoGrupo">
                      Grupo do Produto <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <select
                        class="form-select"
                        :class="{ 'is-invalid': modalErrors.grupo_produto_id }"
                        id="produtoGrupo"
                        v-model="modalData.grupo_produto_id"
                      >
                        <option value="">Selecione um grupo</option>
                        <option
                          v-for="grupo in gruposProdutos"
                          :key="grupo.id"
                          :value="grupo.id"
                        >
                          {{ grupo.nome }}
                        </option>
                      </select>
                      <button
                        class="btn btn-outline-primary"
                        type="button"
                        @click="toggleGrupoForm"
                        title="Cadastrar novo grupo"
                      >
                        <i class="mdi mdi-plus"></i>
                      </button>
                    </div>
                    <div
                      v-if="modalErrors.grupo_produto_id"
                      class="invalid-feedback"
                    >
                      {{ modalErrors.grupo_produto_id[0] }}
                    </div>

                    <!-- Formulário inline para novo grupo -->
                    <div
                      v-if="showGrupoForm"
                      class="mt-2 p-3 bg-light rounded border"
                    >
                      <div class="row g-2">
                        <div class="col-12">
                          <label
                            for="novoGrupoNome"
                            class="form-label small fw-bold"
                            >Nome do Grupo *</label
                          >
                          <input
                            id="novoGrupoNome"
                            v-model="novoGrupo.nome"
                            type="text"
                            class="form-control form-control-sm text-uppercase"
                            placeholder="Digite o nome do grupo"
                            @keyup.enter="salvarGrupoInline"
                            required
                          />
                        </div>
                        <div class="col-12 mt-2">
                          <div class="d-flex gap-2 justify-content-end">
                            <button
                              type="button"
                              class="btn btn-secondary btn-sm"
                              @click="cancelarGrupoForm"
                            >
                              <i class="mdi mdi-close font-size-12"></i>
                              Cancelar
                            </button>
                            <button
                              type="button"
                              class="btn btn-success btn-sm"
                              @click="salvarGrupoInline"
                              :disabled="!novoGrupo.nome"
                            >
                              <i class="mdi mdi-check font-size-12"></i> Salvar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Unidade de Medida (Obrigatório) -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label" for="produtoUnidade">
                      Unidade de Medida <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <select
                        class="form-select"
                        :class="{ 'is-invalid': modalErrors.unidade_medida_id }"
                        id="produtoUnidade"
                        v-model="modalData.unidade_medida_id"
                      >
                        <option value="">Selecione uma unidade</option>
                        <option
                          v-for="unidade in unidadesMedidaAux"
                          :key="unidade.id"
                          :value="unidade.id"
                        >
                          {{ unidade.nome }} ({{ unidade.sigla }})
                        </option>
                      </select>
                      <button
                        class="btn btn-outline-primary"
                        type="button"
                        @click="toggleUnidadeForm"
                        title="Cadastrar nova unidade de medida"
                      >
                        <i class="mdi mdi-plus"></i>
                      </button>
                    </div>
                    <div
                      v-if="modalErrors.unidade_medida_id"
                      class="invalid-feedback"
                    >
                      {{ modalErrors.unidade_medida_id[0] }}
                    </div>

                    <!-- Formulário inline para nova unidade de medida -->
                    <div
                      v-if="showUnidadeForm"
                      class="mt-2 p-3 bg-light rounded border"
                    >
                      <div class="row g-2">
                        <div class="col-md-8">
                          <label
                            for="novaUnidadeNome"
                            class="form-label small fw-bold"
                            >Nome *</label
                          >
                          <input
                            id="novaUnidadeNome"
                            v-model="novaUnidade.nome"
                            type="text"
                            class="form-control form-control-sm text-uppercase"
                            placeholder="Ex: QUILOGRAMA"
                            required
                          />
                        </div>
                        <div class="col-md-4">
                          <label
                            for="novaUnidadeSigla"
                            class="form-label small fw-bold"
                            >Sigla *</label
                          >
                          <input
                            id="novaUnidadeSigla"
                            v-model="novaUnidade.sigla"
                            type="text"
                            class="form-control form-control-sm text-uppercase"
                            placeholder="Ex: KG"
                            maxlength="10"
                            @keyup.enter="salvarUnidadeInline"
                            required
                          />
                        </div>
                        <div class="col-12 mt-2">
                          <div class="d-flex gap-2 justify-content-end">
                            <button
                              type="button"
                              class="btn btn-secondary btn-sm"
                              @click="cancelarUnidadeForm"
                            >
                              <i class="mdi mdi-close font-size-12"></i>
                              Cancelar
                            </button>
                            <button
                              type="button"
                              class="btn btn-success btn-sm"
                              @click="salvarUnidadeInline"
                              :disabled="
                                !novaUnidade.nome || !novaUnidade.sigla
                              "
                            >
                              <i class="mdi mdi-check font-size-12"></i> Salvar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Código SIMPRAS (Opcional) -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label" for="produtoCodigoSimpras"
                      >Código SIMPRAS</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': modalErrors.codigo_simpras }"
                      id="produtoCodigoSimpras"
                      placeholder="Digite o código SIMPRAS"
                      v-model="modalData.codigo_simpras"
                    />
                    <div
                      v-if="modalErrors.codigo_simpras"
                      class="invalid-feedback"
                    >
                      {{ modalErrors.codigo_simpras[0] }}
                    </div>
                  </div>
                </div>

                <!-- Código de Barras (Opcional) -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label" for="produtoCodigoBarras"
                      >Código de Barras</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': modalErrors.codigo_barras }"
                      id="produtoCodigoBarras"
                      placeholder="Digite o código de barras"
                      v-model="modalData.codigo_barras"
                    />
                    <div
                      v-if="modalErrors.codigo_barras"
                      class="invalid-feedback"
                    >
                      {{ modalErrors.codigo_barras[0] }}
                    </div>
                  </div>
                </div>
                <!-- <div class="col-md-12">
                                    <div class="mb-3">
                                        <label class="form-label" for="produtoImagem">Imagem</label>
                                        <input type="file" class="form-control" id="produtoImagem"
                                            @change="onImageChange">
                                        <div v-if="imagePreview" class="mt-2">
                                            <img :src="imagePreview" alt="Preview da Imagem"
                                                style="max-width: 200px; max-height: 200px; border: 1px solid #ccc; border-radius: 4px;" />
                                        </div>
                                    </div>
                                </div> -->
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
              v-on:click="add_UP_Produtos()"
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
import Funcoes from "@/functions/cad_produtos.js";
import GrupoFunctions from "@/functions/cad_grupo_produto.js";
import UnidadeFunctions from "@/functions/cad_unidades_medida.js";

export default {
  name: "ModalProdutos",
  components: {
    ModalBase01,
    Funcoes,
  },
  props: ["idModal", "functions"],
  data() {
    return {
      imagePreview: null,
      // Controle dos formulários inline
      showGrupoForm: false,
      showUnidadeForm: false,
      // Dados para cadastro inline de grupo
      novoGrupo: {
        nome: "",
      },
      // Dados para cadastro inline de unidade
      novaUnidade: {
        nome: "",
        sigla: "",
      },
    };
  },
  mounted() {
    // Carregar dados auxiliares usando os dados já disponíveis no store
    this.carregarDadosDoStore();

    // Também escutar evento de abertura do modal
    this.$nextTick(() => {
      const modalElement = document.getElementById(this.idModal);
      if (modalElement) {
        modalElement.addEventListener("show.bs.modal", () => {
          this.carregarDadosDoStore();
        });
      }
    });
  },
  methods: {
    add_UP_Produtos() {
      // Limpar erros anteriores
      this.$store.commit("setModalErrors", {});

      const content = {
        $axios: this.$axios,
        $store: this.$store,
        $toastr: this.$toastr,
        modalData: JSON.parse(JSON.stringify(this.modalData)),
      };
      this.functions.ADD_UP(content, this.modalFunction);
    },
    carregarDadosDoStore() {
      // Usar dados que já estão no store dos outros módulos
      const gruposExistentes =
        this.$store.state.listGrupoProdutos?.data ||
        this.$store.state.listGrupoProdutos ||
        [];
      const unidadesExistentes =
        this.$store.state.listUnidadesMedida?.data ||
        this.$store.state.listUnidadesMedida ||
        [];

      // Sempre carregar dos módulos para garantir dados atualizados
      this.carregarGruposProdutos();
      this.carregarUnidadesMedida();

      // Se existirem dados, usar enquanto carrega
      if (gruposExistentes.length > 0) {
        this.$store.commit("setGruposProdutos", gruposExistentes);
      }

      if (unidadesExistentes.length > 0) {
        this.$store.commit("setUnidadesMedidaAux", unidadesExistentes);
      }
    },
    carregarGruposProdutos() {
      // Usar a função de listagem do módulo de grupos
      this.$axios
        .post(
          "/grupoProduto/list",
          {
            filters: [{}],
            per_page: 100,
          },
          {
            headers: {
              Authorization: "Bearer " + this.$store.getters.getUserToken,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          if (response.data && response.data.status && response.data.data) {
            const grupos = response.data.data.data || response.data.data;
            this.$store.commit("setGruposProdutos", grupos);
          }
        })
        .catch((error) => {
          console.warn("Não foi possível carregar grupos de produtos:", error);
        });
    },
    carregarUnidadesMedida() {
      // Usar a função de listagem do módulo de unidades de medida
      this.$axios
        .post(
          "/unidadeMedida/list",
          {
            filters: [{}],
            per_page: 100,
          },
          {
            headers: {
              Authorization: "Bearer " + this.$store.getters.getUserToken,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          if (response.data && response.data.status && response.data.data) {
            const unidades = response.data.data.data || response.data.data;
            this.$store.commit("setUnidadesMedidaAux", unidades);
          }
        })
        .catch((error) => {
          console.warn("Não foi possível carregar unidades de medida:", error);
        });
    },
    // Métodos para controle dos formulários inline
    toggleGrupoForm() {
      this.showGrupoForm = !this.showGrupoForm;
      if (this.showGrupoForm) {
        // Limpar dados quando abrir
        this.novoGrupo = { nome: "" };
        // Focar no input após renderização
        this.$nextTick(() => {
          const input = document.getElementById("novoGrupoNome");
          if (input) input.focus();
        });
      }
    },
    toggleUnidadeForm() {
      this.showUnidadeForm = !this.showUnidadeForm;
      if (this.showUnidadeForm) {
        // Limpar dados quando abrir
        this.novaUnidade = { nome: "", sigla: "" };
        // Focar no input após renderização
        this.$nextTick(() => {
          const input = document.getElementById("novaUnidadeNome");
          if (input) input.focus();
        });
      }
    },
    cancelarGrupoForm() {
      this.showGrupoForm = false;
      this.novoGrupo = { nome: "" };
    },
    cancelarUnidadeForm() {
      this.showUnidadeForm = false;
      this.novaUnidade = { nome: "", sigla: "" };
    },
    salvarGrupoInline() {
      if (!this.novoGrupo.nome) return;

      const grupoData = {
        grupoProduto: {
          nome: this.novoGrupo.nome.toUpperCase(),
          tipo: "Material",
          status: "A",
        },
      };

      this.$axios
        .post("/grupoProduto/add", grupoData, {
          headers: {
            Authorization: "Bearer " + this.$store.getters.getUserToken,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          if (response.data.status) {
            // Sucesso - recarregar lista e selecionar
            this.carregarGruposProdutos();

            // Selecionar automaticamente o novo grupo
            const novoGrupo = response.data.data;
            if (novoGrupo && novoGrupo.id) {
              this.$nextTick(() => {
                this.modalData.grupo_produto_id = novoGrupo.id;
              });
            }

            // Fechar formulário
            this.showGrupoForm = false;
            this.novoGrupo = { nome: "" };

            // Exibir mensagem de sucesso
            if (this.$toastr && this.$toastr.s) {
              this.$toastr.s("Grupo cadastrado com sucesso!");
            }
          } else {
            // Erro de validação
            if (this.$toastr && this.$toastr.e) {
              this.$toastr.e("Erro ao cadastrar grupo");
            }
          }
        })
        .catch((error) => {
          console.error("Erro ao cadastrar grupo:", error);
          if (this.$toastr && this.$toastr.e) {
            this.$toastr.e("Erro ao cadastrar grupo");
          }
        });
    },
    salvarUnidadeInline() {
      if (!this.novaUnidade.nome || !this.novaUnidade.sigla) return;

      const unidadeData = {
        unidadeMedida: {
          nome: this.novaUnidade.nome.toUpperCase(),
          sigla: this.novaUnidade.sigla.toUpperCase(),
          quantidade_unidade_minima: 1,
          status: "A",
        },
      };

      this.$axios
        .post("/unidadeMedida/add", unidadeData, {
          headers: {
            Authorization: "Bearer " + this.$store.getters.getUserToken,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          if (response.data.status) {
            // Sucesso - recarregar lista e selecionar
            this.carregarUnidadesMedida();

            // Selecionar automaticamente a nova unidade
            const novaUnidade = response.data.data;
            if (novaUnidade && novaUnidade.id) {
              this.$nextTick(() => {
                this.modalData.unidade_medida_id = novaUnidade.id;
              });
            }

            // Fechar formulário
            this.showUnidadeForm = false;
            this.novaUnidade = { nome: "", sigla: "" };

            // Exibir mensagem de sucesso
            if (this.$toastr && this.$toastr.s) {
              this.$toastr.s("Unidade de medida cadastrada com sucesso!");
            }
          } else {
            // Erro de validação
            if (this.$toastr && this.$toastr.e) {
              this.$toastr.e("Erro ao cadastrar unidade de medida");
            }
          }
        })
        .catch((error) => {
          console.error("Erro ao cadastrar unidade:", error);
          if (this.$toastr && this.$toastr.e) {
            this.$toastr.e("Erro ao cadastrar unidade de medida");
          }
        });
    },
    onImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
          // Se quiser salvar a imagem no modalData:
          // this.modalData.imagem = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.imagePreview = null;
      }
    },
  },
  computed: {
    modalTitle() {
      return this.$store.state.modalData.modalTitle;
    },
    modalData() {
      return this.$store.state.modalData.modalData;
    },
    modalFunction() {
      return this.$store.state.modalData.modalFunction;
    },
    modalErrors() {
      return this.$store.state.modalErrors || {};
    },
    gruposProdutos() {
      return this.$store.state.gruposProdutos || [];
    },
    unidadesMedidaAux() {
      return this.$store.state.unidadesMedidaAux || [];
    },
  },
};
</script>

<style scoped>
.user-form {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr 1fr;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4a4a4a;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background-color: #4a4a4a;
  color: white;
  border: none;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

@media (max-width: 768px) {
  .user-form {
    grid-template-columns: 1fr;
  }
}

/* Estilos para formulários inline */
.bg-light {
  background-color: #f8f9fa !important;
  border: 1px solid #e9ecef !important;
}

.form-control-sm {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

.btn-sm {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

.btn-sm i {
  font-size: 0.75rem;
}

/* Animação suave para aparecer/desaparecer */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Estilo para botões inline */
.d-flex.gap-1 {
  gap: 0.25rem !important;
}

/* Espaçamento para botões */
.d-flex.gap-2 {
  gap: 0.5rem !important;
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
