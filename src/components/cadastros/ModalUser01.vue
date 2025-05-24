<template>
  <span>
    <ModalBase01 :id="idModal" modalClass="modal-dialog modal-lg modal-dialog-centered">

      <div class="col-md-12">
        <div class="tab-content text-muted mt-4 mt-md-0" id="v-pills-tabContent">
          <div class="tab-pane fade show active" id="aba_dados" role="tabpanel" aria-labelledby="aba_dados-tab">

            <form autocomplete="off">
              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Status</label>
                    <select class="form-select" v-model="modalData.status">
                      <option value="A">Ativo</option>
                      <option value="I">Inativo</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="Matricula">Matricula</label>
                    <input type="text" class="form-control text-uppercase" placeholder="" v-model="modalData.matricula">

                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Função</label>
                    <select class="form-select" v-model="modalData.funcao">
                      <option value="L">Leitos</option>
                      <option value="T">Transporte</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label" for="UserNome">Nome</label>
                    <input type="text" class="form-control text-uppercase" placeholder="" v-model="modalData.name">
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label" for="UserCpf">CPF</label>
                    <input type="text" class="form-control text-uppercase" placeholder="" v-model="modalData.cpf">
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label" for="UserEmail">E-mail</label>
                    <input type="text" class="form-control text-lowercase" placeholder="" v-model="modalData.email">
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label" for="UserPassword">Senha</label>
                    <input type="password" class="form-control" placeholder="" v-model="modalData.password">
                  </div>
                </div>
              </div>
            </form>

          </div>
        </div>
      </div>

      <div class="row mt-2">
        <div class="col-12 text-end">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <i class="mdi mdi-close-thick font-size-15"></i> Fechar</button>
          <button type="submit" class="btn btn-success" data-bs-target="#success-btn" id="btn-save-event"
            v-on:click="add_UP_User()"><i class="mdi mdi-check-bold font-size-15"></i> {{
              modalFunction == 'ADD' ? 'Salvar' : 'Atualizar' }}</button>
        </div>
      </div>

    </ModalBase01>
  </span>
</template>

<script>
import ModalBase01 from '@/components/layouts/ModalBase01.vue';
import Funcoes from '@/functions/cad_usuarios.js';

export default {
  name: 'ModalUser01',
  components: {
    ModalBase01
  },
  props: ['idModal', 'functions'],
  data() {
    return {
      // Adicione aqui quaisquer dados locais necessários
    };
  },
  mounted() {
    // Código que deve ser executado quando o componente é montado
  },
methods: {
  add_UP_User() {
    const content = {
      $axios: this.$axios,
      $store: this.$store,
      $toastr: this.$toastr,
      modalData: JSON.parse(JSON.stringify(this.modalData)) // Cópia profunda
    };
    this.functions.ADD_UP(content, this.modalFunction); // Use a prop functions
  }
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
    }
  },
  state: {
    modalData: {
      status: 'A', // Valor padrão (Ativo)
      matricula: '',
      funcao: 'L', // Valor padrão (Leitos)
      name: '',
      cpf: '',
      email: '',
      password: '',
      // Adicione outras propriedades conforme necessário
    },
    // ... outros estados
  },
  mutations: {
    setModalData(state, payload) {
      // Atualiza o objeto modalData com os novos valores
      state.modalData = {
        ...state.modalData, // Mantém os valores existentes
        ...payload         // Sobrescreve com os novos valores
      };
    },

    resetModalData(state) {
      // Reseta para os valores iniciais
      state.modalData = {
        status: 'A',
        matricula: '',
        funcao: 'L',
        name: '',
        cpf: '',
        email: '',
        password: ''
      };
    }
    // ... outras mutations
  }
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