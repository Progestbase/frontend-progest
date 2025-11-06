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
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Status</label>
                    <select class="form-select" v-model="modalData.status">
                      <option value="A">Ativo</option>
                      <option value="I">Inativo</option>
                    </select>
                  </div>
                </div>

                <!-- Tipo de vínculo -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label" for="UserTipoVinculo"
                      >Tipo de Vínculo *</label
                    >
                    <select
                      class="form-select"
                      v-model="modalData.tipo_vinculo"
                      required
                    >
                      <option value="">Selecione um tipo</option>
                      <option
                        v-for="tipo in listTiposVinculoStore"
                        :key="tipo.id"
                        :value="tipo.id"
                      >
                        {{ tipo.nome }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-8">
                  <div class="mb-3">
                    <label class="form-label" for="UserNome">Nome *</label>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Digite o nome"
                      v-model="modalData.name"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="UserCpf">CPF *</label>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Digite o CPF"
                      v-model="modalData.cpf"
                      v-mask="'###.###.###-##'"
                      required
                    />
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label" for="UserEmail">E-mail *</label>
                    <input
                      type="email"
                      class="form-control"
                      placeholder="Digite o e-mail"
                      v-model="modalData.email"
                      required
                    />
                  </div>
                </div>
              </div>
              <!-- Unidades -->
              <!-- Unidades removidas do modal: vínculo a setores será gerenciado por outro módulo -->
              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="UserTelefone"
                      >Telefone</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      placeholder="(99) 99999-9999"
                      v-model="modalData.telefone"
                      v-mask="'(##) #####-####'"
                    />
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="UserNascimento"
                      >Data de Nascimento</label
                    >
                    <input
                      type="date"
                      class="form-control"
                      v-model="modalData.data_nascimento"
                    />
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="UserPassword"
                      >Senha {{ modalFunction === "ADD" ? "*" : "" }}</label
                    >
                    <input
                      type="password"
                      class="form-control"
                      placeholder="Digite a senha"
                      v-model="modalData.password"
                      :required="modalFunction === 'ADD'"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="row mt-2">
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
              v-on:click="add_UP_User()"
            >
              <i class="mdi mdi-check-bold me-2"></i>
              {{ modalFunction === "ADD" ? "Salvar" : "Atualizar" }}
            </button>
          </div>
        </div>
      </div>
    </ModalBase01>
  </span>
</template>

<script>
import ModalBase01 from "@/components/layouts/ModalBase01.vue";
import Funcoes from "@/functions/cad_usuarios.js";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";

export default {
  name: "ModalUser01",
  components: {
    ModalBase01,
    Funcoes,
    Multiselect,
  },
  props: ["idModal", "functions"],
  data() {
    return {};
  },
  mounted() {
    // Carrega apenas os tipos de vínculo que são obrigatórios
    // Captura falhas silenciosamente para não gerar promise rejection não tratada
    this.listTiposVinculo()?.catch((e) => {
      console.warn("Não foi possível carregar tipos de vínculo no modal:", e);
    });
  },
  methods: {
    add_UP_User() {
      // Validação simples antes de enviar
      if (
        !this.modalData.name ||
        !this.modalData.email ||
        !this.modalData.cpf ||
        !this.modalData.tipo_vinculo
      ) {
        alert("Por favor, preencha todos os campos obrigatórios (*)");
        return;
      }

      if (this.modalFunction === "ADD" && !this.modalData.password) {
        alert("Senha é obrigatória para novos usuários");
        return;
      }

      this.functions.ADD_UP(this, this.modalFunction);
    },
    listTiposVinculo() {
      // Retornar a promise para que chamadores possam encadear/capturar erros
      return Funcoes.listTiposVinculo(this);
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
    listTiposVinculoStore() {
      return this.$store.state.listTiposVinculo || [];
    },
  },
  watch: {
    modalFunction(newValue) {
      // Quando é um novo usuário, garante que o status seja 'A'
      if (
        newValue === "ADD" &&
        (!this.modalData.status || this.modalData.status === "")
      ) {
        this.$store.commit("setModalData", { ...this.modalData, status: "A" });
      }
    },
  },
  state: {
    modalData: {},
  },
  mutations: {
    setModalData(state, payload) {
      state.modalData = {
        ...state.modalData,
        ...payload,
      };
    },

    resetModalData(state) {
      state.modalData = {};
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
