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
                <!-- Nome do Polo (Obrigatório) -->
                <div class="col-md-8">
                  <div class="mb-3">
                    <label class="form-label" for="poloNome">
                      Nome <span class="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control text-uppercase"
                      :class="{ 'is-invalid': modalErrors.nome }"
                      id="poloNome"
                      placeholder="Digite o nome do polo"
                      v-model="modalData.nome"
                    />
                    <div v-if="modalErrors.nome" class="invalid-feedback">
                      {{ modalErrors.nome[0] }}
                    </div>
                  </div>
                </div>

                <!-- Status -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="poloStatus">Status</label>
                    <select
                      class="form-select"
                      id="poloStatus"
                      v-model="modalData.status"
                    >
                      <option value="A">Ativo</option>
                      <option value="I">Inativo</option>
                    </select>
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
              v-on:click="add_UP_Polo()"
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

export default {
  name: "ModalPolos",
  components: {
    ModalBase01,
  },
  props: ["idModal", "functions"],
  data() {
    return {};
  },
  computed: {
    modalData() {
      return this.$store.state.modalData.modalData;
    },
    modalFunction() {
      return this.$store.state.modalData.modalFunction;
    },
    modalErrors() {
      return this.$store.state.modalErrors;
    },
  },
  methods: {
    add_UP_Polo() {
      const content = {
        $axios: this.$axios,
        $store: this.$store,
        $toastr: this.$toastr,
        modalData: JSON.parse(JSON.stringify(this.modalData)),
      };
      this.functions.ADD_UP(content, this.modalFunction);
    },
  },
  mounted() {
    // Garantir que modalData tenha status padrão
    if (!this.modalData.status) {
      this.$store.commit("setModalData", { status: "A" });
    }
  },
};
</script>

<style scoped>
/* Estilos específicos para o modal de polos */
.form-label {
  font-weight: 500;
  color: #495057;
}

.text-uppercase {
  text-transform: uppercase;
}

.btn-modal {
  border-radius: 0.375rem;
  font-weight: 500;
}

.btn-modal i {
  font-size: 16px;
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}
</style>
