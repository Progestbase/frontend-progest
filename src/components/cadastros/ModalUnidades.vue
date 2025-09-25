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
                      <option value="Material">Material</option>
                      <option value="Medicamento">Medicamento</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="mb-3">
                    <div class="form-label">Controla Estoque</div>
                    <select class="form-select" v-model="modalData.estoque">
                      <option :value="false">Não</option>
                      <option :value="true">Sim</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="mb-3">
                    <label class="form-label" for="UnidadeCodigo"
                      >Código da Unidade</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      id="UnidadeCodigo"
                      placeholder=""
                      v-model="modalData.codigo_unidade"
                      :class="{ 'is-invalid': errors.codigo_unidade }"
                    />
                    <div v-if="errors.codigo_unidade" class="invalid-feedback">
                      {{ errors.codigo_unidade[0] }}
                    </div>
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label" for="UnidadeNome">Nome</label>
                    <input
                      type="text"
                      class="form-control text-uppercase"
                      id="UnidadeNome"
                      placeholder=""
                      v-model="modalData.nome"
                      :class="{ 'is-invalid': errors.nome }"
                    />
                    <div v-if="errors.nome" class="invalid-feedback">
                      {{ errors.nome[0] }}
                    </div>
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label" for="UnidadeDescricao"
                      >Descrição</label
                    >
                    <textarea
                      class="form-control"
                      id="UnidadeDescricao"
                      rows="3"
                      placeholder=""
                      v-model="modalData.descricao"
                    ></textarea>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="row mmt-2">
        <div class="col-12 text-end">
          <button
            type="button"
            class="btn btn-secondary me-2"
            data-bs-dismiss="modal"
          >
            <i class="mdi mdi-close-thick font-size-15"></i> Fechar
          </button>
          <button
            type="submit"
            class="btn btn-success"
            data-bs-target="#success-btn"
            id="btn-save-event"
            v-on:click="add_UP_Unidades()"
            :disabled="loading"
          >
            <i class="mdi mdi-check-bold font-size-15"></i>
            {{ modalFunction == "ADD" ? "Salvar" : "Atualizar" }}
          </button>
        </div>
      </div>
    </ModalBase01>
  </span>
</template>

<script>
import ModalBase01 from "@/components/layouts/ModalBase01.vue";
import Funcoes from "@/functions/cad_unidades.js";

export default {
  name: "ModalUnidades",
  components: {
    ModalBase01,
    Funcoes,
  },
  props: ["idModal", "functions"],
  data() {
    return {
      errors: {},
      loading: false,
    };
  },
  mounted() {},
  methods: {
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
      console.log("=== INICIANDO SALVAMENTO ===");
      console.log("modalData:", this.modalData);
      console.log("modalFunction:", this.modalFunction);
      console.log("functions:", this.functions);

      // Limpar erros anteriores
      this.errors = {};
      this.loading = true;

      const self = this;
      const content = {
        $axios: this.$axios,
        $store: this.$store,
        modalData: JSON.parse(JSON.stringify(this.modalData)),
        $toastr: {
          success: (msg) => {
            self.showNotification(msg, "success");
            self.loading = false;
          },
          error: (msg) => {
            self.showNotification(msg, "error");
            self.loading = false;

            // Tentar extrair erros específicos para mostrar nos campos
            if (content.lastValidationErrors) {
              self.errors = content.lastValidationErrors;
            }
          },
        },
      };

      console.log("content criado:", content);

      this.functions.ADD_UP(content, this.modalFunction);
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
</style>
