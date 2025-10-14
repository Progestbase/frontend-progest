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
                    <label class="form-label">Polo</label>
                    <select
                      class="form-select"
                      v-model="modalData.polo_id"
                      :class="{ 'is-invalid': errors.polo_id }"
                    >
                      <option value="">Selecionar Polo</option>
                      <option v-for="p in polosList" :key="p.id" :value="p.id">
                        {{ p.nome }}
                      </option>
                    </select>
                    <div v-if="errors.polo_id" class="invalid-feedback">
                      {{ errors.polo_id[0] }}
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

export default {
  name: "ModalSetor",
  components: {
    ModalBase01,
    Funcoes,
  },
  props: ["idModal", "functions"],
  data() {
    return {
      loading: false,
    };
  },
  mounted() {
    this.ensurePolosLoaded();
  },
  methods: {
    async ensurePolosLoaded() {
      const storePolos = this.$store.state.listPolos || {};
      const arr = Array.isArray(storePolos.data) ? storePolos.data : [];
      if (arr.length === 0) {
        try {
          // Tenta acionar o listAll do módulo polos passando o componente
          if (cadPolos && cadPolos.listAll) {
            cadPolos.listAll(this);
          }
        } catch (e) {
          console.warn("Não foi possível carregar polos automaticamente:", e);
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
      console.log("=== INICIANDO SALVAMENTO ===");
      console.log("modalData:", this.modalData);
      console.log("modalFunction:", this.modalFunction);
      console.log("functions:", this.functions);

      // Limpar erros anteriores no store
      this.$store.commit("setModalErrors", {});
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
    errors() {
      return this.$store.state.modalErrors || {};
    },
    polosList() {
      const storePolos = this.$store.state.listPolos || {};
      return Array.isArray(storePolos.data) ? storePolos.data : [];
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
