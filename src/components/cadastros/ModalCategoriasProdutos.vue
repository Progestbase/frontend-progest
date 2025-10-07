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
                    <label class="form-label" for="produtoNome">Nome</label>
                    <input
                      type="text"
                      class="form-control text-uppercase"
                      id="produtoNome"
                      placeholder="Digite o nome"
                      v-model="modalData.nome"
                    />
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="CategoriasProdutosStatus"
                      >Status</label
                    >
                    <select
                      class="form-select"
                      id="CategoriasProdutosStatus"
                      v-model="modalData.status"
                    >
                      <option value="A">Ativo</option>
                      <option value="I">Inativo</option>
                    </select>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-12">
                    <div class="mb-3">
                      <label
                        class="form-label"
                        for="CategoriasProdutosDescricao"
                        >Descrição</label
                      >
                      <input
                        type="text"
                        class="form-control"
                        id="CategoriasProdutosDescricao"
                        placeholder="Digite a descrição"
                        v-model="modalData.descricao"
                      />
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
            data-bs-target="#success-btn"
            id="btn-save-event"
            v-on:click="add_UP_Categorias_Produtos()"
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
import Funcoes from "@/functions/cad_categorias_produtos.js";

export default {
  name: "ModalCategoriasProdutos",
  components: {
    ModalBase01,
    Funcoes,
  },
  props: ["idModal", "functions"],
  data() {
    return {
      imagePreview: null,
    };
  },
  mounted() {},
  methods: {
    add_UP_Categorias_Produtos() {
      const content = {
        $axios: this.$axios,
        $store: this.$store,
        $toastr: this.$toastr,
        modalData: JSON.parse(JSON.stringify(this.modalData)),
      };
      this.functions.ADD_UP(content, this.modalFunction);
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
  },
  state: {
    modalData: {
      status: "A",
      nome: "",
      descricao: "",
    },
  },
  mutations: {
    setModalData(state, payload) {
      state.modalData = {
        ...state.modalData,
        ...payload,
      };
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
</style>
