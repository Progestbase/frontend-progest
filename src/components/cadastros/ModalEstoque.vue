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
            role="tabpanel"
            aria-labelledby="aba_dados-tab"
          >
            <form autocomplete="off">
              <div class="row">
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label">Nome</label>
                    <input
                      type="text"
                      class="form-control text-uppercase"
                      v-model="modalData.nome"
                    />
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Descrição</label>
                    <input
                      type="text"
                      class="form-control text-uppercase"
                      v-model="modalData.descricao"
                    />
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Quantidade</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="modalData.quantidade"
                    />
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Unidade de Medida</label>
                    <select
                      class="form-select"
                      v-model="modalData.unidade_medida"
                    >
                      <option value="UN">Unidade</option>
                      <option value="KG">Quilograma</option>
                      <option value="LT">Litro</option>
                      <option value="M">Metro</option>
                      <option value="PC">Peça</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="row mt-2">
        <div class="col-12 text-end">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            <i class="mdi mdi-close-thick font-size-15"></i> Fechar
          </button>
          <button
            type="submit"
            class="btn btn-success"
            id="btn-save-event"
            @click="add_UP_Estoque"
          >
            <i class="mdi mdi-check-bold font-size-15"></i>
            {{ modalFunction === "ADD" ? "Salvar" : "Atualizar" }}
          </button>
        </div>
      </div>
    </ModalBase01>
  </span>
</template>

<script>
import ModalBase01 from "@/components/layouts/ModalBase01.vue";
import Funcoes from "@/functions/cad_estoque.js";

export default {
  name: "ModalEstoque",
  components: {
    ModalBase01,
    Funcoes,
  },
  props: ["idModal", "functions"],
  computed: {
    modalData() {
      return this.$store.state.modalData.modalData;
    },
    modalFunction() {
      return this.$store.state.modalData.modalFunction;
    },
  },
  methods: {
    add_UP_Estoque() {
      const content = {
        $axios: this.$axios,
        $store: this.$store,
        $toastr: this.$toastr,
        modalData: JSON.parse(JSON.stringify(this.modalData)),
      };
      this.functions.ADD_UP(this, this.modalFunction);
    },
  },
};
</script>

<style scoped>
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
  /* .user-form { */
  /*   grid-template-columns: 1fr; */
  /* } */
}
</style>
