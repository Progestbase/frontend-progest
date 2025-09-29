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
                <div class="col-md-8">
                  <div class="mb-3">
                    <label class="form-label" for="grupoNome">Nome</label>
                    <input
                      type="text"
                      class="form-control text-uppercase"
                      id="grupoNome"
                      placeholder=""
                      v-model="modalData.nome"
                    />
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="grupoTipo">Tipo</label>
                    <select
                      class="form-select"
                      id="grupoTipo"
                      v-model="modalData.tipo"
                    >
                      <option value="Medicamento">Medicamento</option>
                      <option value="Material">Material</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="GrupoStatus">Status</label>
                    <select
                      class="form-select"
                      id="GrupoStatus"
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
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Fechar
          </button>
          <button
            type="submit"
            class="btn btn-success"
            v-on:click="add_UP_Grupo_Produto()"
          >
            {{ modalFunction == "ADD" ? "Salvar" : "Atualizar" }}
          </button>
        </div>
      </div>
    </ModalBase01>
  </span>
</template>

<script>
import ModalBase01 from "@/components/layouts/ModalBase01.vue";
export default {
  name: "ModalGrupoProduto",
  components: { ModalBase01 },
  props: ["idModal", "functions"],
  methods: {
    add_UP_Grupo_Produto() {
      const content = {
        $axios: this.$axios,
        $store: this.$store,
        $toastr: this.$toastr,
        modalData: JSON.parse(JSON.stringify(this.modalData)),
      };
      this.functions.ADD_UP(content, this.modalFunction);
    },
  },
  computed: {
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
.form-control {
  padding: 0.5rem;
}
</style>
